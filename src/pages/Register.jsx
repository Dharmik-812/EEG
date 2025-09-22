import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { motion } from 'framer-motion'
import { Rocket, Eye, EyeOff, Stars } from 'lucide-react'

export default function Register() {
  const { register } = useAuthStore(s => ({ register: s.register }))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  function onSubmit(e) {
    e.preventDefault()
    try {
      register(name, email, password)
      toast.success('Account created')
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
            <Stars className="text-emerald-500"/> Join AverSoltix
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Create an account to unlock challenges, badges, and the game editor.</p>
          <div className="mt-4 text-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border bg-white/60 dark:bg-slate-900/50">Earn XP and badges</div>
            <div className="p-3 rounded-lg border bg-white/60 dark:bg-slate-900/50">Compete on leaderboards</div>
            <div className="p-3 rounded-lg border bg-white/60 dark:bg-slate-900/50">Build eco-games</div>
            <div className="p-3 rounded-lg border bg-white/60 dark:bg-slate-900/50">Learn with friends</div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="order-1 lg:order-2">
        <Card>
          <h2 className="text-xl font-bold">Register</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <input className="w-full rounded border px-3 py-2 bg-white/70 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <input className="w-full rounded border px-3 py-2 bg-white/70 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative">
              <input className="w-full rounded border px-3 py-2 pr-10 bg-white/70 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Password" type={showPwd ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} />
              <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPwd(s=>!s)} className="absolute inset-y-0 right-2 my-auto p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800">
                {showPwd ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
              </button>
            </motion.div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn w-full inline-flex items-center justify-center gap-2" type="submit">
              <Rocket className="h-5 w-5"/> Create Account
            </motion.button>
          </form>
        </Card>
      </motion.div>
    </section>
  )
}

