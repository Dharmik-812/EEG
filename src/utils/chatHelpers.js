/* Chat helpers: topic enforcement, sentence limiting, storage helpers */

const ENV_TOPICS = [
  'climate', 'climate change', 'global warming', 'recycle', 'recycling', 'sustain', 'sustainability',
  'renewable', 'solar', 'wind', 'hydro', 'geothermal', 'conservation', 'biodiversity', 'pollution',
  'water', 'waste', 'plastic', 'compost', 'eco', 'green', 'carbon', 'footprint', 'emissions', 'energy',
  'deforestation', 'ocean', 'wildlife', 'habitat', 'transport', 'electric vehicle', 'ev', 'soil', 'tree', 'forest'
]

export function sanitizeInput(text) {
  return (text || '').replace(/[\u0000-\u001F\u007F]/g, '').trim()
}

export function isEnvironmentalTopic(text) {
  if (!text) return false
  const t = text.toLowerCase()
  return ENV_TOPICS.some(k => t.includes(k))
}

export function limitToSentences(text, max = 3) {
  if (!text) return ''
  const parts = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
  const clipped = parts.slice(0, max).join(' ')
  return clipped.trim()
}

export function addPlayfulEmojis(text) {
  if (!text) return ''
  // Light touch: ensure at least one fun emoji exists
  if (!/[\u{1F300}-\u{1FAFF}]/u.test(text)) {
    const emojis = ['🌱', '♻️', '💧', '🌍', '🌞', '🌿', '🪴']
    const pick = emojis[Math.floor(Math.random() * emojis.length)]
    return `${text} ${pick}`
  }
  return text
}

// Convert app messages to Gemini contents (turns)
export function buildGeminiContents(history, userText, systemPrompt) {
  const turns = []
  if (systemPrompt) {
    turns.push({ role: 'user', parts: [{ text: `SYSTEM: ${systemPrompt}` }] })
  }
  const capped = (history || []).slice(-8) // last 8 turns for brevity
  capped.forEach(m => {
    const role = m.role === 'assistant' ? 'model' : 'user'
    turns.push({ role, parts: [{ text: m.content }] })
  })
  turns.push({ role: 'user', parts: [{ text: userText }] })
  return turns
}

// Session-aware storage (migrates from legacy single-history storage)
const LEGACY_HISTORY_KEY = 'eco_chat_history_v1'
const SESSIONS_KEY = 'eco_chat_sessions_v1'
const ACTIVE_ID_KEY = 'eco_chat_active_id_v1'

function nowId() { return 's_' + Math.random().toString(36).slice(2, 10) }

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

function titleFromMessages(msgs) {
  const firstUser = (msgs || []).find(m => m.role === 'user')
  if (firstUser && firstUser.content) {
    const t = String(firstUser.content).trim().slice(0, 40)
    return t || 'New chat'
  }
  return 'New chat'
}

function migrateLegacyIfNeeded() {
  const sessions = readJSON(SESSIONS_KEY, null)
  if (Array.isArray(sessions) && sessions.length) return
  const legacy = readJSON(LEGACY_HISTORY_KEY, null)
  if (Array.isArray(legacy)) {
    const sid = nowId()
    const newSessions = [{ id: sid, title: titleFromMessages(legacy), createdAt: Date.now(), messages: legacy }]
    writeJSON(SESSIONS_KEY, newSessions)
    writeJSON(ACTIVE_ID_KEY, sid)
    try { localStorage.removeItem(LEGACY_HISTORY_KEY) } catch {}
  }
}

function ensureActiveSession() {
  migrateLegacyIfNeeded()
  let sessions = readJSON(SESSIONS_KEY, [])
  let activeId = readJSON(ACTIVE_ID_KEY, null)
  if (!Array.isArray(sessions)) sessions = []
  if (!sessions.length) {
    const sid = nowId()
    sessions = [{ id: sid, title: 'New chat', createdAt: Date.now(), messages: [] }]
    writeJSON(SESSIONS_KEY, sessions)
    writeJSON(ACTIVE_ID_KEY, sid)
    return sessions[0]
  }
  const found = sessions.find(s => s.id === activeId) || sessions[0]
  if (!activeId || !sessions.find(s => s.id === activeId)) {
    writeJSON(ACTIVE_ID_KEY, found.id)
  }
  return found
}

export function listSessions() {
  migrateLegacyIfNeeded()
  const sessions = readJSON(SESSIONS_KEY, [])
  return Array.isArray(sessions) ? sessions.sort((a,b)=>b.createdAt-a.createdAt) : []
}

export function newSession() {
  const sessions = readJSON(SESSIONS_KEY, []) || []
  const sid = nowId()
  const ses = { id: sid, title: 'New chat', createdAt: Date.now(), messages: [] }
  sessions.push(ses)
  writeJSON(SESSIONS_KEY, sessions)
  writeJSON(ACTIVE_ID_KEY, sid)
  return sid
}

export function openSession(id) {
  const sessions = readJSON(SESSIONS_KEY, []) || []
  const found = sessions.find(s => s.id === id)
  if (!found) return null
  writeJSON(ACTIVE_ID_KEY, id)
  return found
}

export function deleteSession(id) {
  let sessions = readJSON(SESSIONS_KEY, []) || []
  sessions = sessions.filter(s => s.id !== id)
  writeJSON(SESSIONS_KEY, sessions)
  const activeId = readJSON(ACTIVE_ID_KEY, null)
  if (activeId === id) {
    if (sessions[0]) writeJSON(ACTIVE_ID_KEY, sessions[0].id)
    else newSession()
  }
}

export function loadHistory() {
  try {
    const active = ensureActiveSession()
    return Array.isArray(active.messages) ? active.messages : []
  } catch {
    return []
  }
}

export function persistHistory(messages) {
  try {
    const sessions = readJSON(SESSIONS_KEY, []) || []
    const activeId = readJSON(ACTIVE_ID_KEY, null)
    const idx = sessions.findIndex(s => s.id === activeId)
    if (idx >= 0) {
      const title = titleFromMessages(messages)
      sessions[idx] = { ...sessions[idx], title, messages }
      writeJSON(SESSIONS_KEY, sessions)
    } else {
      const sid = nowId()
      sessions.push({ id: sid, title: titleFromMessages(messages), createdAt: Date.now(), messages })
      writeJSON(SESSIONS_KEY, sessions)
      writeJSON(ACTIVE_ID_KEY, sid)
    }
  } catch {}
}
