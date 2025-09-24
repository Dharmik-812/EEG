import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef, useMemo } from 'react'
import { useGSAP } from '../animations/hooks/useGSAP'
import confetti from 'canvas-confetti'

const AnimatedLoadingScreen = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const particleCanvasRef = useRef(null)

  // Generate particle positions
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#10b981' : '#0ea5e9'
    }))
    , [])

  // GSAP animations for complex effects
  useGSAP((gsap) => {
    if (!containerRef.current) return

    try {
      const tl = gsap.timeline()

      // Phase 1: Logo formation (0-1s)
      tl.fromTo('.logo-part',
        { scale: 0, rotation: 180, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)"
        }
      )

        // Phase 2: Environmental elements (1-2s)
        .fromTo('.env-element',
          { y: 100, opacity: 0, scale: 0 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "elastic.out(1, 0.3)"
          }, "-=0.4"
        )

        // Phase 3: Final explosion effect (2-3s)
        .to('.center-logo', {
          scale: 1.2,
          duration: 0.3,
          ease: "power2.inOut"
        }, "2")
        .to('.center-logo', {
          scale: 1,
          duration: 0.4,
          ease: "bounce.out"
        }, "-=0.1")

      // Trigger phase changes
      tl.call(() => setCurrentPhase(1), [], "1")
      tl.call(() => setCurrentPhase(2), [], "2")
      tl.call(() => {
        setCurrentPhase(3)
        triggerConfetti()
      }, [], "2.5")
      tl.call(() => setIsComplete(true), [], "3")

    } catch (error) {
      console.warn('GSAP animation error:', error)
      // Fallback to simple timing without GSAP
      setTimeout(() => setCurrentPhase(1), 1000)
      setTimeout(() => setCurrentPhase(2), 2000)
      setTimeout(() => {
        setCurrentPhase(3)
        triggerConfetti()
      }, 2500)
      setTimeout(() => setIsComplete(true), 3000)
    }

  }, [])

  // Canvas particle animation
  useEffect(() => {
    if (!particleCanvasRef.current) return

    const canvas = particleCanvasRef.current
    const ctx = canvas.getContext('2d')
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        const x = (particle.x + Math.sin(Date.now() * 0.001 * particle.speed) * 20) / 100 * canvas.width
        const y = (particle.y + Math.cos(Date.now() * 0.0015 * particle.speed) * 15) / 100 * canvas.height

        ctx.beginPath()
        ctx.arc(x, y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color + '66'
        ctx.fill()

        // Add glow effect
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(x, y, particle.size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [particles])

  const triggerConfetti = () => {
    try {
      // Multi-burst confetti effect
      const colors = ['#10b981', '#0ea5e9', '#22c55e', '#06b6d4', '#84cc16']

      // Center burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors
      })

      // Side bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        })
      }, 200)
    } catch (error) {
      console.warn('Confetti animation error:', error)
    }
  }

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isComplete, onComplete])

  const loadingMessages = [
    "🌱 Planting seeds of knowledge...",
    "🌍 Building your eco-adventure...",
    "✨ Preparing amazing experiences...",
    "🚀 Almost ready to save the planet!"
  ]

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden animate-gradient-x"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f766e 50%, #065f46 75%, #1f2937 100%)',
            backgroundSize: '400% 400%'
          }}
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            filter: 'blur(10px)'
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          {/* Particle canvas background */}
          <canvas
            ref={particleCanvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.6 }}
          />

          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />

          {/* Main content container */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">

            {/* Central logo area */}
            <div className="relative flex items-center justify-center mb-8 sm:mb-12">
              {/* Rotating rings */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 border-2 border-emerald-400/30 rounded-full" />
              </motion.div>

              <motion.div
                className="absolute inset-0"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 border border-sky-400/30 rounded-full" />
              </motion.div>

              {/* Center logo */}
              <motion.div className="center-logo relative z-10">
                <div className="flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-500 shadow-2xl">

                  {/* Logo parts that animate in */}
                  <div className="relative">
                    <motion.div
                      className="logo-part absolute inset-0 flex items-center justify-center"
                      style={{ fontSize: '2.5rem' }}
                    >
                      🌍
                    </motion.div>

                    <motion.div
                      className="logo-part absolute -top-2 -right-2 text-2xl"
                      animate={{
                        y: [-2, 2, -2],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      ✨
                    </motion.div>

                    <motion.div
                      className="logo-part absolute -bottom-1 -left-2 text-xl"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    >
                      🌱
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Brand name */}
            <motion.div
              className="text-center mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent tracking-wide">
                AverSoltix
              </h1>
              <motion.p
                className="text-emerald-200/80 text-sm sm:text-base mt-2 font-medium tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Learn • Play • Save the Planet
              </motion.p>
            </motion.div>

            {/* Environmental floating elements */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Floating environmental icons */}
              <motion.div
                className="env-element absolute top-[20%] left-[15%] text-2xl sm:text-3xl md:text-4xl"
                animate={{
                  y: [-10, 10, -10],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🌳
              </motion.div>

              <motion.div
                className="env-element absolute top-[30%] right-[20%] text-2xl sm:text-3xl md:text-4xl"
                animate={{
                  y: [10, -10, 10],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                💧
              </motion.div>

              <motion.div
                className="env-element absolute bottom-[30%] left-[25%] text-2xl sm:text-3xl md:text-4xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                ♻️
              </motion.div>

              <motion.div
                className="env-element absolute bottom-[20%] right-[15%] text-2xl sm:text-3xl md:text-4xl"
                animate={{
                  y: [-5, 5, -5],
                  x: [-5, 5, -5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
              >
                🌞
              </motion.div>

              <motion.div
                className="env-element absolute top-[50%] left-[10%] text-xl sm:text-2xl md:text-3xl"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                🍃
              </motion.div>

              <motion.div
                className="env-element absolute top-[60%] right-[10%] text-xl sm:text-2xl md:text-3xl"
                animate={{
                  y: [-8, 8, -8],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.7
                }}
              >
                🌺
              </motion.div>
            </div>

            {/* Loading progress and messages */}
            <div className="relative z-20 w-full max-w-md px-4">
              {/* Loading message */}
              <motion.div
                className="text-center mb-4 h-6"
                key={currentPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-emerald-300 text-sm sm:text-base font-medium">
                  {loadingMessages[currentPhase]}
                </p>
              </motion.div>

              {/* Progress bar */}
              <div className="relative h-1.5 sm:h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              {/* Loading dots */}
              <div className="flex justify-center gap-1 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Completion effect */}
            <AnimatePresence>
              {currentPhase === 3 && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Success message */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 10
                    }}
                  >
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-2">🎉</div>
                    <p className="text-emerald-300 font-bold text-lg sm:text-xl">Ready to Go!</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedLoadingScreen