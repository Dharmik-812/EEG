import { motion, AnimatePresence } from 'framer-motion'
import { Award, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const AchievementNotification = ({ 
  isVisible, 
  onClose, 
  title = "Achievement Unlocked!", 
  description = "You've made a difference!",
  icon: Icon = Award,
  variant = "default"
}) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onClose?.()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const variants = {
    default: {
      bg: "bg-gradient-to-r from-emerald-500 to-sky-500",
      text: "text-white",
      icon: "text-white"
    },
    gold: {
      bg: "bg-gradient-to-r from-amber-400 to-orange-500",
      text: "text-white",
      icon: "text-white"
    },
    eco: {
      bg: "bg-gradient-to-r from-green-500 to-teal-500",
      text: "text-white", 
      icon: "text-white"
    }
  }

  const currentVariant = variants[variant] || variants.default

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 z-[200] max-w-sm"
          initial={{ x: 400, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 400, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <motion.div
            className={`${currentVariant.bg} ${currentVariant.text} rounded-lg p-4 shadow-xl backdrop-blur border border-white/20 relative overflow-hidden`}
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Sparkle effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${10 + Math.random() * 80}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <Sparkles className="h-3 w-3 text-white/60" />
                </motion.div>
              ))}
            </div>

            <div className="flex items-start gap-3 relative">
              <motion.div
                className={`${currentVariant.icon} p-2 rounded-full bg-white/20`}
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Icon className="h-6 w-6" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <motion.h4 
                  className="font-bold text-sm mb-1"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {title}
                </motion.h4>
                <motion.p 
                  className="text-xs opacity-90"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {description}
                </motion.p>
              </div>

              <button
                onClick={() => {
                  setShow(false)
                  onClose?.()
                }}
                className="text-white/80 hover:text-white transition-colors p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AchievementNotification