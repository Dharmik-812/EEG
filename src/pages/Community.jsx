import { useState } from 'react'
import Card from '../components/Card'
import { useSubmissionsStore } from '../store/submissionsStore'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import Modal from '../components/Modal.jsx'
import { useGameStore } from '../store/gameStore'
import { shootConfetti } from '../utils/confetti'
import toast from 'react-hot-toast'
import { BadgeCheck } from 'lucide-react'

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

export default function Community() {
  const { approvedGames, approvedQuizzes, seedDemos } = useSubmissionsStore(s => ({ approvedGames: s.approvedGames, approvedQuizzes: s.approvedQuizzes, seedDemos: s.seedDemos }))
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [showPlayableOnly, setShowPlayableOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedTopics, setSelectedTopics] = useState([]) // multi-select
  const [selectedDifficulties, setSelectedDifficulties] = useState([]) // multi-select
  const [sortBy, setSortBy] = useState('recent') // recent|xpDesc|xpAsc|difficultyAsc|difficultyDesc
  const { completedChallenges } = useGameStore(s => ({ completedChallenges: s.completedChallenges }))

  const allTopics = Array.from(new Set(approvedQuizzes.map(q => (q.quiz?.topic || 'Other')))).sort()
  const toggleTopic = (t) => setSelectedTopics(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t])
  const toggleDifficulty = (d) => setSelectedDifficulties(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d])

  return (
    <section className="space-y-6">
      <SEO title="Community" description="Explore approved community games and quizzes, or submit your own eco creations." />
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Community Games</div>
          <div className="flex gap-2">
            <button className="btn-outline !px-3 !py-1" onClick={seedDemos}>Load Demo Games</button>
            <Link to="/editor" className="btn-outline !px-3 !py-1">Create Game</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedGames.length === 0 && <div className="text-sm text-slate-500">No games yet. Demo games will auto-appear here.</div>}
          {approvedGames.map(g => {
            const firstImage = g.project?.assets?.find(a=>a.type==='image')?.src
            return (
              <div key={g.id} className="p-4 rounded-lg border overflow-hidden">
                {firstImage && <img src={firstImage} alt="thumb" className="w-full h-32 object-cover rounded mb-2" />}
                <div className="font-medium">{g.title}</div>
                <div className="text-sm text-slate-500">{g.description}</div>
                <Link to={`/play/${g.id}`} className="btn mt-3 !px-3 !py-2">Play</Link>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Community Quizzes</div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
            <div className="flex items-center gap-2">
              <input className="rounded border bg-transparent px-2 py-1 text-sm" placeholder="Search…" value={query} onChange={e=>setQuery(e.target.value)} />
              <label className="text-xs flex items-center gap-1">
                <input type="checkbox" className="rounded" checked={showPlayableOnly} onChange={e=>setShowPlayableOnly(e.target.checked)} />
                Playable only
              </label>
              <Link to="/create-quiz" className="btn-outline !px-3 !py-1">Create Quiz</Link>
            </div>
            <div className="flex flex-wrap gap-1">
              {allTopics.map(t => (
                <button key={t} className={`px-2 py-1 rounded border text-xs ${selectedTopics.includes(t)?'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20':'border-slate-200 dark:border-slate-800'}`} onClick={()=>toggleTopic(t)}>{t}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {['easy','medium','hard'].map(d => (
                <button key={d} className={`px-2 py-1 rounded border text-xs capitalize ${selectedDifficulties.includes(d)?'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20':'border-slate-200 dark:border-slate-800'}`} onClick={()=>toggleDifficulty(d)}>{d}</button>
              ))}
            </div>
            <select className="rounded border bg-transparent px-2 py-1 text-sm" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="recent">Recent</option>
              <option value="xpDesc">XP: High to Low</option>
              <option value="xpAsc">XP: Low to High</option>
              <option value="difficultyAsc">Difficulty: Easy→Hard</option>
              <option value="difficultyDesc">Difficulty: Hard→Easy</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedQuizzes.length === 0 && <div className="text-sm text-slate-500">No quizzes yet.</div>}
          {approvedQuizzes
            .filter(q => {
              if (showPlayableOnly && !(q?.quiz && Array.isArray(q.quiz.questions) && q.quiz.questions.length > 0)) return false
              if (query && !(q.quiz.title.toLowerCase().includes(query.toLowerCase()) || (q.quiz.topic||'').toLowerCase().includes(query.toLowerCase()))) return false
              if (selectedTopics.length && !selectedTopics.includes((q.quiz.topic||'Other'))) return false
              if (selectedDifficulties.length && !selectedDifficulties.includes((q.quiz.difficulty||'').toLowerCase())) return false
              return true
            })
            .sort((a,b) => {
              const da = (a.approvedAt || a.updatedAt || a.createdAt || '')
              const db = (b.approvedAt || b.updatedAt || b.createdAt || '')
              const xa = a.quiz?.xp ?? 100
              const xb = b.quiz?.xp ?? 100
              const ord = { easy: 1, medium: 2, hard: 3 }
              const oa = ord[(a.quiz?.difficulty||'easy').toLowerCase()] || 2
              const ob = ord[(b.quiz?.difficulty||'easy').toLowerCase()] || 2
              switch (sortBy) {
                case 'xpDesc': return xb - xa
                case 'xpAsc': return xa - xb
                case 'difficultyAsc': return oa - ob
                case 'difficultyDesc': return ob - oa
                case 'recent':
                default: return (new Date(db) - new Date(da))
              }
            })
            .map(q => {
              const playable = q?.quiz && Array.isArray(q.quiz.questions) && q.quiz.questions.length > 0
              const quizObj = playable ? { id: q.quiz.id || q.id, title: q.quiz.title, xp: q.quiz.xp ?? 100, questions: q.quiz.questions, difficulty: q.quiz.difficulty, topic: q.quiz.topic } : null
              const key = quizObj ? `community-${quizObj.id}` : null
              const lastScore = key ? completedChallenges[key] : undefined
              return (
                <div key={q.id} className="p-4 rounded-lg border">
                  <div className="font-medium">{q.quiz.title}</div>
                  <div className="text-sm text-slate-500">{q.quiz.topic} • {q.quiz.difficulty || 'normal'}</div>
                  {typeof lastScore === 'number' && (
                    <div className="mt-1 text-xs text-emerald-600">Last score: {lastScore}%</div>
                  )}
                  {playable ? (
                    <button className="btn mt-3 !px-3 !py-2" onClick={() => setActiveQuiz(quizObj)}>Take</button>
                  ) : (
                    <div className="mt-3 text-xs text-slate-500">Not playable: no questions provided.</div>
                  )}
                </div>
              )
            })}
        </div>
        <Modal open={!!activeQuiz} onClose={() => setActiveQuiz(null)} title={activeQuiz?.title}>
          {activeQuiz && <CommunityQuizModal challenge={activeQuiz} onClose={() => setActiveQuiz(null)} />}
        </Modal>
      </Card>
    </section>
  )
}

