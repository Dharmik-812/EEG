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

const triggerHapticFeedback = (intensity = 'light') => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns = { light: [50], medium: [100], heavy: [150] }
      navigator.vibrate(patterns[intensity] || patterns.light)
    }
  } catch {}
}

// Hook: Simplified particle system for semi-circle layout
const useParticles = (enableParticles) => {
  const [particles, setParticles] = useState([])

  const createParticles = useCallback((x, y, count = 3, color = 'emerald') => {
    if (!enableParticles) return

    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 1,
      life: 1,
      size: Math.random() * 2 + 1,
      color,
    }))

    setParticles(prev => {
      const combined = [...prev, ...newParticles]
      return combined.slice(-15) // Limit particles
    })
  }, [enableParticles])

  // Update particles with physics
  useEffect(() => {
    if (!enableParticles || particles.length === 0) return

    const raf = requestAnimationFrame(() => {
      setParticles(prev =>
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 0.04,
            vy: particle.vy + 0.1, // gravity
            vx: particle.vx * 0.98, // air resistance
          }))
          .filter(particle => particle.life > 0)
      )
    })

    return () => cancelAnimationFrame(raf)
  }, [particles, enableParticles])

  return { particles, createParticles }
}

const CircularNavWheel = ({ 
  items = [], 
  currentPath = '/',
  onItemSelect,
  className = '',
  radius = 100,
  itemSize = 48,
  layoutStyle = 'semi-circle', // New prop to control layout
  enableParticles = true,
  // Responsive options
  responsive = true,
  mobileRadius = 80,
  mobileItemSize = 40
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, index: 0 })
  const [showHint, setShowHint] = useState(true)

  // Defensive guards
  const itemCount = Array.isArray(items) ? items.length : 0

  // Carousel config: fixed number of visible items on an upright arc
  const VISIBLE_COUNT = 5
  const ARC_SPAN_DEG = 160  // Wider arc for better spacing
  const centerSlot = Math.floor(VISIBLE_COUNT / 2)

  // Responsive detection
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Hide navigation hint after first interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Responsive sizing
  const effectiveRadius = responsive ? (isMobile ? mobileRadius : radius) : radius
  const effectiveItemSize = responsive ? (isMobile ? mobileItemSize : itemSize) : itemSize

  // Ensure good spacing for visible items on the arc
  const minGap = Math.max(12, Math.round(effectiveItemSize * 0.3))
  const visibleSteps = Math.max(Math.min(VISIBLE_COUNT, itemCount) - 1, 1)
  // Calculate radius based on arc length needed for proper spacing
  const arcLength = (ARC_SPAN_DEG * Math.PI / 180) * effectiveRadius
  const requiredArcLength = visibleSteps * (effectiveItemSize + minGap)
  const minRadiusForArc = requiredArcLength / (ARC_SPAN_DEG * Math.PI / 180)
  const circleRadius = Math.max(effectiveRadius, minRadiusForArc)

  // Container dimensions for upright arc layout (circle center at bottom-middle)
  const containerWidth = Math.max((circleRadius * 2) + effectiveItemSize, 320)
  const containerHeight = circleRadius + effectiveItemSize + 16 // more space above arc
  const centerX = containerWidth / 2
  const centerY = circleRadius + (effectiveItemSize / 2)
  const arcYOffset = Math.max(10, Math.round(effectiveItemSize * 0.15))

  // Particles via hook
  const { particles, createParticles } = useParticles(enableParticles)
  const wheelRef = useRef(null)


  // Navigation functions
  const navigateLeft = useCallback(() => {
    const newIndex = itemCount === 0 ? 0 : (activeIndex - 1 + itemCount) % itemCount
    setActiveIndex(newIndex)
    triggerHapticFeedback('light')
    createParticles(0, 0, 3, 'blue')
    setShowHint(false)
  }, [activeIndex, itemCount, createParticles])

  const navigateRight = useCallback(() => {
    const newIndex = itemCount === 0 ? 0 : (activeIndex + 1) % itemCount
    setActiveIndex(newIndex)
    triggerHapticFeedback('light')
    createParticles(0, 0, 3, 'blue')
    setShowHint(false)
  }, [activeIndex, itemCount, createParticles])

  // Item positioning for upright arc with fixed visible slots (center at bottom-middle)
  const getItemPosition = useCallback((slotIndex) => {
    if (layoutStyle !== 'semi-circle') {
      return { left: 0, top: 0, angle: 0 }
    }

    // Evenly distribute visible slots across ARC_SPAN_DEG, centered at 0° (top)
    const startAngle = -ARC_SPAN_DEG / 2
    const slots = Math.min(VISIBLE_COUNT, items.length)
    const angleStep = slots > 1 ? ARC_SPAN_DEG / (slots - 1) : 0
    const angle = startAngle + (slotIndex * angleStep)

    // Convert to radians and calculate position on circle whose center is at bottom-middle
    const radian = (angle * Math.PI) / 180
    const centerX = containerWidth / 2
    const baseCenterY = circleRadius + (effectiveItemSize / 2)
    const x = centerX + Math.sin(radian) * circleRadius
    const y = (baseCenterY + arcYOffset) - Math.cos(radian) * circleRadius

    return { left: x, top: y, angle }
  }, [layoutStyle, circleRadius, containerWidth, effectiveItemSize, itemCount])

  // Simple wheel handling for navigation
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    if (e.deltaY > 0) {
      navigateRight()
    } else {
      navigateLeft()
    }
  }, [navigateLeft, navigateRight])

  // Simple drag/touch handling
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, index: activeIndex })
    setShowHint(false)
  }, [activeIndex])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragStart.x
    const threshold = 50 // Minimum drag distance to trigger navigation
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        navigateLeft()
        setDragStart({ x: e.clientX, index: itemCount === 0 ? 0 : (activeIndex - 1 + itemCount) % itemCount })
      } else {
        navigateRight()
        setDragStart({ x: e.clientX, index: itemCount === 0 ? 0 : (activeIndex + 1) % itemCount })
      }
    }
  }, [isDragging, dragStart.x, activeIndex, itemCount, navigateLeft, navigateRight])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch events
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, index: activeIndex })
    setShowHint(false)
  }, [activeIndex])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    e.preventDefault()
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const threshold = 50
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        navigateLeft()
        setDragStart({ x: touch.clientX, index: itemCount === 0 ? 0 : (activeIndex - 1 + itemCount) % itemCount })
      } else {
        navigateRight()
        setDragStart({ x: touch.clientX, index: itemCount === 0 ? 0 : (activeIndex + 1) % itemCount })
      }
    }
  }, [isDragging, dragStart.x, activeIndex, itemCount, navigateLeft, navigateRight])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Event listeners
  useEffect(() => {
    if (isDragging) {
      const events = [
        ['mousemove', handleMouseMove],
        ['mouseup', handleMouseUp],
        ['touchmove', handleTouchMove, { passive: false }],
        ['touchend', handleTouchEnd]
      ]
      
      events.forEach(([event, handler, options]) => 
        document.addEventListener(event, handler, options)
      )
      
      return () => {
        events.forEach(([event, handler]) => 
          document.removeEventListener(event, handler)
        )
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (itemCount === 0) return
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          navigateLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          navigateRight()
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          const currentItem = items?.[activeIndex]
          if (currentItem && onItemSelect) {
            triggerHapticFeedback('medium')
            createParticles(0, 0, 4, 'emerald')
            onItemSelect(currentItem, activeIndex)
          }
          break
        default:
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigateLeft, navigateRight, activeIndex, items, onItemSelect, createParticles, itemCount])

  // Upright-arc item renderer for a 5-slot carousel
  const renderNavItem = (item, itemIndex, slot) => {
    if (!item) return null
    const { left, top } = getItemPosition(slot)
    const isActive = itemIndex === activeIndex
    const isCurrentPath = currentPath === item.to
    const Icon = item.icon || (() => null)

    return (
      <motion.div
        key={`${item.to}-${itemIndex}`}
        className="absolute cursor-pointer flex items-center justify-center"
        style={{
          transform: 'translate(-50%, -50%)',
          width: `${effectiveItemSize}px`,
          height: `${effectiveItemSize}px`,
          zIndex: isActive ? 20 : 10,
        }}
        initial={{ left, top }}
        animate={{ 
          left,
          top,
          scale: isActive ? 1.2 : 1,
          opacity: 1,
          y: isActive ? [0, -2, 0] : 0,
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20,
          y: isActive ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          } : undefined
        }}
        whileHover={{ 
          scale: isActive ? 1.25 : 1.1,
        }}
        onMouseEnter={() => {
          setHoveredItem(itemIndex)
          if (!isActive) {
            createParticles(0, 0, 2, 'slate')
          }
        }}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => {
          createParticles(0, 0, isActive ? 4 : 2, 'emerald')
          if (!isActive) {
            setActiveIndex(itemIndex)
          } else if (onItemSelect) {
            onItemSelect(item, itemIndex)
          }
        }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <NavLink
          to={item.to ?? '#'}
          className={({ isActive: linkActive }) => `
            relative flex items-center justify-center rounded-full transition-all duration-300
            shadow-lg hover:shadow-xl border-2 backdrop-blur-sm w-full h-full
            focus:outline-none focus:ring-2 focus:ring-emerald-400/60
            ${isActive
              ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white border-emerald-300 shadow-emerald-400/40' 
              : linkActive || isCurrentPath
                ? 'bg-gradient-to-br from-white/95 via-emerald-50/90 to-white/95 dark:from-slate-700/95 dark:via-slate-600/90 dark:to-slate-700/95 text-emerald-600 dark:text-emerald-300 border-emerald-400/80 dark:border-emerald-500/80'
                : 'bg-white/85 dark:bg-slate-600/85 text-slate-700 dark:text-slate-100 border-slate-300/60 dark:border-slate-500/60 hover:border-emerald-400/70 dark:hover:border-emerald-500/70'
            }
            hover:scale-105 active:scale-95
          `}
          onClick={(e) => {
            if (!isActive && onItemSelect) {
              e.preventDefault()
              onItemSelect(item, itemIndex)
            }
          }}
          aria-label={item.label}
        >
          {/* Icon with consistent sizing */}
          <Icon className={`${isActive ? 'w-6 h-6' : 'w-5 h-5'} ${isActive ? 'text-white' : 'text-current'} transition-all duration-200 flex-shrink-0`} />
          
          {/* Active pulse effect */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-emerald-300"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          
          {/* Tooltip for non-active items */}
          <AnimatePresence>
            {(hoveredItem === itemIndex && !isActive) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute left-1/2 transform -translate-x-1/2 
                          px-2 py-1 bg-slate-900/95 text-white text-xs font-medium rounded-lg
                          whitespace-nowrap pointer-events-none z-30 shadow-xl border border-emerald-400/30 backdrop-blur-sm"
                style={{
                  top: `${effectiveItemSize/2 + 8}px`,
                }}
              >
                {item.label}
              </motion.div>
            )}
          </AnimatePresence>
        </NavLink>
      </motion.div>
    )
  }
  
  // Loading skeleton
  if (itemCount === 0) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div
          className="relative rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"
          style={{ width: effectiveRadius * 2, height: effectiveRadius }}
        />
        <div className="mt-4 h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`relative mx-auto flex flex-col items-center ${className}`} 
         style={{ width: containerWidth, height: containerHeight }}>
      
      {/* Navigation hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="flex items-center space-x-2 bg-slate-900/90 text-slate-100 px-3 py-2 rounded-lg text-sm backdrop-blur-sm border border-slate-700">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Drag or scroll to navigate</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle System */}
      <AnimatePresence>
        {particles.map(particle => (
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

      {/* Main semi-circle container */}
      <div className="relative flex items-center justify-center" style={{ width: containerWidth, height: containerHeight }}>
        <motion.div 
          ref={wheelRef}
          className="relative select-none cursor-grab active:cursor-grabbing focus:outline-none"
          style={{ 
            width: containerWidth,
            height: containerHeight,
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          tabIndex={0}
          role="navigation"
          aria-label="Semi-circle navigation wheel"
        >
          {/* Upright arc guide matching the visible arc span */}
          <svg className="absolute inset-0 pointer-events-none z-[1]" 
               width={containerWidth} 
               height={containerHeight} 
               viewBox={`0 0 ${containerWidth} ${containerHeight}`}>
            <motion.path
              d={(() => {
                const startRad = (-ARC_SPAN_DEG / 2) * Math.PI / 180
                const endRad = (ARC_SPAN_DEG / 2) * Math.PI / 180
                const x1 = centerX + Math.sin(startRad) * circleRadius
                const y1 = (centerY + arcYOffset) - Math.cos(startRad) * circleRadius
                const x2 = centerX + Math.sin(endRad) * circleRadius
                const y2 = (centerY + arcYOffset) - Math.cos(endRad) * circleRadius
                return `M ${x1} ${y1} A ${circleRadius} ${circleRadius} 0 0 1 ${x2} ${y2}`
              })()}
              fill="none"
              stroke="rgba(16,185,129,0.15)"
              strokeWidth={1}
              strokeDasharray="4 8"
              animate={{ strokeDashoffset: [0, -24] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          </svg>

          {/* Center hub for semi-circle */}
          <motion.div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-[5]"
          >
            {/* Main center orb */}
            <motion.div
              className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-lg"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 8px rgba(16,185,129,0.4)',
                  '0 0 15px rgba(16,185,129,0.6)',
                  '0 0 8px rgba(16,185,129,0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ 
                width: 12, 
                height: 12 
              }}
            />
          </motion.div>
          
          {/* Navigation items (5 visible, upright arc) */}
          <AnimatePresence initial={false}>
            {Array.from({ length: Math.min(VISIBLE_COUNT, itemCount) }, (_, slot) => {
              const itemIndex = itemCount === 0 
                ? 0 
                : (activeIndex - Math.floor(VISIBLE_COUNT / 2) + slot + itemCount) % itemCount
              return renderNavItem(items[itemIndex], itemIndex, slot)
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom section with current item and controls */}
      <div className="flex flex-col items-center justify-center w-full mt-4">
        {/* Current page display */}
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-lg font-bold text-white drop-shadow-lg mb-3 text-center"
          style={{
            textShadow: '0 0 15px rgba(16,185,129,0.5), 0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {items?.[activeIndex]?.label}
        </motion.div>
          
        {/* Progress dots aligned with semi-circle */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          {items?.map((_, index) => {
            const isActive = index === activeIndex
            return (
              <motion.button
                key={index}
                className={`rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-xl shadow-emerald-400/50 border-2 border-white/60' 
                    : 'bg-slate-400/50 hover:bg-emerald-400/70 border-2 border-slate-300/40 hover:border-emerald-300/60'
                }`}
                style={{
                  width: isActive ? '12px' : '8px',
                  height: isActive ? '12px' : '8px',
                }}
                animate={{
                  scale: isActive ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to ${items[index]?.label}`}
              />
            )
          })}
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center space-x-6 mt-2">
          <motion.button
            onClick={navigateLeft}
            disabled={false}
            className="p-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-400/15 
                     border-2 border-emerald-400/40 hover:border-emerald-300/60
                     shadow-lg hover:shadow-xl backdrop-blur-md
                     transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous item"
          >
            <ChevronLeft className="w-5 h-5 text-emerald-300" />
          </motion.button>
          
          <motion.button
            onClick={navigateRight}
            disabled={false}
            className="p-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-400/15 
                     border-2 border-emerald-400/40 hover:border-emerald-300/60
                     shadow-lg hover:shadow-xl backdrop-blur-md
                     transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Next item"
          >
            <ChevronRight className="w-5 h-5 text-emerald-300" />
          </motion.button>
        </div>
        
        {/* Keyboard hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center space-x-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-emerald-400/20"
        >
          <kbd className="px-2 py-1 bg-emerald-500/60 text-white rounded text-xs font-bold">←</kbd>
          <kbd className="px-2 py-1 bg-emerald-500/60 text-white rounded text-xs font-bold">→</kbd>
          <span className="text-xs text-slate-300 font-medium">or drag to navigate</span>
        </motion.div>
      </div>
    </div>
  )
}

// New Arc Carousel (rewritten from scratch)
const ArcCarouselNav = ({
  items = [],
  currentPath = '/',
  onItemSelect,
  className = '',
  // geometry
  radius = 96,
  itemSize = 44,
  arcSpan = 150,
  visibleCount = 5,
  // responsive
  responsive = true,
  mobileRadius = 76,
  mobileItemSize = 40,
}) => {
  // Single source of truth for carousel state
  const [arcState, setArcState] = useState({ currentAngle: 0, activeIndex: 0, shiftDir: 0 })

  // Responsive sizing
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const count = Array.isArray(items) ? items.length : 0
  if (count === 0) {
    return (
      <div className={`relative mx-auto flex flex-col items-center ${className}`} style={{ width: radius * 2 + itemSize, height: radius + itemSize + 56 }}>
        <div className="w-40 h-20 rounded-2xl bg-slate-700/30 animate-pulse" />
      </div>
    )
  }

  // Ensure exactly 5 visible slots
  const VISIBLE = 5

  const R = responsive ? (isMobile ? mobileRadius : radius) : radius
  const S = responsive ? (isMobile ? mobileItemSize : itemSize) : itemSize
  const width = Math.max((R * 2) + S, 320)
  const height = R + S + 56 + 18
  const centerX = width / 2
  const centerY = R + (S / 2) + 10

  // Arc geometry (upright arc centered at top, using polar coords)
  const arcSpanRad = (arcSpan * Math.PI) / 180
  const startAngle = (Math.PI / 2) - arcSpanRad / 2 // left-most (upright)
  const stepAngle = arcSpanRad / (VISIBLE - 1)
  const centerSlot = Math.floor((VISIBLE - 1) / 2) // 2

  const wrap = (n, m) => ((n % m) + m) % m

  // Position for a given slot, with the global currentAngle applied
  const slotAngle = (slot) => startAngle + slot * stepAngle
  const slotPosition = (slot) => {
    const theta = slotAngle(slot)
    const x = centerX + R * Math.cos(theta)
    const y = centerY - R * Math.sin(theta)
    return { x, y }
  }

  // Navigation (callback form updates)
  // Smooth shift: animate angle, then commit index update when animation finishes
  const commitAfter = 260 // ms; matches spring feel
  const next = useCallback(() => {
    setArcState(prev => ({ ...prev, shiftDir: 1 }))
    setTimeout(() => {
      setArcState(prev => ({ ...prev, shiftDir: 0, activeIndex: wrap(prev.activeIndex + 1, count) }))
    }, commitAfter)
  }, [count])
  const prev = useCallback(() => {
    setArcState(prev => ({ ...prev, shiftDir: -1 }))
    setTimeout(() => {
      setArcState(prev => ({ ...prev, shiftDir: 0, activeIndex: wrap(prev.activeIndex - 1, count) }))
    }, commitAfter)
  }, [count])

  // Wheel (optional): small throttle to avoid spam
  const lastWheel = useRef(0)
  const onWheel = (e) => {
    e.preventDefault()
    const now = performance.now()
    if (now - lastWheel.current < 50) return
    lastWheel.current = now
    if (e.deltaY > 0) next(); else prev()
  }

  // Keyboard arrows support
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [prev, next])

  // Render
  return (
    <div className={`relative mx-auto select-none ${className}`} style={{ width, height }}
         onWheel={onWheel}
         role="navigation" aria-label="Arc carousel navigation">

      {/* Arc guide */}
      <svg className="absolute inset-0 pointer-events-none" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path
          d={`M ${centerX + R * Math.cos(startAngle)} ${centerY - R * Math.sin(startAngle)}
              A ${R} ${R} 0 0 1 ${centerX + R * Math.cos(startAngle + arcSpanRad)} ${centerY - R * Math.sin(startAngle + arcSpanRad)}`}
          fill="none"
          stroke="rgba(16,185,129,0.25)"
          strokeWidth="1.5"
          strokeDasharray="6 10"
        />
      </svg>

      {/* 5 visible items */}
      <AnimatePresence initial={false}>
        {Array.from({ length: VISIBLE }, (_, slot) => {
          const itemIndex = wrap(arcState.activeIndex - centerSlot + slot, count)
          const item = items[itemIndex]
          const distance = Math.abs(slot - centerSlot)
          const scale = distance === 0 ? 1.15 : distance === 1 ? 1.03 : 0.9
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.65 : 0.45
          const Icon = item?.icon || (() => null)
          const isActive = itemIndex === arcState.activeIndex
          const isCurrentPath = currentPath === item?.to

          // Build arc keyframes so movement follows the arc, not a straight chord
          const samples = 7
          const xs = []
          const ys = []
          const startTheta = slotAngle(slot)
          const endSlot = Math.max(0, Math.min(VISIBLE - 1, slot - (arcState.shiftDir || 0)))
          const endTheta = slotAngle(endSlot)
          for (let i = 0; i < samples; i++) {
            const t = i / (samples - 1)
            const theta = startTheta + (endTheta - startTheta) * t
            xs.push(centerX + R * Math.cos(theta) - S/2)
            ys.push(centerY - R * Math.sin(theta) - S/2)
          }

          return (
            <motion.div
              key={`${item?.to}-${itemIndex}`}
              className="absolute cursor-pointer flex items-center justify-center"
              style={{ width: S, height: S }}
              initial={{ x: xs[0], y: ys[0], scale: 0.9, opacity: 0 }}
              animate={{ x: xs, y: ys, scale, opacity }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={() => {
                if (isActive) onItemSelect?.(item, itemIndex)
                else setArcState(prev => ({ ...prev, activeIndex: itemIndex }))
              }}
            >
              <div className={`relative rounded-full border-2 backdrop-blur-sm shadow-lg flex items-center justify-center w-full h-full transition-all duration-300
                ${isActive ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-300 text-white' :
                  isCurrentPath ? 'bg-emerald-50/80 dark:bg-slate-600/80 text-emerald-500 border-emerald-300/70' :
                  'bg-white/80 dark:bg-slate-600/80 text-slate-100 border-slate-400/50'}
              `}>
                <Icon className={`${isActive ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300`} />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Selection label only (no buttons) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full bg-slate-900/70 border border-emerald-400/30 text-emerald-200 text-sm font-semibold min-w-[120px] text-center">
          {items[arcState.activeIndex]?.label}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center gap-2">
        {items.map((_, i) => (
          <button key={i} onClick={() => setArcState(prev => ({ ...prev, activeIndex: i }))} aria-label={`Go to ${items[i]?.label}`}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${i===arcState.activeIndex ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-slate-500/60 hover:bg-emerald-300/70'}`} />
        ))}
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
  componentDidCatch(error, info) {
    // Log to console for easier debugging in development
    try { console.error('CircularNavWheel error:', error, info) } catch {}
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
    <ArcCarouselNav {...props} />
  </CircularNavErrorBoundary>
)

export { ArcCarouselNav as CircularNavWheel }
export default CircularNavWheelWithBoundary
