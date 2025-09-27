import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
    History, RefreshCw, Edit3, Image as ImageIcon, Mic, MicOff,
    Volume2, VolumeX, X, PlayCircle, PauseCircle, Send, Plus,
    Trash2, Settings, AlertCircle, Wifi, WifiOff, Clock
} from 'lucide-react'
import gsap from 'gsap'
import { useAnimationStore } from '../store/animationStore'
import useClientChat from '../hooks/useClientChat'
import '../styles/chatbot.css'

// Enhanced typing indicator component
function TypingIndicator({ message = "AversoAI is thinking..." }) {
    return (
        <div className="eco-typing" aria-live="polite" aria-label={message}>
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    <motion.span
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">{message}</span>
            </div>
        </div>
    )
}

// Enhanced avatar component with status indicators
function Avatar({ role, status = 'online', size = 'md' }) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10'
    }

    return (
        <div className="relative">
            <div className={clsx(
                'rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
                sizeClasses[size],
                role === 'assistant'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md'
                    : 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 dark:from-emerald-800 dark:to-emerald-700 dark:text-emerald-200'
            )}>
                <span aria-hidden className="text-sm">
                    {role === 'assistant' ? '🌿' : '🙂'}
                </span>
            </div>

            {role === 'assistant' && (
                <div className={clsx(
                    'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900',
                    status === 'online' ? 'bg-green-400' :
                        status === 'thinking' ? 'bg-yellow-400' : 'bg-gray-400'
                )} />
            )}
        </div>
    )
}

// Enhanced message bubble with better interactions
function MessageBubble({
    message,
    onEdit,
    onSpeak,
    onRegenerate,
    speaking,
    canEdit = false,
    isLatestAssistant = false
}) {
    const bubbleRef = useRef(null)
    const [isHovered, setIsHovered] = useState(false)
    const reduced = useAnimationStore(s => s.reduced)

    const { role, content, image, timestamp, model, editedAt } = message

    useEffect(() => {
        if (reduced || !bubbleRef.current) return

        const el = bubbleRef.current
        const y = role === 'user' ? 6 : 8

        gsap.fromTo(el,
            { opacity: 0, y, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
        )

        // Subtle highlight animation
        gsap.fromTo(el,
            { boxShadow: '0 4px 12px rgba(16,185,129,0.1)' },
            {
                boxShadow: '0 8px 24px rgba(16,185,129,0.2)',
                duration: 0.8,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1
            }
        )
    }, [reduced, role])

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true)
        if (reduced || !bubbleRef.current) return
        gsap.to(bubbleRef.current, {
            scale: 1.02,
            duration: 0.2,
            ease: 'power2.out'
        })
    }, [reduced])

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false)
        if (reduced || !bubbleRef.current) return
        gsap.to(bubbleRef.current, {
            scale: 1,
            duration: 0.2,
            ease: 'power2.out'
        })
    }, [reduced])

    const formatTime = useCallback((timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
        return date.toLocaleDateString()
    }, [])

    return (
        <motion.div
            className={clsx('flex items-start gap-3', {
                'justify-end': role === 'user',
                'justify-start': role === 'assistant'
            })}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {role === 'assistant' && (
                <Avatar
                    role={role}
                    status={speaking ? 'thinking' : 'online'}
                />
            )}

            <div className="flex flex-col max-w-[90%] sm:max-w-[85%]">
                <div
                    ref={bubbleRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={clsx(
                        'eco-bubble relative group',
                        role === 'user' ? 'eco-bubble-user' : 'eco-bubble-bot'
                    )}
                >
                    {/* Image attachment */}
                    {image && (
                        <div className="mb-3">
                            <img
                                src={`data:${image.mimeType};base64,${image.data}`}
                                alt="Attachment"
                                className="max-h-64 rounded-lg border border-emerald-300/40 dark:border-emerald-700/40 object-contain"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Message content */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="whitespace-pre-wrap leading-relaxed m-0">
                            {content}
                        </p>
                    </div>

                    {/* Message metadata */}
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(timestamp)}</span>
                            {editedAt && (
                                <span className="text-amber-600 dark:text-amber-400">(edited)</span>
                            )}
                            {model && role === 'assistant' && (
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {model}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-1 mt-2 text-xs"
                        >
                            {canEdit && onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="px-2 py-1 rounded-md border border-emerald-400/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 inline-flex items-center gap-1 transition-colors"
                                    data-ripple
                                >
                                    <Edit3 className="h-3 w-3" />
                                    Edit
                                </button>
                            )}

                            {role === 'assistant' && onSpeak && (
                                <button
                                    onClick={onSpeak}
                                    className="px-2 py-1 rounded-md border border-emerald-400/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 inline-flex items-center gap-1 transition-colors"
                                    data-ripple
                                >
                                    {speaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                                    {speaking ? 'Stop' : 'Speak'}
                                </button>
                            )}

                            {isLatestAssistant && onRegenerate && (
                                <button
                                    onClick={onRegenerate}
                                    className="px-2 py-1 rounded-md border border-emerald-400/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 inline-flex items-center gap-1 transition-colors"
                                    data-ripple
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Regenerate
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {role === 'user' && <Avatar role={role} />}
        </motion.div>
    )
}

// Enhanced error display component
function ErrorDisplay({ error, onRetry, onDismiss }) {
    const getErrorIcon = (error) => {
        if (error.includes('network') || error.includes('connection')) {
            return <WifiOff className="h-5 w-5" />
        }
        if (error.includes('rate limit') || error.includes('wait')) {
            return <Clock className="h-5 w-5" />
        }
        return <AlertCircle className="h-5 w-5" />
    }

    const getErrorColor = (error) => {
        if (error.includes('rate limit')) return 'amber'
        if (error.includes('network')) return 'blue'
        return 'red'
    }

    const colorClass = getErrorColor(error)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={clsx(
                'rounded-lg border p-4 flex items-start gap-3',
                `border-${colorClass}-300/50 bg-${colorClass}-50/60 dark:bg-${colorClass}-900/20 text-${colorClass}-800 dark:text-${colorClass}-200`
            )}
        >
            {getErrorIcon(error)}
            <div className="flex-1">
                <p className="text-sm font-medium">Something went wrong</p>
                <p className="text-sm opacity-90 mt-1">{error}</p>
            </div>
            <div className="flex gap-2">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-sm px-2 py-1 rounded hover:bg-white/50 dark:hover:bg-black/20"
                    >
                        Retry
                    </button>
                )}
                <button
                    onClick={onDismiss}
                    className="text-sm px-2 py-1 rounded hover:bg-white/50 dark:hover:bg-black/20"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    )
}

// Enhanced session sidebar
function SessionSidebar({
    isOpen,
    onClose,
    sessions,
    currentSessionId,
    onNewChat,
    onOpenChat,
    onDeleteChat
}) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredSessions = useMemo(() => {
        if (!searchTerm) return sessions
        return sessions.filter(session =>
            session.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [sessions, searchTerm])

    if (!isOpen) return null

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 flex"
            onClick={onClose}
        >
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="ml-auto h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-emerald-900/30 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-emerald-200/50 dark:border-emerald-800/50">
                    <h3 className="font-semibold text-lg">Chat History</h3>
                    <button
                        className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800 transition-colors"
                        onClick={onClose}
                        aria-label="Close history"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Controls */}
                <div className="p-4 space-y-3 border-b border-emerald-200/50 dark:border-emerald-800/50">
                    <button
                        className="w-full btn flex items-center justify-center gap-2"
                        onClick={() => { onNewChat(); onClose() }}
                    >
                        <Plus className="h-4 w-4" />
                        New Chat
                    </button>

                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-emerald-300/60 dark:border-emerald-800/60 bg-white/90 dark:bg-slate-900/80 text-sm"
                    />
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-auto p-4">
                    {filteredSessions.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-slate-400 dark:text-slate-600 mb-2">
                                <History className="h-8 w-8 mx-auto" />
                            </div>
                            <p className="text-sm text-slate-500">
                                {searchTerm ? 'No matching conversations' : 'No conversations yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredSessions.map(session => (
                                <div
                                    key={session.id}
                                    className={clsx(
                                        'p-3 rounded-lg border transition-all cursor-pointer group hover:shadow-md',
                                        session.id === currentSessionId
                                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/20'
                                            : 'border-emerald-200/50 dark:border-emerald-800/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10'
                                    )}
                                    onClick={() => { onOpenChat(session.id); onClose() }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {session.title || 'Untitled Chat'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(session.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {session.messages?.length || 0} messages
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDeleteChat(session.id)
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-all"
                                            aria-label="Delete chat"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

// Enhanced main chat interface
export default function ChatInterface() {
    const {
        messages,
        isStreaming,
        streamingText,
        error,
        sendMessage,
        sendMessageWithImage,
        regenerateLastResponse,
        editLastUserMessage,
        abortCurrentRequest,
        clearCurrentChat,
        createNewChat,
        openExistingChat,
        deleteExistingChat,
        listSessions,
        currentSessionId,
        modelKey,
        setModelKey,
        availableModels,
        preferences,
        updatePreferences,
        apiStatus,
        canSendMessage,
        rateLimitInfo
    } = useClientChat()

    // UI State
    const [input, setInput] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [sessionList, setSessionList] = useState([])
    const [speakingId, setSpeakingId] = useState(null)
    const [isListening, setIsListening] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [showSettings, setShowSettings] = useState(false)

    // Refs
    const inputRef = useRef(null)
    const messagesEndRef = useRef(null)
    const speechRecognitionRef = useRef(null)
    const fileInputRef = useRef(null)

    // Animation preferences
    const reduced = useAnimationStore(s => s.reduced)

    // Speech capabilities
    const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
    const sttSupported = typeof window !== 'undefined' &&
        (window.SpeechRecognition || window.webkitSpeechRecognition)

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, streamingText, scrollToBottom])

    // Load sessions
    const refreshSessions = useCallback(() => {
        const sessions = listSessions()
        setSessionList(sessions)
    }, [listSessions])

    useEffect(() => {
        refreshSessions()
    }, [refreshSessions])

    // Handle form submission
    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault()

        if (!canSendMessage || isSubmitting) return

        const trimmedInput = input.trim()
        if (!trimmedInput && !imageFile) return

        setIsSubmitting(true)

        try {
            if (editingId) {
                await editLastUserMessage(trimmedInput)
                setEditingId(null)
            } else if (imageFile) {
                const base64Data = await fileToBase64(imageFile)
                await sendMessageWithImage(trimmedInput, {
                    data: base64Data,
                    mimeType: imageFile.type
                })
                setImageFile(null)
                setImagePreview(null)
            } else {
                await sendMessage(trimmedInput)
            }

            setInput('')
        } catch (error) {
            console.error('Submit error:', error)
        } finally {
            setIsSubmitting(false)
            inputRef.current?.focus()
        }
    }, [
        canSendMessage, isSubmitting, input, imageFile, editingId,
        editLastUserMessage, sendMessageWithImage, sendMessage
    ])

    // Handle regenerate
    const handleRegenerate = useCallback(async () => {
        if (!canSendMessage || isSubmitting) return

        setIsSubmitting(true)
        try {
            await regenerateLastResponse()
        } catch (error) {
            console.error('Regenerate error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }, [canSendMessage, isSubmitting, regenerateLastResponse])

    // Animation handlers
    const handleInputFocus = useCallback((e) => {
        if (reduced) return
        gsap.to(e.currentTarget, {
            boxShadow: '0 0 0 3px rgba(16,185,129,0.25)',
            duration: 0.25,
            ease: 'power2.out'
        })
    }, [reduced])

    const handleInputBlur = useCallback((e) => {
        if (reduced) return
        gsap.to(e.currentTarget, {
            boxShadow: '0 0 0 0 rgba(0,0,0,0)',
            duration: 0.2,
            ease: 'power2.out'
        })
    }, [reduced])

    const handleButtonHover = useCallback((e) => {
        if (reduced) return
        gsap.to(e.currentTarget, {
            y: -2,
            duration: 0.14,
            ease: 'power2.out',
            onComplete: () => gsap.to(e.currentTarget, {
                y: 0,
                duration: 0.2,
                ease: 'power2.out'
            })
        })
    }, [reduced])

    const handleSendPress = useCallback((e) => {
        if (reduced) return
        gsap.fromTo(e.currentTarget,
            { scale: 0.98 },
            { scale: 1, duration: 0.22, ease: 'back.out(2)' }
        )
    }, [reduced])

    // Speech-to-text handlers
    const startListening = useCallback(() => {
        if (!sttSupported || isListening) return

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            let finalTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    finalTranscript += transcript
                }
            }

            if (finalTranscript) {
                setInput(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript)
            }
        }

        recognition.onend = () => {
            setIsListening(false)
            speechRecognitionRef.current = null
        }

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error)
            setIsListening(false)
            speechRecognitionRef.current = null
        }

        speechRecognitionRef.current = recognition
        setIsListening(true)
        recognition.start()
    }, [sttSupported, isListening])

    const stopListening = useCallback(() => {
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.stop()
        }
        setIsListening(false)
    }, [])

    // Text-to-speech handlers
    const speak = useCallback((text, messageId) => {
        if (!speechSupported || !text) return

        const synth = window.speechSynthesis

        if (speakingId === messageId) {
            synth.cancel()
            setSpeakingId(null)
            return
        }

        try {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.9
            utterance.pitch = 1.0
            utterance.volume = 0.8

            utterance.onend = () => setSpeakingId(null)
            utterance.onerror = () => setSpeakingId(null)

            synth.cancel() // Stop any current speech
            setSpeakingId(messageId)
            synth.speak(utterance)
        } catch (error) {
            console.error('Speech synthesis error:', error)
            setSpeakingId(null)
        }
    }, [speechSupported, speakingId])

    // Image handling
    const handleImageSelect = useCallback((e) => {
        const file = e.target?.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.')
            return
        }

        if (file.size > 4 * 1024 * 1024) { // 4MB limit
            alert('Image too large. Please choose an image under 4MB.')
            return
        }

        setImageFile(file)

        const reader = new FileReader()
        reader.onload = (e) => setImagePreview(e.target?.result)
        reader.readAsDataURL(file)
    }, [])

    const clearImage = useCallback(() => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [])

    // Edit handlers
    const startEdit = useCallback((messageId, content) => {
        setInput(content)
        setEditingId(messageId)
        inputRef.current?.focus()
    }, [])

    const cancelEdit = useCallback(() => {
        setEditingId(null)
        setInput('')
    }, [])

    // Find latest assistant message for regenerate option
    const lastAssistantMessage = useMemo(() => {
        const assistantMessages = messages.filter(m => m.role === 'assistant')
        return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null
    }, [messages])

    // Find last user message for edit option
    const lastUserMessage = useMemo(() => {
        const userMessages = messages.filter(m => m.role === 'user')
        return userMessages.length > 0 ? userMessages[userMessages.length - 1] : null
    }, [messages])

    // Convert file to base64
    const fileToBase64 = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result
                const base64 = result.split(',')[1]
                resolve(base64)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }, [])

    // Header component
    const Header = useMemo(() => (
        <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 bg-white/95 dark:bg-slate-900/95 border-b border-emerald-100 dark:border-emerald-900/30 shadow-sm flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <motion.div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span aria-hidden className="text-base sm:text-lg">🌱</span>
                    </motion.div>
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                            AversoAI
                        </h1>
                        <div className="flex items-center gap-2">
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                                <span className="hidden sm:inline">Environmental Education Assistant</span>
                                <span className="sm:hidden">Eco Assistant</span>
                            </p>
                            {apiStatus === 'ready' ? (
                                <Wifi className="h-3 w-3 text-green-500 flex-shrink-0" />
                            ) : (
                                <WifiOff className="h-3 w-3 text-red-500 flex-shrink-0" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Rate limit indicator - hide on mobile */}
                    {rateLimitInfo.remaining <= 2 && (
                        <div className="hidden sm:flex text-xs text-amber-600 dark:text-amber-400 items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="hidden md:inline">{rateLimitInfo.remaining} requests left</span>
                        </div>
                    )}

                    {/* Model selector - simplified on mobile */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <label className="hidden md:inline text-sm text-slate-700 dark:text-slate-300">
                            Model:
                        </label>
                        <select
                            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-emerald-400/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            value={modelKey}
                            onChange={(e) => setModelKey(e.target.value)}
                            disabled={isStreaming}
                        >
                            {Object.entries(availableModels).map(([key, name]) => (
                                <option key={key} value={key}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action buttons */}
                    <button
                        onClick={() => { refreshSessions(); setShowHistory(true) }}
                        className="btn-secondary flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2"
                        onMouseEnter={handleButtonHover}
                    >
                        <History className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">History</span>
                    </button>

                    <button
                        onClick={createNewChat}
                        className="btn-secondary flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2"
                        onMouseEnter={handleButtonHover}
                    >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">New</span>
                    </button>
                </div>
            </div>
        </div>
    ), [
        apiStatus, rateLimitInfo, modelKey, availableModels, setModelKey,
        isStreaming, refreshSessions, createNewChat, handleButtonHover
    ])

    return (
        <section className="eco-chat-container bg-slate-50/50 dark:bg-slate-950/50">
            {Header}

            {/* Session History Sidebar */}
            <AnimatePresence>
                {showHistory && (
                    <SessionSidebar
                        isOpen={showHistory}
                        onClose={() => setShowHistory(false)}
                        sessions={sessionList}
                        currentSessionId={currentSessionId}
                        onNewChat={createNewChat}
                        onOpenChat={openExistingChat}
                        onDeleteChat={(id) => {
                            deleteExistingChat(id)
                            refreshSessions()
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col w-full min-h-0">
                <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 min-h-0">
                    <div className="eco-chat-scroll py-4 min-h-0">
                        <div className="space-y-4">
                        {/* Welcome message */}
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 mx-auto max-w-4xl"
                            >
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                    <Avatar role="assistant" size="lg" className="flex-shrink-0" />
                                    <div className="text-center sm:text-left flex-1">
                                        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                            Welcome to AversoAI! 🌍
                                        </h2>
                                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                                            I'm your friendly environmental education assistant! I can help you learn about
                                            climate change, sustainability, renewable energy, conservation, and eco-friendly practices.
                                        </p>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors" onClick={() => setInput('How can I reduce my carbon footprint at home?')}>
                                                <h3 className="font-medium text-sm mb-1">🌱 Get Started</h3>
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                                    "How can I reduce my carbon footprint at home?"
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors" onClick={() => setInput('What\'s the difference between solar and wind energy?')}>
                                                <h3 className="font-medium text-sm mb-1">♻️ Learn More</h3>
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                                    "What's the difference between solar and wind energy?"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Messages */}
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                canEdit={message.id === lastUserMessage?.id}
                                isLatestAssistant={message.id === lastAssistantMessage?.id}
                                onEdit={message.role === 'user' ?
                                    () => startEdit(message.id, message.content) : null
                                }
                                onSpeak={message.role === 'assistant' && speechSupported ?
                                    () => speak(message.content, message.id) : null
                                }
                                onRegenerate={message.id === lastAssistantMessage?.id ?
                                    handleRegenerate : null
                                }
                                speaking={speakingId === message.id}
                            />
                        ))}

                        {/* Streaming message */}
                        {isStreaming && (
                            <div className="flex items-start gap-3">
                                <Avatar role="assistant" status="thinking" />
                                <div className="eco-bubble eco-bubble-bot">
                                    {streamingText ? (
                                        <div className="prose prose-sm max-w-none dark:prose-invert">
                                            <p className="whitespace-pre-wrap leading-relaxed m-0">
                                                {streamingText}
                                            </p>
                                        </div>
                                    ) : (
                                        <TypingIndicator />
                                    )}
                                    {streamingText && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-2"
                                        >
                                            <button
                                                onClick={abortCurrentRequest}
                                                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                                            >
                                                <X className="h-3 w-3" />
                                                Stop generating
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error display */}
                        {error && (
                            <ErrorDisplay
                                error={error}
                                onRetry={() => {
                                    // Could implement retry logic here
                                }}
                                onDismiss={() => setError(null)}
                            />
                        )}

                        <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex-shrink-0 p-3 sm:p-4 border-t border-emerald-200/70 dark:border-emerald-900/40 bg-white/90 dark:bg-slate-950/90 backdrop-blur">
                    <form onSubmit={handleSubmit} className="space-y-3 max-w-4xl mx-auto">
                        {/* Image preview */}
                        <AnimatePresence>
                            {imagePreview && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                                >
                                    <img
                                        src={imagePreview}
                                        alt="Selected"
                                        className="h-16 w-16 rounded-lg object-cover border border-emerald-300/50"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {imageFile?.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {imageFile && (imageFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main input row */}
                        <div className="flex items-end gap-2 sm:gap-3">
                            {/* Left controls */}
                            <div className="flex items-center gap-1">
                                {/* Voice input */}
                                {sttSupported && (
                                    <button
                                        type="button"
                                        onClick={isListening ? stopListening : startListening}
                                        onMouseEnter={handleButtonHover}
                                        className={clsx(
                                            'p-2 sm:p-3 rounded-xl transition-all duration-200',
                                            isListening
                                                ? 'bg-red-500 text-white shadow-lg'
                                                : 'hover:bg-emerald-100/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        )}
                                        disabled={isSubmitting}
                                        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                                    >
                                        {isListening ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
                                    </button>
                                )}

                                {/* Image input */}
                                <label className="p-2 sm:p-3 rounded-xl hover:bg-emerald-100/50 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-400 transition-colors">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        disabled={isSubmitting}
                                    />
                                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </label>
                            </div>

                            {/* Text input */}
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        editingId ? 'Edit your message...' :
                                            imageFile ? 'Ask about this image...' :
                                                'Ask me anything about the environment...'
                                    }
                                    className="w-full rounded-2xl border border-emerald-300/60 dark:border-emerald-800/60 bg-white/90 dark:bg-slate-900/80 px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                                    disabled={isSubmitting || !canSendMessage}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    maxLength={2000}
                                />

                                {/* Character count */}
                                {input.length > 1500 && (
                                    <div className="absolute -top-6 right-2 text-xs text-slate-500">
                                        {input.length}/2000
                                    </div>
                                )}

                                {/* Cancel edit button */}
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Send button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !canSendMessage || (!input.trim() && !imageFile)}
                                className={clsx(
                                    'px-4 py-3 sm:px-6 sm:py-4 rounded-2xl font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 flex-shrink-0',
                                    isSubmitting || !canSendMessage || (!input.trim() && !imageFile)
                                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                        : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg hover:shadow-xl'
                                )}
                                onMouseDown={handleSendPress}
                            >
                                {isSubmitting ? (
                                    <>
                                        <motion.div
                                            className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                        <span className="hidden sm:inline">{editingId ? 'Updating...' : 'Sending...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {editingId ? <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Send className="h-4 w-4 sm:h-5 sm:w-5" />}
                                        <span className="hidden sm:inline">{editingId ? 'Update' : 'Send'}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Status indicators */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2 sm:gap-4">
                                {apiStatus !== 'ready' && (
                                    <span className="text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        <span className="hidden sm:inline">
                                            {apiStatus === 'missing_key' ? 'API key missing' : 'Connection error'}
                                        </span>
                                    </span>
                                )}

                                {isListening && (
                                    <motion.span
                                        className="text-red-500 flex items-center gap-1"
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        <Mic className="h-3 w-3" />
                                        <span className="hidden sm:inline">Listening...</span>
                                    </motion.span>
                                )}

                                {speakingId && (
                                    <span className="text-emerald-600 flex items-center gap-1">
                                        <Volume2 className="h-3 w-3" />
                                        <span className="hidden sm:inline">Speaking...</span>
                                    </span>
                                )}
                            </div>

                            <div className="text-slate-400 text-center sm:text-right">
                                <span className="hidden sm:inline">AversoAI can make mistakes. Verify important information.</span>
                                <span className="sm:hidden">Verify AI responses</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}