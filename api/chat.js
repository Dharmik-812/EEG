import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

/**
 * AversoAI Chat API - Backend Service
 * 
 * This module provides the server-side implementation of the AversoAI chatbot,
 * handling model initialization, content generation, and error management.
 * 
 * @module api/chat
 */

// Load environment variables from .env.server
dotenv.config({ path: path.resolve(process.cwd(), '.env.server') });

// Environment variables - SERVER-SIDE ONLY for security
const API_KEY = process.env.GEMINI_API_KEY;

// Safety settings - Prevent harmful content generation
const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Generation configuration - Controls AI response characteristics
const GENERATION_CONFIG = {
    temperature: 0.8,    // Controls randomness (0.0-1.0)
    topP: 0.9,           // Nucleus sampling parameter
    topK: 40,            // Limits vocabulary to top K tokens
    maxOutputTokens: 1024, // Maximum response length
    candidateCount: 1,   // Number of response candidates to generate
    stopSequences: ["Human:", "User:", "Assistant:"] // Prevents AI from continuing the conversation
};

// System prompt - Defines AversoAI's personality and behavior
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

// Model variants - Different AI models with fallback options
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

// Rate limiting store
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

// Initialize Gemini AI client
let genAI = null;
if (API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize GoogleGenerativeAI:', error);
    }
} else {
    console.error('❌ No API_KEY found. Check your .env.server file');
}

/**
 * Gets a Gemini model with fallback options
 * 
 * @param {string} modelType - The type of model to use ('fast' or 'balanced')
 * @param {boolean} isVision - Whether the model needs vision capabilities
 * @returns {Object|null} The generative model or null if initialization fails
 */
function getModel(modelType = 'fast', isVision = false) {
    if (!genAI) {
        console.error('❌ genAI not initialized - check API key configuration');
        return null;
    }

    const variant = MODEL_VARIANTS[modelType] || MODEL_VARIANTS.fast;
    const models = [variant.primary, variant.fallback];

    // For vision tasks, ensure we use a compatible model
    if (isVision) {
        models.unshift('gemini-1.5-pro-latest', 'gemini-1.5-flash-latest');
    }

    for (const modelId of models) {
        try {
            console.log(`🔄 Attempting to create model: ${modelId}`);
            return genAI.getGenerativeModel({
                model: modelId,
                safetySettings: SAFETY_SETTINGS,
                generationConfig: GENERATION_CONFIG,
                systemInstruction: SYSTEM_PROMPT
            });
        } catch (error) {
            console.warn(`⚠️ Failed to create model ${modelId}:`, error.message);
            continue;
        }
    }

    console.error('❌ All model variants failed to initialize');
    return null;
}

/**
 * Categorizes errors for better client feedback and retry logic
 * 
 * @param {Error} error - The error to categorize
 * @returns {Object} Error details with message, type and retryable flag
 */
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

    // Generic client error
    if (status >= 400 && status < 500) {
        return { message, type: 'client', retryable: false };
    }

    return { message, type: 'unknown', retryable: true };
}

/**
 * Processes chat requests and generates AI responses
 * 
 * @param {Object} body - Request body containing chat contents and model preferences
 * @returns {Object} Generated response or error details
 */
async function processChat(body) {
    console.log('🔄 Processing chat request...');
    
    try {
        // Extract request data
        const { contents, modelType = 'fast', isVision = false } = body || {};
        const modelKey = modelType?.toLowerCase() || 'fast';
        
        console.log('📝 Request data:', { modelKey, isVision, contentsLength: contents?.length });
        
        // Validate request
        if (!contents || !Array.isArray(contents) || contents.length === 0) {
            throw new Error('Invalid request: contents must be a non-empty array');
        }
        
        // Content validation
        const MAX_TEXT_LEN = 32000;
        for (const item of contents) {
            if (!item || typeof item !== 'object') {
                throw new Error('Invalid request: Each content must be an object');
            }
            const parts = item.parts || [];
            if (!Array.isArray(parts)) {
                throw new Error('Invalid request: parts must be an array');
            }
            for (const p of parts) {
                if (p.text != null) {
                    if (typeof p.text !== 'string') {
                        throw new Error('Invalid request: text must be a string');
                    }
                    if (p.text.length > MAX_TEXT_LEN) {
                        throw new Error(`Payload too large: text exceeds ${MAX_TEXT_LEN} characters`);
                    }
                }
            }
        }
        
        // Get appropriate model
        const model = getModel(modelKey, isVision);
        if (!model) {
            throw new Error('Model unavailable: Failed to initialize AI model');
        }
        
        // Generate response
        console.log('🤖 Generating content with model...');
        const result = await model.generateContent({
            contents,
            generationConfig: {
                ...GENERATION_CONFIG,
                temperature: modelKey === 'balanced' ? 0.7 : 0.9
            }
        });
        
        const response = result.response;
        console.log('✅ Content generated successfully');
        
        return {
            text: response.text(),
            model: MODEL_VARIANTS[modelKey]?.name || 'AversoAI',
            promptFeedback: response.promptFeedback
        };
    } catch (error) {
        console.error('❌ Error processing chat:', error);
        const errorDetails = categorizeError(error);
        return {
            error: true,
            ...errorDetails,
            timestamp: new Date().toISOString()
        };
    }
}

function checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    
    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, []);
    }
    
    const requests = rateLimitStore.get(ip);
    // Remove old requests outside the current window
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }
    
    recentRequests.push(now);
    rateLimitStore.set(ip, recentRequests);
    return true;
}

/**
 * API handler for chat requests
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
export default async function handler(req, res) {
    console.log(`Received ${req.method} request`);
    
    // Set CORS headers
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);
    const requestOrigin = req.headers?.origin || '';
    const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];
    
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('Handling preflight request');
        return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Check if API is configured
        if (!API_KEY) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({ 
                error: 'AI service unavailable', 
                message: 'Server configuration error - missing API key' 
            });
        }

        if (!genAI) {
            console.error('Failed to initialize Gemini AI');
            return res.status(500).json({ 
                error: 'AI service unavailable', 
                message: 'Server configuration error - failed to initialize AI' 
            });
        }

        // Rate limiting
        const clientIP = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
        if (!checkRateLimit(clientIP)) {
            console.warn(`Rate limit exceeded for IP: ${clientIP}`);
            return res.status(429).json({ 
                error: 'Too Many Requests', 
                message: 'Rate limit exceeded. Please try again later.' 
            });
        }

        // Parse and validate request body
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ 
                error: 'Invalid request', 
                message: 'Request body must be a valid JSON object' 
            });
        }

        // Process the chat request
        const result = await processChat(req.body);
        console.log('Chat processed successfully');
        
        return res.status(200).json({
            success: true,
            ...result
        });
        
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ 
            error: 'Processing failed', 
            message: error.message || 'Unknown error occurred'
        });
    }
}