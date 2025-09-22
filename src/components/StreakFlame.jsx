import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'

export default function StreakFlame({ streak = 0 }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/30">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="text-orange-500"
      >
        <Flame className="h-5 w-5" />
      </motion.div>
      <span className="font-semibold text-orange-600">{streak} day streak</span>
    </div>
  )
}

