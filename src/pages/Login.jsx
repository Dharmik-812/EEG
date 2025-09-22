import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react'

export default function Login() {
  const { login } = useAuthStore(s => ({ login: s.login }))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  function onSubmit(e) {
    e.preventDefault()
    try {
      login(email, password)
      toast.success('Logged in')
      navigate('/')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <section className="min-h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="order-2 lg:order-1">
        <Card>
          <div className="flex items-center gap-2 text-2xl font-extrabold">
            <Sparkles className="text-emerald-500"/> Welcome Back
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to continue learning and earning eco XP. Keep your streak alive!</p>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <li className="p-3 rounded-lg border bg-white/60 dark:bg-slate-900/50">Fast sign-in and secure session <ShieldCheck className="inline h-4 w-4 text-emerald-500"/></li>
            <li className="p-3 rounded-lg border bg-white/60 dark:bg-slate-900/50">Track progress and badges</li>
            <li className="p-3 rounded-lg border bg-white/60 dark:bg-slate-900/50">Compete on leaderboards</li>
            <li className="p-3 rounded-lg border bg-white/60 dark:bg-slate-900/50">Create and play eco-games</li>
          </ul>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="order-1 lg:order-2">
        <Card>
          <h2 className="text-xl font-bold">Login</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <input className="w-full rounded border px-3 py-2 bg-white/70 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
              <input className="w-full rounded border px-3 py-2 pr-10 bg-white/70 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Password" type={showPwd ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} />
              <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPwd(s=>!s)} className="absolute inset-y-0 right-2 my-auto p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800">
                {showPwd ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
              </button>
            </motion.div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn w-full" type="submit">Login</motion.button>
            <div className="text-sm text-slate-500">Admin: admin@aversoltix.com / admin123</div>
            <div className="text-sm text-slate-500">User: student@aversoltix.com / student123</div>
          </form>
        </Card>
      </motion.div>
    </section>
  )
}

