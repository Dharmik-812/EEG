import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Environment variables
const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error('Missing GEMINI_API_KEY environment variable');
}

// Safety settings
const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Generation config
const GENERATION_CONFIG = {
    temperature: 0.8,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 1024,
    candidateCount: 1,
    stopSequences: ["Human:", "User:", "Assistant:"]
};

// System prompt
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
- Use varied sentence structures to keep responses engaging`;

// Model variants
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
};

// Initialize Gemini AI
let genAI = null;
try {
    if (API_KEY) {
        genAI = new GoogleGenerativeAI(API_KEY);
    }
} catch (error) {
    console.error('Failed to initialize GoogleGenerativeAI:', error);
}

// Get model with fallbacks
function getModel(modelType = 'fast', isVision = false) {
    if (!genAI) return null;

    const variant = MODEL_VARIANTS[modelType] || MODEL_VARIANTS.fast;
    const models = [variant.primary, variant.fallback];

    // For vision tasks, ensure we use a compatible model
    if (isVision) {
        models.unshift('gemini-1.5-pro-latest', 'gemini-1.5-flash-latest');
    }

    for (const modelId of models) {
        try {
            return genAI.getGenerativeModel({
                model: modelId,
                safetySettings: SAFETY_SETTINGS,
                generationConfig: GENERATION_CONFIG,
                systemInstruction: SYSTEM_PROMPT
            });
        } catch (error) {
            console.warn(`Failed to create model ${modelId}:`, error);
            continue;
        }
    }

    console.error('All model variants failed to initialize');
    return null;
}

// Error handling
function categorizeError(error) {
    const status = error?.status || error?.response?.status || error?.statusCode;
    const message = error?.message || error?.toString() || 'Unknown error';

    // Rate limiting
    if (status === 429 || message.includes('quota') || message.includes('rate limit')) {
        return { message: 'Rate limit exceeded. Please wait a moment.', type: 'rate_limit', retryable: true };
    }

    // API key issues
    if (status === 401 || status === 403 || message.includes('API key')) {
        return { message: 'Invalid API key. Please check configuration.', type: 'auth', retryable: false };
    }

    // Server errors (retryable)
    if (status >= 500 || message.includes('server error') || message.includes('internal error')) {
        return { message: 'Server temporarily unavailable. Retrying...', type: 'server', retryable: true };
    }

    // Network issues (retryable)
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
        return { message: 'Network connection issue. Please check your internet.', type: 'network', retryable: true };
    }

    // Content filtering
    if (message.includes('safety') || message.includes('blocked')) {
        return { message: 'Response was blocked by safety filters.', type: 'safety', retryable: false };
    }

    // Generic retryable error
    if (status >= 400 && status < 500) {
        return { message, type: 'client', retryable: false };
    }

    return { message, type: 'unknown', retryable: true };
}

// Main API handler
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Check if API is configured
        if (!API_KEY || !genAI) {
            res.status(500).json({ 
                error: 'AI service unavailable', 
                message: 'Server configuration error' 
            });
            return;
        }

        const { contents, modelKey = 'fast', isVision = false } = req.body;

        // Validate request
        if (!contents || !Array.isArray(contents)) {
            res.status(400).json({ 
                error: 'Invalid request', 
                message: 'Contents array is required' 
            });
            return;
        }

        // Get appropriate model
        const model = getModel(modelKey, isVision);
        if (!model) {
            res.status(500).json({ 
                error: 'Model unavailable', 
                message: 'Failed to initialize AI model' 
            });
            return;
        }

        // Generate response
        try {
            const result = await model.generateContent({ contents });
            const response = result.response;
            const text = response.text();

            res.status(200).json({ 
                success: true, 
                text,
                model: modelKey
            });

        } catch (generateError) {
            const categorized = categorizeError(generateError);
            console.error('Generation error:', categorized);
            
            res.status(500).json({ 
                error: 'Generation failed', 
                message: categorized.message,
                type: categorized.type,
                retryable: categorized.retryable
            });
        }

    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: 'Something went wrong' 
        });
    }
}