import { motion, AnimatePresence } from 'framer-motion'
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useGSAP } from '../animations/hooks/useGSAP'
import confetti from 'canvas-confetti'

// Constants for better maintainability
const ANIMATION_DURATIONS = {
  PHASE_1: 1000,
  PHASE_2: 2000,
  PHASE_3: 2500,
  COMPLETE: 3000,
  EXIT: 500,
  MIN_SCREEN: 5000
}

const COLORS = {
  primary: {
    emerald: '#10b981',
    teal: '#0ea5e9',
    green: '#22c55e',
    cyan: '#06b6d4',
    lightGreen: '#84cc16'
  },
  gradients: {
    trunk: ['#0ea5a3', '#10b981'],
    brand: ['from-emerald-400', 'via-teal-300', 'to-sky-400']
  }
}

const LOADING_MESSAGES = [
  '🌱 Planting seeds of knowledge...',
  '🌍 Building your eco-adventure...',
  '✨ Preparing amazing experiences...',
  '🚀 Almost ready to save the planet!'
]

// Decorative, responsive SVG that grows from roots to canopy.
// Purely visual; does not affect existing phases or particle logic.
const TreeGrow = React.memo(() => {
  const pollen = Array.from({ length: 10 }, (_, i) => ({
    key: i,
    x: 90 + Math.random() * 20,
    delay: 0.8 + Math.random() * 1.5,
    dur: 2 + Math.random() * 2.5,
    size: 1 + Math.random() * 1.5,
    hue: Math.random() > 0.5 ? '#a7f3d0' : '#bae6fd'
  }))

  return (
    <div className="w-[340px] sm:w-[420px] md:w-[480px] mx-auto">
      <motion.svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_8px_24px_rgba(16,185,129,.25)]"
        initial="hidden"
        animate="visible"
      >
        {/* Roots */}
        <motion.path
          d="M100 150c-8 4-12 10-18 15m18-15c8 4 12 10 18 15m-18-15c-6 2-10 6-15 10m15-10c6 2 10 6 15 10"
          fill="none"
          stroke="#059669"
          strokeWidth="3"
          strokeLinecap="round"
          variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        />
        {/* Trunk */}
        <motion.path
          d="M100 150 L100 95"
          fill="none"
          stroke="url(#trunkGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
          transition={{ duration: 1.0, ease: 'easeInOut', delay: 0.2 }}
        />
        {/* Sap flow along trunk (thin dashed overlay) */}
        <motion.path
          d="M100 150 L100 95"
          fill="none"
          stroke="#ccfbf1"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 8"
          initial={{ opacity: 0.0, pathLength: 0, strokeDashoffset: 0 }}
          animate={{ opacity: [0, 0.85, 0.6], pathLength: 1, strokeDashoffset: [-40, -140] }}
          transition={{ duration: 3.0, ease: 'easeInOut', delay: 1.0, repeat: Infinity, repeatType: 'mirror' }}
        />
        {/* Branches */}
        <motion.path
          d="M100 115 C92 108, 84 104, 76 102 M100 110 C108 104, 116 100, 124 98"
          fill="none"
          stroke="#10b981"
          strokeWidth="4"
          strokeLinecap="round"
          variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
          transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.6 }}
        />
        {/* Sap flow along branches */}
        <motion.path
          d="M100 115 C92 108, 84 104, 76 102 M100 110 C108 104, 116 100, 124 98"
          fill="none"
          stroke="#d1fae5"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray="3 7"
          initial={{ opacity: 0.0, pathLength: 0, strokeDashoffset: 0 }}
          animate={{ opacity: [0, 0.7, 0.5], pathLength: 1, strokeDashoffset: [-30, -120] }}
          transition={{ duration: 2.6, ease: 'easeInOut', delay: 1.5, repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Additional branch network for richness */}
        <motion.g>
          {/* Upper left branch */}
          <motion.path
            d="M100 108 C92 102, 85 94, 78 88"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
            transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.7 }}
          />
          {/* Upper right branch */}
          <motion.path
            d="M100 108 C108 100, 116 92, 124 86"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
            transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.75 }}
          />
          {/* Lower left branch */}
          <motion.path
            d="M100 120 C94 118, 88 116, 82 114"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
            transition={{ duration: 0.7, ease: 'easeInOut', delay: 0.8 }}
          />
          {/* Lower right branch */}
          <motion.path
            d="M100 120 C106 118, 112 116, 118 114"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
            transition={{ duration: 0.7, ease: 'easeInOut', delay: 0.85 }}
          />
          {/* Sap overlays on select branches */}
          <motion.path
            d="M100 108 C92 102, 85 94, 78 88"
            fill="none"
            stroke="#befae6"
            strokeWidth="1"
            strokeDasharray="3 6"
            initial={{ opacity: 0, pathLength: 0, strokeDashoffset: 0 }}
            animate={{ opacity: [0, 0.6, 0.4], pathLength: 1, strokeDashoffset: [-24, -90] }}
            transition={{ duration: 2.2, ease: 'easeInOut', delay: 1.0, repeat: Infinity, repeatType: 'mirror' }}
          />
          <motion.path
            d="M100 108 C108 100, 116 92, 124 86"
            fill="none"
            stroke="#befae6"
            strokeWidth="1"
            strokeDasharray="3 6"
            initial={{ opacity: 0, pathLength: 0, strokeDashoffset: 0 }}
            animate={{ opacity: [0, 0.6, 0.4], pathLength: 1, strokeDashoffset: [-24, -90] }}
            transition={{ duration: 2.2, ease: 'easeInOut', delay: 1.1, repeat: Infinity, repeatType: 'mirror' }}
          />
        </motion.g>
        {/* Canopy blobs (leaves) with wind sway */}
        <motion.g
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: [0.75, 1, 1.03, 1], opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 1.3 }}
          filter="url(#glow)"
        >
          <motion.g
            initial={{ rotate: 0, x: 0 }}
            animate={{ rotate: [-1.2, 0.8, -0.6, 0], x: [0, 0.6, -0.4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '102px 85px' }}
          >
            <motion.circle cx="92" cy="78" r="20" fill="#34d399" />
            <motion.circle cx="112" cy="80" r="22" fill="#22c55e" />
            <motion.circle cx="102" cy="66" r="18" fill="#06b6d4" opacity="0.9" />
          </motion.g>
        </motion.g>

        {/* Secondary inner canopy that blooms later */}
        <motion.g
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 0.9, 1], opacity: [0, 0.6, 0.9] }}
          transition={{ duration: 1.0, delay: 1.3, ease: 'easeOut' }}
          filter="url(#glow)"
        >
          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: [0.5, -0.8, 0.3, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '102px 85px' }}
          >
            <motion.circle cx="100" cy="82" r="12" fill="#86efac" opacity="0.9" />
            <motion.circle cx="108" cy="74" r="10" fill="#7dd3fc" opacity="0.85" />
            <motion.circle cx="94" cy="72" r="9" fill="#34d399" opacity="0.8" />
          </motion.g>
        </motion.g>

        {/* Leaf clusters on distal branches */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1] }} transition={{ delay: 1.1, duration: 0.6 }}>
          {/* Left cluster */}
          <motion.circle cx="78" cy="88" r="6" fill="#34d399" />
          <motion.circle cx="82" cy="84" r="4.5" fill="#22c55e" />
          <motion.circle cx="86" cy="90" r="4" fill="#059669" opacity="0.7" />
          {/* Right cluster */}
          <motion.circle cx="124" cy="86" r="6" fill="#7dd3fc" />
          <motion.circle cx="120" cy="82" r="4.5" fill="#22c55e" />
          <motion.circle cx="118" cy="90" r="4" fill="#06b6d4" opacity="0.7" />
          {/* Lower clusters */}
          <motion.circle cx="82" cy="114" r="3.5" fill="#86efac" />
          <motion.circle cx="118" cy="114" r="3.5" fill="#86efac" />
        </motion.g>

        {/* Pollen sparkles rising through canopy */}
        <g>
          {pollen.map(p => (
            <motion.circle
              key={p.key}
              cx={p.x}
              cy={85}
              r={p.size}
              fill={p.hue}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: [-6, -22, -32] }}
              transition={{ duration: p.dur + 0.6, delay: p.delay + 0.2, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
        </g>

        {/* Ground shadow with subtle parallax */}
        <motion.ellipse
          cx="100"
          cy="158"
          rx="28"
          ry="6"
          fill="rgba(0,0,0,0.25)"
          initial={{ scaleX: 0.8, opacity: 0 }}
          animate={{ scaleX: [0.9, 1.05, 0.95], opacity: 1 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="trunkGrad" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor={COLORS.gradients.trunk[0]} />
            <stop offset="100%" stopColor={COLORS.gradients.trunk[1]} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </motion.svg>
    </div>
  )
})

TreeGrow.displayName = 'TreeGrow'

// Optimized hook for particle animation
const useParticleAnimation = (particles) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const { innerWidth, innerHeight } = window
      const dpr = window.devicePixelRatio || 1
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      canvas.style.width = `${innerWidth}px`
      canvas.style.height = `${innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const animate = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      particles.forEach((particle) => {
        const time = Date.now() * 0.001
        const x = ((particle.x + Math.sin(time * particle.speed) * 20) / 100) * width
        const y = ((particle.y + Math.cos(time * 1.5 * particle.speed) * 15) / 100) * height

        ctx.shadowColor = particle.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(x, y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        ctx.shadowBlur = 0
        ctx.beginPath()
        ctx.arc(x, y, particle.size * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = particle.color + 'CC'
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [particles])

  return canvasRef
}

// Confetti hook
const useConfetti = () => {
  return useCallback(() => {
    try {
      const colors = Object.values(COLORS.primary)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors, startVelocity: 30, gravity: 0.8 })
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors, startVelocity: 25 })
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors, startVelocity: 25 })
      }, 200)
    } catch (e) {
      console.warn('Confetti animation error:', e)
    }
  }, [])
}

const AnimatedLoadingScreen = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [animDone, setAnimDone] = useState(false)
  const [minTimePassed, setMinTimePassed] = useState(false)
  const containerRef = useRef(null)

  // Generate particle positions
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 0.5,
      color: Math.random() > 0.5 ? COLORS.primary.emerald : COLORS.primary.teal
    }))
    , [])

  const particleCanvasRef = useParticleAnimation(particles)
  const triggerConfetti = useConfetti()

  // Ensure a minimum display time of 5s
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), ANIMATION_DURATIONS.MIN_SCREEN)
    return () => clearTimeout(t)
  }, [])

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
      tl.call(() => setAnimDone(true), [], "3")

    } catch (error) {
      console.warn('GSAP animation error:', error)
      // Fallback to simple timing without GSAP
      setTimeout(() => setCurrentPhase(1), 1000)
      setTimeout(() => setCurrentPhase(2), 2000)
      setTimeout(() => {
        setCurrentPhase(3)
        triggerConfetti()
      }, 2500)
      setTimeout(() => setAnimDone(true), 3000)
    }

  }, [triggerConfetti])

  // Canvas particle animation handled by useParticleAnimation hook

  // Confetti handled by hook: triggerConfetti()

  // Gate completion on both animation finish and minimum time
  useEffect(() => {
    if (animDone && minTimePassed) setIsComplete(true)
  }, [animDone, minTimePassed])

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, ANIMATION_DURATIONS.EXIT)
      return () => clearTimeout(timer)
    }
  }, [isComplete, onComplete])


  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0b1220 0%, #0f172a 25%, #0a3d38 50%, #064e3b 75%, #0b1220 100%)',
            backgroundSize: '400% 400%'
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
            backgroundPosition: { duration: 15, repeat: Infinity, ease: 'linear' }
          }}
        >
          {/* Particle canvas background */}
          <canvas
            ref={particleCanvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.6 }}
          />

          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/35" />

          {/* Main content container */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">
            {/* Brand name (kept subtle, sits above the tree) */}
            <motion.div
              className="text-center mb-3 sm:mb-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent tracking-wide">
                AverSoltix
              </h1>
              <motion.p
                className="text-emerald-100/90 text-xs sm:text-sm mt-1 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                Learn • Play • Save the Planet
              </motion.p>
            </motion.div>

            {/* Central logo area (now: tree at center with orbital rings) */}
            <div className="relative flex items-center justify-center mb-6 sm:mb-8 h-[420px] sm:h-[500px] md:h-[560px]">
            {/* Rotating rings orbiting around the tree (centered wrappers) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  style={{ width: '19rem', height: '19rem', filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.25))' }}
                  animate={{ rotate: 360, x: [0, 2, 0, -2, 0], y: [0, -1.5, 0, 1.5, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-full h-full rounded-full" style={{ borderWidth: '3px', borderColor: 'rgba(52, 211, 153, 0.38)', borderStyle: 'solid' }} />
                </motion.div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  style={{ width: '16rem', height: '16rem', filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.24))' }}
                  animate={{ rotate: -360, x: [0, -1.5, 0, 1.5, 0], y: [0, 1.5, 0, -1.5, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-full h-full rounded-full" style={{ borderWidth: '2.5px', borderColor: 'rgba(125, 211, 252, 0.38)', borderStyle: 'solid' }} />
                </motion.div>
              </div>

              {/* Center content: Tree */}
              <motion.div className="center-logo relative z-10 flex items-center justify-center">
                {/* Soft halo behind tree */}
                <div className="absolute w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] rounded-full bg-emerald-400/10 blur-3xl" aria-hidden />
                <TreeGrow />
              </motion.div>
            </div>


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

            {/* Completion message between tree and progress */}
            <AnimatePresence>
              {currentPhase === 3 && (
                <motion.div
                  key="ready"
                  className="relative z-20 w-full flex items-center justify-center mb-4 sm:mb-6"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/40 border border-emerald-400/30 backdrop-blur text-emerald-200 shadow-glow">
                    <span className="text-2xl">🎉</span>
                    <span className="font-semibold">Ready to Go!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading progress and messages */}
            <div className="relative z-20 w-full max-w-xl px-4">
              {/* Loading message */}
              <motion.div
                className="text-center mb-3 h-6"
                key={currentPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-emerald-300 text-sm sm:text-base font-medium">
                  {LOADING_MESSAGES[currentPhase]}
                </p>
              </motion.div>

              {/* Progress bar */}
              <div className="relative mx-auto max-w-xl h-1.5 sm:h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
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

          </div>

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedLoadingScreen