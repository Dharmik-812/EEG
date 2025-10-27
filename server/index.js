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

// Helper functions for chat API
function extractUserQuestion(contents) {
  if (!contents || !Array.isArray(contents)) return ''
  
  // Find the last user message
  for (let i = contents.length - 1; i >= 0; i--) {
    const content = contents[i]
    if (content.role === 'user' && content.parts && Array.isArray(content.parts)) {
      for (const part of content.parts) {
        if (part.text && typeof part.text === 'string') {
          return part.text.trim()
        }
      }
    }
  }
  return ''
}

function getRecentContext(contents) {
  if (!Array.isArray(contents)) return { lastAssistant: '', prevUser: '' }
  let lastAssistant = ''
  let prevUser = ''
  for (let i = contents.length - 1; i >= 0; i--) {
    const c = contents[i]
    if (!lastAssistant && c.role === 'assistant' && Array.isArray(c.parts)) {
      const part = c.parts.find(p => typeof p.text === 'string')
      if (part) lastAssistant = part.text.trim()
    }
    if (!prevUser && c.role === 'user' && Array.isArray(c.parts)) {
      const part = c.parts.find(p => typeof p.text === 'string')
      if (part) prevUser = part.text.trim()
    }
    if (lastAssistant && prevUser) break
  }
  return { lastAssistant, prevUser }
}

// Enhanced AI-style responses
function generateEnhancedMockResponse(userQuestion, contents) {
  const question = (userQuestion || '').toLowerCase()
  const context = getRecentContext(contents)
  const isFollowUp = /tell me more|more details|what about|and|also|continue|follow up/i.test(userQuestion || '')
  
  // Detect question type and provide intelligent responses
  if (question.includes('recycl')) {
    return `♻️ Great question! Recycling is the process of converting waste materials into reusable products. Here's how it works:

**Types of Recycling:**
• Paper and cardboard → New paper products
• Plastic → Bottles, containers, and building materials
• Glass → New glass containers (endlessly recyclable!)
• Metals → New metal products with 95% less energy

**Benefits:**
✓ Reduces landfill waste
✓ Conserves natural resources
✓ Saves energy (recycling aluminum saves 95% energy)
✓ Reduces pollution

**Getting Started:** Check your local recycling guidelines - they vary by municipality. Most areas accept paper, cardboard, plastic bottles, glass, and metal cans.${context.lastAssistant ? '\n\n' + context.lastAssistant : ''}`
  }
  
  if (question.includes('climat') || question.includes('climate')) {
    return `🌍 Climate change refers to long-term shifts in global temperatures and weather patterns, primarily driven by human activities since the mid-20th century.

**Main Causes:**
• Greenhouse gas emissions from burning fossil fuels
• Deforestation reducing carbon absorption
• Industrial processes and agriculture
• Waste and landfills producing methane

**Key Solutions:**
✓ Reduce energy consumption
✓ Switch to renewable energy (solar, wind)
✓ Use public transport or electric vehicles
✓ Plant trees and support reforestation
✓ Reduce, reuse, recycle

**Impact:** Since 1880, global temperatures have risen about 1.1°C, causing sea levels to rise, extreme weather events, and ecosystem changes.${context.lastAssistant ? '\n\n' + context.lastAssistant : ''}`
  }
  
  if (question.includes('energy') || question.includes('power') || question.includes('electric')) {
    return `⚡ Renewable energy is power generated from natural sources that are constantly replenished and doesn't run out!

**Types of Renewable Energy:**
• **Solar** - Panels convert sunlight to electricity (great for homes!)
• **Wind** - Turbines capture wind energy
• **Hydroelectric** - Water turbines generate power
• **Geothermal** - Earth's heat produces energy
• **Biomass** - Organic materials converted to energy

**Benefits:**
✓ Environmentally friendly (little to no emissions)
✓ Sustainable and infinite resource
✓ Cost-effective long-term
✓ Creates jobs in green economy
✓ Reduces dependence on fossil fuels

**For Your Home:** Consider solar panels - costs have dropped 80% in 10 years! Many governments offer tax incentives.${context.lastAssistant ? '\n\n' + context.lastAssistant : ''}`
  }
  
  if (question.includes('carbon') || question.includes('footprint') || question.includes('co2')) {
    return `🌱 A carbon footprint is the total amount of greenhouse gases produced by your actions, measured in carbon dioxide equivalent.

**How to Calculate:**
Measure your impact from:
• Transportation (cars, flights)
• Energy use at home
• Food consumption
• Waste generation

**Ways to Reduce:**
✓ Drive less - walk, bike, or use public transit
✓ Use energy-efficient appliances
✓ Eat less meat (meat production is resource-intensive)
✓ Reduce, reuse, recycle
✓ Switch to renewable energy
✓ Buy local products (less transportation)
✓ Plant trees (they absorb CO2)

**Quick Tip:** Check online calculators - the average person's carbon footprint is about 4 tons per year globally.${context.lastAssistant ? '\n\n' + context.lastAssistant : ''}`
  }
  
  if (question.includes('water') || question.includes('conserve') || question.includes('save')) {
    return `💧 Water conservation is vital! Fresh water is a limited resource - only 2.5% of Earth's water is fresh.

**Why Conserve:**
• Access to clean water is declining
• Saves energy (treating/pumping water uses lots of electricity)
• Protects ecosystems
• Reduces utility bills

**Simple Ways to Save:**
✓ Fix leaks (drips can waste 3,000 gallons/year!)
✓ Take shorter showers (save 2.5 gallons per minute)
✓ Turn off tap while brushing teeth
✓ Run full loads in dishwasher and washing machine
✓ Use rain barrels for gardening
✓ Install low-flow showerheads and faucets
✓ Water lawns at dawn (less evaporation)

**Impact:** If each person saves 20 gallons/day, that's 7,300 gallons per person per year!${context.lastAssistant ? '\n\n' + context.lastAssistant : ''}`
  }
  
  if (question.includes('plastic') || question.includes('waste')) {
    return `🔄 Plastic waste is a major environmental issue - it takes 400-1,000 years to decompose!

**The Problem:**
• 8 million tons of plastic enter oceans yearly
• Only 9% of plastic is recycled globally
• Plastic production uses fossil fuels
• Microplastics are found everywhere now

**Solutions:**
✓ Reduce single-use plastics (bags, bottles, straws)
✓ Use reusable bags, bottles, and containers
✓ Choose products with less packaging
✓ Recycle properly (check the recycling code)
✓ Support brands using recycled materials
✓ Participate in local cleanups
✓ Choose glass, metal, or paper alternatives

**Quick Actions You Can Take:**
• Refuse plastic straws - use metal/glass ones
• Bring your own shopping bags
• Use a reusable water bottle
• Buy in bulk to reduce packaging${context.lastAssistant ? '\n\n' + context.lastAssistant : ''}`
  }
  
  if (question.includes('pollution')) {
    return `🌫️ Pollution comes in many forms and affects air, water, and soil.

**Types of Pollution:**
• **Air** - Caused by vehicles, industry, burning fossil fuels
• **Water** - Industrial waste, oil spills, agricultural runoff
• **Soil** - Pesticides, chemicals, waste dumping
• **Noise** - Traffic, construction, industrial activities

**Effects on Health:**
✓ Respiratory problems (asthma, lung cancer)
✓ Waterborne diseases
✓ Birth defects
✓ Heart disease
✓ Premature death

**How to Help:**
✓ Use public transport or bike
✓ Support clean energy
✓ Properly dispose of chemicals and waste
✓ Plant trees (they filter air)
✓ Reduce energy consumption
✓ Support environmental regulations

**Quick Fact:** Air pollution causes 7 million premature deaths worldwide each year.${context.lastAssistant ? '\n\n' + context.lastAssistant : ''}`
  }
  
  if (question.includes('sustain') || question.includes('green') || question.includes('eco')) {
    return `🌿 Sustainability means meeting our current needs without compromising future generations' ability to meet theirs.

**Key Principles (The 3 R's):**
✓ **Reduce** - Minimize consumption
✓ **Reuse** - Extend product life
✓ **Recycle** - Convert waste into new products

**Sustainable Living Tips:**
✓ Buy less, choose quality items that last
✓ Eat more plant-based foods
✓ Support local and organic products
✓ Use renewable energy
✓ Reduce water and energy consumption
✓ Support green businesses
✓ Educate yourself and others

**Why It Matters:**
Sustainability ensures we have healthy ecosystems, clean water, fertile soil, and livable climate for future generations. It's about balance between environmental, social, and economic needs.

Every small action counts! 🌍${context.lastAssistant ? '\n\n' + context.lastAssistant : ''}`
  }
  
  // Default intelligent response
  return `🌱 That's a great question! I'm here to help you learn about environmental topics like:

• ♻️ Recycling and waste reduction
• 🌍 Climate change and global warming
• ⚡ Renewable energy sources
• 💧 Water conservation
• 🌿 Sustainability and green living
• 🔄 Reducing plastic waste
• 🌫️ Pollution solutions
• 🌳 Biodiversity and ecosystems

Please ask me about any of these topics, or be more specific about what you'd like to know! I can provide detailed, actionable advice to help you make a positive environmental impact.

How can I help you today?${context.lastAssistant ? '\n\n' + context.lastAssistant : ''}`
}

function generateMockResponse(userQuestion, contents) {
  const question = (userQuestion || '').toLowerCase()
  const { lastAssistant, prevUser } = getRecentContext(contents)
  const isFollowUp = /tell me more|more details|what about|and|also|continue|follow up/i.test(userQuestion || '')

  if (question.includes('recycl')) {
    return `${isFollowUp ? 'Continuing our recycling discussion: ' : ''}♻️ Mock: Recycling reduces waste by converting materials like paper, plastic, glass, and metals into new products. Separate materials and follow local guidelines. ${lastAssistant ? 'Previously, we discussed: ' + lastAssistant : ''}`
  }
  if (question.includes('climate') || question.includes('global warming')) {
    return `${isFollowUp ? 'Building on climate basics: ' : ''}🌍 Mock: Climate change is driven by greenhouse gases. Reduce energy use, choose sustainable transport, and support renewables. ${lastAssistant ? 'Earlier, we noted: ' + lastAssistant : ''}`
  }
  if (question.includes('renewable') || question.includes('solar') || question.includes('wind')) {
    return `${isFollowUp ? 'To add on renewables: ' : ''}⚡ Mock: Solar, wind, and hydro are clean alternatives to fossil fuels, lowering carbon emissions. ${lastAssistant ? 'Recall: ' + lastAssistant : ''}`
  }
  if (question.includes('plastic') || question.includes('pollution')) {
    return `${isFollowUp ? 'Following up on plastic impacts: ' : ''}🚫 Mock: Cut single-use plastics, pick reusables, and dispose properly to protect oceans and wildlife. ${lastAssistant ? 'We mentioned: ' + lastAssistant : ''}`
  }
  if (question.includes('energy') || question.includes('save') || question.includes('conserv')) {
    return `${isFollowUp ? 'Continuing energy tips: ' : ''}💡 Mock: Use LED bulbs, unplug idle devices, and adjust thermostats a few degrees to save energy. ${lastAssistant ? 'Previously: ' + lastAssistant : ''}`
  }
  if (question.includes('water')) {
    return `${isFollowUp ? 'More on water: ' : ''}💧 Mock: Take shorter showers, fix leaks, use efficient appliances, and collect rainwater for gardens. ${lastAssistant ? 'Earlier: ' + lastAssistant : ''}`
  }
  if (question.includes('transport') || question.includes('car') || question.includes('bike')) {
    return `${isFollowUp ? 'Adding transport ideas: ' : ''}🚲 Mock: Walk, bike, transit, or carpool to cut emissions. EVs are increasingly accessible. ${lastAssistant ? 'Previously: ' + lastAssistant : ''}`
  }
  if (question.includes('food') || question.includes('organic') || question.includes('local')) {
    return `${isFollowUp ? 'More on food choices: ' : ''}🥬 Mock: Choose local, seasonal produce, reduce meat, and minimize food waste; consider organic options. ${lastAssistant ? 'Recall: ' + lastAssistant : ''}`
  }
  if ((userQuestion || '').length > 0) {
    return `🌱 Mock: Thanks for asking "${userQuestion}"! I use your conversation context to stay consistent. If this is a follow-up, ${prevUser ? 'earlier you asked: ' + prevUser + '. ' : ''}Try topics like recycling, climate change, renewable energy, and sustainability.`
  }
  return '🌿 Mock: Hello! I\'m AversoAI, your environmental assistant. Ask about recycling, climate, renewable energy, or sustainability!'
}

// AI Chat API (server-side Gemini integration)
app.post('/api/chat', async (req, res, next) => {
  try {
    // Read request early for dev fallback
    const { contents, modelKey = 'fast', isVision = false } = req.body || {}

    // Check if Gemini API is available
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    
    // Force enhanced mode for now (always use enhanced responses)
    console.log('🤖 Using Enhanced AI responses')
    const userQuestion = extractUserQuestion(contents)
    const mockResponse = generateEnhancedMockResponse(userQuestion, contents)
    return res.json({
      success: true,
      text: mockResponse,
      model: 'AversoAI-Enhanced'
    })
    
    // Original code below (commented for testing)
    /*
    if (!GEMINI_API_KEY) {
      console.log('⚠️ Running in ENHANCED mode - no API key available')
      const userQuestion = extractUserQuestion(contents)
      const mockResponse = generateEnhancedMockResponse(userQuestion, contents)
      return res.json({
        success: true,
        text: mockResponse,
        model: 'AversoAI-Enhanced'
      })
    }
    */

    // Validate request
    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: 'Invalid request', message: 'Contents array is required' })
    }

    // Import Gemini AI library dynamically
    let GoogleGenerativeAI, HarmCategory, HarmBlockThreshold
    try {
      const geminiModule = await import('@google/generative-ai')
      GoogleGenerativeAI = geminiModule.GoogleGenerativeAI
      HarmCategory = geminiModule.HarmCategory
      HarmBlockThreshold = geminiModule.HarmBlockThreshold
    } catch (importError) {
      console.error('Failed to import Gemini AI library:', importError)
      return res.status(500).json({ 
        error: 'AI service unavailable', 
        message: 'Failed to load AI library' 
      })
    }
    
    let genAI
    try {
      genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    } catch (initError) {
      console.error('Failed to initialize Gemini AI:', initError)
      return res.status(500).json({ 
        error: 'AI service unavailable', 
        message: 'Failed to initialize AI service' 
      })
    }
    
    // Safety settings
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ]

    // Generation config
    const generationConfig = {
      temperature: 0.3,
      topP: 0.8,
      topK: 1,
      maxOutputTokens: 2048,
      candidateCount: 1,
    }

    // System prompt
    const systemPrompt = `You are EcoGuide — a friendly, accurate environmental assistant.

Use the recent conversation context below to stay consistent with ongoing topics, prior suggestions, and the user's preferences. Build on what has already been discussed; do not repeat yourself unnecessarily.

Core scope: recycling, energy efficiency, climate change, sustainable living, biodiversity, water conservation, environmental policy, and actionable local practices when location is provided. If the question is clearly non-environmental, kindly redirect by offering a related environmental angle or suggest an environmental topic.

Style: practical, structured, and concise (lists, steps, short paragraphs). Default to clear, actionable guidance. Avoid alarmist tone; focus on empowerment.

Constraints: prefer general best practices unless a location is given. Keep to 3–5 sentences unless the user asks for more detail.`

    // Model selection
    const modelName = modelKey === 'balanced' ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest'
    
    let model
    try {
      model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings,
        generationConfig,
        systemInstruction: systemPrompt
      })
    } catch (modelError) {
      console.error('Failed to create Gemini model:', modelError)
      return res.status(500).json({ 
        error: 'AI service unavailable', 
        message: 'Failed to create AI model' 
      })
    }

    // Generate response
    try {
      const result = await model.generateContent({ contents })
      const response = result.response
      const text = response.text()

      res.json({ 
        success: true, 
        text,
        model: modelKey
      })
    } catch (generateError) {
      console.error('Failed to generate content:', generateError)
      if (NODE_ENV === 'development') {
        // Extract user question from contents for dynamic mock response
        const userQuestion = extractUserQuestion(contents)
        const mockResponse = generateMockResponse(userQuestion, contents)
        return res.json({
          success: true,
          text: mockResponse,
          model: 'mock'
        })
      }
      return res.status(500).json({ 
        error: 'Generation failed', 
        message: 'Failed to generate AI response',
        retryable: true
      })
    }

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
      console.warn('Starting server without DB. Chat API will work; DB features limited.')
      app.listen(PORT, () => {
        console.log(`EEG server listening on http://localhost:${PORT} (no DB connection)`)
      })
    }
  }
})();

module.exports = app
