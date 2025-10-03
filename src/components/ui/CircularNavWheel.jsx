import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CircularNavWheel = ({ 
  items = [], 
  currentPath = '/',
  onItemSelect,
  className = '',
  radius = 120,
  itemSize = 45,
  visibleItems = 5,
  autoRotate = true,
  enableParticles = true
}) => {
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, rotation: 0, time: 0 })
  const [hoveredItem, setHoveredItem] = useState(null)
  const [activeParticles, setActiveParticles] = useState([])
  const [orbitalParticles, setOrbitalParticles] = useState([])
  const [isFocused, setIsFocused] = useState(false)
  const [velocity, setVelocity] = useState(0)
  
  const wheelRef = useRef(null)
  const animationRef = useRef(null)
  const lastInteractionRef = useRef(Date.now())
  const lastRotationRef = useRef(0)
  const velocityRef = useRef(0)
  
  // Calculate angle step based on visible items
  const angleStep = items.length > 0 ? 360 / items.length : 0
  const visibleAngleRange = 180

  // Particle system for enhanced interactions
  const createParticles = useCallback((x, y, count = 8, color = 'emerald') => {
    if (!enableParticles) return
    
    const particles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 8 - 2, // slight upward bias
      life: 1,
      size: Math.random() * 4 + 2,
      color,
    }))
    
    setActiveParticles(prev => [...prev, ...particles])
  }, [enableParticles])

  // Update particles with physics
  useEffect(() => {
    if (!enableParticles || activeParticles.length === 0) return
    
    const particleAnimation = requestAnimationFrame(() => {
      setActiveParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 0.03,
            vy: particle.vy + 0.15, // gravity
            vx: particle.vx * 0.98, // air resistance
          }))
          .filter(particle => particle.life > 0)
      )
    })
    
    return () => cancelAnimationFrame(particleAnimation)
  }, [activeParticles, enableParticles])

  // Get currently centered item with enhanced logic
  const getCenterItemIndex = useCallback(() => {
    if (items.length === 0) return 0
    const normalizedRotation = ((rotation % 360) + 360) % 360
    const centerIndex = Math.round(normalizedRotation / angleStep) % items.length
    return (centerIndex + items.length) % items.length // Ensure positive index
  }, [rotation, angleStep, items.length])

  // Refined smooth rotation with better spring physics
  const rotateToItem = useCallback((targetIndex, instant = false) => {
    if (items.length === 0) return
    lastInteractionRef.current = Date.now()
    
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

  // Enhanced wheel scroll with velocity tracking
  const handleWheel = useCallback((e) => {
    if (items.length === 0) return
    e.preventDefault()
    lastInteractionRef.current = Date.now()
    
    const delta = e.deltaY > 0 ? 1 : -1
    const momentum = Math.min(Math.abs(e.deltaY) / 100, 2.5)
    const newVelocity = delta * angleStep * momentum * 0.3
    
    velocityRef.current = newVelocity
    setRotation(prev => prev + newVelocity)
  }, [angleStep, items.length])

  // Enhanced drag with velocity calculation
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      rotation: rotation,
      time: Date.now()
    })
    lastInteractionRef.current = Date.now()
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

  // Navigation with particle effects
  const rotateLeft = useCallback(() => {
    const currentCenter = getCenterItemIndex()
    const nextIndex = (currentCenter - 1 + items.length) % items.length
    createParticles(0, 0, 6, 'blue')
    rotateToItem(nextIndex)
  }, [getCenterItemIndex, items.length, rotateToItem, createParticles])

  const rotateRight = useCallback(() => {
    const currentCenter = getCenterItemIndex()
    const nextIndex = (currentCenter + 1) % items.length
    createParticles(0, 0, 6, 'blue')
    rotateToItem(nextIndex)
  }, [getCenterItemIndex, items.length, rotateToItem, createParticles])

  // Keyboard navigation with enhanced feedback
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        rotateLeft()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        rotateRight()
      } else if (e.key === 'Enter' || e.key === ' ') {
        const centerIndex = getCenterItemIndex()
        const centerItem = items[centerIndex]
        if (centerItem && onItemSelect) {
          e.preventDefault()
          createParticles(0, 0, 12, 'emerald')
          onItemSelect(centerItem, centerIndex)
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [rotateLeft, rotateRight, getCenterItemIndex, items, onItemSelect, createParticles])

  // Generate orbital particles for ambient effect
  useEffect(() => {
    if (!enableParticles) return
    
    const generateOrbitalParticles = () => {
      const particles = Array.from({ length: 6 }, (_, i) => ({
        id: `orbital-${i}`,
        angle: (i / 6) * 360,
        distance: radius * 0.7 + Math.random() * 20,
        size: Math.random() * 2 + 1,
        speed: 0.3 + Math.random() * 0.2,
        opacity: 0.3 + Math.random() * 0.3
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

    // Calculate position with depth
    const radian = (angle * Math.PI) / 180
    const x = Math.sin(radian) * radius
    const y = -Math.cos(radian) * radius
    
    // Enhanced depth effects
    const distanceFromCenter = Math.abs(normalizedAngle) / (visibleAngleRange / 2)
    const scale = Math.max(0.55, 1 - distanceFromCenter * 0.45)
    const opacity = Math.max(0.35, 1 - distanceFromCenter * 0.65)
    const zIndex = Math.round(10 - distanceFromCenter * 8)
    
    const isCentered = Math.abs(normalizedAngle) < angleStep / 4
    const isActive = currentPath === item.to

    const Icon = item.icon

    return (
      <motion.div
        key={`${item.to}-${index}`}
        className="absolute cursor-pointer"
        style={{
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          transform: 'translate(-50%, -50%)',
          zIndex,
        }}
        initial={{ scale: 0.85, opacity: 0, rotate: -90 }}
        animate={{ 
          scale: isCentered ? 1.15 : scale,
          opacity: isCentered ? 1 : opacity,
          rotate: 0,
          y: isCentered ? [0, -3, 0] : 0,
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 30,
          y: isCentered ? {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          } : undefined
        }}
        whileHover={{ 
          scale: (isCentered ? 1.15 : scale) * 1.08,
          rotate: [0, -2, 2, 0],
          transition: { rotate: { duration: 0.3 } }
        }}
        onMouseEnter={() => {
          setHoveredItem(index)
          if (!isCentered) {
            createParticles(x, y, 4, 'slate')
          }
        }}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => {
          createParticles(x, y, isCentered ? 10 : 6, 'emerald')
          if (!isCentered) {
            rotateToItem(index)
          }
        }}
      >
        <NavLink
          to={item.to}
          className={({ isActive: linkActive }) => `
            relative flex items-center justify-center rounded-full transition-all duration-300
            shadow-lg hover:shadow-xl
            ${isCentered 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-3 ring-emerald-300 ring-offset-2' 
              : linkActive || isActive
                ? 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-900 dark:to-teal-900 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }
            hover:scale-110 border-2 border-transparent
            ${isCentered ? 'border-white dark:border-slate-800' : ''}
          `}
          style={{
            width: `${itemSize}px`,
            height: `${itemSize}px`,
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
          {/* Place item exactly on the spiral with a tiny offset toward center for readability */}
          <Icon className="w-[42%] h-[42%]" />
          
          {/* Active pulse effect */}
          {isCentered && (
            <motion.div
              className="absolute inset-0 rounded-full border border-emerald-300"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.35, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          
          {/* Enhanced tooltip */}
          <AnimatePresence>
            {(hoveredItem === index || isCentered) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 8 }}
                className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 
                          px-2.5 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium rounded-md
                          whitespace-nowrap pointer-events-none z-20 shadow-lg"
              >
                {item.label}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 
                              border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-slate-900 dark:border-b-slate-700" />
              </motion.div>
            )}
          </AnimatePresence>
        </NavLink>
      </motion.div>
    )
  }
  
  if (items.length === 0) return null

  return (
    <div className={`relative flex flex-col items-center justify-center mx-auto ${className}`}>
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
        
        {/* Orbital ambient particles */}
        {orbitalParticles.map(particle => {
          const radian = (particle.angle * Math.PI) / 180
          const x = Math.sin(radian) * particle.distance
          const y = -Math.cos(radian) * particle.distance
          
          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full pointer-events-none bg-emerald-300"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )
        })}
      </AnimatePresence>

      {/* Main wheel container - perfectly centered */}
      <motion.div 
        ref={wheelRef}
        className="relative select-none cursor-grab active:cursor-grabbing focus:outline-none rounded-full mx-auto"
        style={{ 
          width: radius * 2 + itemSize * 2, 
          height: radius * 2 + itemSize * 2 
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        animate={{
          scale: isFocused ? 1.05 : 1,
          rotate: isDragging ? [0, -0.5, 0, 0.5, 0] : 0,
          boxShadow: isFocused 
            ? ['0 0 0 rgba(16,185,129,0)', '0 0 20px rgba(16,185,129,0.15)', '0 0 0 rgba(16,185,129,0)']
            : '0 0 0 rgba(16,185,129,0)'
        }}
        transition={{ 
          scale: { type: 'spring', stiffness: 400 },
          rotate: { duration: 0.3, repeat: isDragging ? Infinity : 0 },
          boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }}
        tabIndex={0}
        role="navigation"
        aria-label="Circular navigation wheel"
      >
        {/* Spiral path from orb (center) to active (centered) item */}
        {(() => {
          const size = radius * 2 + itemSize * 2
          const cx = size / 2
          const cy = size / 2
          // Determine angle of centered (active) item
          const activeIndex = getCenterItemIndex()
          const targetAngleDeg = activeIndex * angleStep - rotation
          const targetAngleRad = (targetAngleDeg * Math.PI) / 180
          const maxR = radius
          const steps = 80
          const points = []
          for (let i = 0; i <= steps; i++) {
            const t = i / steps
            // Archimedean spiral from r=0 to r=maxR along targetAngle
            const a = targetAngleRad * t
            const r = maxR * t
            const x = cx + r * Math.sin(a)
            const y = cy - r * Math.cos(a)
            points.push([x, y])
          }
          const d = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ')
          return (
            <svg className="absolute inset-0 pointer-events-none z-[1]" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <motion.path
                d={d}
                fill="none"
                stroke="rgba(16,185,129,0.38)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="6 10"
                animate={{ strokeDashoffset: [0, -200] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
          )
        })()}

        {/* Enhanced center indicator - positioned much lower */}
        <motion.div 
          className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none z-[2]"
          style={{
            top: `calc(50% + ${radius * 0.45}px)` // Position dot much lower
          }}
        >
          {/* Main center dot */}
          <motion.div
            className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.8, 1, 0.8],
              boxShadow: [
                '0 0 6px rgba(16,185,129,0.4)',
                '0 0 12px rgba(16,185,129,0.8)',
                '0 0 6px rgba(16,185,129,0.4)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Orbiting ring effect */}
          <motion.div
            className="absolute inset-0 w-4 h-4 border border-emerald-400/30 rounded-full"
            style={{
              left: '-5px',
              top: '-5px'
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
            }}
          />
        </motion.div>
        
        {/* Navigation items */}
        {items.map((item, index) => renderNavItem(item, index))}
        
        {/* Compact navigation arrows - smaller size */}
        <motion.button
          onClick={rotateLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-10 z-[3]
                     p-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm 
                     shadow-sm border border-slate-200/50 dark:border-slate-700/50
                     hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:shadow-md
                     hover:border-emerald-300 dark:hover:border-emerald-600"
          whileHover={{ scale: 1.05, x: -1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous item"
        >
          <ChevronLeft className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400" />
        </motion.button>
        
        <motion.button
          onClick={rotateRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-10 z-[3]
                     p-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm 
                     shadow-sm border border-slate-200/50 dark:border-slate-700/50
                     hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:shadow-md
                     hover:border-emerald-300 dark:hover:border-emerald-600"
          whileHover={{ scale: 1.05, x: 1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Next item"
        >
          <ChevronRight className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400" />
        </motion.button>
      </motion.div>

      {/* Enhanced current item display */}
      <div className="mt-8 text-center">
        <motion.div
          key={getCenterItemIndex()}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="text-sm sm:text-base font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent"
        >
          {items[getCenterItemIndex()]?.label}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 48 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full mx-auto mt-2 relative"
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent rounded-full opacity-50"
            animate={{
              x: [-20, 68, -20],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default CircularNavWheel