import { useEffect, useMemo } from 'react'
import { useGameStore } from '../store/gameStore.js'
import Card from '../components/Card.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import StreakFlame from '../components/StreakFlame.jsx'
import BadgeComp from '../components/Badge.jsx'
import badgesData from '../data/badges.json'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import SEO from '../components/SEO.jsx'

export default function Dashboard() {
  const { xp, level, streak, badges, xpLog, touchDailyStreak } = useGameStore()
  useEffect(() => { touchDailyStreak() }, [touchDailyStreak])

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

  return (
    <>
      <SEO title="Dashboard" description="Track your XP, level progress, daily streak, and badges on your AverSoltix dashboard." />
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-sm text-slate-500">Level</div>
          <div className="text-4xl font-extrabold">{level}</div>
          <div className="mt-4">
            <ProgressBar value={xpInLevel} max={500} label={`XP ${xp}/${nextLvlXP}`} />
          </div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">Total XP</div>
          <div className="text-4xl font-extrabold">{xp.toLocaleString()}</div>
          <div className="mt-4 text-sm text-slate-500">Keep going! Earn XP by completing challenges.</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">Daily Streak</div>
          <div className="mt-2"><StreakFlame streak={streak} /></div>
        </Card>
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

