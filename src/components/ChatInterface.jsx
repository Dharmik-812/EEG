import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
    History, RefreshCw, Edit3, Image as ImageIcon, Mic, MicOff,
    Volume2, VolumeX, X, Send, Plus, Trash2, Settings, 
    AlertCircle, Wifi, WifiOff, Clock, Shield, Bot, User,
    Zap, ZapOff, Loader2, Search, Moon, Sun, Download, Upload
} from 'lucide-react'
import { loadGSAP } from '../animations/lazy'
import { useAnimationStore } from '../store/animationStore'
import useServerChat from '../hooks/useServerChat'
import { loadChatHistory, saveChatHistory, listSessions, createNewSession, switchToSession, deleteSession } from '../utils/chatHelpers'
import '../styles/chatbot.css'

/**
 * Production-ready Chat Interface with enhanced performance and UX
 */

// Constants
const ERROR_DISPLAY_TIME = 8000
const MAX_RETRIES = 3
const TYPING_MESSAGES = [
    "Analyzing environmental impact...",
    "Consulting sustainability data...",
    "Generating eco-friendly insights...",
    "Compiling green solutions..."
]

// Custom hooks for better organization
const useSpeech = () => {
    const [speakingId, setSpeakingId] = useState(null)
    const [isListening, setIsListening] = useState(false)
    
    const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
    const sttSupported = typeof window !== 'undefined' && 
        (window.SpeechRecognition || window.webkitSpeechRecognition)

    const speak = useCallback((text, messageId) => {
        if (!speechSupported || !text) return

        const synth = window.speechSynthesis

        if (speakingId === messageId) {
            synth.cancel()
            setSpeakingId(null)
            return
        }

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8

        utterance.onend = () => setSpeakingId(null)
        utterance.onerror = () => setSpeakingId(null)

        synth.cancel()
        setSpeakingId(messageId)
        synth.speak(utterance)
    }, [speechSupported, speakingId])

    return {
        speakingId,
        isListening,
        setIsListening,
        speak,
        speechSupported,
        sttSupported
    }
}

const useImageHandler = () => {
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const fileInputRef = useRef(null)

    const handleImageSelect = useCallback((e) => {
        const file = e.target?.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.')
            return
        }

        if (file.size > 4 * 1024 * 1024) {
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

    return {
        imageFile,
        imagePreview,
        fileInputRef,
        handleImageSelect,
        clearImage,
        setImageFile,
        setImagePreview
    }
}

// Optimized Typing Indicator
const TypingIndicator = React.memo(({ 
    message, 
    isRetrying = false, 
    retryCount = 0 
}) => {
    const displayMessage = isRetrying 
        ? `Retrying... (${retryCount}/${MAX_RETRIES})` 
        : message || TYPING_MESSAGES[Math.floor(Math.random() * TYPING_MESSAGES.length)]

    return (
        <div className="eco-typing" aria-live="polite" aria-label={displayMessage}>
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((index) => (
                        <motion.span
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                                isRetrying ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            animate={{ 
                                scale: [1, 1.3, 1],
                                opacity: [0.7, 1, 0.7]
                            }}
                            transition={{ 
                                duration: 1.2, 
                                repeat: Infinity, 
                                delay: index * 0.2 
                            }}
                        />
                    ))}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {displayMessage}
                </span>
            </div>
        </div>
    )
})
TypingIndicator.displayName = 'TypingIndicator'

// Enhanced Avatar Component
const Avatar = React.memo(({ 
    role, 
    status = 'online', 
    size = 'md', 
    className = '',
    isSpeaking = false 
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
        xl: 'w-12 h-12'
    }

    const statusColors = {
        online: 'bg-green-400',
        thinking: 'bg-yellow-400',
        retrying: 'bg-amber-500',
        offline: 'bg-gray-400',
        speaking: 'bg-blue-400'
    }

    return (
        <div className={clsx('relative flex-shrink-0', className)}>
            <div className={clsx(
                'rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 border-2',
                sizeClasses[size],
                role === 'assistant'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 text-white'
            )}>
                {role === 'assistant' ? (
                    <Bot className={clsx(
                        size === 'sm' ? 'h-3 w-3' :
                        size === 'md' ? 'h-4 w-4' :
                        size === 'lg' ? 'h-5 w-5' : 'h-6 w-6'
                    )} />
                ) : (
                    <User className={clsx(
                        size === 'sm' ? 'h-3 w-3' :
                        size === 'md' ? 'h-4 w-4' :
                        size === 'lg' ? 'h-5 w-5' : 'h-6 w-6'
                    )} />
                )}
            </div>

            {(role === 'assistant' || isSpeaking) && (
                <div className={clsx(
                    'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-colors',
                    statusColors[isSpeaking ? 'speaking' : status]
                )}>
                    {isSpeaking && (
                        <motion.div
                            className="w-full h-full rounded-full bg-blue-400"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    )}
                </div>
            )}
        </div>
    )
})
Avatar.displayName = 'Avatar'

// Enhanced Message Bubble with performance optimizations
const MessageBubble = React.memo(({
    message,
    onEdit,
    onSpeak,
    onRegenerate,
    speaking = false,
    canEdit = false,
    isLatestAssistant = false,
    gsap
}) => {
    const bubbleRef = useRef(null)
    const [isHovered, setIsHovered] = useState(false)
    const reduced = useAnimationStore(s => s.reduced)

    const { role, content, image, timestamp, model, editedAt } = message

    useEffect(() => {
        if (reduced || !bubbleRef.current || !gsap) return

        const el = bubbleRef.current
        gsap.fromTo(el,
            { 
                opacity: 0, 
                y: role === 'user' ? 10 : -10,
                scale: 0.95
            },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                duration: 0.5, 
                ease: 'back.out(1.2)' 
            }
        )
    }, [reduced, role, gsap])

    const formatTime = useCallback((timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        })
    }, [])

    const handleMouseEnter = useCallback(() => setIsHovered(true), [])
    const handleMouseLeave = useCallback(() => setIsHovered(false), [])

    return (
        <motion.div
            className={clsx('flex items-start gap-4 transition-all duration-300', {
                'justify-end': role === 'user',
                'justify-start': role === 'assistant'
            })}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {role === 'assistant' && (
                <Avatar
                    role={role}
                    status={speaking ? 'speaking' : 'online'}
                    isSpeaking={speaking}
                />
            )}

            <div className="flex flex-col max-w-[85%] lg:max-w-[80%] flex-1">
                <div
                    ref={bubbleRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={clsx(
                        'eco-bubble relative group transition-all duration-300 p-4 rounded-2xl',
                        role === 'user' 
                            ? 'eco-bubble-user bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 shadow-lg' 
                            : 'eco-bubble-bot bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 shadow-md'
                    )}
                >
                    {image && (
                        <div className="mb-4 rounded-xl overflow-hidden border-2 border-emerald-200/50 dark:border-emerald-800/50">
                            <img
                                src={`data:${image.mimeType};base64,${image.data}`}
                                alt="User uploaded content"
                                className="w-full h-auto max-h-80 object-cover"
                                loading="lazy"
                            />
                        </div>
                    )}

                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed">
                        <div className="whitespace-pre-wrap break-words text-slate-900 dark:text-slate-100">
                            {content}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-emerald-100/50 dark:border-emerald-800/30">
                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(timestamp)}</span>
                            </div>
                            {editedAt && (
                                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Edit3 className="h-3 w-3" />
                                    Edited
                                </span>
                            )}
                            {model && role === 'assistant' && (
                                <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                    {model}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {(isHovered || speaking) && (
                        <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                            className="flex items-center gap-2 mt-3"
                        >
                            {canEdit && onEdit && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onEdit}
                                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
                                >
                                    <Edit3 className="h-3 w-3" />
                                    Edit
                                </motion.button>
                            )}

                            {role === 'assistant' && onSpeak && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onSpeak}
                                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
                                >
                                    {speaking ? (
                                        <VolumeX className="h-3 w-3 text-red-500" />
                                    ) : (
                                        <Volume2 className="h-3 w-3 text-emerald-500" />
                                    )}
                                    {speaking ? 'Stop' : 'Speak'}
                                </motion.button>
                            )}

                            {isLatestAssistant && onRegenerate && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onRegenerate}
                                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Regenerate
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {role === 'user' && (
                <Avatar role={role} isSpeaking={speaking} />
            )}
        </motion.div>
    )
})
MessageBubble.displayName = 'MessageBubble'

// Enhanced Error Display
const ErrorDisplay = React.memo(({ error, onRetry, onDismiss }) => {
    const getErrorConfig = (error) => {
        if (error.includes('network') || error.includes('connection')) {
            return {
                icon: WifiOff,
                color: 'blue',
                title: 'Connection Issue'
            }
        }
        if (error.includes('rate limit') || error.includes('wait')) {
            return {
                icon: Clock,
                color: 'amber',
                title: 'Rate Limit'
            }
        }
        if (error.includes('safety') || error.includes('blocked')) {
            return {
                icon: Shield,
                color: 'orange',
                title: 'Content Filtered'
            }
        }
        return {
            icon: AlertCircle,
            color: 'red',
            title: 'Error'
        }
    }

    const { icon: Icon, color, title } = getErrorConfig(error)

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={clsx(
                'rounded-xl border p-4 flex items-start gap-4 shadow-lg',
                `border-${color}-300 bg-${color}-50 dark:bg-${color}-900/20 text-${color}-800 dark:text-${color}-200`
            )}
        >
            <Icon className={`h-5 w-5 text-${color}-500 flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1">{title}</p>
                <p className="text-sm opacity-90 leading-relaxed">{error}</p>
            </div>
            <div className="flex gap-1">
                {onRetry && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRetry}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
                    >
                        Retry
                    </motion.button>
                )}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDismiss}
                    className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
                >
                    <X className="h-4 w-4" />
                </motion.button>
            </div>
        </motion.div>
    )
})
ErrorDisplay.displayName = 'ErrorDisplay'

// Quick Actions Component
const QuickActions = React.memo(({ onActionClick }) => {
    const quickActions = [
        {
            icon: '🌱',
            title: 'Carbon Footprint',
            question: 'How can I reduce my carbon footprint at home?',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: '♻️',
            title: 'Recycling Guide',
            question: 'What materials can and cannot be recycled?',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: '💡',
            title: 'Energy Saving',
            question: 'What are the most effective ways to save energy?',
            color: 'from-amber-500 to-orange-500'
        },
        {
            icon: '🌞',
            title: 'Renewable Energy',
            question: 'What are the benefits of solar energy for homes?',
            color: 'from-purple-500 to-pink-500'
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
            {quickActions.map((action, index) => (
                <motion.button
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onActionClick(action.question)}
                    className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all text-left group backdrop-blur-sm"
                >
                    <div className={clsx(
                        'w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 bg-gradient-to-br',
                        action.color
                    )}>
                        {action.icon}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        {action.title}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {action.question}
                    </div>
                </motion.button>
            ))}
        </motion.div>
    )
})
QuickActions.displayName = 'QuickActions'

// Enhanced Session Sidebar
const SessionSidebar = React.memo(({
    isOpen,
    onClose,
    sessions,
    currentSessionId,
    onNewChat,
    onOpenChat,
    onDeleteChat
}) => {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredSessions = useMemo(() => {
        if (!searchTerm) return sessions
        const term = searchTerm.toLowerCase()
        return sessions.filter(session =>
            session.title?.toLowerCase().includes(term) ||
            session.messages?.some(msg => 
                msg.content?.toLowerCase().includes(term)
            )
        )
    }, [sessions, searchTerm])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    Chat History
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        </div>

                        {/* Controls */}
                        <div className="p-4 space-y-4 border-b border-slate-200 dark:border-slate-800">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { onNewChat(); onClose() }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                New Chat
                            </motion.button>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>

                        {/* Session list */}
                        <div className="flex-1 overflow-auto">
                            {filteredSessions.length === 0 ? (
                                <div className="text-center py-12">
                                    <History className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        {searchTerm ? 'No matching conversations' : 'No conversations yet'}
                                    </p>
                                    {!searchTerm && (
                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                                            Start a new chat to begin your environmental journey
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 space-y-3">
                                    {filteredSessions.map((session) => (
                                        <motion.div
                                            key={session.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={clsx(
                                                'p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group hover:shadow-lg',
                                                session.id === currentSessionId
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-slate-800'
                                            )}
                                            onClick={() => { onOpenChat(session.id); onClose() }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-900 dark:text-white truncate mb-1">
                                                        {session.title || 'New Chat'}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                                        {new Date(session.updatedAt || session.createdAt).toLocaleDateString()} • 
                                                        {session.messages?.length || 0} messages
                                                    </p>
                                                    {session.messages?.[0] && (
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                            {session.messages[0].content}
                                                        </p>
                                                    )}
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onDeleteChat(session.id)
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
})
SessionSidebar.displayName = 'SessionSidebar'

// Main Chat Interface Component
export default function ChatInterface() {
    // Chat hook
    const {
        messages,
        isStreaming,
        streamingText,
        error,
        clearError,
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
    } = useServerChat()

    // Custom hooks
    const {
        speakingId,
        isListening,
        setIsListening,
        speak,
        speechSupported,
        sttSupported
    } = useSpeech()

    const {
        imageFile,
        imagePreview,
        fileInputRef,
        handleImageSelect,
        clearImage
    } = useImageHandler()

    // UI State
    const [input, setInput] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [sessionList, setSessionList] = useState([])
    const [isDarkMode, setIsDarkMode] = useState(false)

    // Refs and external dependencies
    const gsapRef = useRef(null)
    const [hasGSAP, setHasGSAP] = useState(false)
    const inputRef = useRef(null)
    const messagesEndRef = useRef(null)
    const speechRecognitionRef = useRef(null)

    // Animation preferences
    const reduced = useAnimationStore(s => s.reduced)

    // Load GSAP lazily
    useEffect(() => {
        let active = true
        ;(async () => {
            try {
                const g = await loadGSAP()
                if (active && g) {
                    gsapRef.current = g
                    setHasGSAP(true)
                }
            } catch (error) {
                console.warn('GSAP loading failed:', error)
            }
        })()
        return () => { active = false }
    }, [])

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
        })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, streamingText, scrollToBottom])

    // Session management
    const refreshSessions = useCallback(() => {
        const sessions = listSessions()
        setSessionList(sessions)
    }, [listSessions])

    useEffect(() => {
        refreshSessions()
    }, [refreshSessions])

    // Message handling
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
                clearImage()
            } else {
                await sendMessage(trimmedInput)
            }
            setInput('')
        } catch (error) {
            console.error('Message submission error:', error)
        } finally {
            setIsSubmitting(false)
            inputRef.current?.focus()
        }
    }, [
        canSendMessage, isSubmitting, input, imageFile, editingId,
        editLastUserMessage, sendMessageWithImage, sendMessage, clearImage
    ])

    // File to base64 utility
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

    // Quick action handler
    const handleQuickAction = useCallback((question) => {
        setInput(question)
        inputRef.current?.focus()
    }, [])

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

    return (
        <div className={clsx(
            "min-h-screen transition-colors duration-300",
            isDarkMode 
                ? "bg-slate-900 text-white" 
                : "bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/30 text-slate-900"
        )}>
            {/* Header */}
            <header className={clsx(
                "sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300",
                isDarkMode
                    ? "bg-slate-900/80 border-slate-700"
                    : "bg-white/80 border-slate-200"
            )}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and title */}
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg"
                            >
                                <Bot className="h-6 w-6 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-xl font-bold">AversoAI</h1>
                                <p className={clsx(
                                    "text-sm",
                                    isDarkMode ? "text-slate-400" : "text-slate-600"
                                )}>
                                    Environmental Education Assistant
                                </p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                            {/* Model selector */}
                            <select
                                value={modelKey}
                                onChange={(e) => setModelKey(e.target.value)}
                                disabled={isStreaming}
                                className={clsx(
                                    "px-3 py-2 rounded-lg border text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors",
                                    isDarkMode
                                        ? "bg-slate-800 border-slate-700 text-white"
                                        : "bg-white border-slate-300 text-slate-900"
                                )}
                            >
                                {Object.entries(availableModels).map(([key, name]) => (
                                    <option key={key} value={key}>
                                        {name}
                                    </option>
                                ))}
                            </select>

                            {/* Theme toggle */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors",
                                    isDarkMode
                                        ? "hover:bg-slate-700"
                                        : "hover:bg-slate-200"
                                )}
                            >
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </motion.button>

                            {/* Action buttons */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { refreshSessions(); setShowHistory(true) }}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors",
                                    isDarkMode
                                        ? "hover:bg-slate-700"
                                        : "hover:bg-slate-200"
                                )}
                            >
                                <History className="h-5 w-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={createNewChat}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors",
                                    isDarkMode
                                        ? "hover:bg-slate-700"
                                        : "hover:bg-slate-200"
                                )}
                            >
                                <Plus className="h-5 w-5" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Quick Actions */}
                {messages.length === 0 && (
                    <QuickActions onActionClick={handleQuickAction} />
                )}

                {/* Chat Messages */}
                <div className={clsx(
                    "flex-1 overflow-auto rounded-2xl border shadow-lg backdrop-blur-sm transition-colors duration-300",
                    isDarkMode
                        ? "bg-slate-800/80 border-slate-700"
                        : "bg-white/80 border-slate-200"
                )}>
                    <div className="p-6 space-y-6">
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-12"
                            >
                                <Avatar 
                                    role="assistant" 
                                    size="xl" 
                                    className="mx-auto mb-4"
                                />
                                <h2 className="text-2xl font-bold mb-3">
                                    Welcome to AversoAI! 🌍
                                </h2>
                                <p className={clsx(
                                    "max-w-md mx-auto leading-relaxed",
                                    isDarkMode ? "text-slate-400" : "text-slate-600"
                                )}>
                                    I'm your environmental education assistant. Ask me about sustainability, 
                                    climate change, renewable energy, or any eco-friendly topics!
                                </p>
                            </motion.div>
                        )}

                        {/* Messages list */}
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
                                gsap={hasGSAP ? gsapRef.current : null}
                            />
                        ))}

                        {/* Streaming indicator */}
                        {isStreaming && (
                            <div className="flex items-start gap-4">
                                <Avatar 
                                    role="assistant" 
                                    status="thinking"
                                />
                                <div className={clsx(
                                    "eco-bubble eco-bubble-bot p-4 rounded-2xl",
                                    isDarkMode
                                        ? "bg-emerald-900/20 border-emerald-800"
                                        : "bg-emerald-50 border-emerald-200"
                                )}>
                                    <TypingIndicator 
                                        isRetrying={streamingText?.includes('Retrying')}
                                        retryCount={streamingText?.match(/attempt\s(\d+)/i)?.[1] || 0}
                                    />
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
                        <AnimatePresence>
                            {error && (
                                <ErrorDisplay
                                    error={error}
                                    onDismiss={clearError}
                                />
                            )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="mt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Image preview */}
                        <AnimatePresence>
                            {imagePreview && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={clsx(
                                        "flex items-center gap-3 p-3 rounded-lg",
                                        isDarkMode ? "bg-slate-800" : "bg-slate-50"
                                    )}
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
                        <div className="flex items-end gap-3">
                            {/* Left controls */}
                            <div className="flex items-center gap-1">
                                {/* Voice input */}
                                {sttSupported && (
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={isListening ? stopListening : startListening}
                                        className={clsx(
                                            'p-3 rounded-xl transition-all duration-200',
                                            isListening
                                                ? 'bg-red-500 text-white shadow-lg'
                                                : isDarkMode
                                                    ? 'hover:bg-slate-700 text-slate-400'
                                                    : 'hover:bg-slate-200 text-slate-600'
                                        )}
                                        disabled={isSubmitting}
                                        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                                    >
                                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                    </motion.button>
                                )}

                                {/* Image input */}
                                <motion.label
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={clsx(
                                        "p-3 rounded-xl cursor-pointer transition-colors",
                                        isDarkMode
                                            ? "hover:bg-slate-700 text-slate-400"
                                            : "hover:bg-slate-200 text-slate-600"
                                    )}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        disabled={isSubmitting}
                                    />
                                    <ImageIcon className="h-5 w-5" />
                                </motion.label>
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
                                    className={clsx(
                                        "w-full rounded-2xl border px-4 py-3 sm:px-6 sm:py-4 text-base outline-none transition-all focus:ring-2 focus:ring-emerald-500/60",
                                        isDarkMode
                                            ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                                    )}
                                    disabled={isSubmitting || !canSendMessage}
                                    maxLength={2000}
                                    autoFocus
                                />
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Press Enter to send</p>

                                {/* Character count */}
                                {input.length > 1500 && (
                                    <div className={clsx(
                                        "absolute -top-6 right-2 text-xs",
                                        isDarkMode ? "text-slate-300" : "text-slate-600"
                                    )}>
                                        {`${input.length}/2000`}
                                    </div>
                                )}
                            </div>

                            {/* Send button */}
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting || !canSendMessage || (!input.trim() && !imageFile)}
                                className={clsx(
                                    'px-6 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 flex-shrink-0',
                                    isSubmitting || !canSendMessage || (!input.trim() && !imageFile)
                                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                        : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg hover:shadow-xl'
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <motion.div
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                        <span className="hidden sm:inline">{editingId ? 'Updating...' : 'Sending...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {editingId ? <Edit3 className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                                        <span className="hidden sm:inline">{editingId ? 'Update' : 'Send'}</span>
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Status indicators */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
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

                            <div className={clsx(
                                "text-center sm:text-right",
                                isDarkMode ? "text-slate-400" : "text-slate-500"
                            )}>
                                <span className="hidden sm:inline">AversoAI can make mistakes. Verify important information.</span>
                                <span className="sm:hidden">Verify AI responses</span>
                            </div>
                        </div>
                    </form>
                </div>
            </main>

            {/* Session Sidebar */}
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
        </div>
    )
}