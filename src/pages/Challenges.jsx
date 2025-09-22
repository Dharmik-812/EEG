import { useState } from 'react'
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

function Quiz({ challenge, onClose }) {
  const { addXP, awardBadge, markChallengeComplete, touchDailyStreak, streak } = useGameStore()
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const q = challenge.questions[idx]
  const total = challenge.questions.length

  const select = (i) => {
    setAnswers(prev => {
      const copy = [...prev]
      copy[idx] = i
      return copy
    })
  }

  const next = () => {
    if (idx < total - 1) setIdx(idx + 1)
  }

  const submit = () => {
    const correct = challenge.questions.reduce((sum, qq, i) => sum + (answers[i] === qq.answerIndex ? 1 : 0), 0)
    const scorePct = Math.round((correct / total) * 100)
    const xpEarned = Math.round((correct / total) * challenge.xp)
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

    shootConfetti()
    toast.success(`You scored ${scorePct}% and earned ${xpEarned} XP!`)
    if (earned.length) {
      toast.success(`Badges unlocked: ${earned.join(', ')}`)
    }
    onClose()
  }

  return (
    <div>
      <div className="mb-4">
        <div className="text-sm text-slate-500">Question {idx + 1} of {total}</div>
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
        <div className="text-sm text-slate-500">XP available: {challenge.xp}</div>
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
  const { completedChallenges } = useGameStore()
  const { approvedQuizzes } = useSubmissionsStore(s => ({ approvedQuizzes: s.approvedQuizzes }))
  const [active, setActive] = useState(null)

  // Normalize community quizzes and filter to playable ones (must include questions)
  const community = approvedQuizzes
    .map(q => q?.quiz)
    .filter(q => q && Array.isArray(q.questions) && q.questions.length > 0)
  const data = [...baseData, ...community]

  return (
    <>
      <SEO title="Challenges" description="Answer environmental quizzes and complete eco-quests to earn XP and unlock badges." />
    <section className="space-y-6">
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

