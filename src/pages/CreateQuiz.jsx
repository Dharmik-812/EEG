import { useState } from 'react'
import Card from '../components/Card'
import { useAuthStore } from '../store/authStore'
import { useSubmissionsStore } from '../store/submissionsStore'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle2, HelpCircle, Sparkles, Trash2, TreePine, Leaf, Globe, Award, PenTool, BookOpen, Target } from 'lucide-react'
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
  
  function removeQuestion(index) {
    if (questions.length > 1) {
      setQuestions(q => q.filter((_, i) => i !== index))
    }
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
      
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob"></div>
        <div className="absolute top-40 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>
      
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-3 text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          <div className="relative">
            <BookOpen className="text-emerald-500 animate-pulse"/> 
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
          Create Your Eco Quiz
        </div>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Design engaging environmental quizzes to educate and inspire others. Share your knowledge and contribute to our learning community!
        </p>
      </motion.div>
      
      {/* Quiz Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-xl font-semibold">
              <PenTool className="h-6 w-6 text-emerald-500"/>
              Quiz Settings
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-500"/>
                  Quiz Title
                </label>
                <input 
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                  placeholder="Enter quiz title" 
                  value={title} 
                  onChange={e=>setTitle(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500"/>
                  Topic
                </label>
                <select 
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                  value={topic} 
                  onChange={e=>setTopic(e.target.value)}
                >
                  <option value="Environment">Environment</option>
                  <option value="Climate Change">Climate Change</option>
                  <option value="Recycling">Recycling</option>
                  <option value="Renewable Energy">Renewable Energy</option>
                  <option value="Wildlife Conservation">Wildlife Conservation</option>
                  <option value="Water Conservation">Water Conservation</option>
                  <option value="Pollution">Pollution</option>
                  <option value="Sustainability">Sustainability</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500"/>
                  XP Reward
                </label>
                <input 
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                  placeholder="XP Points" 
                  type="number"
                  min="10"
                  max="500"
                  value={xp} 
                  onChange={e=>setXp(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <HelpCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5"/> 
              <div className="space-y-1">
                <h4 className="font-medium text-emerald-700 dark:text-emerald-400">Quiz Creation Tips</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Keep questions clear and concise</li>
                  <li>• Use positive, educational answers</li>
                  <li>• Include interesting facts to enhance learning</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Questions Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xl font-semibold">
                <HelpCircle className="h-6 w-6 text-blue-500"/>
                Questions ({questions.length})
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline !px-4 !py-2 inline-flex items-center gap-2" 
                onClick={addQuestion}
              >
                <Plus className="h-4 w-4"/> Add Question
              </motion.button>
            </div>
            
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <motion.div 
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    whileHover={{ boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.1)" }}
                    className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Question {i + 1}</span>
                      </div>
                      {questions.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeQuestion(i)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove Question"
                        >
                          <Trash2 className="h-4 w-4"/>
                        </motion.button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                          Question Text
                        </label>
                        <input 
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/90 dark:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                          placeholder={`Enter question ${i+1}...`} 
                          value={q.question} 
                          onChange={e=>updateQuestion(i,'question', e.target.value)} 
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                          Answer Options
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((o, oi) => (
                            <div key={oi} className="relative">
                              <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-colors ${
                                q.answerIndex === oi 
                                  ? 'bg-emerald-500 border-emerald-500' 
                                  : 'border-slate-300 dark:border-slate-600'
                              }`} />
                              <input 
                                className={`w-full rounded-lg border pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                  q.answerIndex === oi 
                                    ? 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                    : 'border-slate-300 dark:border-slate-600 focus:ring-emerald-500'
                                }`}
                                placeholder={`Option ${String.fromCharCode(65 + oi)}`} 
                                value={o} 
                                onChange={e=>updateOption(i, oi, e.target.value)}
                                onClick={() => updateQuestion(i, 'answerIndex', oi)}
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Click on an option to mark it as the correct answer. Currently: Option {String.fromCharCode(65 + q.answerIndex)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* Submit Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center pt-4"
      >
        <motion.button 
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.2), 0 10px 10px -5px rgba(16, 185, 129, 0.05)" 
          }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 inline-flex items-center gap-3 text-lg" 
          onClick={submit}
        >
          <CheckCircle2 className="h-6 w-6"/> 
          Submit Quiz for Review
        </motion.button>
      </motion.div>
    </div>
    </>
  )
}

