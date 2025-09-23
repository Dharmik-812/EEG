import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card'
import { motion } from 'framer-motion'
import { Rocket, Eye, EyeOff, Stars, TreePine, Leaf, Globe, Award, Gamepad2, Users } from 'lucide-react'
import SEO from '../components/SEO.jsx'

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
    <>
      <SEO title="Register" description="Create an AverSoltix account to unlock challenges, badges, leaderboards, and the 2D game editor." />
      
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
    <section className="min-h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative">
      <motion.div 
        initial={{ opacity: 0, x: -30 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }} 
        className="order-2 lg:order-1"
      >
        <Card>
          <div className="flex items-center gap-3 text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            <div className="relative">
              <Stars className="text-emerald-500 animate-pulse"/> 
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            Join the AverSoltix Community
          </div>
          <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">
            Start your journey towards environmental literacy. Create games, earn badges, and make a positive impact on our planet!
          </p>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Rocket className="h-5 w-5"/>
              Unlock your potential:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
              >
                <Award className="h-5 w-5 text-emerald-500 flex-shrink-0"/>
                <span>Earn XP & Badges</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20"
              >
                <Users className="h-5 w-5 text-blue-500 flex-shrink-0"/>
                <span>Join Leaderboards</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
              >
                <Gamepad2 className="h-5 w-5 text-purple-500 flex-shrink-0"/>
                <span>Build Eco-Games</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
              >
                <Globe className="h-5 w-5 text-green-500 flex-shrink-0"/>
                <span>Learn with Friends</span>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 30 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }} 
        className="order-1 lg:order-2"
      >
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Start Your Journey</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Create your AverSoltix account</p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input 
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                placeholder="Enter your full name" 
                type="text"
                value={name} 
                onChange={e=>setName(e.target.value)} 
                required
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <input 
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                placeholder="Enter your email" 
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                required
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }} 
              className="space-y-2 relative"
            >
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input 
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 pr-12 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                  placeholder="Create a secure password" 
                  type={showPwd ? 'text' : 'password'} 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)}
                  required
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button" 
                  aria-label="Toggle password visibility" 
                  onClick={() => setShowPwd(s=>!s)} 
                  className="absolute inset-y-0 right-3 flex items-center p-1 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                >
                  {showPwd ? <EyeOff className="h-5 w-5 text-slate-500"/> : <Eye className="h-5 w-5 text-slate-500"/>}
                </motion.button>
              </div>
            </motion.div>
            
            <motion.button 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.25)" }} 
              whileTap={{ scale: 0.98 }} 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2" 
              type="submit"
            >
              <Rocket className="h-5 w-5"/> 
              Create My Account
            </motion.button>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5 }}
              className="text-center pt-4"
            >
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account? {' '}
                <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors">
                  Sign in here
                </Link>
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.6 }}
              className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-green-900/20 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                By creating an account, you agree to join our mission of environmental education and sustainability. 
                Let's build a greener future together! 🌱
              </p>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </section>
    </>
  )
}

