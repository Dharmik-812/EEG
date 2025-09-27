import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import {
    History, RefreshCw, Edit3, Image as ImageIcon, Mic, MicOff,
    Volume2, VolumeX, X, PlayCircle, PauseCircle, Loader2
} from 'lucide-react';
import gsap from 'gsap';
import { useAnimationStore } from '../store/animationStore';
import useGeminiChat from '../hooks/useGeminiChat';
import '../styles/chatbot.css';

// Constants
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const SCROLL_BEHAVIOR = { top: 'smooth', behavior: 'smooth' } as const;

// Utility function for base64 conversion
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Sub-components
const Avatar = React.memo(({ role }: { role: 'user' | 'assistant' }) => (
    <div className={clsx(
        'mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm',
        role === 'assistant'
            ? 'bg-emerald-500 text-white'
            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    )}>
        <span aria-hidden>{role === 'assistant' ? '🌿' : '🙂'}</span>
    </div>
));

Avatar.displayName = 'Avatar';

const TypingIndicator = React.memo(() => (
    <div className="eco-typing" aria-live="polite" aria-label="AversoAI is typing">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
    </div>
));

TypingIndicator.displayName = 'TypingIndicator';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    image?: { data: string; mimeType: string };
    onEdit?: () => void;
    onSpeak?: () => void;
    speaking?: boolean;
}

const MessageBubble = React.memo(({
    role,
    content,
    image,
    onEdit,
    onSpeak,
    speaking
}: MessageBubbleProps) => {
    const bubbleRef = useRef < HTMLDivElement > (null);
    const reduced = useAnimationStore((s) => s.reduced);

    useEffect(() => {
        if (reduced || !bubbleRef.current) return;

        const el = bubbleRef.current;
        const y = role === 'user' ? 6 : 8;

        gsap.fromTo(el,
            { opacity: 0, y, scale: 0.98 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.35,
                ease: 'power2.out'
            }
        );

        gsap.fromTo(el,
            { boxShadow: '0 6px 18px rgba(16,185,129,0.06)' },
            {
                boxShadow: '0 10px 28px rgba(16,185,129,0.15)',
                duration: 0.6,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1
            }
        );
    }, [reduced, role]);

    const handleHover = useCallback((e: React.MouseEvent) => {
        if (reduced) return;
        const el = e.currentTarget;
        gsap.to(el, {
            scale: 1.01,
            duration: 0.18,
            ease: 'power2.out',
            onComplete: () => gsap.to(el, {
                scale: 1,
                duration: 0.22,
                ease: 'power2.out'
            })
        });
    }, [reduced]);

    return (
        <div className={clsx('flex items-start gap-3', role === 'user' ? 'justify-end' : 'justify-start')}>
            {role !== 'user' && <Avatar role={role} />}
            <div
                ref={bubbleRef}
                onMouseEnter={handleHover}
                className={clsx(
                    'eco-bubble max-w-[85%]',
                    role === 'user' ? 'eco-bubble-user' : 'eco-bubble-bot'
                )}
            >
                {image && (
                    <img
                        src={`data:${image.mimeType};base64,${image.data}`}
                        alt="Attachment"
                        className="mb-2 max-h-56 rounded-lg border border-emerald-300/40 object-cover"
                        loading="lazy"
                    />
                )}
                <p className="whitespace-pre-wrap leading-relaxed text-sm">{content}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="px-2 py-1 rounded-md border border-emerald-400/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 inline-flex items-center gap-1 transition-colors"
                            data-ripple
                        >
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                        </button>
                    )}
                    {onSpeak && (
                        <button
                            onClick={onSpeak}
                            className="px-2 py-1 rounded-md border border-emerald-400/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 inline-flex items-center gap-1 transition-colors"
                            data-ripple
                        >
                            {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                            Speak
                        </button>
                    )}
                </div>
            </div>
            {role === 'user' && <Avatar role={role} />}
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';

const HistoryDrawer = React.memo(({
    isOpen,
    onClose,
    sessions,
    onNewChat,
    onOpenChat,
    onDeleteChat,
    onRefresh
}: {
    isOpen: boolean;
    onClose: () => void;
    sessions: Array<{ id: string; title: string; createdAt: number }>;
    onNewChat: () => void;
    onOpenChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
    onRefresh: () => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/30 flex animate-in fade-in">
            <div className="ml-auto h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-emerald-900/30 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Previous Chats</h3>
                    <button
                        className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800 transition-colors"
                        onClick={onClose}
                        aria-label="Close history"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <button
                        className="btn !px-3 !py-2"
                        onClick={() => { onNewChat(); onRefresh(); }}
                    >
                        New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-auto space-y-2">
                    {sessions.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No previous chats yet.</p>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                className="p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 flex items-center justify-between transition-colors"
                            >
                                <button
                                    onClick={() => { onOpenChat(session.id); onClose(); }}
                                    className="text-left flex-1"
                                >
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {session.title || 'Untitled'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {new Date(session.createdAt).toLocaleString()}
                                    </p>
                                </button>
                                <button
                                    onClick={() => { onDeleteChat(session.id); onRefresh(); }}
                                    className="text-xs text-red-500 hover:underline ml-2 shrink-0"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
});

HistoryDrawer.displayName = 'HistoryDrawer';

export default function ChatInterface() {
    const {
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
    } = useGeminiChat();

    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [editingId, setEditingId] = useState < string | null > (null);
    const [sessions, setSessions] = useState < Array < { id: string; title: string; createdAt: number } >> ([]);
    const [speakingId, setSpeakingId] = useState < string | null > (null);
    const [speechOn, setSpeechOn] = useState(false);
    const [recognizing, setRecognizing] = useState(false);
    const [imageFile, setImageFile] = useState < File | null > (null);
    const [imagePreview, setImagePreview] = useState < string | null > (null);

    const inputRef = useRef < HTMLInputElement > (null);
    const listRef = useRef < HTMLDivElement > (null);
    const recRef = useRef < SpeechRecognition | null > (null);

    const reduced = useAnimationStore((s) => s.reduced);
    const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const sttSupported = typeof window !== 'undefined' &&
        (window.SpeechRecognition || window.webkitSpeechRecognition);

    // Memoized functions
    const refreshSessions = useCallback(() => {
        setSessions(listSessions());
    }, [listSessions]);

    const handleSend = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = input.trim();

        if ((text.length === 0 && !imageFile) || sending) return;

        setSending(true);
        try {
            if (imageFile) {
                const base64 = await fileToBase64(imageFile);
                await sendMessageWithImage(text, { data: base64, mimeType: imageFile.type });
                setImageFile(null);
                setImagePreview(null);
            } else if (editingId) {
                await editLastUserMessage(text);
                setEditingId(null);
            } else {
                await sendMessage(text);
            }
            setInput('');
        } catch (err) {
            console.error('Send message error:', err);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }, [input, imageFile, sending, editingId, sendMessage, sendMessageWithImage, editLastUserMessage]);

    const handleRegenerate = useCallback(async () => {
        if (sending || isStreaming) return;

        setSending(true);
        try {
            await regenerateLast();
        } catch (err) {
            console.error('Regenerate error:', err);
        } finally {
            setSending(false);
        }
    }, [sending, isStreaming, regenerateLast]);

    // Animation handlers
    const onInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        if (reduced) return;
        gsap.to(e.currentTarget, {
            boxShadow: '0 0 0 3px rgba(16,185,129,0.25)',
            duration: 0.25,
            ease: 'power2.out'
        });
    }, [reduced]);

    const onInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        if (reduced) return;
        gsap.to(e.currentTarget, {
            boxShadow: '0 0 0 0 rgba(0,0,0,0)',
            duration: 0.2,
            ease: 'power2.out'
        });
    }, [reduced]);

    const onIconHover = useCallback((e: React.MouseEvent) => {
        if (reduced) return;
        const el = e.currentTarget;
        gsap.to(el, {
            y: -2,
            duration: 0.14,
            ease: 'power2.out',
            onComplete: () => gsap.to(el, {
                y: 0,
                duration: 0.2,
                ease: 'power2.out'
            })
        });
    }, [reduced]);

    const onSendPress = useCallback((e: React.MouseEvent) => {
        if (reduced) return;
        gsap.fromTo(e.currentTarget,
            { scale: 0.98 },
            { scale: 1, duration: 0.22, ease: 'back.out(2)' }
        );
    }, [reduced]);

    // Speech-to-text functionality
    const startSTT = useCallback(() => {
        if (!sttSupported || recognizing) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) final += result[0].transcript;
            }
            if (final) {
                setInput(prev => (prev ? `${prev} ${final}` : final));
            }
        };

        recognition.onend = () => {
            setRecognizing(false);
            recRef.current = null;
        };

        recognition.onerror = () => {
            setRecognizing(false);
            recRef.current = null;
        };

        setRecognizing(true);
        recRef.current = recognition;
        recognition.start();
    }, [sttSupported, recognizing]);

    const stopSTT = useCallback(() => {
        try {
            recRef.current?.stop();
        } catch (err) {
            console.error('STT stop error:', err);
        }
        setRecognizing(false);
    }, []);

    // Text-to-speech functionality
    const speak = useCallback((text: string, id: string) => {
        if (!speechSupported || !text) return;

        const synth = window.speechSynthesis;

        if (speakingId === id) {
            synth.cancel();
            setSpeakingId(null);
            setSpeechOn(false);
            return;
        }

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onend = () => {
                setSpeakingId(null);
                setSpeechOn(false);
            };

            synth.cancel();
            setSpeakingId(id);
            setSpeechOn(true);
            synth.speak(utterance);
        } catch (err) {
            console.error('Speech synthesis error:', err);
        }
    }, [speechSupported, speakingId]);

    // Image handling
    const handleImagePick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            alert('Please choose an image under 2MB.');
            return;
        }

        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreview(url);
    }, []);

    // Effects
    useEffect(() => {
        refreshSessions();
    }, [refreshSessions]);

    useEffect(() => {
        const el = listRef.current;
        if (!el) return;

        el.scrollTo(SCROLL_BEHAVIOR);
    }, [messages, streamingText]);

    // Memoized components
    const Header = useMemo(() => (
        <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 bg-white/90 dark:bg-slate-900/90 border-b border-emerald-100 dark:border-emerald-900/30">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-glow">
                        <span aria-hidden>🌱</span>
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-slate-900 dark:text-white">AversoAI</h1>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Environmental Education Assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-700 dark:text-slate-300">
                        Model:
                        <select
                            className="ml-2 px-2 py-1 rounded-md border border-emerald-400/40 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                            value={modelKey}
                            onChange={(e) => setModelKey(e.target.value)}
                            disabled={isStreaming}
                            aria-label="Select model"
                        >
                            <option value="normal">AversoAI-Impulsive</option>
                            <option value="pro">AversoAI-Thinker</option>
                        </select>
                    </label>
                    <button
                        onClick={() => { refreshSessions(); setShowHistory(true); }}
                        className="text-xs px-3 py-2 rounded-lg border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 transition-colors inline-flex items-center gap-1"
                        aria-label="Show previous chats"
                        onMouseEnter={onIconHover}
                        data-ripple
                    >
                        <History className="h-4 w-4" /> History
                    </button>
                    <button
                        onClick={clearChat}
                        className="text-xs px-3 py-2 rounded-lg border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 transition-colors"
                        aria-label="Start a new chat"
                        onMouseEnter={onIconHover}
                        data-ripple
                    >
                        New Chat
                    </button>
                </div>
            </div>
        </div>
    ), [clearChat, isStreaming, modelKey, setModelKey, refreshSessions, onIconHover]);

    const lastUserId = messages.filter(m => m.role === 'user').slice(-1)[0]?.id;
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');

    return (
        <section className="min-h-[70vh] relative">
            {Header}

            <HistoryDrawer
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                sessions={sessions}
                onNewChat={newChat}
                onOpenChat={openChat}
                onDeleteChat={deleteChat}
                onRefresh={refreshSessions}
            />

            <div className="max-w-3xl mx-auto px-4 pt-6 pb-28">
                <div
                    ref={listRef}
                    className="eco-chat-scroll space-y-4 max-h-[60vh] overflow-y-auto"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions"
                >
                    {messages.length === 0 && (
                        <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40">
                            <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Welcome to AversoAI! ♻️</h2>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                Ask me about climate change, recycling, sustainability, renewable energy, conservation, or eco-friendly habits. I'll keep it short, fun, and gamified! ✨
                            </p>
                            <ul className="mt-3 text-sm text-slate-600 dark:text-slate-400 list-disc pl-5 space-y-1">
                                <li>Try: "How can I reduce plastic at home?"</li>
                                <li>Try: "Solar vs. wind: which is greener?"</li>
                                <li>Try: "What goes in recycling?"</li>
                            </ul>
                        </div>
                    )}

                    {messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            role={message.role}
                            content={message.content}
                            image={message.image}
                            onEdit={message.id === lastUserId ? () => {
                                setInput(message.content);
                                setEditingId(message.id);
                            } : undefined}
                            onSpeak={message.role === 'assistant' && speechSupported ?
                                () => speak(message.content, message.id) : undefined}
                            speaking={speakingId === message.id}
                        />
                    ))}

                    {isStreaming && (
                        <div className="flex items-start gap-3">
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 1.2 }}
                            >
                                <Avatar role="assistant" />
                            </motion.div>
                            <div className="eco-bubble eco-bubble-bot">
                                {streamingText ? (
                                    <p className="whitespace-pre-wrap leading-relaxed text-sm">{streamingText}</p>
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

                {lastAssistant && (
                    <div className="mt-2 flex items-center gap-2">
                        <button
                            onClick={handleRegenerate}
                            disabled={sending || isStreaming}
                            className="text-xs px-3 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 inline-flex items-center gap-1 disabled:opacity-50 transition-colors"
                            onMouseEnter={onIconHover}
                            data-ripple
                        >
                            <RefreshCw className="h-4 w-4" /> Regenerate
                        </button>
                        {speechSupported && (
                            <button
                                onClick={() => speak(lastAssistant.content, lastAssistant.id)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 inline-flex items-center gap-1 transition-colors"
                                onMouseEnter={onIconHover}
                                data-ripple
                            >
                                {speakingId === lastAssistant.id ?
                                    <VolumeX className="h-4 w-4" /> :
                                    <Volume2 className="h-4 w-4" />
                                } Speak
                            </button>
                        )}
                    </div>
                )}
            </div>

            <form
                onSubmit={handleSend}
                className="fixed bottom-0 left-0 right-0 border-t border-emerald-200/70 dark:border-emerald-900/40 bg-white/90 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60"
                role="search"
                aria-label="Chat Composer"
            >
                <div className="max-w-3xl mx-auto px-4 py-3 grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                    <div className="flex items-center gap-1">
                        {sttSupported && !recognizing && (
                            <button
                                type="button"
                                onMouseEnter={onIconHover}
                                onClick={startSTT}
                                className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Start voice input"
                                data-ripple
                            >
                                <Mic className="h-5 w-5" />
                            </button>
                        )}
                        {sttSupported && recognizing && (
                            <button
                                type="button"
                                onMouseEnter={onIconHover}
                                onClick={stopSTT}
                                className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800 text-red-600 transition-colors"
                                aria-label="Stop voice input"
                                data-ripple
                            >
                                <MicOff className="h-5 w-5" />
                            </button>
                        )}
                        <label
                            className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            aria-label="Attach image"
                            onMouseEnter={onIconHover}
                            data-ripple
                        >
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImagePick}
                            />
                            <ImageIcon className="h-5 w-5" />
                        </label>
                    </div>

                    <div className="relative">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={editingId ? 'Edit your prompt…' : 'Ask an eco question…'}
                            className="w-full rounded-xl border border-emerald-300/60 dark:border-emerald-800/60 bg-white/90 dark:bg-slate-900/80 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                            disabled={sending || isStreaming}
                            aria-disabled={sending || isStreaming}
                            onFocus={onInputFocus}
                            onBlur={onInputBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => { setEditingId(null); setInput(''); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-emerald-100/50 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Cancel editing"
                                data-ripple
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Selected"
                                className="h-9 w-9 rounded-md object-cover border border-emerald-300/50"
                            />
                        )}
                        <button
                            type="submit"
                            disabled={sending || isStreaming || (input.trim().length === 0 && !imageFile)}
                            className={clsx(
                                'inline-flex items-center justify-center gap-2 rounded-xl px-4 sm:px-5 py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed',
                                sending || isStreaming
                                    ? 'bg-emerald-400'
                                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                            )}
                            aria-label={editingId ? 'Update message' : 'Send message'}
                            onMouseDown={onSendPress}
                            data-ripple
                        >
                            {sending || isStreaming ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {editingId ? 'Updating…' : 'Sending…'}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    {editingId ? <Edit3 className="h-5 w-5" /> : <span aria-hidden>🪴</span>}
                                    {editingId ? 'Update' : 'Send'}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}