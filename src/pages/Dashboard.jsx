import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore.js'
import Card from '../components/Card.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import StreakFlame from '../components/StreakFlame.jsx'
import BadgeComp from '../components/Badge.jsx'
import badgesData from '../data/badges.json'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { TrendingUp, Award, Zap, Target } from 'lucide-react'

export default function Dashboard() {
  const { xp, level, streak, badges, xpLog, touchDailyStreak } = useGameStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [prevLevel, setPrevLevel] = useState(level)
  
  useEffect(() => { 
    touchDailyStreak() 
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [touchDailyStreak])
  
  // Check for level up
  useEffect(() => {
    if (level > prevLevel) {
      setShowLevelUp(true)
      setTimeout(() => setShowLevelUp(false), 3000)
    }
    setPrevLevel(level)
  }, [level, prevLevel])

  const nextLvlXP = level * 500
  const currentLevelBase = (level - 1) * 500
  const xpInLevel = xp - currentLevelBase

  const last7days = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayKey = d.toISOString().slice(0,10)
      const total = xpLog.filter(e => e.date.slice(0,10) === dayKey).reduce((sum, e) => sum + e.delta, 0)
      days.push({ day: d.toLocaleDateString(undefined, { weekday: 'short' }), xp: total })
    }
    return days
  }, [xpLog])

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading your eco-progress..." variant="recycle" />
  }

  return (
    <>
      <SEO title="Dashboard" description="Track your XP, level progress, daily streak, and badges on your AverSoltix dashboard." />
      
      {/* Level up notification */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ scale: 0, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <div className="eco-card achievement-glow text-center px-8 py-6">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="inline-block mb-2"
              >
                <Award className="h-12 w-12 text-amber-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                Level Up! 🎉
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You reached Level {level}!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4 }}
        >
          <Card className="eco-card hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-sm text-slate-500">Eco Level</div>
            </div>
            <div className={`text-4xl font-extrabold xp-counter ${showLevelUp ? 'level-up' : ''}`}>
              {level}
            </div>
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs">
                <span>Progress to Level {level + 1}</span>
                <span>{xpInLevel}/500 XP</span>
              </div>
              <div className="eco-progress h-3 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(xpInLevel / 500) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4 }}
        >
          <Card className="eco-card hover-lift nature-particles">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/20">
                <Zap className="h-6 w-6 text-sky-600" />
              </div>
              <div className="text-sm text-slate-500">Total XP</div>
            </div>
            <div className="text-4xl font-extrabold xp-counter text-gradient">
              {xp.toLocaleString()}
            </div>
            <div className="mt-4 text-sm text-slate-500">
              🌱 Keep growing! Every action helps save the planet.
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4 }}
        >
          <Card className="eco-card hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm text-slate-500">Daily Streak</div>
            </div>
            <div className="mt-2 streak-flame">
              <StreakFlame streak={streak} />
            </div>
            <div className="mt-3 text-xs text-slate-500">
              🔥 {streak > 0 ? `${streak} days strong!` : 'Start your streak today!'}
            </div>
          </Card>
        </motion.div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">XP Earned (last 7 days)</div>
        </div>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <AreaChart data={last7days}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="xp" stroke="#22c55e" fillOpacity={1} fill="url(#xpGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="font-semibold mb-4">Badges</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {badgesData.map(b => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <BadgeComp name={b.name} description={b.description} acquired={badges.includes(b.id)} />
            </motion.div>
          ))}
        </div>
      </Card>
    </section>
    </>
  )
}

