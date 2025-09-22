import data from '../data/leaderboard.json'
import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore.js'
import Card from '../components/Card.jsx'
import LeaderboardItem from '../components/LeaderboardItem.jsx'
import { motion } from 'framer-motion'
import SEO from '../components/SEO.jsx'

export default function Leaderboard() {
  const { user, xp } = useGameStore()
  const rows = useMemo(() => {
    const merged = data.filter(d => d.id !== user.id)
    merged.push({ id: user.id, name: user.name, xp })
    merged.sort((a, b) => b.xp - a.xp)
    return merged.map((u, i) => ({ rank: i + 1, ...u }))
  }, [user, xp])

  const yourRank = rows.find(r => r.id === user.id)?.rank

  return (
    <>
      <SEO title="Leaderboard" description="See how you rank globally on the AverSoltix leaderboard." />
    <section className="space-y-6">
      <Card>
        <div className="font-semibold mb-4">Global Leaderboard</div>
        <div className="space-y-2">
          {rows.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <LeaderboardItem rank={r.rank} name={r.name} xp={r.xp} isYou={r.id === user.id} />
            </motion.div>
          ))}
        </div>
        <div className="mt-4 text-sm text-slate-500">Your current rank: #{yourRank}</div>
      </Card>
    </section>
    </>
  )
}

