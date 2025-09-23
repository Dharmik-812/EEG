import { useState, useEffect } from 'react'
import baseData from '../data/challenges.json'
import Card from '../components/Card.jsx'
import Modal from '../components/Modal.jsx'
import { useGameStore } from '../store/gameStore.js'
import { useSubmissionsStore } from '../store/submissionsStore.js'
import { shootConfetti } from '../utils/confetti.js'
import toast from 'react-hot-toast'
import { BadgeCheck, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO.jsx'
import { useSearchParams } from 'react-router-dom'
import StreakFlame from '../components/StreakFlame.jsx'

function Quiz({ challenge, onClose }) {
  const { addXP, awardBadge, markChallengeComplete, touchDailyStreak, streak, touchDailyQuizStreak } = useGameStore()
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const q = challenge.questions[idx]
  const total = challenge.questions.length

  const select = (i) => {
    if (submitted) return
    setAnswers(prev => {
      const copy = [...prev]
      copy[idx] = i
      return copy
    })
  }

  const next = () => {
    if (submitted) return
    if (idx < total - 1) setIdx(idx + 1)
  }

  const score = () => challenge.questions.reduce((sum, qq, i) => sum + (answers[i] === qq.answerIndex ? 1 : 0), 0)

  const submit = () => {
    const correct = score()
    const scorePct = Math.round((correct / total) * 100)
    const xpEarned = Math.round((correct / total) * (challenge.xp ?? 100))
    addXP(xpEarned, `Challenge: ${challenge.title}`)

    const s = touchDailyStreak()
    if (s.type === 'increment' || s.type === 'start') {
      toast.success(`Streak ${s.type === 'start' ? 1 : streak + 1}! Keep it up!`)
    }

    let earned = []
    if (xpEarned > 0) {
      awardBadge('starter')
      earned.push('Getting Started')
    }
    if (challenge.id === 'recycling-basics' && scorePct >= 80) {
      awardBadge('recycler'); earned.push('Recycler')
    }
    if (challenge.id === 'renewable-energy' && scorePct >= 80) {
      awardBadge('renewable'); earned.push('Renewable Rookie')
    }
    if (streak + 1 >= 3) awardBadge('streak3')
    if (streak + 1 >= 7) awardBadge('streak7')

    markChallengeComplete(challenge.id, scorePct)

    // If this is the Daily Quiz, update its separate streak
    if (String(challenge.id || '').startsWith('daily-')) {
      const dq = touchDailyQuizStreak()
      if (dq.type === 'increment' || dq.type === 'start') {
        toast.success(`Daily Quiz Streak ${dq.streak}!`)
      }
    }

    shootConfetti()
    toast.success(`You scored ${scorePct}% and earned ${xpEarned} XP!`)
    if (earned.length) {
      toast.success(`Badges unlocked: ${earned.join(', ')}`)
    }
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
            const picked = answers[qi]
            const correct = qq.answerIndex
            return (
              <div key={qq.id} className="p-3 rounded-xl border bg-white/50 dark:bg-slate-900/40">
                <div className="font-medium">Q{qi+1}. {qq.question}</div>
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
          <div className="h-2 bg-emerald-500" style={{ width: `${Math.round(((idx)/total)*100)}%` }} />
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

export default function Challenges() {
  const { completedChallenges, dailyQuizStreak } = useGameStore()
  const { approvedQuizzes } = useSubmissionsStore(s => ({ approvedQuizzes: s.approvedQuizzes }))
  const [active, setActive] = useState(null)

  // Normalize community quizzes and filter to playable ones (must include questions)
  const playableCommunity = approvedQuizzes
    .filter(it => it && it.quiz && Array.isArray(it.quiz.questions) && it.quiz.questions.length > 0)
    .map(it => ({ ...it.quiz, id: it.quiz.id || it.id }))
  const data = [...baseData, ...playableCommunity]

  // Daily quiz selection (deterministic by date)
  const [searchParams] = useSearchParams()
  const today = new Date().toISOString().slice(0,10)
  function pickDaily(arr) {
    if (!arr || arr.length === 0) return null
    const seed = today
    let sum = 0; for (let i = 0; i < seed.length; i++) sum = (sum + seed.charCodeAt(i))
    const idx = sum % arr.length
    const q = arr[idx]
    return { ...q, id: `daily-${today}-${q.id}` }
  }
  // Daily quiz via backend (fallback to client pick)
  const [dailyApiId, setDailyApiId] = useState(null)
  const [dailyApiList, setDailyApiList] = useState([])
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
    }).catch(()=>{})
  }, [approvedQuizzes.length])
  let dailyPicks = (dailyApiList.length ? dailyApiList : [playableCommunity[0]?.id, playableCommunity[1]?.id, playableCommunity[2]?.id].filter(Boolean))
    .map(id => playableCommunity.find(q => q.id === id))
    .filter(Boolean)
    .map(q => ({ ...q, id: `daily-${today}-${q.id}` }))

  // Ensure at least one daily pick always shows
  if (dailyPicks.length === 0) {
    const fallbackOne = (playableCommunity && playableCommunity.length > 0) ? pickDaily(playableCommunity) : pickDaily(baseData)
    if (fallbackOne) dailyPicks = [fallbackOne]
  }

  const daily = dailyPicks[0] || null

  // Open specific community quiz if linked via ?quiz=
  useEffect(() => {
    const qid = searchParams.get('quiz')
    if (!qid) return
    const found = playableCommunity.find(it => (it.id === qid))
    if (found) setActive(found)
  }, [searchParams, playableCommunity])

  return (
    <>
      <SEO title="Challenges" description="Answer environmental quizzes and complete eco-quests to earn XP and unlock badges." />
    <section className="space-y-6">
      {dailyPicks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-emerald-600">Daily Picks</div>
                <div className="text-xs text-slate-500">{today}</div>
              </div>
              <div className="hidden sm:block"><StreakFlame streak={dailyQuizStreak} /></div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              {dailyPicks.map((dq, i) => (
                <div key={i} className="p-3 rounded-xl border bg-white/60 dark:bg-slate-900/50 backdrop-blur hover-lift transition-all">
                  <div className="font-semibold">{dq.title}</div>
                  <div className="text-xs text-slate-500">{dq.topic || 'Quiz'} • {dq.difficulty || 'normal'}</div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div>XP: {dq.xp ?? 100}</div>
                    <button className="btn !px-3 !py-1" onClick={() => setActive(dq)}>Start</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((ch, i) => (
          <motion.div key={ch.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{ch.topic}</div>
                  <div className="text-lg font-bold">{ch.title}</div>
                </div>
                {completedChallenges[ch.id] != null && (
                  <div className="text-sm text-emerald-600 dark:text-emerald-400">Score: {completedChallenges[ch.id]}%</div>
                )}
              </div>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                {(ch.facts && ch.facts[0]) ? ch.facts[0] : 'Test your knowledge with this challenge.'}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500">Earn up to {ch.xp ?? 100} XP</div>
                <button onClick={() => setActive(ch)} className="btn">
                  <Play className="h-5 w-5" /> Start
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.title}>
        {active && <Quiz challenge={active} onClose={() => setActive(null)} />}
      </Modal>
    </section>
    </>
  )
}

