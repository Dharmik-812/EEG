import { useState } from 'react'
import Card from '../components/Card'
import { useAuthStore } from '../store/authStore'
import { useSubmissionsStore } from '../store/submissionsStore'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Plus, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react'
import SEO from '../components/SEO.jsx'

export default function CreateQuiz() {
  const { currentUser } = useAuthStore(s => ({ currentUser: s.currentUser }))
  const { submitQuiz } = useSubmissionsStore(s => ({ submitQuiz: s.submitQuiz }))

  const [title, setTitle] = useState('My Eco Quiz')
  const [topic, setTopic] = useState('Environment')
  const [xp, setXp] = useState(100)
  const [facts, setFacts] = useState([''])
  const [questions, setQuestions] = useState([
    { question: 'What is recycling?', options: ['Reusing waste','Burning waste','Burying waste','None'], answerIndex: 0 },
  ])

  function addQuestion() {
    setQuestions(q => [...q, { question: '', options: ['', '', '', ''], answerIndex: 0 }])
  }

  function updateQuestion(i, field, value) {
    setQuestions(q => q.map((qq, idx) => idx === i ? { ...qq, [field]: value } : qq))
  }

  function updateOption(i, oi, value) {
    setQuestions(q => q.map((qq, idx) => idx === i ? { ...qq, options: qq.options.map((o, k) => k === oi ? value : o) } : qq))
  }

  function submit() {
    if (!currentUser) { toast.error('Login required to submit'); return }
    const quiz = {
      id: `user-${Date.now()}`,
      title,
      topic,
      xp: Number(xp),
      questions: questions.map((q, idx) => ({ id: `q${idx+1}`, type: 'mcq', question: q.question, options: q.options, answerIndex: q.answerIndex })),
      facts: facts.filter(Boolean),
    }
    submitQuiz({ quiz, ownerId: currentUser.id })
    toast.success('Quiz submitted for review!')
  }

  return (
    <>
      <SEO title="Create Quiz" description="Create your own environmental quizzes with multiple-choice questions and submit them for review." />
    <section className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center justify-between">
            <div className="font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-500"/> Create a Colorful Eco Quiz</div>
            <div className="text-xs text-slate-500">Make it engaging and informative</div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="rounded-lg border px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <input className="rounded-lg border px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Topic (e.g., Recycling)" value={topic} onChange={e=>setTopic(e.target.value)} />
            <input className="rounded-lg border px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="XP" type="number" value={xp} onChange={e=>setXp(e.target.value)} />
          </div>
          <div className="mt-4 text-sm text-slate-500 flex items-center gap-2"><HelpCircle className="h-4 w-4"/> Tip: Keep questions short and clear. Use positive, actionable answers.</div>
        </Card>
      </motion.div>

      <Card>
        <div className="font-semibold mb-3">Questions</div>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-3 rounded-xl border bg-gradient-to-br from-emerald-50/60 to-sky-50/60 dark:from-slate-800/60 dark:to-slate-900/60">
              <input className="w-full rounded-lg border px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder={`Question ${i+1}`} value={q.question} onChange={e=>updateQuestion(i,'question', e.target.value)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {q.options.map((o, oi) => (
                  <input key={oi} className="rounded-lg border px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder={`Option ${oi+1}`} value={o} onChange={e=>updateOption(i, oi, e.target.value)} />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-slate-500">Correct option index (0-3)</span>
                <input className="rounded-lg border px-3 py-2 w-24 bg-white/70 dark:bg-slate-900/50" type="number" min={0} max={3} value={q.answerIndex} onChange={e=>updateQuestion(i,'answerIndex', Number(e.target.value))} />
              </div>
            </motion.div>
          ))}
        </div>
        <button className="btn mt-3 inline-flex items-center gap-2" onClick={addQuestion}><Plus className="h-5 w-5"/> Add Question</button>
      </Card>

      <button className="btn inline-flex items-center gap-2" onClick={submit}><CheckCircle2 className="h-5 w-5"/> Submit for Review</button>
    </section>
    </>
  )
}

