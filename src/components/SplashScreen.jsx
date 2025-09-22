import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'

export default function SplashScreen() {
  const reduce = useReducedMotion()
  const dur = reduce ? 0.01 : 1.8

  // Random sparkle positions (stable per mount)
  const sparkles = useMemo(() => Array.from({ length: 6 }, () => ({
    x: 40 + Math.random() * 120,
    y: 40 + Math.random() * 60,
    r: 1.8 + Math.random() * 1.6,
    d: 0.6 + Math.random() * 0.6,
    delay: 0.2 + Math.random() * 0.8,
  })), [])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-emerald-50 to-sky-50 dark:from-slate-950 dark:to-slate-900"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(2px)' }}
      transition={{ duration: 0.45 }}
    >
      <div className="relative w-[min(92vw,740px)] aspect-square">
        <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
          {/* soft sun glow */}
          <motion.circle cx="100" cy="78" r="44" fill="url(#sun)" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 0.6 }} transition={{ duration: 0.8, delay: 0.15 }} />

          {/* ground baseline */}
          <motion.line x1="20" y1="160" x2="180" y2="160" stroke="url(#grad)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur * 0.4, ease: 'easeInOut' }} />

          {/* mound (grows up) */}
          <motion.path d="M40 160 Q100 140 160 160 L160 170 L40 170 Z" fill="url(#mound)" style={{ transformOrigin: '50% 100%' }} initial={{ scaleY: 0.2, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ duration: dur * 0.6, delay: 0.15, ease: 'easeOut' }} />

          {/* grass blades */}
          <motion.path d="M70 160 C72 150 74 145 76 140" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur * 0.5, delay: 0.3 }} />
          <motion.path d="M90 160 C92 150 95 145 97 141" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur * 0.5, delay: 0.36 }} />
          <motion.path d="M110 160 C108 150 105 145 103 141" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur * 0.5, delay: 0.42 }} />
          <motion.path d="M130 160 C128 150 126 145 124 140" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur * 0.5, delay: 0.48 }} />

          {/* trunk */}
          <motion.path
            d="M100 160 C100 140 100 120 100 100 C100 85 98 70 100 60"
            fill="none"
            stroke="#16a34a"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: dur, ease: 'easeInOut', delay: 0.25 }}
          />

          {/* branches */}
          <motion.path d="M100 110 C85 100 75 92 65 84" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur * 0.8, ease: 'easeInOut', delay: 0.5 }} />
          <motion.path d="M100 110 C115 100 125 92 135 84" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur * 0.8, ease: 'easeInOut', delay: 0.55 }} />

          {/* leaf clusters with subtle sway */}
          <motion.g initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1, rotate: [0, 2, 0] }} transition={{ delay: 0.9, duration: 1.2, repeat: reduce ? 0 : Infinity, repeatType: 'mirror' }}>
            <motion.ellipse cx="65" cy="84" rx="7" ry="5" fill="#22c55e" />
            <motion.ellipse cx="135" cy="84" rx="7" ry="5" fill="#22c55e" />
            <motion.ellipse cx="100" cy="60" rx="8" ry="6" fill="#22c55e" />
            <motion.ellipse cx="86" cy="74" rx="5" ry="4" fill="#34d399" />
            <motion.ellipse cx="114" cy="74" rx="5" ry="4" fill="#34d399" />
          </motion.g>

          {/* sparkles */}
          {sparkles.map((s, i) => (
            <motion.circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#a7f3d0" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }} transition={{ duration: s.d, delay: s.delay, repeat: reduce ? 0 : Infinity, repeatType: 'mirror' }} />
          ))}

          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>
            <radialGradient id="sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mound" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          className="absolute -bottom-2 inset-x-0 text-center text-base sm:text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          AverSoltix
        </motion.div>

        {/* loading bar */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[75%] max-w-[520px] h-1.5 rounded-full bg-emerald-200/40 dark:bg-emerald-900/40 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500"
            style={{ width: '35%' }}
            initial={{ x: '-110%' }}
            animate={{ x: ['-110%', '-10%', '110%'] }}
            transition={{ duration: reduce ? 0.01 : 1.8, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
