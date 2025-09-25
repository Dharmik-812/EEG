import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { useSubmissionsStore } from '../store/submissionsStore'
import { useAuthStore } from '../store/authStore'
import { filterQuizzes, canUserAccessContent } from '../utils/contentFilters'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import Modal from '../components/Modal.jsx'
import { useGameStore } from '../store/gameStore'
import { shootConfetti } from '../utils/confetti'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BadgeCheck, Users, Play, Lock, Plus, Search, Filter,
  Star, Gamepad2, BookOpen, Trophy, Globe, Clock,
  ChevronDown, Grid3X3, List, SortDesc, Flame
} from 'lucide-react'
import StreakFlame from '../components/StreakFlame.jsx'

function CommunityQuizModal({ challenge, onClose }) {
  const { addXP, awardBadge, markChallengeComplete, touchDailyStreak, streak } = useGameStore()
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const q = challenge.questions[idx]
  const total = challenge.questions.length

  const select = (i) => {
    if (submitted) return
    setAnswers(prev => { const copy = [...prev]; copy[idx] = i; return copy })
  }
  const next = () => { if (!submitted && idx < total - 1) setIdx(idx + 1) }
  const score = () => challenge.questions.reduce((sum, qq, i) => sum + (answers[i] === qq.answerIndex ? 1 : 0), 0)

  const submit = () => {
    const correct = score()
    const scorePct = Math.round((correct / total) * 100)
    const xpEarned = Math.round((correct / total) * (challenge.xp ?? 100))
    addXP(xpEarned, `Community Quiz: ${challenge.title}`)

    const s = touchDailyStreak()
    if (s.type === 'increment' || s.type === 'start') {
      toast.success(`Streak ${s.type === 'start' ? 1 : streak + 1}! Keep it up!`)
    }

    let earned = []
    if (xpEarned > 0) { awardBadge('starter'); earned.push('Getting Started') }
    markChallengeComplete(`community-${challenge.id || challenge.title}`, scorePct)

    shootConfetti()
    toast.success(`You scored ${scorePct}% and earned ${xpEarned} XP!`)
    if (earned.length) toast.success(`Badges unlocked: ${earned.join(', ')}`)
    setSubmitted(true)
  }

  if (submitted) {
    const correctCount = score()
    return (
      <div className="space-y-4">
        <div className="text-xl font-bold">Review</div>
        <div className="text-sm text-slate-600 dark:text-slate-300">You scored {correctCount}/{total}.</div>
        <div className="space-y-4 max-h-[60vh] overflow-auto pr-2">
          {challenge.questions.map((qq, qi) => {
            const picked = answers[qi]; const correct = qq.answerIndex
            return (
              <div key={qq.id || qi} className="p-3 rounded-xl border bg-white/50 dark:bg-slate-900/40">
                <div className="font-medium">Q{qi + 1}. {qq.question}</div>
                <ul className="mt-2 space-y-2">
                  {qq.options.map((opt, oi) => {
                    const isPicked = picked === oi
                    const isCorrect = correct === oi
                    const classes = isCorrect ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' : isPicked ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-900/20' : 'border-slate-200 dark:border-slate-800'
                    return (
                      <li key={oi} className={`px-3 py-2 rounded-lg border ${classes}`}>
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {isCorrect && <span className="text-emerald-600 text-xs">Correct</span>}
                          {!isCorrect && isPicked && <span className="text-rose-600 text-xs">Your choice</span>}
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-2 text-xs text-slate-500">Right answer: {qq.options[correct]}</div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn-outline" onClick={() => { setIdx(0); setAnswers([]); setSubmitted(false) }}>Retry</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">Question {idx + 1} of {total}</div>
          <div className="text-xs text-slate-500">Difficulty: {challenge.difficulty || 'normal'}</div>
        </div>
        <div className="mt-1 h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-2 bg-emerald-500" style={{ width: `${Math.round(((idx) / total) * 100)}%` }} />
        </div>
        <div className="mt-2 text-xl font-semibold">{q.question}</div>
      </div>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const selected = answers[idx] === i
          return (
            <button key={i} onClick={() => select(i)} className={`w-full text-left p-4 rounded-xl border transition-all ${selected ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {opt}
            </button>
          )
        })}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-slate-500">XP available: {challenge.xp ?? 100}</div>
        {idx < total - 1 ? (
          <button onClick={next} className="btn">Next</button>
        ) : (
          <button onClick={submit} className="btn inline-flex items-center gap-2">
            Submit <BadgeCheck className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Community() {
  const { approvedGames, approvedQuizzes, seedDemos } = useSubmissionsStore(s => ({ approvedGames: s.approvedGames, approvedQuizzes: s.approvedQuizzes, seedDemos: s.seedDemos }))
  const { currentUser } = useAuthStore(s => ({ currentUser: s.currentUser }))
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [showPlayableOnly, setShowPlayableOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedTopics, setSelectedTopics] = useState([]) // multi-select
  const [selectedDifficulties, setSelectedDifficulties] = useState([]) // multi-select
  const [sortBy, setSortBy] = useState('recent') // recent|xpDesc|xpAsc|difficultyAsc|difficultyDesc
  const { completedChallenges, dailyQuizStreak } = useGameStore(s => ({ completedChallenges: s.completedChallenges, dailyQuizStreak: s.dailyQuizStreak }))

  // Build daily picks from approved quizzes (playable only), or gracefully fallback
  const today = new Date().toISOString().slice(0, 10)
  const playableCommunity = approvedQuizzes
    .filter(it => it && it.quiz && Array.isArray(it.quiz.questions) && it.quiz.questions.length > 0)
    .map(it => ({ ...it.quiz, id: it.quiz.id || it.id }))

  function pickDaily(arr) {
    if (!arr || arr.length === 0) return null
    const seed = today
    let sum = 0; for (let i = 0; i < seed.length; i++) sum = (sum + seed.charCodeAt(i))
    const idx = sum % arr.length
    const q = arr[idx]
    return { ...q, id: `daily-${today}-${q.id}` }
  }

  // Try backend-provided daily list; fallback client-side
  const [dailyApiList, setDailyApiList] = useState([])
  const [dailyApiId, setDailyApiId] = useState(null)
  useEffect(() => {
    const pool = playableCommunity.map(q => ({ id: q.id, topic: q.topic || 'Other' }))
    const payload = { pool, count: 3 }
    fetch('/api/daily-quiz?count=3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(json => {
      if (Array.isArray(json?.ids)) {
        setDailyApiList(json.ids)
        if (json.ids[0]) setDailyApiId(json.ids[0])
      }
    }).catch(() => { })
  }, [approvedQuizzes.length])

  let dailyPicks = (dailyApiList.length ? dailyApiList : [playableCommunity[0]?.id, playableCommunity[1]?.id, playableCommunity[2]?.id].filter(Boolean))
    .map(id => playableCommunity.find(q => q.id === id))
    .filter(Boolean)
    .map(q => ({ ...q, id: `daily-${today}-${q.id}` }))
  if (dailyPicks.length === 0) {
    const fallbackOne = (playableCommunity && playableCommunity.length > 0) ? pickDaily(playableCommunity) : null
    if (fallbackOne) dailyPicks = [fallbackOne]
  }

  // Apply role-based filtering to quizzes
  const quizzesWithAccess = approvedQuizzes.map(q => ({
    ...q,
    canAccess: canUserAccessContent(q.quiz || {}, currentUser),
    quiz: {
      ...q.quiz,
      difficulty: q.quiz?.difficulty || 'medium',
      isPublic: q.quiz?.difficulty === 'easy' || q.quiz?.isPublic !== false
    }
  }))

  const filteredQuizzes = filterQuizzes(quizzesWithAccess.map(q => q.quiz), currentUser)

  const allTopics = Array.from(new Set(approvedQuizzes.map(q => (q.quiz?.topic || 'Other')))).sort()
  const toggleTopic = (t) => setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  const toggleDifficulty = (d) => setSelectedDifficulties(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  return (
    <section className="space-y-6">
      <SEO title="Community" description="Explore approved community games and quizzes, or submit your own eco creations." />

      {/* Welcome Section */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-purple-500/10 rounded-3xl p-8 border border-emerald-200/20 dark:border-emerald-800/20 overflow-hidden backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-white/5 dark:bg-black/5 backdrop-blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                      Community Hub
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-emerald-500" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        Global Learning Network
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed"
                >
                  Discover educational content from educators and students worldwide.
                  {currentUser.institution && (
                    <span className="block mt-1 font-medium text-emerald-600 dark:text-emerald-400">
                      🏫 {currentUser.institution.name}
                    </span>
                  )}
                </motion.p>
              </div>

              {(currentUser.role.includes('teacher') || currentUser.role === 'admin') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center lg:items-end gap-3"
                >
                  <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-200/30 dark:border-purple-800/30">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        Content Creator
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 text-center lg:text-right max-w-xs">
                    Share your educational content and inspire learners globally
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Enhanced floating decorative elements */}
          <motion.div
            className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-emerald-400/15 to-sky-400/15 rounded-full"
            animate={{ y: [-5, 5, -5], rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-8 right-12 w-6 h-6 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full"
            animate={{ y: [-3, 3, -3], x: [-1, 1, -1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-4 left-8 w-12 h-12 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full"
            animate={{ y: [5, -5, 5], rotate: [0, -5, 5, 0], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute bottom-8 left-16 w-4 h-4 bg-gradient-to-br from-cyan-400/25 to-blue-400/25 rounded-full"
            animate={{ y: [2, -2, 2], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-1/2 right-8 w-8 h-8 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full"
            animate={{ x: [-4, 4, -4], y: [-2, 2, -2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          />
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                    Community Games
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Play className="h-4 w-4 text-purple-500" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Interactive Learning Experiences
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Explore educational games created by teachers and students from around the world
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <button
                className="btn-outline px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
                onClick={seedDemos}
                data-ripple
              >
                <Plus className="h-4 w-4" />
                <span>Demo Games</span>
              </button>
              <Link
                to="/editor"
                className="btn-primary px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
                data-ripple
              >
                <Plus className="h-4 w-4" />
                <span>Create Game</span>
              </Link>
            </motion.div>
          </div>

          {approvedGames.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🎮</div>
              <h4 className="text-lg font-semibold mb-2">No games yet</h4>
              <p className="text-slate-500 mb-4">Demo games will auto-appear here, or create your own!</p>
              <button onClick={seedDemos} className="btn-primary" data-ripple>
                Load Demo Games
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedGames.map((game, index) => {
                const firstImage = game.project?.assets?.find(a => a.type === 'image')?.src
                const canAccess = canUserAccessContent(game, currentUser)

                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.6,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    whileHover={{
                      y: -8,
                      scale: 1.03,
                      rotateY: 2,
                      transition: { type: "spring", stiffness: 400, damping: 25 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`group rounded-2xl border overflow-hidden bg-gradient-to-br from-white/60 to-white/40 dark:from-slate-800/60 dark:to-slate-900/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 will-change-transform ${!canAccess ? 'opacity-75' : ''} relative`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Animated floating particles */}
                    <motion.div
                      className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full opacity-60"
                      animate={{
                        y: [-3, 3, -3],
                        x: [-1, 1, -1],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                      }}
                    />
                    <motion.div
                      className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-50"
                      animate={{
                        y: [2, -2, 2],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3 + 1
                      }}
                    />

                    <div className="relative">
                      {firstImage && (
                        <div className="aspect-video overflow-hidden rounded-t-2xl">
                          <motion.img
                            src={firstImage}
                            alt={`${game.title} thumbnail`}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}
                      {!canAccess && (
                        <motion.div
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute top-2 right-2 px-2 py-1 bg-amber-100/90 dark:bg-amber-900/40 backdrop-blur-sm text-amber-600 dark:text-amber-400 text-xs rounded-full flex items-center gap-1 border border-amber-200 dark:border-amber-800"
                        >
                          <Lock className="h-3 w-3" />
                          Restricted
                        </motion.div>
                      )}
                    </div>

                    <div className="p-4 relative">
                      {/* Interactive glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl" />

                      <motion.h4
                        className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors relative z-10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {game.title}
                      </motion.h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {game.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          👤 By {game.ownerId || 'Anonymous'}
                        </div>
                        {canAccess ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              to={`/play/${game.id}`}
                              className="btn !px-4 !py-2 text-sm flex items-center gap-1 shadow-lg hover:shadow-xl transition-shadow"
                              data-ripple
                            >
                              <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Play className="h-4 w-4" />
                              </motion.div>
                              Play
                            </Link>
                          </motion.div>
                        ) : (
                          <button
                            className="btn opacity-50 cursor-not-allowed !px-4 !py-2 text-sm flex items-center gap-1"
                            disabled
                            onClick={() => toast.error('You need higher privileges to access this game')}
                          >
                            <Lock className="h-4 w-4" /> Locked
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Daily Challenges (moved from Challenges) */}
      {dailyPicks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-emerald-200/30 dark:border-emerald-800/30 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 text-white">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-emerald-600">Daily Challenges</div>
                  <div className="text-xs text-slate-500">{today}</div>
                </div>
              </div>
              <div className="hidden sm:block"><StreakFlame streak={dailyQuizStreak} /></div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {dailyPicks.map((dq, i) => (
                <div key={i} className="p-4 rounded-2xl border bg-white/70 dark:bg-slate-900/50 backdrop-blur hover-lift transition-all">
                  <div className="font-semibold">{dq.title}</div>
                  <div className="text-xs text-slate-500">{dq.topic || 'Quiz'} • {(dq.difficulty || 'normal')}</div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div>XP: {dq.xp ?? 100}</div>
                    <button className="btn !px-3 !py-1" onClick={() => setActiveQuiz(dq)}>Start</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-3">
                <motion.div
                  className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl relative overflow-hidden"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <BookOpen className="h-6 w-6 text-white relative z-10" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                    Community Quizzes
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Trophy className="h-4 w-4 text-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Test Your Knowledge
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Challenge yourself with quizzes created by educators worldwide
              </p>
            </motion.div>

            <Link
              to="/create-quiz"
              className="btn-primary px-6 py-3 flex items-center gap-2 hover:scale-105 transition-transform"
              data-ripple
            >
              <Plus className="h-5 w-5" />
              <span>Create Quiz</span>
            </Link>
          </div>

          {/* Enhanced Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 mb-8 border border-slate-200/30 dark:border-slate-700/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-slate-500" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Filters & Search</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Search quizzes..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>

              {/* Playable Filter */}
              <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  checked={showPlayableOnly}
                  onChange={e => setShowPlayableOnly(e.target.checked)}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Playable Only</span>
              </label>

              {/* Sort */}
              <div className="relative">
                <SortDesc className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  className="w-full pl-10 pr-8 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="xpDesc">Highest XP</option>
                  <option value="xpAsc">Lowest XP</option>
                  <option value="difficultyAsc">Easy → Hard</option>
                  <option value="difficultyDesc">Hard → Easy</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedTopics([])
                  setSelectedDifficulties([])
                  setQuery('')
                  setShowPlayableOnly(false)
                  setSortBy('recent')
                }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-600 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Topic Tags */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Topics</h4>
              <div className="flex flex-wrap gap-2">
                {allTopics.map(t => (
                  <motion.button
                    key={t}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedTopics.includes(t)
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                      }`}
                    onClick={() => toggleTopic(t)}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Difficulty Tags */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Difficulty</h4>
              <div className="flex flex-wrap gap-2">
                {['easy', 'medium', 'hard'].map(d => {
                  const colors = {
                    easy: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100',
                    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
                    hard: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                  }
                  const selectedColors = {
                    easy: 'bg-green-500 text-white shadow-lg shadow-green-500/25',
                    medium: 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25',
                    hard: 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                  }

                  return (
                    <motion.button
                      key={d}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${selectedDifficulties.includes(d)
                        ? selectedColors[d]
                        : `${colors[d]} border`
                        }`}
                      onClick={() => toggleDifficulty(d)}
                    >
                      {d}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
          {/* Quiz Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {approvedQuizzes.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <div className="text-6xl mb-4">📚</div>
                  <h4 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">No quizzes yet</h4>
                  <p className="text-slate-500">Be the first to create and share a quiz with the community!</p>
                </motion.div>
              )}

              {approvedQuizzes
                .filter(q => {
                  if (showPlayableOnly && !(q?.quiz && Array.isArray(q.quiz.questions) && q.quiz.questions.length > 0)) return false
                  if (query && !(q.quiz.title.toLowerCase().includes(query.toLowerCase()) || (q.quiz.topic || '').toLowerCase().includes(query.toLowerCase()))) return false
                  if (selectedTopics.length && !selectedTopics.includes((q.quiz.topic || 'Other'))) return false
                  if (selectedDifficulties.length && !selectedDifficulties.includes((q.quiz.difficulty || '').toLowerCase())) return false
                  return true
                })
                .sort((a, b) => {
                  const da = (a.approvedAt || a.updatedAt || a.createdAt || '')
                  const db = (b.approvedAt || b.updatedAt || b.createdAt || '')
                  const xa = a.quiz?.xp ?? 100
                  const xb = b.quiz?.xp ?? 100
                  const ord = { easy: 1, medium: 2, hard: 3 }
                  const oa = ord[(a.quiz?.difficulty || 'easy').toLowerCase()] || 2
                  const ob = ord[(b.quiz?.difficulty || 'easy').toLowerCase()] || 2
                  switch (sortBy) {
                    case 'xpDesc': return xb - xa
                    case 'xpAsc': return xa - xb
                    case 'difficultyAsc': return oa - ob
                    case 'difficultyDesc': return ob - oa
                    case 'recent':
                    default: return (new Date(db) - new Date(da))
                  }
                })
                .map((q, index) => {
                  const playable = q?.quiz && Array.isArray(q.quiz.questions) && q.quiz.questions.length > 0
                  const quizObj = playable ? { id: q.quiz.id || q.id, title: q.quiz.title, xp: q.quiz.xp ?? 100, questions: q.quiz.questions, difficulty: q.quiz.difficulty, topic: q.quiz.topic } : null
                  const key = quizObj ? `community-${quizObj.id}` : null
                  const lastScore = key ? completedChallenges[key] : undefined

                  const difficultyColors = {
                    easy: 'from-green-500 to-emerald-500',
                    medium: 'from-yellow-500 to-orange-500',
                    hard: 'from-red-500 to-pink-500'
                  }

                  const difficulty = (q.quiz.difficulty || 'medium').toLowerCase()

                  return (
                    <motion.div
                      key={q.id}
                      layout
                      initial={{ opacity: 0, y: 30, scale: 0.8, rotateY: -10 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, y: -20, scale: 0.8, rotateX: 10 }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.7,
                        type: "spring",
                        stiffness: 120,
                        damping: 18
                      }}
                      whileHover={{
                        y: -10,
                        scale: 1.03,
                        rotateY: 3,
                        transition: { type: "spring", stiffness: 400, damping: 20 }
                      }}
                      whileTap={{ scale: 0.97, rotateY: 1 }}
                      className="group bg-gradient-to-br from-white/95 to-white/85 dark:from-slate-800/95 dark:to-slate-900/85 backdrop-blur-2xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-600 will-change-transform relative"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Floating decorative particles */}
                      <motion.div
                        className="absolute top-4 right-4 w-3 h-3 bg-emerald-400/60 rounded-full"
                        animate={{
                          y: [-4, 4, -4],
                          opacity: [0.6, 1, 0.6],
                          scale: [1, 1.3, 1]
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.15
                        }}
                      />
                      <motion.div
                        className="absolute bottom-4 left-4 w-2 h-2 bg-sky-400/50 rounded-full"
                        animate={{
                          x: [-2, 2, -2],
                          y: [1, -1, 1],
                          opacity: [0.5, 0.9, 0.5]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2 + 0.5
                        }}
                      />

                      {/* Gradient border animation */}
                      <div className={`h-2 bg-gradient-to-r ${difficultyColors[difficulty] || difficultyColors.medium} relative overflow-hidden`}>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.3
                          }}
                        />
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                              {q.quiz.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium">
                                {q.quiz.topic || 'General'}
                              </span>
                              <span className={`px-2 py-1 rounded-lg font-medium capitalize ${difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                difficulty === 'hard' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                }`}>
                                {difficulty}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <Trophy className="h-4 w-4" />
                              <span className="font-bold">{q.quiz.xp || 100}</span>
                              <span className="text-xs">XP</span>
                            </div>
                            {typeof lastScore === 'number' && (
                              <div className="mt-1 text-xs text-slate-500">
                                Best: {lastScore}%
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            <span>{q.quiz.questions?.length || 0} questions</span>
                          </div>

                          {playable ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="btn-primary px-4 py-2 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                              onClick={() => setActiveQuiz(quizObj)}
                            >
                              <Play className="h-4 w-4" />
                              <span>Start Quiz</span>
                            </motion.button>
                          ) : (
                            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg text-sm">
                              <Lock className="h-4 w-4 inline mr-1" />
                              Not Ready
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </AnimatePresence>
          </div>

          <Modal open={!!activeQuiz} onClose={() => setActiveQuiz(null)} title={activeQuiz?.title}>
            {activeQuiz && <CommunityQuizModal challenge={activeQuiz} onClose={() => setActiveQuiz(null)} />}
          </Modal>
        </div>
      </motion.div>
    </section>
  )
}

