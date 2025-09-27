import React, { useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import useGeminiChat from '../hooks/useGeminiChat'
import '../styles/chatbot.css'

export default function ChatInterface() {
  const {
    messages,
    isStreaming,
    streamingText,
    error,
    sendMessage,
    clearChat,
  } = useGeminiChat()

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const handleSend = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    try {
      await sendMessage(text)
      setInput('')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  useEffect(() => {
    // Auto-scroll to bottom on new messages or stream updates
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingText])

  const Header = useMemo(() => (
    <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 bg-white/90 dark:bg-slate-900/90 border-b border-emerald-100 dark:border-emerald-900/30">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-glow">
            <span aria-hidden>🌱</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-white">EcoBot</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">Environmental Education Assistant</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-xs px-3 py-2 rounded-lg border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 transition-colors"
          aria-label="Clear chat history"
        >
          Clear Chat
        </button>
      </div>
    </div>
  ), [clearChat])

  return (
    <section className="min-h-[70vh]">
      {Header}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-28">
        <div
          ref={listRef}
          className="eco-chat-scroll space-y-4"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {/* Intro card when no messages */}
          {messages.length === 0 && (
            <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Welcome to EcoBot! ♻️</h2>
              <p className="text-sm text-slate-700 dark:text-slate-300">Ask me about climate change, recycling, sustainability, renewable energy, conservation, or eco-friendly habits. I’ll keep it short, fun, and gamified! ✨</p>
              <ul className="mt-3 text-sm text-slate-600 dark:text-slate-400 list-disc pl-5">
                <li>Try: "How can I reduce plastic at home?"</li>
                <li>Try: "Solar vs. wind: which is greener?"</li>
                <li>Try: "What goes in recycling?"</li>
              </ul>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} />
          ))}

          {isStreaming && (
            <div className="flex items-start gap-3">
              <Avatar role="assistant" />
              <div className="eco-bubble eco-bubble-bot">
                {streamingText ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{streamingText}</p>
                ) : (
                  <TypingIndicator />
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-300/50 bg-red-50/60 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 border-t border-emerald-200/70 dark:border-emerald-900/40 bg-white/90 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60"
        role="search"
        aria-label="Chat Composer"
      >
        <div className="max-w-3xl mx-auto px-4 py-3 grid grid-cols-[1fr_auto] gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask an eco question…"
            className="w-full rounded-xl border border-emerald-300/60 dark:border-emerald-800/60 bg-white/90 dark:bg-slate-900/80 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/60"
            disabled={sending || isStreaming}
            aria-disabled={sending || isStreaming}
          />
          <button
            type="submit"
            disabled={sending || isStreaming || input.trim().length === 0}
            className={clsx(
              'inline-flex items-center justify-center gap-2 rounded-xl px-4 sm:px-5 py-3 text-sm font-medium text-white transition-colors',
              sending || isStreaming
                ? 'bg-emerald-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
            )}
            aria-label="Send message"
          >
            {sending || isStreaming ? (
              <span className="flex items-center gap-2">
                <span className="eco-spinner" aria-hidden />
                Sending…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span aria-hidden>🪴</span>
                Send
              </span>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

function Avatar({ role }) {
  return (
    <div className={clsx(
      'mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
      role === 'assistant' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
    )}>
      <span aria-hidden>{role === 'assistant' ? '🌿' : '🙂'}</span>
    </div>
  )
}

function MessageBubble({ role, content }) {
  return (
    <div className={clsx('flex items-start gap-3', role === 'user' ? 'justify-end' : 'justify-start')}>
      {role !== 'user' && <Avatar role={role} />}
      <div className={clsx('eco-bubble', role === 'user' ? 'eco-bubble-user' : 'eco-bubble-bot')}>
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
      {role === 'user' && <Avatar role={role} />}
    </div>
  )}

function TypingIndicator() {
  return (
    <div className="eco-typing" aria-live="polite" aria-label="EcoBot is typing">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  )
}
