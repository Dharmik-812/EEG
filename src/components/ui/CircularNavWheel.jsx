import { useState, useRef, useEffect, useCallback, useMemo, Component } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

// Utility: throttle calls to ~60fps using rAF (leading, with trailing coalescing)
const throttle = (fn, wait = 16) => {
  let ticking = false
  let lastArgs = null
  return (...args) => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(() => {
        fn(...(lastArgs || args))
        ticking = false
        lastArgs = null
      })
    } else {
      lastArgs = args
    }
  }
}

const MAX_ACTIVE_PARTICLES = 30

const triggerHapticFeedback = (intensity = 'light') => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns = { light: [50], medium: [100], heavy: [150] }
      // @ts-ignore
      navigator.vibrate(patterns[intensity] || patterns.light)
    }
  } catch {}
}

// Hook: Particle system management
const useParticles = (enableParticles, radius, particleConfig) => {
  const [activeParticles, setActiveParticles] = useState([])
  const [orbitalParticles, setOrbitalParticles] = useState([])

  const createParticles = useCallback((x, y, count = 4, color = 'emerald') => {
    if (!enableParticles) return

    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 6 - 2,
      life: 1,
      size: Math.random() * 2 + 1,
      color,
    }))

    setActiveParticles(prev => {
      const combined = [...prev, ...newParticles]
      const limit = Math.min(particleConfig?.maxParticles || 20, MAX_ACTIVE_PARTICLES)
      return combined.slice(-limit)
    })
  }, [enableParticles, particleConfig])

  // Update particles with physics
  useEffect(() => {
    if (!enableParticles || activeParticles.length === 0) return

    const raf = requestAnimationFrame(() => {
      setActiveParticles(prev =>
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 0.03,
            vy: particle.vy + (particleConfig?.gravity ?? 0.15), // gravity
            vx: particle.vx * (particleConfig?.airResistance ?? 0.98), // air resistance
          }))
          .filter(particle => particle.life > 0)
      )
    })

    return () => cancelAnimationFrame(raf)
  }, [activeParticles, enableParticles, particleConfig])

  // Generate orbital particles for ambient effect - reduced
  useEffect(() => {
    if (!enableParticles) return

    const generateOrbitalParticles = () => {
      const particles = Array.from({ length: 3 }, (_, i) => ({
        id: `orbital-${i}`,
        angle: (i / 3) * 360,
        distance: radius * 0.7 + Math.random() * 20,
        size: Math.random() * 1.5 + 0.5,
        speed: 0.2 + Math.random() * 0.1,
        opacity: 0.15 + Math.random() * 0.15
      }))
      setOrbitalParticles(particles)
    }

    generateOrbitalParticles()
  }, [enableParticles, radius])

  // Animate orbital particles
  useEffect(() => {
    if (!enableParticles || orbitalParticles.length === 0) return

    let animationFrame
    const animateOrbitals = () => {
      setOrbitalParticles(prev =>
        prev.map(particle => ({
          ...particle,
          angle: particle.angle + particle.speed
        }))
      )
      animationFrame = requestAnimationFrame(animateOrbitals)
    }

    animationFrame = requestAnimationFrame(animateOrbitals)
    return () => animationFrame && cancelAnimationFrame(animationFrame)
  }, [orbitalParticles.length, enableParticles])

  return { activeParticles, orbitalParticles, createParticles }
}

const CircularNavWheel = ({ 
  items = [], 
  currentPath = '/',
  onItemSelect,
  className = '',
  radius = 140,
  itemSize = 52,
  visibleItems = 5,
  autoRotate = true,
  enableParticles = true,
  // Responsive options
  responsive = true,
  mobileRadius = 110,
  mobileItemSize = 48,
  // Theme (reserved)
  theme = 'auto'
}) => {
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, rotation: 0, time: 0 })
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isFocused, setIsFocused] = useState(false)
  const [velocity, setVelocity] = useState(0)
  const [showNavigationHint, setShowNavigationHint] = useState(true)

  // Responsive detection with better breakpoints
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 640)
      setIsTablet(width >= 640 && width < 1024)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Hide navigation hint after first interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavigationHint(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  // Better responsive sizing
  const effectiveRadius = responsive 
    ? (isMobile ? mobileRadius : isTablet ? radius * 0.9 : radius)
    : radius
  const effectiveItemSize = responsive 
    ? (isMobile ? mobileItemSize : isTablet ? itemSize * 0.9 : itemSize)
    : itemSize

  // Particle configuration - reduced for less visual noise
  const particleConfig = useMemo(() => ({
    maxParticles: 20,
    gravity: 0.15,
    airResistance: 0.98
  }), [])

  // Particles via hook
  const { activeParticles, orbitalParticles, createParticles } = useParticles(enableParticles, effectiveRadius, particleConfig)
  
  const wheelRef = useRef(null)
  const animationRef = useRef(null)
  const lastInteractionRef = useRef(Date.now())
  const lastRotationRef = useRef(0)
  const velocityRef = useRef(0)
  
  // Calculate angle step based on visible items
  const angleStep = items.length > 0 ? 360 / items.length : 0
  const visibleAngleRange = 180

  // Memoized normalized rotation and centered index
  const { normalizedRotation, centerIndex } = useMemo(() => {
    const nr = ((rotation % 360) + 360) % 360
    const ci = items.length > 0 ? Math.round(nr / angleStep) % items.length : 0
    return { normalizedRotation: nr, centerIndex: (ci + items.length) % (items.length || 1) }
  }, [rotation, angleStep, items.length])

  // Get currently centered item using memoized value
  const getCenterItemIndex = useCallback(() => centerIndex, [centerIndex])

  // Refined smooth rotation with better spring physics
  const rotateToItem = useCallback((targetIndex, instant = false) => {
    if (items.length === 0) return
    lastInteractionRef.current = Date.now()
    setShowNavigationHint(false)
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const targetRotation = targetIndex * angleStep
    const currentNormalizedRotation = ((rotation % 360) + 360) % 360
    
    // Find shortest path with improved logic
    let diff = targetRotation - currentNormalizedRotation
    if (Math.abs(diff) > 180) {
      diff = diff > 0 ? diff - 360 : diff + 360
    }
    
    const targetRotationFinal = rotation + diff

    if (instant) {
      setRotation(targetRotationFinal)
      velocityRef.current = 0
    } else {
      // Smooth spring animation with better easing
      const startRotation = rotation
      const startTime = Date.now()
      const baseDuration = 400
      const distance = Math.abs(diff)
      const duration = baseDuration + Math.min(distance * 1.2, 300) // Dynamic duration

      const animateSpring = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Smooth easing with subtle bounce
        const easeOutBack = (t) => {
          const c1 = 1.70158
          const c3 = c1 + 1
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
        }
        
        const easedProgress = easeOutBack(progress)
        const newRotation = startRotation + diff * easedProgress
        
        setRotation(newRotation)
        
        // Update velocity for momentum calculations
        velocityRef.current = (newRotation - (lastRotationRef.current || newRotation)) * 0.1
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateSpring)
        } else {
          velocityRef.current = 0
        }
      }
      
      animationRef.current = requestAnimationFrame(animateSpring)
    }
  }, [rotation, angleStep, items.length])

  // Enhanced wheel scroll with throttling and velocity tracking
  const throttledWheel = useMemo(() => throttle((deltaY) => {
    if (items.length === 0) return
    lastInteractionRef.current = Date.now()
    setShowNavigationHint(false)
    const delta = deltaY > 0 ? 1 : -1
    const momentum = Math.min(Math.abs(deltaY) / 100, 2.5)
    const newVelocity = delta * angleStep * momentum * 0.3
    velocityRef.current = newVelocity
    setRotation(prev => prev + newVelocity)
  }, 16), [angleStep, items.length])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    throttledWheel(e.deltaY)
  }, [throttledWheel])

  // Enhanced drag with velocity calculation
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      rotation: rotation,
      time: Date.now()
    })
    lastInteractionRef.current = Date.now()
    setShowNavigationHint(false)
    velocityRef.current = 0
  }, [rotation])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragStart.x
    const rotationDelta = (deltaX / window.innerWidth) * 720 // Increased sensitivity
    
    // Calculate velocity for smooth motion
    const now = Date.now()
    const timeDelta = now - dragStart.time
    if (timeDelta > 0) {
      velocityRef.current = rotationDelta / timeDelta
    }
    
    setRotation(dragStart.rotation + rotationDelta)
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      
      // Apply momentum based on velocity
      const momentum = velocityRef.current * 120 // Momentum multiplier
      if (Math.abs(momentum) > 1) {
        setRotation(prev => prev + momentum)
        
        // Gradually reduce momentum
        const reduceMomentum = () => {
          velocityRef.current *= 0.85
          if (Math.abs(velocityRef.current) > 0.1) {
            setRotation(prev => prev + velocityRef.current)
            requestAnimationFrame(reduceMomentum)
          } else {
            // Final snap to nearest item
            setTimeout(() => {
              const centerIndex = getCenterItemIndex()
              rotateToItem(centerIndex)
            }, 200)
          }
        }
        requestAnimationFrame(reduceMomentum)
      } else {
        // Direct snap if no significant momentum
        const centerIndex = getCenterItemIndex()
        rotateToItem(centerIndex)
      }
    }
  }, [isDragging, getCenterItemIndex, rotateToItem])

  // Touch events with improved handling
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({
      x: touch.clientX,
      rotation: rotation,
      time: Date.now()
    })
    lastInteractionRef.current = Date.now()
    setShowNavigationHint(false)
    velocityRef.current = 0
  }, [rotation])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    e.preventDefault()
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const rotationDelta = (deltaX / window.innerWidth) * 720
    
    const now = Date.now()
    const timeDelta = now - dragStart.time
    if (timeDelta > 0) {
      velocityRef.current = rotationDelta / timeDelta
    }
    
    setRotation(dragStart.rotation + rotationDelta)
  }, [isDragging, dragStart])

  const handleTouchEnd = useCallback(() => {
    handleMouseUp()
  }, [handleMouseUp])

  // Global event listeners with cleanup
  useEffect(() => {
    if (isDragging) {
      const events = [
        ['mousemove', handleMouseMove],
        ['mouseup', handleMouseUp],
        ['touchmove', handleTouchMove],
        ['touchend', handleTouchEnd]
      ]
      
      events.forEach(([event, handler]) => 
        document.addEventListener(event, handler, { passive: false })
      )
      
      return () => {
        events.forEach(([event, handler]) => 
          document.removeEventListener(event, handler)
        )
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Enhanced auto-rotate with intelligent idle detection
  useEffect(() => {
    if (!autoRotate) return
    
    const checkIdle = () => {
      return Date.now() - lastInteractionRef.current > 3000 // 3 seconds idle
    }
    
    let raf
    const autoRotateStep = () => {
      if (!isDragging && checkIdle()) {
        // Gentle, natural drifting when idle
        const time = Date.now() * 0.001
        const drift = Math.sin(time * 0.3) * 0.04 + Math.cos(time * 0.2) * 0.03
        setRotation(prev => prev + 0.02 + drift)
      }
      raf = requestAnimationFrame(autoRotateStep)
    }
    
    raf = requestAnimationFrame(autoRotateStep)
    return () => raf && cancelAnimationFrame(raf)
  }, [autoRotate, isDragging])

  // Navigation with reduced particle effects
  const rotateLeft = useCallback(() => {
    triggerHapticFeedback('light')
    const currentCenter = getCenterItemIndex()
    const nextIndex = (currentCenter - 1 + items.length) % items.length
    createParticles(0, 0, 2, 'blue')
    rotateToItem(nextIndex)
  }, [getCenterItemIndex, items.length, rotateToItem, createParticles])

  const rotateRight = useCallback(() => {
    triggerHapticFeedback('light')
    const currentCenter = getCenterItemIndex()
    const nextIndex = (currentCenter + 1) % items.length
    createParticles(0, 0, 2, 'blue')
    rotateToItem(nextIndex)
  }, [getCenterItemIndex, items.length, rotateToItem, createParticles])

  // Keyboard navigation with enhanced feedback and more keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          rotateLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          rotateRight()
          break
        case 'Enter':
        case ' ': {
          e.preventDefault()
          const ci = getCenterItemIndex()
          const centerItem = items[ci]
          if (centerItem && onItemSelect) {
            triggerHapticFeedback('medium')
            createParticles(0, 0, 4, 'emerald')
            onItemSelect(centerItem, ci)
          }
          break
        }
        case 'Home':
          e.preventDefault()
          rotateToItem(0)
          break
        case 'End':
          e.preventDefault()
          rotateToItem(Math.max(0, items.length - 1))
          break
        case 'Escape':
          e.preventDefault()
          setIsFocused(false)
          wheelRef.current?.blur?.()
          break
        default:
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [rotateLeft, rotateRight, getCenterItemIndex, items, onItemSelect, createParticles, rotateToItem])

  // Track rotation for velocity calculations
  useEffect(() => {
    const deltaRotation = rotation - lastRotationRef.current
    const deltaTime = 16 // ~60fps
    setVelocity(deltaRotation / deltaTime)
    lastRotationRef.current = rotation
  }, [rotation])

  const renderNavItem = (item, index) => {
    const angle = index * angleStep - rotation
    const normalizedAngle = ((angle + 180) % 360 + 360) % 360 - 180
    const isInFront = Math.abs(normalizedAngle) <= visibleAngleRange / 2
    
    if (!isInFront) return null

    // Calculate position with proper spacing
    const radian = (angle * Math.PI) / 180
    const x = Math.sin(radian) * effectiveRadius
    const y = -Math.cos(radian) * effectiveRadius
    
    // Enhanced depth effects with better visibility
    const distanceFromCenter = Math.abs(normalizedAngle) / (visibleAngleRange / 2)
    const scale = Math.max(0.8, 1 - distanceFromCenter * 0.2) // Much less scaling
    const opacity = Math.max(0.9, 1 - distanceFromCenter * 0.1) // Much higher minimum opacity
    const zIndex = Math.round(10 - distanceFromCenter * 8)
    
    const isCentered = Math.abs(normalizedAngle) < angleStep / 4
    const isActive = currentPath === item.to

    const Icon = item.icon

    return (
      <motion.div
        key={`${item.to}-${index}`}
        className="absolute cursor-pointer"
        role="button"
        tabIndex={isCentered ? 0 : -1}
        aria-label={`${item.label}${isCentered ? ', current item' : ''}`}
        aria-current={isCentered ? 'page' : undefined}
        style={{
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          transform: 'translate(-50%, -50%)',
          zIndex,
        }}
        initial={{ scale: 0.85, opacity: 0, rotate: -90 }}
        animate={{ 
          scale: isCentered ? 1.1 : scale,
          opacity: isCentered ? 1 : opacity,
          rotate: 0,
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 30,
        }}
        whileHover={{ 
          scale: (isCentered ? 1.1 : scale) * 1.05,
        }}
        onMouseEnter={() => {
          setHoveredItem(index)
          if (!isCentered) {
            createParticles(x, y, 2, 'slate')
          }
        }}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => {
          createParticles(x, y, isCentered ? 4 : 2, 'emerald')
          if (!isCentered) {
            rotateToItem(index)
          }
        }}
      >
        <NavLink
          to={item.to}
          className={({ isActive: linkActive }) => `
            relative flex items-center justify-center rounded-full transition-all duration-300
            shadow-lg hover:shadow-xl border
            ${isCentered 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-2 ring-emerald-400' 
              : linkActive || isActive
                ? 'bg-white/95 dark:bg-slate-600/95 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-500'
                : 'bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
            }
            hover:scale-105 backdrop-blur-sm
          `}
          style={{
            width: `${effectiveItemSize}px`,
            height: `${effectiveItemSize}px`,
          }}
          onClick={(e) => {
            if (!isCentered) {
              e.preventDefault()
              setTimeout(() => onItemSelect?.(item, index), 400)
            } else {
              onItemSelect?.(item, index)
            }
          }}
          aria-label={item.label}
        >
          <Icon className={`w-[50%] h-[50%] ${isCentered ? 'text-white' : 'text-current'}`} />
        </NavLink>
      </motion.div>
    )
  }
  
  // Loading skeleton
  if (items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div
          className="relative rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"
          style={{ width: effectiveRadius * 2, height: effectiveRadius * 2 }}
        />
        <div className="mt-4 h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`relative flex flex-col items-center justify-center mx-auto w-full max-w-2xl ${className}`}>
      {/* Enhanced Particle System */}
      <AnimatePresence>
        {/* Interaction particles */}
        {activeParticles.map(particle => (
          <motion.div
            key={particle.id}
            className={`absolute rounded-full pointer-events-none
              ${particle.color === 'emerald' ? 'bg-emerald-400' : 
                particle.color === 'blue' ? 'bg-blue-400' : 'bg-slate-400'}`}
            style={{
              left: `calc(50% + ${particle.x}px)`,
              top: `calc(50% + ${particle.y}px)`,
              width: particle.size,
              height: particle.size,
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: particle.life, scale: particle.life }}
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>

      {/* Navigation hint animation */}
      <AnimatePresence>
        {showNavigationHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10"
          >
            <motion.div
              className="flex items-center space-x-2 bg-slate-900/95 text-slate-100 px-4 py-3 rounded-xl text-sm backdrop-blur-sm border border-slate-700 shadow-xl"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Drag or scroll to navigate</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main wheel container - FIXED ALIGNMENT */}
      <div className="relative flex items-center justify-center w-full mb-8">
        <motion.div 
          ref={wheelRef}
          className="relative select-none cursor-grab active:cursor-grabbing focus:outline-none rounded-full mx-auto"
          style={{ 
            width: effectiveRadius * 2 + effectiveItemSize,
            height: effectiveRadius * 2 + effectiveItemSize,
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ 
            scale: { type: 'spring', stiffness: 400 },
          }}
          tabIndex={0}
          role="navigation"
          aria-label="Circular navigation wheel"
        >
          {/* Simple center indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[2]">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg" />
          </div>
          
          {/* Navigation items */}
          {items.map((item, index) => renderNavItem(item, index))}
        </motion.div>
      </div>

      {/* Enhanced bottom section - PROPERLY ALIGNED */}
      <div className="w-full flex flex-col items-center justify-center space-y-6">
        {/* Current page display */}
        <div className="text-center">
          <motion.div
            key={getCenterItemIndex()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="text-2xl font-bold text-white mb-3"
          >
            {items[getCenterItemIndex()]?.label}
          </motion.div>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center space-x-2">
            {items.map((_, index) => (
              <button
                key={index}
                className={`rounded-full transition-all duration-300 ${
                  index === getCenterItemIndex() 
                    ? 'bg-emerald-400 w-3 h-3' 
                    : 'bg-slate-600 w-2 h-2 hover:bg-slate-500'
                }`}
                onClick={() => rotateToItem(index)}
                aria-label={`Go to ${items[index]?.label}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation controls - SIMPLIFIED AND ALIGNED */}
        <div className="flex items-center justify-center space-x-6">
          <motion.button
            onClick={rotateLeft}
            className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 
                       border border-slate-600 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous item"
          >
            <ChevronLeft className="w-5 h-5 text-slate-200" />
          </motion.button>

          <motion.button
            onClick={rotateRight}
            className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 
                       border border-slate-600 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Next item"
          >
            <ChevronRight className="w-5 h-5 text-slate-200" />
          </motion.button>
        </div>

        {/* Keyboard hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-xs text-slate-400 text-center"
        >
          Use arrow keys or drag to navigate
        </motion.div>
      </div>
    </div>
  )
}

// Error Boundary wrapper
class CircularNavErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-600 dark:text-red-400">
          Navigation wheel unavailable
        </div>
      )
    }
    return this.props.children
  }
}

const CircularNavWheelWithBoundary = (props) => (
  <CircularNavErrorBoundary>
    <CircularNavWheel {...props} />
  </CircularNavErrorBoundary>
)

export { CircularNavWheel }
export default CircularNavWheelWithBoundary