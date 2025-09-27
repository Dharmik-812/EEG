// Environmental topics for content filtering
const ENVIRONMENTAL_TOPICS = [
    'climate', 'climate change', 'global warming', 'recycle', 'recycling',
    'sustain', 'sustainability', 'renewable', 'solar', 'wind', 'hydro',
    'geothermal', 'conservation', 'biodiversity', 'pollution', 'water',
    'waste', 'plastic', 'compost', 'eco', 'green', 'carbon', 'footprint',
    'emissions', 'energy', 'deforestation', 'ocean', 'wildlife', 'habitat',
    'transport', 'electric vehicle', 'ev', 'soil', 'tree', 'forest',
    'environment', 'ecological', 'ecosystem', 'planet', 'earth', 'nature',
    'clean energy', 'sustainable', 'greenhouse', 'gas', 'emission',
    'conservation', 'preservation', 'organic', 'biodegradable', 'zero waste'
];

// Storage keys
const STORAGE_KEYS = {
    LEGACY_HISTORY: 'eco_chat_history_v1',
    SESSIONS: 'eco_chat_sessions_v1',
    ACTIVE_ID: 'eco_chat_active_id_v1'
};

/**
 * Sanitizes user input by removing control characters
 */
export function sanitizeInput(text: string): string {
    if (!text) return '';
    return text.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

/**
 * Checks if the text is related to environmental topics
 */
export function isEnvironmentalTopic(text: string): boolean {
    if (!text) return false;

    const normalizedText = text.toLowerCase();

    return ENVIRONMENTAL_TOPICS.some(topic =>
        normalizedText.includes(topic) ||
        normalizedText.split(/\s+/).some(word =>
            topic.includes(word) || word.includes(topic)
        )
    );
}

/**
 * Limits text to a maximum number of sentences
 */
export function limitToSentences(text: string, maxSentences: number = 3): string {
    if (!text) return '';

    const cleanedText = text.replace(/\s+/g, ' ');
    const sentences = cleanedText.split(/(?<=[.!?])\s+/).filter(Boolean);

    if (sentences.length <= maxSentences) {
        return cleanedText.trim();
    }

    const limited = sentences.slice(0, maxSentences).join(' ');
    return limited.trim() + (text.trim().endsWith('.') ? '' : '.');
}

/**
 * Adds playful emojis to text if none exist
 */
export function addPlayfulEmojis(text: string): string {
    if (!text) return '';

    // Check if text already contains emojis
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(text);

    if (!hasEmoji) {
        const emojis = ['🌱', '♻️', '💧', '🌍', '🌞', '🌿', '🪴', '🍃', '🌎', '🌈'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        return `${text} ${randomEmoji}`;
    }

    return text;
}

/**
 * Converts chat history to Gemini API format
 */
export function buildGeminiContents(
    history: Array<{ role: string; content: string }>,
    userText: string,
    systemPrompt?: string
): Array<{ role: string; parts: Array<{ text: string }> }> {
    const turns: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Add system prompt if provided
    if (systemPrompt) {
        turns.push({
            role: 'user',
            parts: [{ text: `SYSTEM: ${systemPrompt}` }]
        });
    }

    // Limit history to last 6 turns for context management
    const recentHistory = history.slice(-6);

    recentHistory.forEach(message => {
        const role = message.role === 'assistant' ? 'model' : 'user';
        turns.push({
            role,
            parts: [{ text: message.content }]
        });
    });

    // Add current user message
    turns.push({
        role: 'user',
        parts: [{ text: userText }]
    });

    return turns;
}

// Session management utilities
function generateSessionId(): string {
    return 's_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
}

function readFromStorage<T>(key: string, fallback: T): T {
    try {
        if (typeof window === 'undefined') return fallback;

        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.warn(`Failed to read from storage key "${key}":`, error);
        return fallback;
    }
}

function writeToStorage(key: string, value: any): void {
    try {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Failed to write to storage key "${key}":`, error);
    }
}

function migrateLegacyStorage(): void {
    const existingSessions = readFromStorage(STORAGE_KEYS.SESSIONS, []);
    if (Array.isArray(existingSessions) && existingSessions.length > 0) return;

    const legacyHistory = readFromStorage(STORAGE_KEYS.LEGACY_HISTORY, null);
    if (Array.isArray(legacyHistory) && legacyHistory.length > 0) {
        const newSessionId = generateSessionId();
        const newSession = {
            id: newSessionId,
            title: generateTitleFromMessages(legacyHistory),
            createdAt: Date.now(),
            messages: legacyHistory
        };

        writeToStorage(STORAGE_KEYS.SESSIONS, [newSession]);
        writeToStorage(STORAGE_KEYS.ACTIVE_ID, newSessionId);

        // Clean up legacy storage
        try {
            localStorage.removeItem(STORAGE_KEYS.LEGACY_HISTORY);
        } catch (error) {
            console.warn('Failed to remove legacy storage:', error);
        }
    }
}

function generateTitleFromMessages(messages: Array<{ role: string; content: string }>): string {
    const firstUserMessage = messages.find(msg => msg.role === 'user');

    if (firstUserMessage?.content) {
        const content = String(firstUserMessage.content).trim();
        if (content.length > 0) {
            // Extract first 40 characters, but break at last complete word
            const truncated = content.slice(0, 40);
            if (truncated.length === 40) {
                const lastSpace = truncated.lastIndexOf(' ');
                return lastSpace > 20 ? truncated.slice(0, lastSpace) + '…' : truncated + '…';
            }
            return truncated;
        }
    }

    return 'New chat';
}

function ensureActiveSession(): { id: string; title: string; createdAt: number; messages: any[] } {
    migrateLegacyStorage();

    let sessions = readFromStorage(STORAGE_KEYS.SESSIONS, []);
    let activeId = readFromStorage(STORAGE_KEYS.ACTIVE_ID, null);

    if (!Array.isArray(sessions)) {
        sessions = [];
    }

    // Create initial session if none exist
    if (sessions.length === 0) {
        const newSessionId = generateSessionId();
        const newSession = {
            id: newSessionId,
            title: 'New chat',
            createdAt: Date.now(),
            messages: []
        };

        sessions = [newSession];
        writeToStorage(STORAGE_KEYS.SESSIONS, sessions);
        writeToStorage(STORAGE_KEYS.ACTIVE_ID, newSessionId);

        return newSession;
    }

    // Find active session or fallback to first session
    const activeSession = sessions.find(session => session.id === activeId) || sessions[0];

    if (!activeId || !sessions.find(session => session.id === activeId)) {
        writeToStorage(STORAGE_KEYS.ACTIVE_ID, activeSession.id);
    }

    return activeSession;
}

// Public API
export function loadHistory(): any[] {
    try {
        const activeSession = ensureActiveSession();
        return Array.isArray(activeSession.messages) ? activeSession.messages : [];
    } catch (error) {
        console.error('Failed to load chat history:', error);
        return [];
    }
}

export function persistHistory(messages: any[]): void {
    try {
        const sessions = readFromStorage(STORAGE_KEYS.SESSIONS, []);
        const activeId = readFromStorage(STORAGE_KEYS.ACTIVE_ID, null);

        const sessionIndex = sessions.findIndex(session => session.id === activeId);

        if (sessionIndex >= 0) {
            const title = generateTitleFromMessages(messages);
            sessions[sessionIndex] = {
                ...sessions[sessionIndex],
                title,
                messages,
                updatedAt: Date.now()
            };

            writeToStorage(STORAGE_KEYS.SESSIONS, sessions);
        } else {
            // Create new session if active session not found
            const newSessionId = generateSessionId();
            const newSession = {
                id: newSessionId,
                title: generateTitleFromMessages(messages),
                createdAt: Date.now(),
                messages
            };

            sessions.push(newSession);
            writeToStorage(STORAGE_KEYS.SESSIONS, sessions);
            writeToStorage(STORAGE_KEYS.ACTIVE_ID, newSessionId);
        }
    } catch (error) {
        console.error('Failed to persist chat history:', error);
    }
}

export function listSessions(): Array<{ id: string; title: string; createdAt: number }> {
    migrateLegacyStorage();

    const sessions = readFromStorage(STORAGE_KEYS.SESSIONS, []);
    return Array.isArray(sessions)
        ? sessions
            .map(({ id, title, createdAt }) => ({ id, title, createdAt }))
            .sort((a, b) => b.createdAt - a.createdAt)
        : [];
}

export function newSession(): string {
    const sessions = readFromStorage(STORAGE_KEYS.SESSIONS, []);
    const newSessionId = generateSessionId();

    const newSession = {
        id: newSessionId,
        title: 'New chat',
        createdAt: Date.now(),
        messages: []
    };

    sessions.push(newSession);
    writeToStorage(STORAGE_KEYS.SESSIONS, sessions);
    writeToStorage(STORAGE_KEYS.ACTIVE_ID, newSessionId);

    return newSessionId;
}

export function openSession(id: string): { id: string; title: string; createdAt: number; messages: any[] } | null {
    const sessions = readFromStorage(STORAGE_KEYS.SESSIONS, []);
    const session = sessions.find(s => s.id === id);

    if (session) {
        writeToStorage(STORAGE_KEYS.ACTIVE_ID, id);
        return session;
    }

    return null;
}

export function deleteSession(id: string): void {
    let sessions = readFromStorage(STORAGE_KEYS.SESSIONS, []);
    const activeId = readFromStorage(STORAGE_KEYS.ACTIVE_ID, null);

    sessions = sessions.filter(session => session.id !== id);
    writeToStorage(STORAGE_KEYS.SESSIONS, sessions);

    // Update active session if deleted session was active
    if (activeId === id) {
        if (sessions.length > 0) {
            writeToStorage(STORAGE_KEYS.ACTIVE_ID, sessions[0].id);
        } else {
            newSession(); // Create a new session if all were deleted
        }
    }
}