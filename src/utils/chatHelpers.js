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

const STORAGE_KEY = 'eco_chat_history_v1'

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function persistHistory(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {}
}
