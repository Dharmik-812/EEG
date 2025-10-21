import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  sanitizeInput,
  isEnvironmentalTopic,
  buildGeminiContents,
  limitToSentences,
  addPlayfulEmojis,
  loadChatHistory,
  saveChatHistory,
  listSessions,
  createNewSession,
  switchToSession,
  deleteSession,
  loadUserPreferences,
  saveUserPreferences
} from '../utils/chatHelpers';

// Model variants mapping displayed to users
const MODEL_VARIANTS = {
  fast: { name: 'AversoAI-Impulsive' },
  balanced: { name: 'AversoAI-Thinker' }
};

// --- Caching helpers ---
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const createCacheKey = (contents, modelType) => {
  if (!contents || contents.length === 0 || contents.length > 10) return null;
  try { return `${JSON.stringify(contents)}_${modelType}`; } catch { return null; }
};
const cacheResponse = (key, data) => {
  if (!key || !data) return;
  responseCache.set(key, { data, timestamp: Date.now() });
  setTimeout(() => responseCache.delete(key), CACHE_TTL);
};
const getCachedResponse = (key) => {
  const cached = key ? responseCache.get(key) : null;
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) { responseCache.delete(key); return null; }
  return cached.data;
};

// --- Rate limiter ---
class RateLimiter {
  constructor(maxRequests = 5, windowMs = 15000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  canProceed() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    if (this.requests.length >= this.maxRequests) return false;
    this.requests.push(now);
    return true;
  }
  
  getBackoffDelay() { return 2000; }
  reset() { this.requests = []; }
}

// --- Error handling ---
class APIError extends Error {
  constructor(message, type = 'unknown', statusCode = null, retryable = false) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

const categorizeError = (error) => {
  const status = error?.status || error?.statusCode;
  const msg = error?.message || String(error);
  if (status === 429 || /rate limit|quota/i.test(msg)) return new APIError('Rate limit exceeded. Please wait a moment.', 'rate_limit', status, true);
  if (status === 401 || status === 403) return new APIError('Auth error. Check server config.', 'auth', status, false);
  if (status >= 500) return new APIError('Server temporarily unavailable. Retrying...', 'server', status, true);
  if (/network|timeout|fetch/i.test(msg)) return new APIError('Network issue. Please check your connection.', 'network', status, true);
  return new APIError(msg, 'unknown', status, true);
};

/**
 * Custom React hook for server-based chat functionality
 * @returns {Object} Chat state and methods
 */
export default function useServerChat() {
  // core state
  const [messages, setMessages] = useState(() => loadChatHistory());
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // preferences
  const [preferences, setPreferences] = useState(() => loadUserPreferences());
  const [modelKey, setModelKey] = useState(() => preferences.model || 'fast');

  // refs
  const rateLimiter = useRef(new RateLimiter(5, 15000));
  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Use Vercel serverless functions in production, local server in development
    const API_BASE = import.meta.env.VITE_API_BASE || 
      (import.meta.env.PROD ? '' : 'http://localhost:4000');
    const apiEndpoint = `${API_BASE}/api/chat`;

  // call API with caching and timeout
  const callServerAPI = useCallback(async (contents, modelType = 'fast', isVision = false) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (!isVision) {
      const key = createCacheKey(contents, modelType);
      const cached = getCachedResponse(key);
      if (cached) {
        return cached;
      }
    }
    
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, modelKey: modelType, isVision }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new APIError(
        data.message || `Server responded ${response.status}`,
        data.type || 'server',
        response.status,
        response.status >= 500
      );
    }
    
    const data = await response.json();
    if (!isVision && data?.success) {
      const key = createCacheKey(contents, modelType);
      cacheResponse(key, data);
    }
    
    return data;
  }, [apiEndpoint]);

  // retry wrapper
  const executeWithRetry = useCallback(async (operation, maxAttempts = 3, onRetry = null) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (abortControllerRef.current?.signal?.aborted) throw new Error('Operation aborted');
        return await operation();
      } catch (err) {
        lastError = categorizeError(err);
        if (!lastError.retryable || attempt === maxAttempts) {
          break;
        }
        
        const delay = Math.min(1000 * (2 ** (attempt - 1)), 8000) + Math.floor(Math.random() * 200);
        if (onRetry) onRetry(attempt, delay, lastError);
        await new Promise(r => {
          retryTimeoutRef.current = setTimeout(r, delay);
        });
      }
    }
    
    throw lastError;
  }, []);

  const processUserMessage = useCallback((rawInput, imageFile = null) => {
    const text = sanitizeInput(rawInput);
    if (!text && !imageFile) throw new Error('Please provide a message or image');
    if (text.length > 2000) throw new Error('Message too long. Keep under 2000 characters.');
    
    if (!imageFile && text && !isEnvironmentalTopic(text)) {
      return {
        isOffTopic: true,
        response: 'I can help with environmental topics like climate change, recycling, sustainability, energy, and conservation. 🌍✨'
      };
    }
    
    return { text, isValid: true };
  }, []);

  const sendMessage = useCallback(async (rawInput) => {
    setError(null);
    
    try {
      const processed = processUserMessage(rawInput);
      
      if (processed.isOffTopic) {
        const userMsg = {
          id: crypto.randomUUID(),
          role: 'user',
          content: sanitizeInput(rawInput),
          timestamp: Date.now()
        };
        
        const botMsg = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: processed.response,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, userMsg, botMsg]);
        saveChatHistory([...messages, userMsg, botMsg]);
        return;
      }
      
      if (!rateLimiter.current.canProceed()) {
        const delay = rateLimiter.current.getBackoffDelay();
        throw new APIError(`Please wait ${Math.ceil(delay / 1000)}s before sending another message.`, 'rate_limit');
      }
      
      const userMsg = {
        id: crypto.randomUUID(),
        role: 'user',
        content: processed.text,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingText('');
      
      const updatedHistory = [...messages, userMsg];
      const contents = buildGeminiContents(updatedHistory, processed.text);
      
      const result = await executeWithRetry(
        () => callServerAPI(contents, modelKey, false),
        3,
        (attempt) => {
          setStreamingText(prev => `${prev ? prev + '\n' : ''}Retrying... (attempt ${attempt}/3)`);
        }
      );
      
      if (!result.success) throw new Error(result.message || 'Failed to generate response');
      
      let finalText = addPlayfulEmojis(limitToSentences(result.text || 'Got it! 🌱', 3));
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: finalText,
        timestamp: Date.now(),
        model: modelKey
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      saveChatHistory([...messages, userMsg, assistantMsg]);
    } catch (err) {
      const e = categorizeError(err);
      setError(e.message);
    } finally {
      setIsStreaming(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  }, [messages, modelKey, callServerAPI, executeWithRetry, processUserMessage]);

  const sendMessageWithImage = useCallback(async (rawInput, imageData) => {
    setError(null);
    
    try {
      if (!imageData || !imageData.data || !imageData.mimeType) throw new Error('Invalid image data');
      
      const text = sanitizeInput(rawInput) || 'What can you tell me about this image from an environmental perspective?';
      
      if (!rateLimiter.current.canProceed()) {
        throw new APIError('Please wait a moment before sending another message.', 'rate_limit');
      }
      
      const userMsg = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        image: imageData,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingText('');
      
      const contents = [{
        role: 'user',
        parts: [
          { text },
          { inlineData: { data: imageData.data, mimeType: imageData.mimeType } }
        ]
      }];
      
      const result = await executeWithRetry(() => callServerAPI(contents, modelKey, true), 3);
      
      if (!result.success) throw new Error(result.message || 'Failed to analyze image');
      
      let finalText = addPlayfulEmojis(limitToSentences(
        result.text || 'I can see the image, but I\'m having trouble analyzing it right now.',
        3
      ));
      
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: finalText,
        timestamp: Date.now(),
        model: `${modelKey}-vision`
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      saveChatHistory([...messages, userMsg, assistantMsg]);
    } catch (err) {
      const e = categorizeError(err);
      setError(e.message);
    } finally {
      setIsStreaming(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  }, [messages, modelKey, callServerAPI, executeWithRetry]);

  const regenerateLastResponse = useCallback(async () => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return;
    
    const last = userMessages[userMessages.length - 1];
    const idx = messages.findIndex(m => m.id === last.id);
    if (idx === -1) return;
    
    setMessages(messages.slice(0, idx + 1));
    await new Promise(r => setTimeout(r, 100));
    return last.image ? sendMessageWithImage(last.content, last.image) : sendMessage(last.content);
  }, [messages, sendMessage, sendMessageWithImage]);

  const editLastUserMessage = useCallback(async (newText) => {
    const sanitized = sanitizeInput(newText);
    if (!sanitized) return;
    
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return;
    
    const last = userMessages[userMessages.length - 1];
    const idx = messages.findIndex(m => m.id === last.id);
    if (idx === -1) return;
    
    const edited = { ...last, content: sanitized, editedAt: Date.now() };
    setMessages([...messages.slice(0, idx), edited]);
    await new Promise(r => setTimeout(r, 100));
    return sendMessage(sanitized);
  }, [messages, sendMessage]);

  const clearCurrentChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    setStreamingText('');
    rateLimiter.current.reset();
    const id = createNewSession();
    setCurrentSessionId(id);
  }, []);

  const createNewChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError(null);
    const id = createNewSession();
    if (id) {
      setCurrentSessionId(id);
      rateLimiter.current.reset();
    }
  }, []);

  const openExistingChat = useCallback((sessionId) => {
    abortControllerRef.current?.abort();
    const session = switchToSession(sessionId);
    if (session) {
      setMessages(session.messages || []);
      setCurrentSessionId(sessionId);
      setError(null);
      rateLimiter.current.reset();
      return true;
    }
    setError('Chat session not found');
    return false;
  }, []);

  const deleteExistingChat = useCallback((sessionId) => {
    const ok = deleteSession(sessionId);
    if (ok && sessionId === currentSessionId) {
      setMessages(loadChatHistory());
    }
    return ok;
  }, [currentSessionId]);

  const updatePreferences = useCallback((next) => {
    const updated = { ...preferences, ...next };
    setPreferences(updated);
    saveUserPreferences(updated);
    if (next.model && next.model !== modelKey) setModelKey(next.model);
  }, [preferences, modelKey]);

  const abortCurrentRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    clearTimeout(retryTimeoutRef.current);
    setIsStreaming(false);
    setStreamingText('');
    setError('Request cancelled');
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Effects
  useEffect(() => {
    if (messages.length > 0) saveChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (modelKey !== preferences.model) updatePreferences({ model: modelKey });
  }, [modelKey, preferences.model, updatePreferences]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  const apiStatus = 'ready';
  const availableModels = useMemo(() => 
    Object.fromEntries(Object.entries(MODEL_VARIANTS).map(([k, v]) => [k, v.name])),
    []
  );

  const rateLimitInfo = {
    remaining: Math.max(0, rateLimiter.current.maxRequests - rateLimiter.current.requests.length),
    resetTime: rateLimiter.current.requests.length > 0 ? 
      rateLimiter.current.requests[0] + rateLimiter.current.windowMs : null
  };

  return {
    // State
    messages,
    isStreaming,
    streamingText,
    error,
    clearError,
    
    // Message actions
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
    availableModels,
    preferences,
    updatePreferences,
    
    // Status info
    apiStatus,
    canSendMessage: !isStreaming && apiStatus === 'ready',
    rateLimitInfo
  };
}