import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { Sprout, Globe, Zap, Leaf, TreePine, Sparkles } from 'lucide-react'

const LOADING_MESSAGES = [
  'Planting seeds of knowledge...',
  'Building your eco-adventure...',
  'Preparing amazing experiences...',
  'Almost ready to save the planet!'
]

const FloatingIcon = ({ Icon, delay, duration, x, y, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <motion.div
      className={`absolute ${sizeClasses[size]} text-emerald-400/60`}
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        rotate: [0, 360],
        scale: [1, 1.2, 1],
        opacity: [0.4, 0.8, 0.4]
      }}
      transition={{
        duration: duration || 4,
        repeat: Infinity,
        delay: delay || 0,
        ease: "easeInOut"
      }}
    >
      <Icon className="w-full h-full" />
    </motion.div>
  )
}

const AnimatedLoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const animationRef = useRef(null)
  const isVisibleRef = useRef(true)

  // Handle visibility change to restart animations
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
      if (!document.hidden && animationRef.current) {
        // Restart animations when tab becomes visible
        setProgress(prev => Math.min(prev, 95)) // Don't reset completely, just ensure it continues
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Progress animation
  useEffect(() => {
    if (isComplete) return

    const interval = setInterval(() => {
      if (!isVisibleRef.current) return // Pause when tab is hidden

      setProgress(prev => {
        if (prev >= 100) {
          setIsComplete(true)
          return 100
        }
        return prev + 1.5 // Smooth progress
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isComplete])

  // Message rotation
  useEffect(() => {
    if (isComplete) return

    const interval = setInterval(() => {
      if (!isVisibleRef.current) return

      setCurrentMessage(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [isComplete])

  // Completion handler
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isComplete, onComplete])

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0b1220 0%, #0f172a 25%, #064e3b 50%, #0a3d38 75%, #0b1220 100%)',
            backgroundSize: '400% 400%'
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
            opacity: 1
          }}
          transition={{
            duration: 0.8,
            backgroundPosition: { duration: 20, repeat: Infinity, ease: 'linear' },
            exit: { duration: 0.6 }
          }}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-sky-500/10 animate-pulse" />

          {/* Floating environmental icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingIcon Icon={Sprout} delay={0} duration={5} x={15} y={20} size="md" />
            <FloatingIcon Icon={Leaf} delay={0.5} duration={4.5} x={85} y={25} size="sm" />
            <FloatingIcon Icon={TreePine} delay={1} duration={6} x={20} y={70} size="lg" />
            <FloatingIcon Icon={Globe} delay={0.3} duration={5.5} x={80} y={75} size="md" />
            <FloatingIcon Icon={Zap} delay={0.7} duration={4} x={50} y={50} size="sm" />
            <FloatingIcon Icon={Sparkles} delay={1.2} duration={5} x={70} y={15} size="sm" />
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-4">
            {/* Central logo/icon */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Rotating rings */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-32 h-32 rounded-full border-2 border-emerald-400/30" />
              </motion.div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-24 h-24 rounded-full border-2 border-sky-400/30" />
              </motion.div>

              {/* Center icon */}
              <motion.div
                className="relative w-20 h-20 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <TreePine className="w-full h-full text-emerald-400" />
              </motion.div>
            </motion.div>

            {/* Brand name */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-black mb-2 bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              AverSoltix
            </motion.h1>

            <motion.p
              className="text-emerald-200/90 text-sm sm:text-base mb-8 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Learn • Play • Save the Planet
            </motion.p>

            {/* Loading message */}
            <motion.div
              key={currentMessage}
              className="h-8 mb-6 flex items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-emerald-300 text-sm sm:text-base font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse" />
                {LOADING_MESSAGES[currentMessage]}
              </p>
            </motion.div>

            {/* Progress bar */}
            <div className="w-full max-w-md">
              <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm mb-2">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              {/* Progress percentage */}
              <div className="text-center">
                <motion.span
                  className="text-emerald-400 text-xs font-semibold"
                  key={Math.floor(progress)}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
            </div>

            {/* Loading dots */}
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-emerald-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30 pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedLoadingScreen
