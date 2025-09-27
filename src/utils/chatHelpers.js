/* Enhanced Chat helpers: topic enforcement, sentence limiting, storage helpers */

const ENV_TOPICS = [
    'climate', 'climate change', 'global warming', 'recycle', 'recycling', 'sustain', 'sustainability',
    'renewable', 'solar', 'wind', 'hydro', 'geothermal', 'conservation', 'biodiversity', 'pollution',
    'water', 'waste', 'plastic', 'compost', 'eco', 'green', 'carbon', 'footprint', 'emissions', 'energy',
    'deforestation', 'ocean', 'wildlife', 'habitat', 'transport', 'electric vehicle', 'ev', 'soil', 'tree',
    'forest', 'environment', 'ecosystem', 'organic', 'natural', 'greenhouse', 'ozone', 'renewable energy'
]

// Enhanced input sanitization with comprehensive cleaning
export function sanitizeInput(text) {
    if (!text || typeof text !== 'string') return ''
    return text
        .replace(/[\u0000-\u001F\u007F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .slice(0, 2000) // Prevent excessive input length
}

// Improved topic detection with fuzzy matching and context awareness
export function isEnvironmentalTopic(text) {
    if (!text || typeof text !== 'string') return false

    const normalized = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' ')
        .trim()

    // Direct keyword matching
    const hasDirectMatch = ENV_TOPICS.some(keyword =>
        normalized.includes(keyword.toLowerCase())
    )

    if (hasDirectMatch) return true

    // Context-aware patterns for environmental discussions
    const contextPatterns = [
        /\b(how to|ways to|tips for).*(save|protect|conserve|reduce)\b/i,
        /\b(eco.?friendly|environmentally safe|green alternative)\b/i,
        /\b(carbon.?neutral|zero.?waste|sustainable.?living)\b/i,
        /\b(clean.?energy|alternative.?fuel|green.?tech)\b/i
    ]

    return contextPatterns.some(pattern => pattern.test(text))
}

// Enhanced sentence limiting with better punctuation handling
export function limitToSentences(text, maxSentences = 3) {
    if (!text || typeof text !== 'string') return ''

    const normalized = text.replace(/\s+/g, ' ').trim()

    // Improved sentence splitting that handles abbreviations better
    const sentences = normalized
        .split(/(?<=[.!?])\s+(?=[A-Z])/g)
        .filter(sentence => sentence.trim().length > 0)
        .map(sentence => sentence.trim())

    const limited = sentences.slice(0, maxSentences).join(' ')
    return limited.length > 280 ? limited.slice(0, 277) + '...' : limited
}

// Enhanced emoji addition with context awareness
export function addPlayfulEmojis(text) {
    if (!text || typeof text !== 'string') return ''

    // Check if emojis already exist
    const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text)
    if (hasEmoji) return text

    // Context-aware emoji selection
    const emojiMap = {
        recycle: ['♻️', '🔄'],
        water: ['💧', '🌊'],
        energy: ['⚡', '🔋'],
        solar: ['☀️', '🌞'],
        wind: ['💨', '🌪️'],
        tree: ['🌳', '🌲'],
        plant: ['🌱', '🪴'],
        earth: ['🌍', '🌎', '🌏'],
        default: ['🌱', '♻️', '💧', '🌍', '🌞', '🌿', '🪴', '🌳']
    }

    // Find contextual emoji
    let selectedEmojis = emojiMap.default
    for (const [key, emojis] of Object.entries(emojiMap)) {
        if (key !== 'default' && text.toLowerCase().includes(key)) {
            selectedEmojis = emojis
            break
        }
    }

    const emoji = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)]
    return `${text} ${emoji}`
}

// Enhanced Gemini content builder with better error handling
export function buildGeminiContents(history, userText, systemPrompt) {
    const contents = []

    // Add system prompt if provided
    if (systemPrompt && typeof systemPrompt === 'string') {
        contents.push({
            role: 'user',
            parts: [{ text: `SYSTEM: ${systemPrompt}` }]
        })
    }

    // Process conversation history with validation
    const validHistory = Array.isArray(history) ? history : []
    const recentHistory = validHistory.slice(-12) // Increased context window

    recentHistory.forEach(message => {
        if (!message || typeof message !== 'object') return

        const role = message.role === 'assistant' ? 'model' : 'user'
        const content = sanitizeInput(message.content)

        if (content) {
            contents.push({
                role,
                parts: [{ text: content }]
            })
        }
    })

    // Add current user message
    const currentText = sanitizeInput(userText)
    if (currentText) {
        contents.push({
            role: 'user',
            parts: [{ text: currentText }]
        })
    }

    return contents
}

// Enhanced storage with compression and error recovery
const STORAGE_KEYS = {
    LEGACY_HISTORY: 'eco_chat_history_v1',
    SESSIONS: 'eco_chat_sessions_v2', // Incremented version for improvements
    ACTIVE_ID: 'eco_chat_active_id_v1',
    USER_PREFERENCES: 'eco_chat_preferences_v1'
}

const MAX_SESSIONS = 50 // Prevent unlimited storage growth
const SESSION_CLEANUP_THRESHOLD = 100

// Enhanced storage utilities with better error handling
function isStorageAvailable() {
    try {
        const test = '__storage_test__'
        localStorage.setItem(test, test)
        localStorage.removeItem(test)
        return true
    } catch {
        return false
    }
}

function compressData(data) {
    try {
        return JSON.stringify(data)
    } catch {
        return null
    }
}

function decompressData(compressed, fallback = null) {
    try {
        return JSON.parse(compressed)
    } catch {
        return fallback
    }
}

function readStorage(key, fallback = null) {
    if (!isStorageAvailable()) return fallback

    try {
        const raw = localStorage.getItem(key)
        return raw ? decompressData(raw, fallback) : fallback
    } catch (error) {
        console.warn(`Failed to read from storage (${key}):`, error)
        return fallback
    }
}

function writeStorage(key, value) {
    if (!isStorageAvailable()) return false

    try {
        const compressed = compressData(value)
        if (compressed) {
            localStorage.setItem(key, compressed)
            return true
        }
    } catch (error) {
        console.warn(`Failed to write to storage (${key}):`, error)
    }
    return false
}

// Enhanced session ID generation with better uniqueness
function generateSessionId() {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 10)
    return `s_${timestamp}_${random}`
}

// Improved title generation with better content extraction
function generateSessionTitle(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return 'New Chat'
    }

    const firstUserMessage = messages.find(m =>
        m?.role === 'user' &&
        m?.content &&
        typeof m.content === 'string'
    )

    if (!firstUserMessage) return 'New Chat'

    let title = sanitizeInput(firstUserMessage.content)

    // Extract meaningful keywords for title
    const words = title.split(' ').filter(word =>
        word.length > 2 &&
        !['the', 'and', 'but', 'for', 'are', 'with', 'how', 'what', 'why'].includes(word.toLowerCase())
    )

    title = words.slice(0, 6).join(' ')

    if (title.length > 50) {
        title = title.substring(0, 47) + '...'
    }

    return title || 'New Chat'
}

// Enhanced migration with better error recovery
function migrateLegacyData() {
    try {
        const existingSessions = readStorage(STORAGE_KEYS.SESSIONS, [])
        if (Array.isArray(existingSessions) && existingSessions.length > 0) {
            return // Already migrated
        }

        const legacyHistory = readStorage(STORAGE_KEYS.LEGACY_HISTORY, null)
        if (Array.isArray(legacyHistory) && legacyHistory.length > 0) {
            const sessionId = generateSessionId()
            const newSession = {
                id: sessionId,
                title: generateSessionTitle(legacyHistory),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                messages: legacyHistory,
                version: 2
            }

            writeStorage(STORAGE_KEYS.SESSIONS, [newSession])
            writeStorage(STORAGE_KEYS.ACTIVE_ID, sessionId)

            // Clean up legacy data
            try {
                localStorage.removeItem(STORAGE_KEYS.LEGACY_HISTORY)
            } catch { }
        }
    } catch (error) {
        console.warn('Failed to migrate legacy data:', error)
    }
}

// Enhanced session cleanup
function cleanupOldSessions() {
    try {
        const sessions = readStorage(STORAGE_KEYS.SESSIONS, [])
        if (!Array.isArray(sessions) || sessions.length <= MAX_SESSIONS) {
            return sessions
        }

        // Sort by updatedAt (most recent first) and keep only MAX_SESSIONS
        const sortedSessions = sessions
            .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
            .slice(0, MAX_SESSIONS)

        writeStorage(STORAGE_KEYS.SESSIONS, sortedSessions)
        return sortedSessions
    } catch (error) {
        console.warn('Failed to cleanup old sessions:', error)
        return []
    }
}

// Enhanced session management
function ensureActiveSession() {
    migrateLegacyData()

    let sessions = readStorage(STORAGE_KEYS.SESSIONS, [])
    if (!Array.isArray(sessions)) sessions = []

    // Cleanup if needed
    if (sessions.length > SESSION_CLEANUP_THRESHOLD) {
        sessions = cleanupOldSessions()
    }

    let activeId = readStorage(STORAGE_KEYS.ACTIVE_ID, null)

    // Create first session if none exist
    if (sessions.length === 0) {
        const sessionId = generateSessionId()
        const newSession = {
            id: sessionId,
            title: 'New Chat',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
            version: 2
        }

        sessions = [newSession]
        writeStorage(STORAGE_KEYS.SESSIONS, sessions)
        writeStorage(STORAGE_KEYS.ACTIVE_ID, sessionId)
        return newSession
    }

    // Find active session or use most recent
    let activeSession = sessions.find(s => s.id === activeId)
    if (!activeSession) {
        activeSession = sessions.sort((a, b) =>
            (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
        )[0]
        writeStorage(STORAGE_KEYS.ACTIVE_ID, activeSession.id)
    }

    return activeSession
}

// Public API functions with enhanced error handling
export function listSessions() {
    migrateLegacyData()
    const sessions = readStorage(STORAGE_KEYS.SESSIONS, [])

    if (!Array.isArray(sessions)) return []

    return sessions
        .filter(session => session && typeof session === 'object' && session.id)
        .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
}

export function createNewSession() {
    try {
        const sessions = readStorage(STORAGE_KEYS.SESSIONS, []) || []
        const sessionId = generateSessionId()
        const newSession = {
            id: sessionId,
            title: 'New Chat',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
            version: 2
        }

        sessions.unshift(newSession) // Add to beginning
        writeStorage(STORAGE_KEYS.SESSIONS, sessions)
        writeStorage(STORAGE_KEYS.ACTIVE_ID, sessionId)

        return sessionId
    } catch (error) {
        console.error('Failed to create new session:', error)
        return null
    }
}

export function switchToSession(sessionId) {
    try {
        const sessions = readStorage(STORAGE_KEYS.SESSIONS, [])
        const session = sessions.find(s => s?.id === sessionId)

        if (!session) {
            console.warn(`Session not found: ${sessionId}`)
            return null
        }

        // Update last accessed time
        session.updatedAt = Date.now()
        writeStorage(STORAGE_KEYS.SESSIONS, sessions)
        writeStorage(STORAGE_KEYS.ACTIVE_ID, sessionId)

        return session
    } catch (error) {
        console.error('Failed to switch to session:', error)
        return null
    }
}

export function deleteSession(sessionId) {
    try {
        let sessions = readStorage(STORAGE_KEYS.SESSIONS, [])
        const initialLength = sessions.length

        sessions = sessions.filter(s => s?.id !== sessionId)

        if (sessions.length === initialLength) {
            console.warn(`Session not found for deletion: ${sessionId}`)
            return false
        }

        writeStorage(STORAGE_KEYS.SESSIONS, sessions)

        const activeId = readStorage(STORAGE_KEYS.ACTIVE_ID, null)
        if (activeId === sessionId) {
            if (sessions.length > 0) {
                // Switch to most recent session
                const mostRecent = sessions.sort((a, b) =>
                    (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
                )[0]
                writeStorage(STORAGE_KEYS.ACTIVE_ID, mostRecent.id)
            } else {
                // Create new session if no sessions left
                createNewSession()
            }
        }

        return true
    } catch (error) {
        console.error('Failed to delete session:', error)
        return false
    }
}

export function loadChatHistory() {
    try {
        const activeSession = ensureActiveSession()
        return Array.isArray(activeSession.messages) ? activeSession.messages : []
    } catch (error) {
        console.error('Failed to load chat history:', error)
        return []
    }
}

export function saveChatHistory(messages) {
    try {
        if (!Array.isArray(messages)) {
            console.warn('Invalid messages array provided to saveChatHistory')
            return false
        }

        const sessions = readStorage(STORAGE_KEYS.SESSIONS, [])
        const activeId = readStorage(STORAGE_KEYS.ACTIVE_ID, null)

        const sessionIndex = sessions.findIndex(s => s?.id === activeId)

        if (sessionIndex >= 0) {
            // Update existing session
            sessions[sessionIndex] = {
                ...sessions[sessionIndex],
                title: generateSessionTitle(messages),
                messages: messages.map(msg => ({
                    ...msg,
                    content: sanitizeInput(msg.content) // Sanitize on save
                })),
                updatedAt: Date.now()
            }
        } else {
            // Create new session
            const sessionId = generateSessionId()
            sessions.unshift({
                id: sessionId,
                title: generateSessionTitle(messages),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                messages: messages.map(msg => ({
                    ...msg,
                    content: sanitizeInput(msg.content)
                })),
                version: 2
            })
            writeStorage(STORAGE_KEYS.ACTIVE_ID, sessionId)
        }

        return writeStorage(STORAGE_KEYS.SESSIONS, sessions)
    } catch (error) {
        console.error('Failed to save chat history:', error)
        return false
    }
}

// User preferences management
export function saveUserPreferences(preferences) {
    return writeStorage(STORAGE_KEYS.USER_PREFERENCES, {
        ...preferences,
        updatedAt: Date.now()
    })
}

export function loadUserPreferences() {
    return readStorage(STORAGE_KEYS.USER_PREFERENCES, {
        theme: 'auto',
        animations: true,
        sound: true,
        model: 'normal'
    })
}