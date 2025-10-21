/**
 * Chat Helper Functions for AversoAI
 * 
 * This module provides utility functions for chat operations including
 * input sanitization, topic detection, content formatting, and storage management.
 */

// Environmental topics for topic detection
const ENV_TOPICS = [
    'climate', 'climate change', 'global warming', 'recycle', 'recycling', 'sustain', 'sustainability',
    'renewable', 'solar', 'wind', 'hydro', 'geothermal', 'conservation', 'biodiversity', 'pollution',
    'water', 'waste', 'plastic', 'compost', 'eco', 'green', 'carbon', 'footprint', 'emissions', 'energy',
    'deforestation', 'ocean', 'wildlife', 'habitat', 'transport', 'electric vehicle', 'ev', 'soil', 'tree',
    'forest', 'environment', 'ecosystem', 'organic', 'natural', 'greenhouse', 'ozone', 'renewable energy'
];

// Storage keys for persistence
const STORAGE_KEYS = {
    LEGACY_HISTORY: 'eco_chat_history_v1',
    SESSIONS: 'eco_chat_sessions_v2',
    ACTIVE_ID: 'eco_chat_active_id_v1',
    USER_PREFERENCES: 'eco_chat_preferences_v1'
};

const MAX_SESSIONS = 50;
const SESSION_CLEANUP_THRESHOLD = 100;

/**
 * Enhanced input sanitization with comprehensive cleaning
 * @param {string} text - Input text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeInput(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/[\u0000-\u001F\u007F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .slice(0, 2000); // Prevent excessive input length
}

/**
 * Improved topic detection with fuzzy matching and context awareness
 * @param {string} text - Text to check for environmental topics
 * @returns {boolean} True if text is about environmental topics
 */
export function isEnvironmentalTopic(text) {
    if (!text || typeof text !== 'string') return false;

    const normalized = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' ')
        .trim();

    // Direct keyword matching
    const hasDirectMatch = ENV_TOPICS.some(keyword =>
        normalized.includes(keyword.toLowerCase())
    );

    if (hasDirectMatch) return true;

    // Context-aware patterns for environmental discussions
    const contextPatterns = [
        /\b(how to|ways to|tips for).*(save|protect|conserve|reduce)\b/i,
        /\b(eco.?friendly|environmentally safe|green alternative)\b/i,
        /\b(carbon.?neutral|zero.?waste|sustainable.?living)\b/i,
        /\b(clean.?energy|alternative.?fuel|green.?tech)\b/i
    ];

    return contextPatterns.some(pattern => pattern.test(text));
}

/**
 * Enhanced sentence limiting with better punctuation handling
 * @param {string} text - Text to limit
 * @param {number} maxSentences - Maximum number of sentences
 * @returns {string} Limited text
 */
export function limitToSentences(text, maxSentences = 3) {
    if (!text || typeof text !== 'string') return '';

    const normalized = text.replace(/\s+/g, ' ').trim();

    // Improved sentence splitting that handles abbreviations better
    const sentences = normalized
        .split(/(?<=[.!?])\s+(?=[A-Z])/g)
        .filter(sentence => sentence.trim().length > 0)
        .map(sentence => sentence.trim());

    const limited = sentences.slice(0, maxSentences).join(' ');
    return limited.length > 280 ? limited.slice(0, 277) + '...' : limited;
}

/**
 * Enhanced emoji addition with context awareness
 * @param {string} text - Text to add emojis to
 * @returns {string} Text with emojis
 */
export function addPlayfulEmojis(text) {
    if (!text || typeof text !== 'string') return '';

    // Check if emojis already exist
    const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text);
    if (hasEmoji) return text;

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
    };

    // Find contextual emoji
    let selectedEmojis = emojiMap.default;
    for (const [key, emojis] of Object.entries(emojiMap)) {
        if (key !== 'default' && text.toLowerCase().includes(key)) {
            selectedEmojis = emojis;
            break;
        }
    }

    const emoji = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
    return `${text} ${emoji}`;
}

/**
 * Builds the content structure for Gemini API
 * @param {Array} history - Chat history array
 * @param {string} userText - Current user message
 * @returns {Array} Formatted contents for the Gemini API
 */
export function buildGeminiContents(history, userText) {
    const contents = [];
    
    try {
        // Add chat history (limited to last 20 messages for performance)
        const recentHistory = history.slice(-20);
        
        for (const msg of recentHistory) {
            if (msg.role === 'user' || msg.role === 'assistant') {
                contents.push({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                });
            }
        }
        
        // Ensure the latest user message is included
        if (!recentHistory.some(msg => 
            msg.role === 'user' && msg.content === userText)) {
            contents.push({
                role: 'user',
                parts: [{ text: userText }]
            });
        }
        
        return contents;
    } catch (error) {
        console.error('Error building Gemini contents:', error);
        // Fallback to basic content structure
        return [
            { role: 'user', parts: [{ text: userText }] }
        ];
    }
}

// Storage utility functions
function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}

function compressData(data) {
    try {
        return JSON.stringify(data);
    } catch {
        return null;
    }
}

function decompressData(compressed, fallback = null) {
    try {
        return JSON.parse(compressed);
    } catch {
        return fallback;
    }
}

function readStorage(key, fallback = null) {
    if (!isStorageAvailable()) return fallback;

    try {
        const raw = localStorage.getItem(key);
        return raw ? decompressData(raw, fallback) : fallback;
    } catch (error) {
        console.warn(`Failed to read from storage (${key}):`, error);
        return fallback;
    }
}

function writeStorage(key, value) {
    if (!isStorageAvailable()) return false;

    try {
        const compressed = compressData(value);
        if (compressed) {
            localStorage.setItem(key, compressed);
            return true;
        }
    } catch (error) {
        console.warn(`Failed to write to storage (${key}):`, error);
    }
    return false;
}

// Enhanced session ID generation with better uniqueness
function generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `s_${timestamp}_${random}`;
}

// Improved title generation with better content extraction
function generateSessionTitle(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return 'New Chat';
    }

    const firstUserMessage = messages.find(m =>
        m?.role === 'user' &&
        m?.content &&
        typeof m.content === 'string'
    );

    if (!firstUserMessage) return 'New Chat';

    let title = sanitizeInput(firstUserMessage.content);

    // Extract meaningful keywords for title
    const words = title.split(' ').filter(word =>
        word.length > 2 &&
        !['the', 'and', 'but', 'for', 'are', 'with', 'how', 'what', 'why'].includes(word.toLowerCase())
    );

    title = words.slice(0, 6).join(' ');

    if (title.length > 50) {
        title = title.substring(0, 47) + '...';
    }

    return title || 'New Chat';
}

// Enhanced migration with better error recovery
function migrateLegacyData() {
    try {
        const existingSessions = readStorage(STORAGE_KEYS.SESSIONS, []);
        if (Array.isArray(existingSessions) && existingSessions.length > 0) {
            return; // Already migrated
        }

        const legacyHistory = readStorage(STORAGE_KEYS.LEGACY_HISTORY, null);
        if (Array.isArray(legacyHistory) && legacyHistory.length > 0) {
            const sessionId = generateSessionId();
            const newSession = {
                id: sessionId,
                title: generateSessionTitle(legacyHistory),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                messages: legacyHistory,
                version: 2
            };

            writeStorage(STORAGE_KEYS.SESSIONS, [newSession]);
            writeStorage(STORAGE_KEYS.ACTIVE_ID, sessionId);

            // Clean up legacy data
            try {
                localStorage.removeItem(STORAGE_KEYS.LEGACY_HISTORY);
            } catch { }
        }
    } catch (error) {
        console.warn('Failed to migrate legacy data:', error);
    }
}

// Enhanced session cleanup
function cleanupOldSessions() {
    try {
        const sessions = readStorage(STORAGE_KEYS.SESSIONS, []);
        if (!Array.isArray(sessions) || sessions.length <= MAX_SESSIONS) {
            return sessions;
        }

        // Sort by updatedAt (most recent first) and keep only MAX_SESSIONS
        const sortedSessions = sessions
            .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
            .slice(0, MAX_SESSIONS);

        writeStorage(STORAGE_KEYS.SESSIONS, sortedSessions);
        return sortedSessions;
    } catch (error) {
        console.warn('Failed to cleanup old sessions:', error);
        return [];
    }
}

// Enhanced session management
function ensureActiveSession() {
    migrateLegacyData();

    let sessions = readStorage(STORAGE_KEYS.SESSIONS, []);
    if (!Array.isArray(sessions)) sessions = [];

    // Cleanup if needed
    if (sessions.length > SESSION_CLEANUP_THRESHOLD) {
        sessions = cleanupOldSessions();
    }

    let activeId = readStorage(STORAGE_KEYS.ACTIVE_ID, null);

    // Create first session if none exist
    if (sessions.length === 0) {
        const sessionId = generateSessionId();
        const newSession = {
            id: sessionId,
            title: 'New Chat',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
            version: 2
        };

        sessions = [newSession];
        writeStorage(STORAGE_KEYS.SESSIONS, sessions);
        writeStorage(STORAGE_KEYS.ACTIVE_ID, sessionId);
        return newSession;
    }

    // Find active session or use most recent
    let activeSession = sessions.find(s => s.id === activeId);
    if (!activeSession) {
        activeSession = sessions.sort((a, b) =>
            (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
        )[0];
        writeStorage(STORAGE_KEYS.ACTIVE_ID, activeSession.id);
    }

    return activeSession;
}

// Public API functions with enhanced error handling

/**
 * List all chat sessions
 * @returns {Array} Array of session objects
 */
export function listSessions() {
    migrateLegacyData();
    const sessions = readStorage(STORAGE_KEYS.SESSIONS, []);

    if (!Array.isArray(sessions)) return [];

    return sessions
        .filter(session => session && typeof session === 'object' && session.id)
        .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

/**
 * Create a new chat session
 * @returns {string|null} New session ID or null on failure
 */
export function createNewSession() {
    try {
        const sessions = readStorage(STORAGE_KEYS.SESSIONS, []) || [];
        const sessionId = generateSessionId();
        const newSession = {
            id: sessionId,
            title: 'New Chat',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
            version: 2
        };

        sessions.unshift(newSession); // Add to beginning
        writeStorage(STORAGE_KEYS.SESSIONS, sessions);
        writeStorage(STORAGE_KEYS.ACTIVE_ID, sessionId);

        return sessionId;
    } catch (error) {
        console.error('Failed to create new session:', error);
        return null;
    }
}

/**
 * Switch to a specific chat session
 * @param {string} sessionId - Session ID to switch to
 * @returns {Object|null} Session object or null if not found
 */
export function switchToSession(sessionId) {
    try {
        const sessions = readStorage(STORAGE_KEYS.SESSIONS, []);
        const session = sessions.find(s => s?.id === sessionId);

        if (!session) {
            console.warn(`Session not found: ${sessionId}`);
            return null;
        }

        // Update last accessed time
        session.updatedAt = Date.now();
        writeStorage(STORAGE_KEYS.SESSIONS, sessions);
        writeStorage(STORAGE_KEYS.ACTIVE_ID, sessionId);

        return session;
    } catch (error) {
        console.error('Failed to switch to session:', error);
        return null;
    }
}

/**
 * Delete a chat session
 * @param {string} sessionId - Session ID to delete
 * @returns {boolean} True if deletion was successful
 */
export function deleteSession(sessionId) {
    try {
        let sessions = readStorage(STORAGE_KEYS.SESSIONS, []);
        const initialLength = sessions.length;

        sessions = sessions.filter(s => s?.id !== sessionId);

        if (sessions.length === initialLength) {
            console.warn(`Session not found for deletion: ${sessionId}`);
            return false;
        }

        writeStorage(STORAGE_KEYS.SESSIONS, sessions);

        const activeId = readStorage(STORAGE_KEYS.ACTIVE_ID, null);
        if (activeId === sessionId) {
            if (sessions.length > 0) {
                // Switch to most recent session
                const mostRecent = sessions.sort((a, b) =>
                    (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
                )[0];
                writeStorage(STORAGE_KEYS.ACTIVE_ID, mostRecent.id);
            } else {
                // Create new session if no sessions left
                createNewSession();
            }
        }

        return true;
    } catch (error) {
        console.error('Failed to delete session:', error);
        return false;
    }
}

/**
 * Load chat history for a session
 * @param {string} sessionId - Session ID (optional, uses active session if not provided)
 * @returns {Array} Array of message objects
 */
export function loadChatHistory(sessionId = null) {
    try {
        const activeId = sessionId ? sessionId : readStorage(STORAGE_KEYS.ACTIVE_ID, null);
        const sessions = readStorage(STORAGE_KEYS.SESSIONS, []);
        let session = sessions.find(s => s?.id === activeId);
        if (!session) {
            session = ensureActiveSession();
        }
        return Array.isArray(session.messages) ? session.messages : [];
    } catch (error) {
        console.error('Failed to load chat history:', error);
        return [];
    }
}

/**
 * Save chat history for a session
 * @param {Array} messages - Array of message objects
 * @param {string} sessionId - Session ID (optional, uses active session if not provided)
 */
export function saveChatHistory(messages, sessionId = null) {
    try {
        if (!Array.isArray(messages)) return;
        let sessions = readStorage(STORAGE_KEYS.SESSIONS, []) || [];
        let targetId = sessionId ? sessionId : readStorage(STORAGE_KEYS.ACTIVE_ID, null);
        let session = sessions.find(s => s?.id === targetId);

        if (!session) {
            const newId = generateSessionId();
            session = {
                id: newId,
                title: generateSessionTitle(messages),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                messages,
                version: 2
            };
            sessions.unshift(session);
            writeStorage(STORAGE_KEYS.ACTIVE_ID, newId);
        } else {
            session.messages = messages;
            session.updatedAt = Date.now();
            session.title = generateSessionTitle(messages);
        }

        writeStorage(STORAGE_KEYS.SESSIONS, sessions);
    } catch (error) {
        console.error('Failed to save chat history:', error);
    }
}

/**
 * Save user preferences
 * @param {Object} preferences - Preferences object
 * @returns {boolean} True if save was successful
 */
export function saveUserPreferences(preferences) {
    try {
        const existing = readStorage(STORAGE_KEYS.USER_PREFERENCES, {});
        const next = { ...existing, ...preferences, updatedAt: Date.now() };
        return writeStorage(STORAGE_KEYS.USER_PREFERENCES, next);
    } catch (error) {
        console.error('Failed to save user preferences:', error);
        return false;
    }
}

/**
 * Load user preferences
 * @returns {Object} User preferences object
 */
export function loadUserPreferences() {
    try {
        const prefs = readStorage(STORAGE_KEYS.USER_PREFERENCES, null);
        return prefs || {
            theme: 'system',
            animations: true,
            sound: true,
            model: 'fast'
        };
    } catch (error) {
        console.error('Failed to load user preferences:', error);
        return {
            theme: 'system',
            animations: true,
            sound: true,
            model: 'fast'
        };
    }
}
