import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import {
    addPlayfulEmojis,
    isEnvironmentalTopic,
    limitToSentences,
    sanitizeInput,
    loadChatHistory,
    saveChatHistory,
    listSessions,
    createNewSession,
    switchToSession,
    deleteSession,
    loadUserPreferences,
    saveUserPreferences
} from '../utils/chatHelpers'

const SYSTEM_PROMPT = `You are AversoAI, an enthusiastic environmental education assistant for a gamified learning website. 

CORE RULES:
- ONLY answer questions about environmental topics: climate change, recycling, sustainability, renewable energy, conservation, biodiversity, pollution, eco-friendly habits, green technology, and environmental science.
- For off-topic questions, politely redirect users to environmental education with encouraging suggestions.
- Keep responses concise (under 3 sentences) but informative and engaging.
- Use emojis occasionally to maintain a fun, gamified atmosphere.
- Maintain an enthusiastic, educational tone that encourages learning and action.
- Provide practical, actionable advice when possible.
- Be scientifically accurate but accessible to all education levels.

RESPONSE STYLE:
- Start with enthusiasm and acknowledgment
- Provide clear, factual information
- End with encouragement or a call to action when appropriate
- Use varied sentence structures to keep responses engaging`

// Safety settings
const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

// Generation config
const GENERATION_CONFIG = {
    temperature: 0.8,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 1024,
    candidateCount: 1,
    stopSequences: ["Human:", "User:", "Assistant:"]
}

// Model variants - using stable model names
const MODEL_VARIANTS = {
    fast: {
        primary: 'gemini-1.5-flash',
        fallback: 'gemini-1.5-flash',
        name: 'AversoAI-Impulsive'
    },
    balanced: {
        primary: 'gemini-1.5-pro',
        fallback: 'gemini-1.5-pro',
        name: 'AversoAI-Thinker'
    },
    normal: {
        primary: 'gemini-1.5-pro',
        fallback: 'gemini-1.5-pro',
        name: 'AversoAI-Thinker'
    }
}

// Rate limiter
class RateLimiter {
    constructor(maxRequests = 5, windowMs = 15000) {
        this.maxRequests = maxRequests
        this.windowMs = windowMs
        this.requests = []
        this.backoffMultiplier = 1
        this.maxBackoff = 8
    }

    canProceed() {
        const now = Date.now()
        this.requests = this.requests.filter(time => now - time < this.windowMs)

        if (this.requests.length >= this.maxRequests) {
            return false
        }

        this.requests.push(now)
        this.backoffMultiplier = Math.max(1, this.backoffMultiplier * 0.9)
        return true
    }

    getBackoffDelay() {
        const delay = Math.min(this.backoffMultiplier * 1000, this.maxBackoff * 1000)
        this.backoffMultiplier = Math.min(this.backoffMultiplier * 2, this.maxBackoff)
        return delay
    }

    reset() {
        this.requests = []
        this.backoffMultiplier = 1
    }
}

// API Error class
class APIError extends Error {
    constructor(message, type = 'unknown', statusCode = null, retryable = false) {
        super(message)
        this.name = 'APIError'
        this.type = type
        this.statusCode = statusCode
        this.retryable = retryable
    }
}

function categorizeError(error) {
    const status = error?.status || error?.statusCode
    const message = error?.message || error?.toString() || 'Unknown error'
    
    console.error('Categorizing error:', { error, status, message })

    // CORS issues
    if (message.includes('CORS') || message.includes('cross-origin')) {
        return new APIError('Cross-origin request blocked. API calls from browser may be restricted.', 'cors', status, false)
    }

    // Network/fetch failures
    if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('ERR_NETWORK')) {
        return new APIError('Network request failed. Check your internet connection or try again.', 'network', status, true)
    }

    // Rate limiting
    if (status === 429 || message.includes('quota') || message.includes('rate limit') || message.includes('RESOURCE_EXHAUSTED')) {
        return new APIError('Rate limit exceeded. Please wait a moment.', 'rate_limit', status, true)
    }

    // API key issues
    if (status === 401 || status === 403 || message.includes('API key') || message.includes('PERMISSION_DENIED') || message.includes('authentication')) {
        return new APIError('Invalid or missing API key. Please check your configuration.', 'auth', status, false)
    }

    // Gemini-specific errors
    if (message.includes('INVALID_ARGUMENT')) {
        return new APIError('Invalid request format. Please try again.', 'invalid_request', status, false)
    }

    // Server errors (retryable)
    if (status >= 500 || message.includes('server error') || message.includes('internal error') || message.includes('INTERNAL')) {
        return new APIError('Server temporarily unavailable. Retrying...', 'server', status, true)
    }

    // Generic network issues (retryable)
    if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
        return new APIError('Network connection issue. Please check your internet connection.', 'network', status, true)
    }

    // Content filtering
    if (message.includes('safety') || message.includes('blocked') || message.includes('SAFETY')) {
        return new APIError('Response was blocked by safety filters. Try rephrasing your message.', 'safety', status, false)
    }

    return new APIError(`Request failed: ${message}`, 'unknown', status, true)
}

export default function useClientChat() {
    // Core state
    const [messages, setMessages] = useState(() => loadChatHistory())
    const [isStreaming, setIsStreaming] = useState(false)
    const [streamingText, setStreamingText] = useState('')
    const [error, setError] = useState(null)
    const [currentSessionId, setCurrentSessionId] = useState(null)

    // User preferences
    const [preferences, setPreferences] = useState(() => loadUserPreferences())
    const [modelKey, setModelKey] = useState(() => preferences.model || 'normal')

    // API status
    const [apiStatus, setApiStatus] = useState('checking')
    const [genAI, setGenAI] = useState(null)

    // Refs and utilities
    const rateLimiter = useRef(new RateLimiter(5, 15000))
    const abortControllerRef = useRef(null)
    const retryTimeoutRef = useRef(null)

    // Initialize Gemini AI
    useEffect(() => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY

        if (!apiKey) {
            console.error('Missing VITE_GEMINI_API_KEY environment variable')
            setApiStatus('missing_key')
            return
        }

        try {
            const ai = new GoogleGenerativeAI(apiKey)
            setGenAI(ai)
            setApiStatus('ready')
        } catch (error) {
            console.error('Failed to initialize GoogleGenerativeAI:', error)
            setApiStatus('error')
        }
    }, [])

    // Get model with fallbacks
    const getModel = useCallback((modelType = 'normal', isVision = false) => {
        if (!genAI) return null

        const variant = MODEL_VARIANTS[modelType] || MODEL_VARIANTS.normal
        const models = [variant.primary, variant.fallback]

        // For vision tasks, Gemini 1.5 models already support image inputs.
        // Avoid forcing unsupported fallbacks that could 404.

        for (const modelId of models) {
            try {
                return genAI.getGenerativeModel({
                    model: modelId,
                    safetySettings: SAFETY_SETTINGS,
                    generationConfig: GENERATION_CONFIG
                }, { apiVersion: 'v1' })
            } catch (error) {
                console.warn(`Failed to create model ${modelId}:`, error)
                continue
            }
        }

        console.error('All model variants failed to initialize')
        return null
    }, [genAI])

    // Retry logic with exponential backoff
    const executeWithRetry = useCallback(async (operation, maxAttempts = 3) => {
        let lastError

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                if (abortControllerRef.current?.signal?.aborted) {
                    throw new Error('Operation aborted')
                }

                return await operation()
            } catch (error) {
                lastError = categorizeError(error)

                if (!lastError.retryable || attempt === maxAttempts) {
                    break
                }

                const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 8000)
                const jitter = Math.random() * 0.1 * baseDelay
                const delay = baseDelay + jitter

                console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message)

                await new Promise(resolve => {
                    retryTimeoutRef.current = setTimeout(resolve, delay)
                })
            }
        }

        throw lastError
    }, [])

    // Message validation and processing
    const processUserMessage = useCallback((rawInput, imageFile = null) => {
        const text = sanitizeInput(rawInput)

        if (!text && !imageFile) {
            throw new Error('Please provide a message or image')
        }

        if (text.length > 2000) {
            throw new Error('Message too long. Please keep it under 2000 characters.')
        }

        // Check if topic is environmental (unless there's an image)
        if (!imageFile && text && !isEnvironmentalTopic(text)) {
            return {
                isOffTopic: true,
                response: 'I can only help with environmental topics like climate change, recycling, sustainability, renewable energy, conservation, and eco-friendly habits. Try asking about going green! 🌍✨'
            }
        }

        return { text, isValid: true }
    }, [])

    // Send message
    const sendMessage = useCallback(async (rawInput) => {
        setError(null)

        try {
            const processed = processUserMessage(rawInput)

            if (processed.isOffTopic) {
                const userMsg = {
                    id: crypto.randomUUID(),
                    role: 'user',
                    content: sanitizeInput(rawInput),
                    timestamp: Date.now()
                }
                const botMsg = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: processed.response,
                    timestamp: Date.now()
                }

                setMessages(prev => [...prev, userMsg, botMsg])
                return
            }

            // Rate limiting check
            if (!rateLimiter.current.canProceed()) {
                const delay = rateLimiter.current.getBackoffDelay()
                throw new APIError(
                    `Please wait ${Math.ceil(delay / 1000)} seconds before sending another message.`,
                    'rate_limit'
                )
            }

            // Create user message
            const userMsg = {
                id: crypto.randomUUID(),
                role: 'user',
                content: processed.text,
                timestamp: Date.now()
            }

            setMessages(prev => [...prev, userMsg])
            setIsStreaming(true)
            setStreamingText('')

            try {
                // Get model and generate response
                const model = getModel(modelKey, false)
                if (!model) {
                    throw new Error('AI model not available')
                }

                // Build simple prompt with conversation context
                let prompt = `${SYSTEM_PROMPT}\n\nUser: ${processed.text}`
                
                // Add recent conversation context if available
                if (messages.length > 0) {
                    const recentMessages = messages.slice(-4) // Last 4 messages for context
                    let context = recentMessages.map(msg => 
                        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
                    ).join('\n')
                    prompt = `${SYSTEM_PROMPT}\n\nPrevious conversation:\n${context}\n\nUser: ${processed.text}`
                }

                // Call Gemini API directly with retry logic
                console.log('Sending to Gemini API:', { prompt, modelKey })
                const result = await executeWithRetry(async () => {
                    const response = await model.generateContent(prompt)
                    return response.response
                })
                console.log('Gemini API response received:', result)

                // Process response
                let finalText = limitToSentences(result.text() || 'Got it! 🌱', 3)
                finalText = addPlayfulEmojis(finalText)

                const assistantMsg = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: finalText,
                    timestamp: Date.now(),
                    model: modelKey
                }

                setMessages(prev => [...prev, assistantMsg])

            } catch (apiError) {
                if (apiError.message === 'Operation aborted') return
                throw apiError
            }

        } catch (error) {
            const categorizedError = categorizeError(error)
            setError(categorizedError.message)
            console.error('Send message error:', categorizedError)
        } finally {
            setIsStreaming(false)
            setStreamingText('')
            abortControllerRef.current = null
        }
    }, [messages, modelKey, getModel, executeWithRetry, processUserMessage])

    // Send message with image
    const sendMessageWithImage = useCallback(async (rawInput, imageData) => {
        setError(null)

        try {
            if (!imageData || !imageData.data || !imageData.mimeType) {
                throw new Error('Invalid image data')
            }

            const text = sanitizeInput(rawInput) || 'What can you tell me about this image from an environmental perspective?'

            // Rate limiting
            if (!rateLimiter.current.canProceed()) {
                const delay = rateLimiter.current.getBackoffDelay()
                throw new APIError(
                    `Please wait ${Math.ceil(delay / 1000)} seconds before sending another message.`,
                    'rate_limit'
                )
            }

            const userMsg = {
                id: crypto.randomUUID(),
                role: 'user',
                content: text,
                image: imageData,
                timestamp: Date.now()
            }

            setMessages(prev => [...prev, userMsg])
            setIsStreaming(true)
            setStreamingText('')

            try {
                // Prepare content parts for vision model
                const parts = [
                    { text: `${SYSTEM_PROMPT}\n\nUser message: ${text}` },
                    {
                        inlineData: {
                            data: imageData.data,
                            mimeType: imageData.mimeType
                        }
                    }
                ]

                const contents = [{ role: 'user', parts }]

                // Get vision model and generate response
                const model = getModel(modelKey, true)
                if (!model) {
                    throw new Error('Vision model not available')
                }

                const result = await executeWithRetry(async () => {
                    const response = await model.generateContent(contents)
                    return response.response
                })

                let finalText = limitToSentences(result.text() || 'I can see the image, but I\'m having trouble analyzing it right now.', 3)
                finalText = addPlayfulEmojis(finalText)

                const assistantMsg = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: finalText,
                    timestamp: Date.now(),
                    model: `${modelKey}-vision`
                }

                setMessages(prev => [...prev, assistantMsg])

            } catch (visionError) {
                if (visionError.message === 'Operation aborted') return
                throw visionError
            }

        } catch (error) {
            const categorizedError = categorizeError(error)
            setError(categorizedError.message)
            console.error('Send image error:', categorizedError)
        } finally {
            setIsStreaming(false)
            setStreamingText('')
            abortControllerRef.current = null
        }
    }, [messages, modelKey, getModel, executeWithRetry])

    // Regenerate last response
    const regenerateLastResponse = useCallback(async () => {
        setError(null)

        try {
            const userMessages = messages.filter(m => m.role === 'user')
            if (userMessages.length === 0) {
                throw new Error('No message to regenerate')
            }

            const lastUserMessage = userMessages[userMessages.length - 1]
            const cutoffIndex = messages.findIndex(m => m.id === lastUserMessage.id)
            
            if (cutoffIndex === -1) {
                throw new Error('Could not find message to regenerate from')
            }

            const trimmedMessages = messages.slice(0, cutoffIndex + 1)
            setMessages(trimmedMessages)

            await new Promise(resolve => setTimeout(resolve, 100))

            if (lastUserMessage.image) {
                return await sendMessageWithImage(lastUserMessage.content, lastUserMessage.image)
            } else {
                return await sendMessage(lastUserMessage.content)
            }

        } catch (error) {
            const categorizedError = categorizeError(error)
            setError(categorizedError.message)
            console.error('Regenerate error:', categorizedError)
        }
    }, [messages, sendMessage, sendMessageWithImage])

    // Edit last user message
    const editLastUserMessage = useCallback(async (newText) => {
        setError(null)

        try {
            const sanitizedText = sanitizeInput(newText)
            if (!sanitizedText) {
                throw new Error('Please provide a valid message')
            }

            const userMessages = messages.filter(m => m.role === 'user')
            if (userMessages.length === 0) {
                throw new Error('No message to edit')
            }

            const lastUserMessage = userMessages[userMessages.length - 1]
            const messageIndex = messages.findIndex(m => m.id === lastUserMessage.id)

            if (messageIndex === -1) {
                throw new Error('Could not find message to edit')
            }

            const updatedMessages = messages.slice(0, messageIndex)
            const editedMessage = {
                ...lastUserMessage,
                content: sanitizedText,
                editedAt: Date.now()
            }

            setMessages([...updatedMessages, editedMessage])

            await new Promise(resolve => setTimeout(resolve, 100))
            return await sendMessage(sanitizedText)

        } catch (error) {
            const categorizedError = categorizeError(error)
            setError(categorizedError.message)
            console.error('Edit message error:', categorizedError)
        }
    }, [messages, sendMessage])

    // Session management
    const clearCurrentChat = useCallback(() => {
        try {
            abortControllerRef.current?.abort()
            setMessages([])
            setError(null)
            setIsStreaming(false)
            setStreamingText('')
            rateLimiter.current.reset()

            const newSessionId = createNewSession()
            setCurrentSessionId(newSessionId)
        } catch (error) {
            console.error('Failed to clear chat:', error)
            setError('Failed to start new chat')
        }
    }, [])

    const createNewChat = useCallback(() => {
        try {
            abortControllerRef.current?.abort()
            setMessages([])
            setError(null)

            const newSessionId = createNewSession()
            if (newSessionId) {
                setCurrentSessionId(newSessionId)
                rateLimiter.current.reset()
            }
        } catch (error) {
            console.error('Failed to create new chat:', error)
            setError('Failed to create new chat')
        }
    }, [])

    const openExistingChat = useCallback((sessionId) => {
        try {
            abortControllerRef.current?.abort()

            const session = switchToSession(sessionId)
            if (session) {
                setMessages(session.messages || [])
                setCurrentSessionId(sessionId)
                setError(null)
                rateLimiter.current.reset()
                return true
            }

            setError('Chat session not found')
            return false
        } catch (error) {
            console.error('Failed to open chat:', error)
            setError('Failed to open chat session')
            return false
        }
    }, [])

    const deleteExistingChat = useCallback((sessionId) => {
        try {
            const success = deleteSession(sessionId)
            if (success && sessionId === currentSessionId) {
                const newHistory = loadChatHistory()
                setMessages(newHistory)
            }
            return success
        } catch (error) {
            console.error('Failed to delete chat:', error)
            return false
        }
    }, [currentSessionId])

    // Preferences management
    const updatePreferences = useCallback((newPreferences) => {
        const updated = { ...preferences, ...newPreferences }
        setPreferences(updated)
        saveUserPreferences(updated)

        if (newPreferences.model && newPreferences.model !== modelKey) {
            setModelKey(newPreferences.model)
        }
    }, [preferences, modelKey])

    // Abort current request
    const abortCurrentRequest = useCallback(() => {
        try {
            abortControllerRef.current?.abort()
            clearTimeout(retryTimeoutRef.current)
            setIsStreaming(false)
            setStreamingText('')
            setError('Request cancelled')
        } catch (error) {
            console.error('Failed to abort request:', error)
        }
    }, [])

    // Clear error
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    // Auto-save messages when they change
    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory(messages)
        }
    }, [messages])

    // Save preferences when model changes
    useEffect(() => {
        if (modelKey !== preferences.model) {
            updatePreferences({ model: modelKey })
        }
    }, [modelKey, preferences.model, updatePreferences])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort()
            clearTimeout(retryTimeoutRef.current)
        }
    }, [])

    // Return API
    return {
        // Core state
        messages,
        isStreaming,
        streamingText,
        error,
        clearError,

        // Message operations
        sendMessage,
        sendMessageWithImage,
        regenerateLastResponse,
        editLastUserMessage,
        abortCurrentRequest,

        // Session management
        clearCurrentChat,
        createNewChat,
        openExistingChat,
        deleteExistingChat,
        listSessions,
        currentSessionId,

        // Model and preferences
        modelKey,
        setModelKey,
        availableModels: Object.fromEntries(
            Object.entries(MODEL_VARIANTS).map(([key, variant]) => [key, variant.name])
        ),
        preferences,
        updatePreferences,

        // Status and utilities
        apiStatus,
        canSendMessage: !isStreaming && apiStatus === 'ready',
        rateLimitInfo: {
            remaining: Math.max(0, rateLimiter.current.maxRequests - rateLimiter.current.requests.length),
            resetTime: rateLimiter.current.requests.length > 0 ?
                rateLimiter.current.requests[0] + rateLimiter.current.windowMs : null
        }
    }
}