import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { addPlayfulEmojis, buildGeminiContents, isEnvironmentalTopic, limitToSentences, loadHistory, persistHistory, sanitizeInput } from '../utils/chatHelpers'

const SYSTEM_PROMPT = "You are EcoBot, a fun environmental education assistant for a gamified learning app. You ONLY answer questions about environmental topics like climate change, recycling, sustainability, renewable energy, conservation, and eco-friendly habits. For off-topic questions, politely redirect to environmental education. Keep responses under 3 sentences, use emojis occasionally, and maintain an enthusiastic, game-like tone."

const SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

const GEN_CFG = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 512,
}

// Simple in-memory rate limiter (3 requests per 10s)
function useRateLimiter(max = 3, windowMs = 10_000) {
  const timestampsRef = useRef([])
  return useCallback(() => {
    const now = Date.now()
    timestampsRef.current = timestampsRef.current.filter(t => now - t < windowMs)
    if (timestampsRef.current.length >= max) {
      return false
    }
    timestampsRef.current.push(now)
    return true
  }, [max, windowMs])
}

export default function useGeminiChat() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const [messages, setMessages] = useState(() => loadHistory())
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [error, setError] = useState(null)
  const canProceed = useRateLimiter(3, 10_000)

  useEffect(() => { persistHistory(messages) }, [messages])

  const genAI = useMemo(() => {
    if (!apiKey) return null
    try {
      return new GoogleGenerativeAI(apiKey)
    } catch {
      return null
    }
  }, [apiKey])

  const model = useMemo(() => {
    if (!genAI) return null
    try {
      return genAI.getGenerativeModel({ model: 'gemini-pro', safetySettings: SAFETY, generationConfig: GEN_CFG, systemInstruction: SYSTEM_PROMPT })
    } catch {
      return null
    }
  }, [genAI])

  const withRetry = useCallback(async (fn, attempts = 3) => {
    let lastErr
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn()
      } catch (err) {
        lastErr = err
        // Retry on 429/5xx or network-like errors
        const status = err?.status || err?.response?.status
        if (status && status < 500 && status !== 429) break
        const delay = 250 * (2 ** i)
        await new Promise(res => setTimeout(res, delay))
      }
    }
    throw lastErr
  }, [])

  const sendMessage = useCallback(async (rawInput) => {
    setError(null)
    const text = sanitizeInput(rawInput)
    if (!text) return

    if (!canProceed()) {
      setError('Rate limit: Please wait a moment before sending another message.')
      return
    }

    // Off-topic guard
    if (!isEnvironmentalTopic(text)) {
      const reply = 'I can only chat about environmental topics (climate, recycling, sustainability, renewable energy, conservation, eco-habits). Ask me something green! 🌍'
      const userMsg = { id: crypto.randomUUID(), role: 'user', content: text, createdAt: Date.now() }
      const botMsg = { id: crypto.randomUUID(), role: 'assistant', content: reply, createdAt: Date.now() }
      setMessages(prev => [...prev, userMsg, botMsg])
      return
    }

    if (!model) {
      setError('Missing API key. Set VITE_GEMINI_API_KEY in your environment.')
      return
    }

    const userMsg = { id: crypto.randomUUID(), role: 'user', content: text, createdAt: Date.now() }
    setMessages(prev => [...prev, userMsg])

    setIsStreaming(true)
    setStreamingText('')

    try {
      const contents = buildGeminiContents(messages.concat(userMsg), text, SYSTEM_PROMPT)
      const run = await withRetry(() => model.generateContentStream({ contents }))

      for await (const chunk of run.stream) {
        const delta = chunk?.text?.() ?? ''
        if (delta) setStreamingText(prev => (prev + delta))
      }

      let finalText = limitToSentences(streamingText || 'Done!', 3)
      finalText = addPlayfulEmojis(finalText)

      const botMsg = { id: crypto.randomUUID(), role: 'assistant', content: finalText, createdAt: Date.now() }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error(err)
      setError('EcoBot hit a snag. Please try again. 🌱')
    } finally {
      setIsStreaming(false)
      setStreamingText('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, messages, streamingText, withRetry, canProceed])

  const clearChat = useCallback(() => {
    localStorage.removeItem('eco_chat_history_v1')
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isStreaming,
    streamingText,
    error,
    sendMessage,
    clearChat,
  }
}
