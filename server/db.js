const crypto = require('crypto')
const { Pool } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.SUPABASE_POSTGRES_URL

let pool = null
let mode = 'memory' // 'pg' | 'memory'
if (DATABASE_URL) mode = 'pg'
else if (process.env.NODE_ENV === 'test') mode = 'memory'

let mem = null

function toPg(sql, params) {
  let i = 0
  const mapped = sql.replace(/\?/g, () => `$${++i}`)
  return { sql: mapped, params }
}

function initMemory() {
  mem = {
    users: [],
    friend_requests: [],
    friendships: [],
    dm_threads: new Map(), // threadKey -> { threadKey, aId, bId }
    dm_messages: [],
    dm_reads: new Map(), // `${threadKey}|${userId}` -> lastReadAt
    reactions: [],
    group_chats: [],
    group_members: [],
    group_messages: [],
    group_pins: new Set(),
    // Moderation & audit
    reports: [], // { id, reporterId, targetUserId, groupId, messageId, reason, evidence, status, createdAt }
    bans: [], // { id, userId, type, duration, createdAt }
    audit_logs: [] // { id, userId, action, details, ip, createdAt }
  }
}

function memGet(sql, params) {
  // Users
  if (sql === 'SELECT id FROM users WHERE email = ?') {
    const [email] = params
    const u = mem.users.find(x => x.email === email)
    return u ? { id: u.id } : undefined
  }
  if (sql === 'SELECT * FROM users WHERE id = ?') {
    const [id] = params
    return mem.users.find(x => x.id === id)
  }
  if (sql === 'SELECT * FROM users WHERE email = ?') {
    const [email] = params
    return mem.users.find(x => x.email === email)
  }
  // Friend requests
  if (sql === 'SELECT * FROM friend_requests WHERE id = ?') {
    const [id] = params
    return mem.friend_requests.find(x => x.id === id)
  }
  // Friendships OR dm
  if (sql === 'SELECT * FROM dm_messages WHERE threadKey = ? ORDER BY createdAt DESC LIMIT 1') {
    const [threadKey] = params
    const arr = mem.dm_messages.filter(x => x.threadKey === threadKey).sort((a,b) => b.createdAt - a.createdAt)
    return arr[0]
  }
  if (sql === 'SELECT lastReadAt FROM dm_reads WHERE threadKey = ? AND userId = ?') {
    const [threadKey, userId] = params
    const v = mem.dm_reads.get(`${threadKey}|${userId}`)
    return v != null ? { lastReadAt: v } : undefined
  }
  if (sql === 'SELECT COUNT(*) as c FROM dm_messages WHERE threadKey = ? AND createdAt > COALESCE(?,0)') {
    const [threadKey, ts] = params
    const c = mem.dm_messages.filter(x => x.threadKey === threadKey && x.createdAt > (ts || 0)).length
    return { c }
  }
  if (sql === 'SELECT * FROM dm_messages WHERE id = ?') {
    const [id] = params
    return mem.dm_messages.find(x => x.id === id)
  }
  // Moderation: latest ban for user
  if (sql === 'SELECT * FROM bans WHERE userId = ? ORDER BY createdAt DESC LIMIT 1') {
    const [userId] = params
    const rows = mem.bans.filter(b => b.userId === userId).sort((a,b) => Number(b.createdAt) - Number(a.createdAt))
    return rows[0]
  }
  // Groups
  if (sql === 'SELECT * FROM group_chats WHERE id = ?') {
    const [id] = params
    return mem.group_chats.find(x => x.id === id)
  }
  if (sql === 'SELECT * FROM reactions WHERE messageType=? AND messageId=? AND emoji=? AND userId=?') {
    const [messageType, messageId, emoji, userId] = params
    return mem.reactions.find(r => r.messageType === messageType && r.messageId === messageId && r.emoji === emoji && r.userId === userId)
  }
  return undefined
}

function memAll(sql, params) {
  if (sql === 'SELECT * FROM users') {
    return [...mem.users]
  }
  if (sql === 'SELECT * FROM friend_requests WHERE toId = ? AND status = ? ORDER BY createdAt DESC') {
    const [toId, status] = params
    return mem.friend_requests.filter(x => x.toId === toId && x.status === status).sort((a,b) => (b.createdAt > a.createdAt ? 1 : -1))
  }
  if (sql === 'SELECT * FROM friend_requests WHERE fromId = ? AND status = ? ORDER BY createdAt DESC') {
    const [fromId, status] = params
    return mem.friend_requests.filter(x => x.fromId === fromId && x.status === status).sort((a,b) => (b.createdAt > a.createdAt ? 1 : -1))
  }
  if (sql === 'SELECT * FROM friendships WHERE aId = ? OR bId = ?') {
    const [idA, idB] = params
    return mem.friendships.filter(x => x.aId === idA || x.bId === idB)
  }
  if (sql === 'SELECT * FROM dm_threads WHERE aId = ? OR bId = ?') {
    const [idA, idB] = params
    return [...mem.dm_threads.values()].filter(t => t.aId === idA || t.bId === idB)
  }
  if (sql === 'SELECT * FROM dm_messages WHERE threadKey = ? ORDER BY createdAt ASC') {
    const [threadKey] = params
    return mem.dm_messages.filter(x => x.threadKey === threadKey).sort((a,b) => a.createdAt - b.createdAt)
  }
  if (sql === 'SELECT gc.* FROM group_chats gc JOIN group_members gm ON gc.id = gm.groupId WHERE gm.userId = ?') {
    const [userId] = params
    const myGroupIds = new Set(mem.group_members.filter(m => m.userId === userId).map(m => m.groupId))
    return mem.group_chats.filter(g => myGroupIds.has(g.id))
  }
  if (sql === 'SELECT * FROM group_messages WHERE groupId = ? ORDER BY createdAt ASC') {
    const [groupId] = params
    return mem.group_messages.filter(m => m.groupId === groupId).sort((a,b) => (a.createdAt > b.createdAt ? 1 : -1))
  }
  if (sql === 'SELECT * FROM reports ORDER BY createdAt DESC') {
    return [...mem.reports].sort((a,b) => Number(b.createdAt) - Number(a.createdAt))
  }
  if (sql === 'SELECT * FROM group_chats') {
    return [...mem.group_chats]
  }
  return []
}

function memRun(sql, params) {
  // Users
  if (sql === 'INSERT INTO users (id,name,email,passwordHash,bio,avatarUrl,createdAt) VALUES (?,?,?,?,?,?,?)') {
    const [id, name, email, passwordHash, bio, avatarUrl, createdAt] = params
    mem.users.push({ id, name, email, passwordHash, bio, avatarUrl, createdAt })
    return { rowCount: 1 }
  }
  if (sql === 'UPDATE users SET name=?, email=?, bio=?, avatarUrl=? WHERE id=?') {
    const [name, email, bio, avatarUrl, id] = params
    const u = mem.users.find(x => x.id === id)
    if (u) { u.name = name; u.email = email; u.bio = bio; u.avatarUrl = avatarUrl }
    return { rowCount: u ? 1 : 0 }
  }
  if (sql === 'UPDATE users SET passwordHash=? WHERE id=?') {
    const [passwordHash, id] = params
    const u = mem.users.find(x => x.id === id)
    if (u) u.passwordHash = passwordHash
    return { rowCount: u ? 1 : 0 }
  }
  if (sql === 'UPDATE users SET publicKeyJwk=? WHERE id=?') {
    const [jwk, id] = params
    const u = mem.users.find(x => x.id === id)
    if (u) u.publicKeyJwk = jwk
    return { rowCount: u ? 1 : 0 }
  }
  // Friend requests
  if (sql === 'INSERT INTO friend_requests (id, fromId, toId, status, createdAt) VALUES (?,?,?,?,?)') {
    const [id, fromId, toId, status, createdAt] = params
    mem.friend_requests.push({ id, fromId, toId, status, createdAt })
    return { rowCount: 1 }
  }
  if (sql === 'UPDATE friend_requests SET status = ? WHERE id = ?') {
    const [status, id] = params
    const r = mem.friend_requests.find(x => x.id === id)
    if (r) r.status = status
    return { rowCount: r ? 1 : 0 }
  }
  if (sql === 'DELETE FROM friend_requests WHERE id = ?') {
    const [id] = params
    const idx = mem.friend_requests.findIndex(x => x.id === id)
    if (idx >= 0) mem.friend_requests.splice(idx, 1)
    return { rowCount: idx >= 0 ? 1 : 0 }
  }
  // Friendships
  if (sql === 'INSERT INTO friendships (id, aId, bId, since) VALUES (?,?,?,?)') {
    const [id, aId, bId, since] = params
    mem.friendships.push({ id, aId, bId, since })
    return { rowCount: 1 }
  }
  // DMs
  if (sql === 'INSERT INTO dm_messages (id, threadKey, userId, content, attachments, replyToId, createdAt) VALUES (?,?,?,?,?,?,?)') {
    const [id, threadKey, userId, content, attachments, replyToId, createdAt] = params
    mem.dm_messages.push({ id, threadKey, userId, content, attachments, replyToId, createdAt })
    return { rowCount: 1 }
  }
  if (sql === 'UPDATE dm_messages SET content = ?, editedAt = ? WHERE id = ?') {
    const [content, editedAt, id] = params
    const m = mem.dm_messages.find(x => x.id === id)
    if (m) { m.content = content; m.editedAt = editedAt }
    return { rowCount: m ? 1 : 0 }
  }
  if (sql === 'DELETE FROM dm_messages WHERE id = ?') {
    const [id] = params
    const idx = mem.dm_messages.findIndex(x => x.id === id)
    if (idx >= 0) mem.dm_messages.splice(idx, 1)
    return { rowCount: idx >= 0 ? 1 : 0 }
  }
  // Reactions
  if (sql === 'DELETE FROM reactions WHERE id = ?') {
    const [id] = params
    const idx = mem.reactions.findIndex(x => x.id === id)
    if (idx >= 0) mem.reactions.splice(idx, 1)
    return { rowCount: idx >= 0 ? 1 : 0 }
  }
  if (sql === 'INSERT INTO reactions (id, messageType, messageId, emoji, userId) VALUES (?,?,?,?,?)') {
    const [id, messageType, messageId, emoji, userId] = params
    mem.reactions.push({ id, messageType, messageId, emoji, userId })
    return { rowCount: 1 }
  }
  // Groups (minimal coverage for completeness)
  if (sql === 'INSERT INTO group_members (id, groupId, userId, role, joinedAt) VALUES (?,?,?,?,?)') {
    const [id, groupId, userId, role, joinedAt] = params
    mem.group_members.push({ id, groupId, userId, role, joinedAt })
    return { rowCount: 1 }
  }
  if (sql === 'DELETE FROM group_members WHERE groupId = ? AND userId = ?') {
    const [groupId, userId] = params
    const idx = mem.group_members.findIndex(m => m.groupId === groupId && m.userId === userId)
    if (idx >= 0) mem.group_members.splice(idx, 1)
    return { rowCount: idx >= 0 ? 1 : 0 }
  }
  if (sql === 'INSERT INTO group_chats (id, name, description, isPrivate, inviteCode, createdAt, createdBy) VALUES (?,?,?,?,?,?,?)') {
    const [id, name, description, isPrivate, inviteCode, createdAt, createdBy] = params
    mem.group_chats.push({ id, name, description, isPrivate, inviteCode, createdAt, createdBy })
    return { rowCount: 1 }
  }
  if (sql === 'UPDATE group_chats SET name=?, description=?, isPrivate=? WHERE id=?') {
    const [name, description, isPrivate, id] = params
    const g = mem.group_chats.find(x => x.id === id)
    if (g) { g.name = name; g.description = description; g.isPrivate = isPrivate }
    return { rowCount: g ? 1 : 0 }
  }
  if (sql === 'INSERT INTO group_messages (id, groupId, userId, content, attachments, replyToId, createdAt) VALUES (?,?,?,?,?,?,?)') {
    const [id, groupId, userId, content, attachments, replyToId, createdAt] = params
    mem.group_messages.push({ id, groupId, userId, content, attachments, replyToId, createdAt })
    return { rowCount: 1 }
  }
  // Moderation & audit
  if (sql === 'INSERT INTO reports (id, reporterId, targetUserId, groupId, messageId, reason, evidence, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?)') {
    const [id, reporterId, targetUserId, groupId, messageId, reason, evidence, status, createdAt] = params
    mem.reports.push({ id, reporterId, targetUserId, groupId, messageId, reason, evidence, status, createdAt })
    return { rowCount: 1 }
  }
  if (sql === 'UPDATE reports SET status = ? WHERE id = ?') {
    const [status, id] = params
    const r = mem.reports.find(x => x.id === id)
    if (r) r.status = status
    return { rowCount: r ? 1 : 0 }
  }
  if (sql === 'INSERT INTO bans (id, userId, type, duration, createdAt) VALUES (?,?,?,?,?)') {
    const [id, userId, type, duration, createdAt] = params
    mem.bans.push({ id, userId, type, duration, createdAt })
    return { rowCount: 1 }
  }
  if (sql === 'INSERT INTO audit_logs (id, userId, action, details, ip, createdAt) VALUES (?,?,?,?,?,?)') {
    const [id, userId, action, details, ip, createdAt] = params
    mem.audit_logs.push({ id, userId, action, details, ip, createdAt })
    return { rowCount: 1 }
  }
  return { rowCount: 0 }
}

const db = {
  async get(sql, ...params) {
    if (mode === 'pg') {
      const { sql: s, params: p } = toPg(sql, params)
      const res = await pool.query(s, p)
      return res.rows[0]
    }
    return memGet(sql, params)
  },
  async all(sql, ...params) {
    if (mode === 'pg') {
      const { sql: s, params: p } = toPg(sql, params)
      const res = await pool.query(s, p)
      return res.rows
    }
    return memAll(sql, params)
  },
  async run(sql, ...params) {
    if (mode === 'pg') {
      const { sql: s, params: p } = toPg(sql, params)
      const res = await pool.query(s, p)
      return { rowCount: res.rowCount }
    }
    return memRun(sql, params)
  },
}

async function init() {
  if (mode === 'pg') {
    pool = new Pool({ connectionString: DATABASE_URL, ssl: DATABASE_URL.includes('supabase.co') ? { rejectUnauthorized: false } : undefined })
    const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      bio TEXT,
      avatarUrl TEXT,
      publicKeyJwk TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS friend_requests (
      id TEXT PRIMARY KEY,
      fromId TEXT NOT NULL,
      toId TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS friendships (
      id TEXT PRIMARY KEY,
      aId TEXT NOT NULL,
      bId TEXT NOT NULL,
      since TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dm_threads (
      threadKey TEXT PRIMARY KEY,
      aId TEXT NOT NULL,
      bId TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dm_messages (
      id TEXT PRIMARY KEY,
      threadKey TEXT NOT NULL,
      userId TEXT NOT NULL,
      content TEXT,
      attachments TEXT,
      replyToId TEXT,
      createdAt BIGINT NOT NULL,
      editedAt BIGINT
    );

    CREATE TABLE IF NOT EXISTS dm_keys (
      threadKey TEXT NOT NULL,
      forUserId TEXT NOT NULL,
      encKey TEXT NOT NULL,
      nonce TEXT NOT NULL,
      PRIMARY KEY (threadKey, forUserId)
    );

    CREATE TABLE IF NOT EXISTS group_chats (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      isPrivate INTEGER NOT NULL,
      inviteCode TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      createdBy TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id TEXT PRIMARY KEY,
      groupId TEXT NOT NULL,
      userId TEXT NOT NULL,
      role TEXT NOT NULL,
      joinedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS group_messages (
      id TEXT PRIMARY KEY,
      groupId TEXT NOT NULL,
      userId TEXT NOT NULL,
      content TEXT,
      attachments TEXT,
      replyToId TEXT,
      createdAt TEXT NOT NULL,
      editedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS group_keys (
      groupId TEXT NOT NULL,
      forUserId TEXT NOT NULL,
      encKey TEXT NOT NULL,
      nonce TEXT NOT NULL,
      PRIMARY KEY (groupId, forUserId)
    );

    CREATE TABLE IF NOT EXISTS reactions (
      id TEXT PRIMARY KEY,
      messageType TEXT NOT NULL,
      messageId TEXT NOT NULL,
      emoji TEXT NOT NULL,
      userId TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dm_reads (
      threadKey TEXT NOT NULL,
      userId TEXT NOT NULL,
      lastReadAt BIGINT NOT NULL,
      PRIMARY KEY (threadKey, userId)
    );

    CREATE TABLE IF NOT EXISTS group_reads (
      groupId TEXT NOT NULL,
      userId TEXT NOT NULL,
      lastReadAt BIGINT NOT NULL,
      PRIMARY KEY (groupId, userId)
    );

    CREATE TABLE IF NOT EXISTS group_pins (
      groupId TEXT NOT NULL,
      messageId TEXT NOT NULL,
      PRIMARY KEY (groupId, messageId)
    );

    -- Moderation: reports and bans
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporterId TEXT NOT NULL,
      targetUserId TEXT,
      groupId TEXT,
      messageId TEXT,
      reason TEXT NOT NULL,
      evidence TEXT,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bans (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      duration BIGINT,
      createdAt BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip TEXT,
      createdAt TEXT NOT NULL
    );
    `
    await pool.query(schema)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_friend_requests_to_status ON friend_requests (toId, status);
      CREATE INDEX IF NOT EXISTS idx_friend_requests_from_status ON friend_requests (fromId, status);
      CREATE INDEX IF NOT EXISTS idx_friendships_aId ON friendships (aId);
      CREATE INDEX IF NOT EXISTS idx_friendships_bId ON friendships (bId);
      CREATE INDEX IF NOT EXISTS idx_dm_messages_thread_created ON dm_messages (threadKey, createdAt);
      CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members (groupId);
      CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members (userId);
      CREATE INDEX IF NOT EXISTS idx_group_messages_group_created ON group_messages (groupId, createdAt);
      CREATE INDEX IF NOT EXISTS idx_group_chats_name ON group_chats (name);
      CREATE INDEX IF NOT EXISTS idx_group_chats_description ON group_chats (description);
      CREATE INDEX IF NOT EXISTS idx_bans_user ON bans (userId);
      CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
    `)
    return
  }
  // memory mode: initialize in-memory structures
  initMemory()
  console.warn('Database not configured. Using in-memory store for tests/health. Set DATABASE_URL for persistence.')
}

function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`
}

async function insertDmThreadIgnore(threadKey, aId, bId) {
  if (mode === 'pg') {
    await db.run('INSERT INTO dm_threads (threadKey, aId, bId) VALUES (?,?,?) ON CONFLICT (threadKey) DO NOTHING', threadKey, aId, bId)
    return
  }
  if (!mem.dm_threads.has(threadKey)) mem.dm_threads.set(threadKey, { threadKey, aId, bId })
}

async function upsertDmRead(threadKey, userId, lastReadAt) {
  if (mode === 'pg') {
    await db.run('INSERT INTO dm_reads (threadKey, userId, lastReadAt) VALUES (?,?,?) ON CONFLICT (threadKey, userId) DO UPDATE SET lastReadAt = EXCLUDED.lastReadAt', threadKey, userId, lastReadAt)
    return
  }
  mem.dm_reads.set(`${threadKey}|${userId}`, lastReadAt)
}

async function insertGroupPinIgnore(groupId, messageId) {
  if (mode === 'pg') {
    await db.run('INSERT INTO group_pins (groupId, messageId) VALUES (?,?) ON CONFLICT (groupId, messageId) DO NOTHING', groupId, messageId)
    return
  }
  mem.group_pins.add(`${groupId}|${messageId}`)
}

module.exports = { db, init, newId, insertDmThreadIgnore, upsertDmRead, insertGroupPinIgnore }
