import badgesData from '../data/badges.json'
import { useGameStore } from '../store/gameStore.js'
import Card from '../components/Card.jsx'
import BadgeComp from '../components/Badge.jsx'
import { motion } from 'framer-motion'

export default function Badges() {
  const { badges } = useGameStore()
  return (
    <section>
      <Card>
        <div className="font-semibold mb-4">Badges & Rewards</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {badgesData.map(b => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <BadgeComp name={b.name} description={b.description} acquired={badges.includes(b.id)} />
            </motion.div>
          ))}
        </div>
      </Card>
    </section>
  )
}

