import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { Globe, Sprout, Sparkles } from 'lucide-react'

const SimpleLoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const animationRef = useRef(null)
  const isVisibleRef = useRef(true)

  // Handle visibility change to restart animations
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
      if (!document.hidden && animationRef.current) {
        // Restart animations when tab becomes visible
        setProgress(prev => Math.min(prev, 95))
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isVisibleRef.current) return // Pause when tab is hidden

      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => onComplete?.(), 500)
          return 100
        }
        return prev + (100 / 30) // Complete in 3 seconds
      })
    }, 100)

    animationRef.current = timer
    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center">
        {/* Logo */}
        <motion.div
          className="mb-8 flex justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Globe className="h-16 w-16 text-emerald-400" />
        </motion.div>

        {/* Brand name */}
        <motion.h1
          className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          AverSoltix
        </motion.h1>

        <motion.p
          className="text-emerald-200 mb-8 text-lg flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Sprout className="h-5 w-5" />
          <span>Learn • Play • Save the Planet</span>
        </motion.p>

        {/* Progress bar */}
        <div className="w-80 max-w-sm mx-auto">
          <div className="bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-emerald-400 to-sky-400 h-full rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-emerald-300 text-sm flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Loading {Math.round(progress)}%</span>
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-1 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-emerald-400 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default SimpleLoadingScreen
