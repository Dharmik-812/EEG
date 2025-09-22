import { motion } from 'framer-motion'

export default function SplashScreen() {
  const duration = 1.2
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-emerald-50 to-sky-50 dark:from-slate-950 dark:to-slate-900"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative w-[280px] sm:w-[340px] aspect-square">
        <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
          {/* ground */}
          <motion.line x1="20" y1="160" x2="180" y2="160" stroke="url(#grad)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: duration * 0.5, ease: 'easeInOut' }} />

          {/* trunk */}
          <motion.path
            d="M100 160 C100 140 100 120 100 100 C100 85 98 70 100 60"
            fill="none"
            stroke="#16a34a"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration, ease: 'easeInOut', delay: 0.2 }}
          />

          {/* left branch */}
          <motion.path
            d="M100 110 C85 100 75 92 65 84"
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: duration * 0.8, ease: 'easeInOut', delay: 0.4 }}
          />

          {/* right branch */}
          <motion.path
            d="M100 110 C115 100 125 92 135 84"
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: duration * 0.8, ease: 'easeInOut', delay: 0.45 }}
          />

          {/* leaves */}
          <motion.circle cx="65" cy="84" r="6" fill="#22c55e" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.9, type: 'spring', stiffness: 200 }} />
          <motion.circle cx="135" cy="84" r="6" fill="#22c55e" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.95, type: 'spring', stiffness: 200 }} />
          <motion.circle cx="100" cy="60" r="7" fill="#22c55e" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0, type: 'spring', stiffness: 220 }} />

          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          className="absolute -bottom-2 inset-x-0 text-center text-sm font-semibold text-slate-700 dark:text-slate-200"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          AverSoltix
        </motion.div>
      </div>
    </motion.div>
  )
}