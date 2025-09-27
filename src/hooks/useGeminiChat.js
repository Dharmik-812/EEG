import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import {
    addPlayfulEmojis,
    buildGeminiContents,
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

// Enhanced safety settings with more granular control
const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

// Enhanced generation config with better parameters
const GENERATION_CONFIG = {
    temperature: 0.8, // Slightly higher for more creative responses
    topP: 0.9, // More focused responses
    topK: 40,
    maxOutputTokens: 1024, // Increased for better responses
    candidateCount: 1,
    stopSequences: ["Human:", "User:", "Assistant:"] // Prevent role confusion
}

// Enhanced model mapping with fallback options
const MODEL_VARIANTS = {
    fast: {
        primary: 'gemini-1.5-flash-latest',
        fallback: 'gemini-1.5-flash',
        name: 'AversoAI-Impulsive'
    },
    balanced: {
        primary: 'gemini-1.5-pro-latest',
        fallback: 'gemini-1.5-pro',
        name: 'AversoAI-Thinker'
    }
}

// Enhanced rate limiter with exponential backoff
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

        // Clean old requests
        this.requests = this.requests.filter(time => now - time < this.windowMs)

        if (this.requests.length >= this.maxRequests) {
            return false
        }

        this.requests.push(now)
        this.backoffMultiplier = Math.max(1, this.backoffMultiplier * 0.9) // Reduce backoff on success
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

// Enhanced error handling with categorized error types
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
    const status = error?.status || error?.response?.status || error?.statusCode
    const message = error?.message || error?.toString() || 'Unknown error'

    // Rate limiting
    if (status === 429 || message.includes('quota') || message.includes('rate limit')) {
        return new APIError('Rate limit exceeded. Please wait a moment.', 'rate_limit', status, true)
    }

    // API key issues
    if (status === 401 || status === 403 || message.includes('API key')) {
        return new APIError('Invalid API key. Please check your configuration.', 'auth', status, false)
    }

    // Server errors (retryable)
    if (status >= 500 || message.includes('server error') || message.includes('internal error')) {
        return new APIError('Server temporarily unavailable. Retrying...', 'server', status, true)
    }

    // Network issues (retryable)
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
        return new APIError('Network connection issue. Please check your internet.', 'network', status, true)
    }

    // Content filtering
    if (message.includes('safety') || message.includes('blocked')) {
        return new APIError('Response was blocked by safety filters.', 'safety', status, false)
    }

    // Generic retryable error
    if (status >= 400 && status < 500) {
        return new APIError(message, 'client', status, false)
    }

    return new APIError(message, 'unknown', status, true)
}

export default function useGeminiChat() {
    // Core state
    const [messages, setMessages] = useState(() => loadChatHistory())
    const [isStreaming, setIsStreaming] = useState(false)
    const [streamingText, setStreamingText] = useState('')
    const [error, setError] = useState(null)
    const [currentSessionId, setCurrentSessionId] = useState(null)

    // Enhanced user preferences
    const [preferences, setPreferences] = useState(() => loadUserPreferences())
    const [modelKey, setModelKey] = useState(() => preferences.model || 'fast')

    // Enhanced refs and utilities
    const rateLimiter = useRef(new RateLimiter(5, 15000))
    const abortControllerRef = useRef(null)
    const retryTimeoutRef = useRef(null)

    // API configuration
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    // Enhanced Gemini AI client with error handling
    const genAI = useMemo(() => {
        if (!apiKey) {
            console.warn('Missing VITE_GEMINI_API_KEY environment variable')
            return null
        }

        try {
            return new GoogleGenerativeAI(apiKey)
        } catch (error) {
            console.error('Failed to initialize GoogleGenerativeAI:', error)
            return null
        }
    }, [apiKey])

    // Enhanced model selection with fallbacks
    const getModel = useCallback((modelType = 'fast', isVision = false) => {
        if (!genAI) return null

        const variant = MODEL_VARIANTS[modelType] || MODEL_VARIANTS.fast
        const models = [variant.primary, variant.fallback]

        // For vision tasks, ensure we use a compatible model
        if (isVision) {
            models.unshift('gemini-1.5-pro-latest', 'gemini-1.5-flash-latest')
        }

        for (const modelId of models) {
            try {
                return genAI.getGenerativeModel({
                    model: modelId,
                    safetySettings: SAFETY_SETTINGS,
                    generationConfig: GENERATION_CONFIG,
                    systemInstruction: SYSTEM_PROMPT
                })
            } catch (error) {
                console.warn(`Failed to create model ${modelId}:`, error)
                continue
            }
        }

        console.error('All model variants failed to initialize')
        return null
    }, [genAI])

    // Enhanced retry logic with exponential backoff
    const executeWithRetry = useCallback(async (operation, maxAttempts = 3) => {
        let lastError

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                // Check if we should abort
                if (abortControllerRef.current?.signal?.aborted) {
                    throw new Error('Operation aborted')
                }

                return await operation()
            } catch (error) {
                lastError = categorizeError(error)

                // Don't retry non-retryable errors
                if (!lastError.retryable || attempt === maxAttempts) {
                    break
                }

                // Calculate delay with exponential backoff
                const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 8000)
                const jitter = Math.random() * 0.1 * baseDelay
                const delay = baseDelay + jitter

                console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message)

                // Wait before retry
                await new Promise(resolve => {
                    retryTimeoutRef.current = setTimeout(resolve, delay)
                })
            }
        }

        throw lastError
    }, [])

    // Enhanced message validation and processing
    const processUserMessage = useCallback((rawInput, imageFile = null) => {
        const text = sanitizeInput(rawInput)

        // Validate input
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

    // Enhanced streaming message handler
    const sendMessage = useCallback(async (rawInput) => {
        // Reset error state
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

            // Get appropriate model
            const model = getModel(modelKey)
            if (!model) {
                throw new APIError('AI model unavailable. Please check your API key.', 'model')
            }

            // Create user message
            const userMsg = {
                id: crypto.randomUUID(),
                role: 'user',
                content: processed.text,
                timestamp: Date.now()
            }

            // Add user message to state
            setMessages(prev => [...prev, userMsg])

            // Setup streaming
            setIsStreaming(true)
            setStreamingText('')

            // Create abort controller for this request
            abortControllerRef.current = new AbortController()

            try {
                // Build conversation context
                const updatedHistory = [...messages, userMsg]
                const contents = buildGeminiContents(updatedHistory, processed.text, SYSTEM_PROMPT)

                // Execute with retry logic
                const response = await executeWithRetry(async () => {
                    const result = await model.generateContentStream({ contents })
                    return result
                })

                // Process streaming response
                let fullText = ''
                for await (const chunk of response.stream) {
                    if (abortControllerRef.current?.signal?.aborted) {
                        break
                    }

                    const delta = chunk?.text?.() || ''
                    if (delta) {
                        fullText += delta
                        setStreamingText(fullText)
                    }
                }

                // Process final response
                let finalText = limitToSentences(fullText || 'Got it! 🌱', 3)
                finalText = addPlayfulEmojis(finalText)

                // Create assistant message
                const assistantMsg = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: finalText,
                    timestamp: Date.now(),
                    model: modelKey
                }

                setMessages(prev => [...prev, assistantMsg])

            } catch (streamError) {
                if (streamError.message === 'Operation aborted') return
                throw streamError
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

    // Enhanced image message handler
    const sendMessageWithImage = useCallback(async (rawInput, imageData) => {
        setError(null)

        try {
            // Validate inputs
            if (!imageData || !imageData.data || !imageData.mimeType) {
                throw new Error('Invalid image data')
            }

            // Process text input (allow empty for image-only messages)
            const text = sanitizeInput(rawInput) || 'What can you tell me about this image from an environmental perspective?'

            // Rate limiting
            if (!rateLimiter.current.canProceed()) {
                const delay = rateLimiter.current.getBackoffDelay()
                throw new APIError(
                    `Please wait ${Math.ceil(delay / 1000)} seconds before sending another message.`,
                    'rate_limit'
                )
            }

            // Get vision model
            const model = getModel(modelKey, true)
            if (!model) {
                throw new APIError('Vision model unavailable. Please try again.', 'model')
            }

            // Create user message with image
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

            abortControllerRef.current = new AbortController()

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

                // Execute with retry
                const response = await executeWithRetry(async () => {
                    return await model.generateContent({
                        contents: [{ role: 'user', parts }]
                    })
                })

                // Process response
                const responseText = response?.response?.text?.() ||
                    response?.response?.candidates?.[0]?.content?.parts?.map(p => p.text).join(' ') ||
                    'I can see the image, but I\'m having trouble analyzing it right now.'

                let finalText = limitToSentences(responseText, 3)
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

    // Enhanced regenerate function
    const regenerateLastResponse = useCallback(async () => {
        setError(null)

        try {
            // Find last user message
            const userMessages = messages.filter(m => m.role === 'user')
            if (userMessages.length === 0) {
                throw new Error('No message to regenerate')
            }

            const lastUserMessage = userMessages[userMessages.length - 1]

            // Remove messages after the last user message
            const cutoffIndex = messages.findIndex(m => m.id === lastUserMessage.id)
            if (cutoffIndex === -1) {
                throw new Error('Could not find message to regenerate from')
            }

            const trimmedMessages = messages.slice(0, cutoffIndex + 1)
            setMessages(trimmedMessages)

            // Wait for state update
            await new Promise(resolve => setTimeout(resolve, 100))

            // Regenerate response
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

    // Enhanced edit function
    const editLastUserMessage = useCallback(async (newText) => {
        setError(null)

        try {
            const sanitizedText = sanitizeInput(newText)
            if (!sanitizedText) {
                throw new Error('Please provide a valid message')
            }

            // Find last user message
            const userMessages = messages.filter(m => m.role === 'user')
            if (userMessages.length === 0) {
                throw new Error('No message to edit')
            }

            const lastUserMessage = userMessages[userMessages.length - 1]
            const messageIndex = messages.findIndex(m => m.id === lastUserMessage.id)

            if (messageIndex === -1) {
                throw new Error('Could not find message to edit')
            }

            // Update the message and remove everything after it
            const updatedMessages = messages.slice(0, messageIndex)
            const editedMessage = {
                ...lastUserMessage,
                content: sanitizedText,
                editedAt: Date.now()
            }

            setMessages([...updatedMessages, editedMessage])

            // Wait for state update
            await new Promise(resolve => setTimeout(resolve, 100))

            // Send new response
            return await sendMessage(sanitizedText)

        } catch (error) {
            const categorizedError = categorizeError(error)
            setError(categorizedError.message)
            console.error('Edit message error:', categorizedError)
        }
    }, [messages, sendMessage])

    // Enhanced session management
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
                // If we deleted the current session, load the new active one
                const newHistory = loadChatHistory()
                setMessages(newHistory)
            }
            return success
        } catch (error) {
            console.error('Failed to delete chat:', error)
            return false
        }
    }, [currentSessionId])

    // Enhanced preferences management
    const updatePreferences = useCallback((newPreferences) => {
        const updated = { ...preferences, ...newPreferences }
        setPreferences(updated)
        saveUserPreferences(updated)

        // Update model if changed
        if (newPreferences.model && newPreferences.model !== modelKey) {
            setModelKey(newPreferences.model)
        }
    }, [preferences, modelKey])

    // Enhanced abort function
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

    // Enhanced API status
    const apiStatus = useMemo(() => {
        if (!apiKey) return 'missing_key'
        if (!genAI) return 'invalid_key'
        return 'ready'
    }, [apiKey, genAI])

    // Return enhanced API
    return {
        // Core state
        messages,
        isStreaming,
        streamingText,
        error,

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