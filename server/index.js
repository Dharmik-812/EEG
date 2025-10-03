require('dotenv').config()
// Also load from root key.env file for centralized API key management
require('dotenv').config({ path: '../key.env' })
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { z } = require('zod')
const { escape } = require('html-entities')
const { db, init, newId, insertDmThreadIgnore, upsertDmRead, insertGroupPinIgnore } = require('./db')
const { generateTokens, verifyRefreshToken, authMiddleware, optionalAuthMiddleware } = require('./middleware/auth')
const { sanitizeRequestBody, validateFileUpload } = require('./middleware/sanitization')
const { createFileUploadMiddleware, createSingleFileUploadMiddleware } = require('./middleware/fileUpload')

const PORT = process.env.PORT || 4000
const NODE_ENV = process.env.NODE_ENV || 'development'
const CORS_ORIGIN = process.env.CORS_ORIGIN
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean)

// Validate required environment variables in production
if (NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET']
  const missing = required.filter(key => !process.env[key] || process.env[key].includes('dev_'))
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`)
    process.exit(1)
  }
}

const app = express()
app.use(helmet({ crossOriginResourcePolicy: false }))
const corsOrigin = CORS_ORIGIN ? CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean) : true
app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json({ limit: '5mb' }))

// Apply input sanitization to all requests
app.use(sanitizeRequestBody({ 
  logSanitization: NODE_ENV === 'development' 
}))


// Auth middleware is now imported from ./middleware/auth.js

// Helpers
function userRowToDto(u) {
  if (!u) return null
  return { id: u.id, name: u.name, email: u.email, role: u.role || (isAdmin(u.id) ? 'admin' : 'user'), bio: u.bio, avatarUrl: u.avatarUrl, createdAt: u.createdAt }
}

function isAdmin(userId) {
  return ADMIN_USER_IDS.includes(userId)
}

function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  if (!isAdmin(req.user.id)) return res.status(403).json({ error: 'Admin only' })
  next()
}

function sanitizeMessageContent(content) {
  try {
    if (typeof content === 'string') {
      try {
        const maybeJson = JSON.parse(content)
        if (maybeJson && typeof maybeJson === 'object' && maybeJson.e2ee) {
          return content // keep encrypted payload as-is for E2EE messages
        }
      } catch {}
      // Content is already sanitized by middleware, but double-check for safety
      return content
    }
    return content
  } catch {
    return content || ''
  }
}

async function audit(req, action, details = {}) {
  try {
    await db.run(
      'INSERT INTO audit_logs (id, userId, action, details, ip, createdAt) VALUES (?,?,?,?,?,?)',
      newId('aud'), req.user?.id || null, action, JSON.stringify(details || {}), req.ip, new Date().toISOString()
    )
  } catch (e) {
    console.warn('audit log failed', e?.message)
  }
}

// Rate limits
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 })
app.use(globalLimiter)
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 })
const perUserMessagesLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, keyGenerator: (req) => (req.user?.id || req.ip) })

// Ban enforcement middleware for community features
async function enforceCommunityBan(req, res, next) {
  try {
    const ban = await db.get('SELECT * FROM bans WHERE userId = ? ORDER BY createdAt DESC LIMIT 1', req.user.id)
    if (!ban) return next()
    if (ban.type === 'perm') return res.status(403).json({ error: 'You are permanently banned from community features.' })
    if (ban.type === 'temp') {
      const createdAt = Number(ban.createdAt)
      const duration = Number(ban.duration || 0)
      if (Date.now() < createdAt + duration) {
        const remainingMs = createdAt + duration - Date.now()
        return res.status(403).json({ error: 'You are temporarily banned from community features.', remainingMs })
      }
    }
    next()
  } catch (e) { next(e) }
}

// Validation schemas
const RegisterSchema = z.object({ name: z.string().min(1).max(100), email: z.string().email(), password: z.string().min(8).max(200) })
const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })
const DmMessageSchema = z.object({ content: z.string().max(8000).optional(), attachments: z.array(z.any()).optional(), replyToId: z.string().optional() })
const GroupCreateSchema = z.object({ name: z.string().min(1).max(120), description: z.string().max(2000).optional(), isPrivate: z.boolean().optional() })
const ReportSchema = z.object({ targetUserId: z.string().optional(), groupId: z.string().optional(), messageId: z.string().optional(), reason: z.string().min(5).max(500), evidence: z.any().optional() })

// Auth
app.use('/auth', authLimiter)
app.post('/auth/register', async (req, res, next) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body || {})
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues })
    const { name, email, password } = parsed.data
    const exists = await db.get('SELECT id FROM users WHERE email = ?', email)
    if (exists) return res.status(400).json({ error: 'Email already registered' })
    const id = newId('u')
    const passwordHash = bcrypt.hashSync(password, 10)
    const createdAt = new Date().toISOString()
    await db.run('INSERT INTO users (id,name,email,passwordHash,bio,avatarUrl,createdAt) VALUES (?,?,?,?,?,?,?)', id, name, email, passwordHash, '', '', createdAt)
    const user = await db.get('SELECT * FROM users WHERE id = ?', id)
    const tokens = generateTokens(user)
    await audit(req, 'auth.register', { userId: id })
    return res.json({ 
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: userRowToDto(user) 
    })
  } catch (err) { next(err) }
})

app.post('/auth/login', async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body || {})
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues })
    const { email, password } = parsed.data
    const user = await db.get('SELECT * FROM users WHERE email = ?', email)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = bcrypt.compareSync(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const tokens = generateTokens(user)
    await audit(req, 'auth.login', { userId: user.id })
    return res.json({ 
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: userRowToDto(user) 
    })
  } catch (err) { next(err) }
})

app.post('/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {}
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' })
    }
    
    const decoded = verifyRefreshToken(refreshToken)
    const user = await db.get('SELECT * FROM users WHERE id = ?', decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    const tokens = generateTokens(user)
    await audit(req, 'auth.refresh', { userId: user.id })
    
    return res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: userRowToDto(user)
    })
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }
})

app.get('/auth/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', req.user.id)
    return res.json({ user: userRowToDto(user) })
  } catch (err) { next(err) }
})

// Users
app.get('/users', authMiddleware, async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().toLowerCase()
    const rows = await db.all('SELECT * FROM users')
    const list = rows.map(userRowToDto).filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    res.json({ users: list })
  } catch (err) { next(err) }
})

app.get('/users/:id', authMiddleware, async (req, res, next) => {
  try {
    const u = await db.get('SELECT * FROM users WHERE id = ?', req.params.id)
    if (!u) return res.status(404).json({ error: 'Not found' })
    return res.json({ user: userRowToDto(u) })
  } catch (err) { next(err) }
})

app.put('/users/me', authMiddleware, async (req, res, next) => {
  try {
    const { name, email, bio, avatarUrl } = req.body || {}
    const user = await db.get('SELECT * FROM users WHERE id = ?', req.user.id)
    if (!user) return res.status(404).json({ error: 'Not found' })
    const newName = name ?? user.name
    const newEmail = email ?? user.email
    const newBio = bio ?? user.bio
    const newAvatar = avatarUrl ?? user.avatarUrl
    try {
      await db.run('UPDATE users SET name=?, email=?, bio=?, avatarUrl=? WHERE id=?', newName, newEmail, newBio, newAvatar, user.id)
    } catch (e) {
      if (e.message?.includes('duplicate') || e.message?.includes('UNIQUE')) return res.status(400).json({ error: 'Email already in use' })
      throw e
    }
    const updated = await db.get('SELECT * FROM users WHERE id = ?', user.id)
    res.json({ user: userRowToDto(updated) })
  } catch (err) { next(err) }
})

app.put('/users/me/password', authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {}
    const user = await db.get('SELECT * FROM users WHERE id = ?', req.user.id)
    if (!user) return res.status(404).json({ error: 'Not found' })
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing password fields' })
    if (typeof newPassword !== 'string' || newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' })
    const ok = bcrypt.compareSync(currentPassword, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid current password' })
    const hash = bcrypt.hashSync(newPassword, 10)
    await db.run('UPDATE users SET passwordHash=? WHERE id=?', hash, user.id)
    await audit(req, 'user.password_change', { userId: user.id })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// User public key for E2EE
app.put('/users/me/keys', authMiddleware, async (req, res, next) => {
  try {
    const { publicKeyJwk } = req.body || {}
    if (!publicKeyJwk) return res.status(400).json({ error: 'Missing publicKeyJwk' })
    await db.run('UPDATE users SET publicKeyJwk=? WHERE id=?', JSON.stringify(publicKeyJwk), req.user.id)
    const u = await db.get('SELECT * FROM users WHERE id = ?', req.user.id)
    res.json({ user: userRowToDto(u) })
  } catch (err) { next(err) }
})

// Friends
app.use('/friends', authMiddleware, enforceCommunityBan)
app.post('/friends/request', async (req, res, next) => {
  try {
    const toUserId = (req.body || {}).toUserId
    if (!toUserId || typeof toUserId !== 'string') return res.status(400).json({ error: 'Invalid toUserId' })
    const id = newId('req')
    await db.run('INSERT INTO friend_requests (id, fromId, toId, status, createdAt) VALUES (?,?,?,?,?)', id, req.user.id, toUserId, 'pending', new Date().toISOString())
    res.json({ id })
  } catch (err) { next(err) }
})

app.get('/friends/requests', authMiddleware, async (req, res, next) => {
  try {
    const type = (req.query.type || 'incoming').toString()
    let rows
    if (type === 'incoming') rows = await db.all('SELECT * FROM friend_requests WHERE toId = ? AND status = ? ORDER BY createdAt DESC', req.user.id, 'pending')
    else rows = await db.all('SELECT * FROM friend_requests WHERE fromId = ? AND status = ? ORDER BY createdAt DESC', req.user.id, 'pending')
    res.json({ requests: rows })
  } catch (err) { next(err) }
})

app.post('/friends/requests/:id/accept', authMiddleware, async (req, res, next) => {
  try {
    const reqRow = await db.get('SELECT * FROM friend_requests WHERE id = ?', req.params.id)
    if (!reqRow || reqRow.toId !== req.user.id || reqRow.status !== 'pending') return res.status(400).json({ error: 'Invalid request' })
    await db.run('UPDATE friend_requests SET status = ? WHERE id = ?', 'accepted', reqRow.id)
    await db.run('INSERT INTO friendships (id, aId, bId, since) VALUES (?,?,?,?)', newId('fr'), reqRow.fromId, reqRow.toId, new Date().toISOString())
    res.json({ ok: true })
  } catch (err) { next(err) }
})

app.post('/friends/requests/:id/decline', authMiddleware, async (req, res, next) => {
  try {
    const reqRow = await db.get('SELECT * FROM friend_requests WHERE id = ?', req.params.id)
    if (!reqRow || reqRow.toId !== req.user.id || reqRow.status !== 'pending') return res.status(400).json({ error: 'Invalid request' })
    await db.run('UPDATE friend_requests SET status = ? WHERE id = ?', 'declined', reqRow.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

app.post('/friends/requests/:id/cancel', authMiddleware, async (req, res, next) => {
  try {
    const reqRow = await db.get('SELECT * FROM friend_requests WHERE id = ?', req.params.id)
    if (!reqRow || reqRow.fromId !== req.user.id || reqRow.status !== 'pending') return res.status(400).json({ error: 'Invalid request' })
    await db.run('DELETE FROM friend_requests WHERE id = ?', reqRow.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

app.get('/friends', authMiddleware, async (req, res, next) => {
  try {
    const rows = await db.all('SELECT * FROM friendships WHERE aId = ? OR bId = ?', req.user.id, req.user.id)
    const ids = rows.map(r => (r.aId === req.user.id ? r.bId : r.aId))
    res.json({ friends: ids })
  } catch (err) { next(err) }
})

// DMs
function sortedThreadKey(a, b) { return [a, b].sort().join('|') }

app.use('/dms', authMiddleware, enforceCommunityBan)
app.get('/dms', async (req, res, next) => {
  try {
    const rows = await db.all('SELECT * FROM dm_threads WHERE aId = ? OR bId = ?', req.user.id, req.user.id)
    const result = await Promise.all(rows.map(async r => {
      const last = await db.get('SELECT * FROM dm_messages WHERE threadKey = ? ORDER BY createdAt DESC LIMIT 1', r.threadKey)
      const other = r.aId === req.user.id ? r.bId : r.aId
      const read = await db.get('SELECT lastReadAt FROM dm_reads WHERE threadKey = ? AND userId = ?', r.threadKey, req.user.id)
      const unreadRow = await db.get('SELECT COUNT(*) as c FROM dm_messages WHERE threadKey = ? AND createdAt > COALESCE(?,0)', r.threadKey, read?.lastReadAt || 0)
      const unread = Number(unreadRow?.c || 0)
      return { threadKey: r.threadKey, otherUserId: other, lastMessage: last || null, unread }
    }))
    // sort by last message desc
    result.sort((a,b) => (b.lastMessage?.createdAt || 0) - (a.lastMessage?.createdAt || 0))
    res.json({ conversations: result })
  } catch (err) { next(err) }
})

app.get('/dms/:threadKey/messages', async (req, res, next) => {
  try {
    const msgs = await db.all('SELECT * FROM dm_messages WHERE threadKey = ? ORDER BY createdAt ASC', req.params.threadKey)
    res.json({ messages: msgs })
  } catch (err) { next(err) }
})

app.post('/dms/:otherId/messages', perUserMessagesLimiter, async (req, res, next) => {
  try {
    const otherId = req.params.otherId
    const parsed = DmMessageSchema.safeParse(req.body || {})
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues })
    const { content, attachments, replyToId } = parsed.data
    const threadKey = sortedThreadKey(req.user.id, otherId)
    // ensure thread
    const [aId, bId] = [req.user.id, otherId].sort()
    await insertDmThreadIgnore(threadKey, aId, bId)
    const id = newId('dm')
    const createdAt = Date.now()
    const safeContent = sanitizeMessageContent(content || '')
    await db.run('INSERT INTO dm_messages (id, threadKey, userId, content, attachments, replyToId, createdAt) VALUES (?,?,?,?,?,?,?)', id, threadKey, req.user.id, safeContent, JSON.stringify(attachments || []), replyToId || null, createdAt)
    res.json({ id, threadKey, createdAt })
  } catch (err) { next(err) }
})

app.put('/dms/messages/:id', async (req, res, next) => {
  try {
    const { content } = req.body || {}
    const row = await db.get('SELECT * FROM dm_messages WHERE id = ?', req.params.id)
    if (!row || row.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    const safeContent = sanitizeMessageContent(content || '')
    await db.run('UPDATE dm_messages SET content = ?, editedAt = ? WHERE id = ?', safeContent, Date.now(), row.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

app.delete('/dms/messages/:id', authMiddleware, async (req, res, next) => {
  try {
    const row = await db.get('SELECT * FROM dm_messages WHERE id = ?', req.params.id)
    if (!row || row.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    await db.run('DELETE FROM dm_messages WHERE id = ?', row.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

app.post('/dms/messages/:id/reactions', authMiddleware, async (req, res, next) => {
  try {
    const { emoji } = req.body || {}
    const msg = await db.get('SELECT * FROM dm_messages WHERE id = ?', req.params.id)
    if (!msg) return res.status(404).json({ error: 'Not found' })
    const exists = await db.get('SELECT * FROM reactions WHERE messageType=? AND messageId=? AND emoji=? AND userId=?', 'dm', msg.id, emoji, req.user.id)
    if (exists) {
      await db.run('DELETE FROM reactions WHERE id = ?', exists.id)
    } else {
      await db.run('INSERT INTO reactions (id, messageType, messageId, emoji, userId) VALUES (?,?,?,?,?)', newId('rxn'), 'dm', msg.id, emoji, req.user.id)
    }
    res.json({ ok: true })
  } catch (err) { next(err) }
})

app.put('/dms/:threadKey/read', authMiddleware, async (req, res, next) => {
  try {
    await upsertDmRead(req.params.threadKey, req.user.id, Date.now())
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// Groups
app.use('/groups', authMiddleware, enforceCommunityBan)
app.get('/groups', async (req, res, next) => {
  try {
    const q = ((req.query.q || '').toString() || '').toLowerCase()
    const tag = ((req.query.tag || '').toString() || '').toLowerCase()
    if (q || tag) {
      const all = await db.all('SELECT * FROM group_chats')
      const filtered = all.filter(g => {
        const name = (g.name || '').toLowerCase()
        const desc = (g.description || '').toLowerCase()
        const isMatch = (!q || name.includes(q) || desc.includes(q)) && (!tag || name.includes(tag) || desc.includes(tag))
        return isMatch && (!g.isPrivate || g.isPrivate === 0)
      })
      return res.json({ groups: filtered })
    }
    // Default: user's groups
    const groups = await db.all('SELECT gc.* FROM group_chats gc JOIN group_members gm ON gc.id = gm.groupId WHERE gm.userId = ?', req.user.id)
    res.json({ groups })
  } catch (err) { next(err) }
})

app.post('/groups', async (req, res, next) => {
  try {
    const parsed = GroupCreateSchema.safeParse(req.body || {})
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues })
    const { name, description, isPrivate } = parsed.data
    const id = newId('grp')
    const inviteCode = newId('invite')
    await db.run('INSERT INTO group_chats (id, name, description, isPrivate, inviteCode, createdAt, createdBy) VALUES (?,?,?,?,?,?,?)', id, escape(name), description ? escape(description) : '', isPrivate ? 1 : 0, inviteCode, new Date().toISOString(), req.user.id)
    await db.run('INSERT INTO group_members (id, groupId, userId, role, joinedAt) VALUES (?,?,?,?,?)', newId('m'), id, req.user.id, 'admin', new Date().toISOString())
    res.json({ id })
  } catch (err) { next(err) }
})

app.post('/groups/:id/join', authMiddleware, async (req, res, next) => {
  try {
    const g = await db.get('SELECT * FROM group_chats WHERE id = ?', req.params.id)
    if (!g) return res.status(404).json({ error: 'Not found' })
    const exists = await db.get('SELECT * FROM group_members WHERE groupId = ? AND userId = ?', g.id, req.user.id)
    if (!exists) await db.run('INSERT INTO group_members (id, groupId, userId, role, joinedAt) VALUES (?,?,?,?,?)', newId('m'), g.id, req.user.id, 'member', new Date().toISOString())
    res.json({ ok: true })
  } catch (err) { next(err) }
})

app.post('/groups/:id/leave', authMiddleware, async (req, res, next) => {
  try {
    await db.run('DELETE FROM group_members WHERE groupId = ? AND userId = ?', req.params.id, req.user.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

app.put('/groups/:id/settings', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, isPrivate } = req.body || {}
    const g = await db.get('SELECT * FROM group_chats WHERE id = ?', req.params.id)
    if (!g) return res.status(404).json({ error: 'Not found' })
    await db.run('UPDATE group_chats SET name=?, description=?, isPrivate=? WHERE id=?', name ?? g.name, description ?? g.description, typeof isPrivate === 'boolean' ? (isPrivate ? 1 : 0) : g.isPrivate, g.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

app.get('/groups/:id/messages', authMiddleware, async (req, res, next) => {
  try {
    const msgs = await db.all('SELECT * FROM group_messages WHERE groupId = ? ORDER BY createdAt ASC', req.params.id)
    res.json({ messages: msgs })
  } catch (err) { next(err) }
})

app.post('/groups/:id/messages', perUserMessagesLimiter, async (req, res, next) => {
  try {
    const parsed = DmMessageSchema.safeParse(req.body || {})
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues })
    const { content, attachments, replyToId } = parsed.data
    const id = newId('msg')
    const safeContent = sanitizeMessageContent(content || '')
    await db.run('INSERT INTO group_messages (id, groupId, userId, content, attachments, replyToId, createdAt) VALUES (?,?,?,?,?,?,?)', id, req.params.id, req.user.id, safeContent, JSON.stringify(attachments || []), replyToId || null, new Date().toISOString())
    res.json({ id })
  } catch (err) { next(err) }
})

app.post('/groups/messages/:id/reactions', authMiddleware, async (req, res, next) => {
  try {
    const { emoji } = req.body || {}
    const msg = await db.get('SELECT * FROM group_messages WHERE id = ?', req.params.id)
    if (!msg) return res.status(404).json({ error: 'Not found' })
    const exists = await db.get('SELECT * FROM reactions WHERE messageType=? AND messageId=? AND emoji=? AND userId=?', 'group', msg.id, emoji, req.user.id)
    if (exists) await db.run('DELETE FROM reactions WHERE id = ?', exists.id)
    else await db.run('INSERT INTO reactions (id, messageType, messageId, emoji, userId) VALUES (?,?,?,?,?)', newId('rxn'), 'group', msg.id, emoji, req.user.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

app.post('/groups/:id/pins', authMiddleware, async (req, res, next) => {
  try {
    const { messageId, action } = req.body || {}
    if (action === 'pin') await insertGroupPinIgnore(req.params.id, messageId)
    else if (action === 'unpin') await db.run('DELETE FROM group_pins WHERE groupId = ? AND messageId = ?', req.params.id, messageId)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// Reports & Moderation
app.post('/reports', authMiddleware, async (req, res, next) => {
  try {
    const parsed = ReportSchema.safeParse(req.body || {})
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues })
    const { targetUserId, groupId, messageId, reason, evidence } = parsed.data
    const id = newId('rpt')
    await db.run('INSERT INTO reports (id, reporterId, targetUserId, groupId, messageId, reason, evidence, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?)', id, req.user.id, targetUserId || null, groupId || null, messageId || null, escape(reason), JSON.stringify(evidence || {}), 'pending', new Date().toISOString())
    await audit(req, 'report.submit', { id, targetUserId, groupId, messageId })
    res.json({ id, status: 'pending' })
  } catch (err) { next(err) }
})

app.get('/reports', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const reports = await db.all('SELECT * FROM reports ORDER BY createdAt DESC')
    res.json({ reports })
  } catch (err) { next(err) }
})

app.post('/reports/:id/action', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { action, banType, durationMs, targetUserId } = req.body || {}
    if (action === 'ban') {
      if (!targetUserId || !banType || !['temp','perm'].includes(banType)) return res.status(400).json({ error: 'Invalid ban action' })
      const banId = newId('ban')
      const createdAt = Date.now()
      const duration = banType === 'temp' ? Number(durationMs || 0) : null
      await db.run('INSERT INTO bans (id, userId, type, duration, createdAt) VALUES (?,?,?,?,?)', banId, targetUserId, banType, duration, createdAt)
      await audit(req, 'ban.issue', { banId, targetUserId, type: banType, duration })
    }
    await db.run('UPDATE reports SET status = ? WHERE id = ?', 'resolved', req.params.id)
    await audit(req, 'report.resolve', { reportId: req.params.id, action })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// WebRTC Call Signaling (in-memory)
const calls = new Map() // callId -> { fromUserId, toUserId, offer, answer, status: 'pending'|'accepted'|'declined'|'cancelled', createdAt }

app.post('/calls/start', authMiddleware, async (req, res, next) => {
  try {
    const { toUserId, offer } = req.body || {}
    if (!toUserId || !offer) return res.status(400).json({ error: 'Missing toUserId or offer' })
    const callId = newId('call')
    calls.set(callId, { fromUserId: req.user.id, toUserId, offer, status: 'pending', createdAt: Date.now() })
    res.json({ callId, status: 'pending' })
  } catch (err) { next(err) }
})

app.post('/calls/answer', authMiddleware, async (req, res, next) => {
  try {
    const { callId, accept, answer } = req.body || {}
    const c = calls.get(callId)
    if (!c) return res.status(404).json({ error: 'Call not found' })
    if (c.toUserId !== req.user.id) return res.status(403).json({ error: 'Only recipient can answer' })
    if (!accept) { c.status = 'declined'; return res.json({ ok: true, status: 'declined' }) }
    if (!answer) return res.status(400).json({ error: 'Missing answer' })
    c.answer = answer
    c.status = 'accepted'
    res.json({ ok: true, status: 'accepted' })
  } catch (err) { next(err) }
})

app.post('/calls/cancel', authMiddleware, async (req, res, next) => {
  try {
    const { callId } = req.body || {}
    const c = calls.get(callId)
    if (!c) return res.status(404).json({ error: 'Call not found' })
    if (c.fromUserId !== req.user.id) return res.status(403).json({ error: 'Only caller can cancel' })
    c.status = 'cancelled'
    res.json({ ok: true, status: 'cancelled' })
  } catch (err) { next(err) }
})

// File Upload
app.post('/upload', authMiddleware, createSingleFileUploadMiddleware('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const file = req.file
    
    // In a real implementation, you would:
    // 1. Upload to cloud storage (AWS S3, Google Cloud, etc.)
    // 2. Store file metadata in database
    // 3. Return public URL
    
    // For now, simulate successful upload
    const fileRecord = {
      id: newId('file'),
      originalName: file.originalname,
      secureFilename: file.secureFilename,
      mimeType: file.mimetype,
      size: file.size,
      hash: file.hash,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      // In real implementation: publicUrl: uploadedUrl
      publicUrl: `https://your-cdn.com/files/${file.secureFilename}`
    }

    await audit(req, 'file.upload', { 
      fileId: fileRecord.id, 
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    })

    res.json({
      file: {
        id: fileRecord.id,
        name: fileRecord.originalName,
        url: fileRecord.publicUrl,
        size: fileRecord.size,
        type: fileRecord.mimeType
      }
    })
  } catch (err) {
    next(err)
  }
})

// AI Chat API (server-side Gemini integration)
app.post('/api/chat', async (req, res, next) => {
  try {
    // Check if Gemini API is available
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'AI service unavailable', 
        message: 'Server configuration error - missing Gemini API key' 
      })
    }

    const { contents, modelKey = 'fast', isVision = false } = req.body || {}

    // Validate request
    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'Contents array is required' 
      })
    }

    // Import Gemini AI library dynamically
    const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = await import('@google/generative-ai')
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    
    // Safety settings
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ]

    // Generation config
    const generationConfig = {
      temperature: 0.8,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 1024,
      candidateCount: 1,
    }

    // System prompt
    const systemPrompt = `You are AversoAI, an enthusiastic environmental education assistant for a gamified learning website. 

CORE RULES:
- ONLY answer questions about environmental topics: climate change, recycling, sustainability, renewable energy, conservation, biodiversity, pollution, eco-friendly habits, green technology, and environmental science.
- For off-topic questions, politely redirect users to environmental education with encouraging suggestions.
- Keep responses concise (under 3 sentences) but informative and engaging.
- Use emojis occasionally to maintain a fun, gamified atmosphere.
- Maintain an enthusiastic, educational tone that encourages learning and action.
- Provide practical, actionable advice when possible.
- Be scientifically accurate but accessible to all education levels.`

    // Model selection
    const modelName = modelKey === 'balanced' ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest'
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings,
      generationConfig,
      systemInstruction: systemPrompt
    })

    // Generate response
    const result = await model.generateContent({ contents })
    const response = result.response
    const text = response.text()

    res.json({ 
      success: true, 
      text,
      model: modelKey
    })

  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ 
      error: 'Generation failed', 
      message: 'Something went wrong with the AI service',
      retryable: true
    })
  }
})

// Health
app.get('/health', (req, res) => res.json({ ok: true }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start after DB init
;(async () => {
  try {
    await init()
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`EEG server listening on http://localhost:${PORT}`)
      })
    }
  } catch (e) {
    console.error('Failed to initialize server', e)
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1)
    }
  }
})()

module.exports = app
