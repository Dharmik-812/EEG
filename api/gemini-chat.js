import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Initialize Gemini with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

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

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map()
const RATE_LIMIT = {
    maxRequests: 10,
    windowMs: 60000 // 1 minute
}

function checkRateLimit(clientId) {
    const now = Date.now()
    const key = `rate_limit:${clientId}`
    
    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, [])
    }
    
    const requests = rateLimitStore.get(key)
    
    // Clean old requests
    const validRequests = requests.filter(time => now - time < RATE_LIMIT.windowMs)
    rateLimitStore.set(key, validRequests)
    
    if (validRequests.length >= RATE_LIMIT.maxRequests) {
        return false
    }
    
    validRequests.push(now)
    rateLimitStore.set(key, validRequests)
    return true
}

function sanitizeInput(text) {
    if (!text || typeof text !== 'string') return ''
    return text
        .replace(/[\u0000-\u001F\u007F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .slice(0, 2000) // Prevent excessive input length
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY environment variable is not set')
            return res.status(500).json({ error: 'Server configuration error' })
        }

        // Rate limiting
        const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
        if (!checkRateLimit(clientId)) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded. Please wait before sending another message.' 
            })
        }

        const { contents, modelType = 'fast', isVision = false } = req.body

        if (!contents || !Array.isArray(contents)) {
            return res.status(400).json({ error: 'Invalid request: contents required' })
        }

        // Sanitize input contents
        const sanitizedContents = contents.map(content => ({
            ...content,
            parts: content.parts?.map(part => ({
                ...part,
                text: part.text ? sanitizeInput(part.text) : part.text
            }))
        }))

        // Validate content length
        const totalTextLength = sanitizedContents
            .flatMap(c => c.parts || [])
            .filter(p => p.text)
            .reduce((sum, p) => sum + p.text.length, 0)

        if (totalTextLength > 10000) {
            return res.status(400).json({ error: 'Content too long' })
        }

        // Select appropriate model
        let modelName = 'gemini-1.5-flash'
        if (modelType === 'balanced') {
            modelName = 'gemini-1.5-pro'
        }
        if (isVision) {
            modelName = 'gemini-1.5-pro'
        }

        const model = genAI.getGenerativeModel({
            model: modelName,
            safetySettings: SAFETY_SETTINGS,
            generationConfig: GENERATION_CONFIG
        })

        // Generate response
        const result = await model.generateContent({ contents: sanitizedContents })
        const response = result.response

        if (!response) {
            return res.status(500).json({ error: 'No response from AI model' })
        }

        const text = response.text?.() || ''
        
        if (!text) {
            return res.status(500).json({ error: 'Empty response from AI model' })
        }

        return res.status(200).json({
            text: text,
            model: modelName,
            timestamp: Date.now()
        })

    } catch (error) {
        console.error('Gemini API Error:', error)

        // Handle specific Google AI errors
        if (error.message?.includes('API key')) {
            return res.status(401).json({ error: 'Invalid API configuration' })
        }
        
        if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            return res.status(429).json({ error: 'Service temporarily unavailable due to high demand' })
        }

        if (error.message?.includes('safety')) {
            return res.status(400).json({ error: 'Response blocked by safety filters' })
        }

        return res.status(500).json({ 
            error: 'Failed to generate response. Please try again.' 
        })
    }
}