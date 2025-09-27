import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import {
    addPlayfulEmojis,
    buildGeminiContents,
    isEnvironmentalTopic,
    limitToSentences,
    loadHistory,
    persistHistory,
    sanitizeInput,
    listSessions as listSessionsHelper,
    newSession as newSessionHelper,
    openSession as openSessionHelper,
    deleteSession as deleteSessionHelper
} from '../utils/chatHelpers';

// Constants
const SYSTEM_PROMPT = "You are AversoAI, a fun environmental education assistant for a gamified learning website. You ONLY answer questions about environmental topics like climate change, recycling, sustainability, renewable energy, conservation, and eco-friendly habits. For off-topic questions, politely redirect to environmental education. Keep responses under 3 sentences, use emojis occasionally, and maintain an enthusiastic, game-like tone.";

const SAFETY_SETTINGS = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
];

const GENERATION_CONFIG = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 512,
};

const MODEL_MAP = {
    normal: 'gemini-1.5-flash-latest',
    pro: 'gemini-1.5-pro-latest',
};

const RATE_LIMIT = {
    max: 3,
    windowMs: 10_000
};

const STORAGE_KEYS = {
    model: 'aversoai:model',
    sessions: 'eco_chat_sessions_v1',
    activeId: 'eco_chat_active_id_v1'
};

// Rate limiter hook
function useRateLimiter(max = RATE_LIMIT.max, windowMs = RATE_LIMIT.windowMs) {
    const timestampsRef = useRef < number[] > ([]);

    return useCallback(() => {
        const now = Date.now();
        timestampsRef.current = timestampsRef.current.filter(t => now - t < windowMs);

        if (timestampsRef.current.length >= max) {
            return false;
        }

        timestampsRef.current.push(now);
        return true;
    }, [max, windowMs]);
}

// Error handler
class ChatError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'ChatError';
    }
}

// Retry utility
const withRetry = async <T,>(
    fn: () => Promise<T>,
    attempts = 3,
    baseDelay = 250
): Promise<T> => {
    let lastError: Error;

    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on client errors (4xx)
            const status = (error as any)?.status || (error as any)?.response?.status;
            if (status && status >= 400 && status < 500) break;

            // Exponential backoff
            const delay = baseDelay * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
};

export default function useGeminiChat() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const [messages, setMessages] = useState(() => loadHistory());
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [error, setError] = useState < string | null > (null);
    const canProceed = useRateLimiter();

    const [modelKey, setModelKey] = useState(() => {
        try {
            return (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.model)) || 'normal';
        } catch {
            return 'normal';
        }
    });

    // Effects for persistence
    useEffect(() => {
        persistHistory(messages);
    }, [messages]);

    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.model, modelKey);
            }
        } catch (error) {
            console.warn('Failed to save model preference:', error);
        }
    }, [modelKey]);

    // Gemini AI initialization
    const genAI = useMemo(() => {
        if (!apiKey) {
            setError('Missing API key. Set VITE_GEMINI_API_KEY in your environment.');
            return null;
        }

        try {
            return new GoogleGenerativeAI(apiKey);
        } catch (error) {
            console.error('Failed to initialize Gemini AI:', error);
            setError('Failed to initialize AI service.');
            return null;
        }
    }, [apiKey]);

    const model = useMemo(() => {
        if (!genAI) return null;

        const modelId = MODEL_MAP[modelKey as keyof typeof MODEL_MAP] || MODEL_MAP.normal;

        try {
            return genAI.getGenerativeModel({
                model: modelId,
                safetySettings: SAFETY_SETTINGS,
                generationConfig: GENERATION_CONFIG,
                systemInstruction: SYSTEM_PROMPT
            });
        } catch (error) {
            console.error(`Failed to load model ${modelId}:`, error);
            return null;
        }
    }, [genAI, modelKey]);

    const visionModel = useMemo(() => {
        if (!genAI) return null;

        const preferred = MODEL_MAP[modelKey as keyof typeof MODEL_MAP] || MODEL_MAP.normal;
        const fallbacks = [preferred, 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];

        for (const modelId of fallbacks) {
            try {
                return genAI.getGenerativeModel({
                    model: modelId,
                    safetySettings: SAFETY_SETTINGS,
                    generationConfig: GENERATION_CONFIG,
                    systemInstruction: SYSTEM_PROMPT
                });
            } catch (error) {
                console.warn(`Failed to load vision model ${modelId}:`, error);
                continue;
            }
        }

        return null;
    }, [genAI, modelKey]);

    // Core chat functions
    const sendMessage = useCallback(async (rawInput: string) => {
        setError(null);
        const text = sanitizeInput(rawInput);

        if (!text) {
            setError('Please enter a message.');
            return;
        }

        if (!canProceed()) {
            setError('Rate limit: Please wait a moment before sending another message.');
            return;
        }

        // Topic validation
        if (!isEnvironmentalTopic(text)) {
            const reply = 'I can only chat about environmental topics (climate, recycling, sustainability, renewable energy, conservation, eco-habits). Ask me something green! 🌍';
            const userMsg = {
                id: crypto.randomUUID(),
                role: 'user' as const,
                content: text,
                createdAt: Date.now()
            };
            const botMsg = {
                id: crypto.randomUUID(),
                role: 'assistant' as const,
                content: reply,
                createdAt: Date.now()
            };

            setMessages(prev => [...prev, userMsg, botMsg]);
            return;
        }

        if (!model) {
            setError('AI service is not available. Please check your configuration.');
            return;
        }

        const userMsg = {
            id: crypto.randomUUID(),
            role: 'user' as const,
            content: text,
            createdAt: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsStreaming(true);
        setStreamingText('');

        try {
            const contents = buildGeminiContents(messages.concat(userMsg), text, SYSTEM_PROMPT);
            const run = await withRetry(() => model.generateContentStream({ contents }));

            let accumulatedText = '';
            for await (const chunk of run.stream) {
                const delta = chunk.text() || '';
                if (delta) {
                    accumulatedText += delta;
                    setStreamingText(accumulatedText);
                }
            }

            let finalText = limitToSentences(accumulatedText || 'I appreciate your question!', 3);
            finalText = addPlayfulEmojis(finalText);

            const botMsg = {
                id: crypto.randomUUID(),
                role: 'assistant' as const,
                content: finalText,
                createdAt: Date.now()
            };

            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'user') {
                    return [...prev.slice(0, -1), lastMessage, botMsg];
                }
                return [...prev, botMsg];
            });
        } catch (error) {
            console.error('Chat error:', error);
            setError('AversoAI hit a snag. Please try again. 🌱');

            // Remove the user message if the request failed
            setMessages(prev => prev.filter(msg => msg.id !== userMsg.id));
        } finally {
            setIsStreaming(false);
            setStreamingText('');
        }
    }, [model, messages, canProceed]);

    const sendMessageWithImage = useCallback(async (rawInput: string, image: { data: string; mimeType: string }) => {
        setError(null);
        const text = sanitizeInput(rawInput);

        if (!text && !image) {
            setError('Please provide either text or an image.');
            return;
        }

        if (!canProceed()) {
            setError('Rate limit: Please wait a moment before sending another message.');
            return;
        }

        if (!visionModel) {
            setError('Image processing is not available. Please check your configuration.');
            return;
        }

        const userMsg = {
            id: crypto.randomUUID(),
            role: 'user' as const,
            content: text || '(sent an image)',
            createdAt: Date.now(),
            image
        };

        setMessages(prev => [...prev, userMsg]);
        setIsStreaming(true);
        setStreamingText('');

        try {
            const parts = [];
            if (text) parts.push({ text });
            if (image?.data && image?.mimeType) {
                parts.push({
                    inlineData: {
                        data: image.data,
                        mimeType: image.mimeType
                    }
                });
            }

            const result = await withRetry(() =>
                visionModel.generateContent({ contents: [{ role: 'user', parts }] })
            );

            const response = await result.response;
            const finalTextRaw = response.text() || 'I looked at your image!';

            let finalText = limitToSentences(finalTextRaw, 3);
            finalText = addPlayfulEmojis(finalText);

            const botMsg = {
                id: crypto.randomUUID(),
                role: 'assistant' as const,
                content: finalText,
                createdAt: Date.now()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Image chat error:', error);
            setError('AversoAI could not process the image. Please try a different one.');

            // Remove the user message if the request failed
            setMessages(prev => prev.filter(msg => msg.id !== userMsg.id));
        } finally {
            setIsStreaming(false);
            setStreamingText('');
        }
    }, [visionModel, canProceed]);

    const regenerateLast = useCallback(async () => {
        setError(null);

        const userMessageIndex = [...messages]
            .map((m, index) => ({ role: m.role, index }))
            .filter(({ role }) => role === 'user')
            .pop()?.index;

        if (userMessageIndex === undefined || userMessageIndex < 0) return;

        const lastPrompt = messages[userMessageIndex].content;

        // Remove messages after the last user message
        setMessages(prev => prev.slice(0, userMessageIndex + 1));

        // Allow state to update before sending
        await new Promise(resolve => setTimeout(resolve, 0));

        return sendMessage(lastPrompt);
    }, [messages, sendMessage]);

    const editLastUserMessage = useCallback(async (newText: string) => {
        const text = sanitizeInput(newText);
        if (!text) return;

        const userMessageIndex = [...messages]
            .map((m, index) => ({ role: m.role, index }))
            .filter(({ role }) => role === 'user')
            .pop()?.index;

        if (userMessageIndex === undefined || userMessageIndex < 0) return;

        setMessages(prev => {
            const updated = prev.slice(0, userMessageIndex + 1);
            updated[userMessageIndex] = {
                ...updated[userMessageIndex],
                content: text,
                editedAt: Date.now()
            };
            return updated;
        });

        await new Promise(resolve => setTimeout(resolve, 0));
        return sendMessage(text);
    }, [messages, sendMessage]);

    // Session management
    const clearChat = useCallback(() => {
        newSessionHelper();
        setMessages([]);
        setError(null);
    }, []);

    const listSessions = useCallback(() => listSessionsHelper(), []);

    const newChat = useCallback(() => {
        newSessionHelper();
        setMessages([]);
        setError(null);
    }, []);

    const openChat = useCallback((id: string) => {
        const session = openSessionHelper(id);
        setMessages(session?.messages || []);
        setError(null);
    }, []);

    const deleteChat = useCallback((id: string) => {
        deleteSessionHelper(id);
        const active = loadHistory();
        setMessages(active);
    }, []);

    return {
        messages,
        isStreaming,
        streamingText,
        error,
        sendMessage,
        sendMessageWithImage,
        regenerateLast,
        editLastUserMessage,
        clearChat,
        listSessions,
        newChat,
        openChat,
        deleteChat,
        modelKey,
        setModelKey,
    };
}