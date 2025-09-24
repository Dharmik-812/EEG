import { useEffect, useRef, useState } from 'react'

/**
 * Hook for scroll-triggered animations
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @param {boolean} options.triggerOnce - Whether to trigger animation only once
 * @returns {Array} [ref, inView, hasAnimated] - ref to attach to element, current visibility state, has animated flag
 */
export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.3,
    rootMargin = '0px',
    triggerOnce = true
  } = options

  const [inView, setInView] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting
        setInView(isIntersecting)
        
        if (isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          
          // Add animation classes
          element.classList.add('scroll-fade-in', 'visible')
          
          // Trigger custom event for additional animations
          const animationEvent = new CustomEvent('scrollAnimation', {
            detail: { element, entry }
          })
          element.dispatchEvent(animationEvent)
        }
        
        if (!triggerOnce && !isIntersecting && hasAnimated) {
          element.classList.remove('visible')
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, hasAnimated])

  return [ref, inView, hasAnimated]
}

/**
 * Hook for staggered scroll animations on multiple elements
 * @param {number} itemCount - Number of items to animate
 * @param {Object} options - Configuration options
 * @returns {Array} refs - Array of refs to attach to elements
 */
export function useStaggeredAnimation(itemCount, options = {}) {
  const {
    staggerDelay = 100,
    threshold = 0.2,
    rootMargin = '0px'
  } = options

  const refs = useRef([])
  const [triggered, setTriggered] = useState(false)

  // Initialize refs array
  useEffect(() => {
    refs.current = Array(itemCount).fill().map((_, i) => refs.current[i] || { current: null })
  }, [itemCount])

  useEffect(() => {
    if (triggered) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggered) {
            setTriggered(true)
            
            // Stagger the animations
            refs.current.forEach((ref, index) => {
              if (ref.current) {
                setTimeout(() => {
                  ref.current.classList.add('list-item-slide')
                }, index * staggerDelay)
              }
            })
          }
        })
      },
      { threshold, rootMargin }
    )

    // Observe the first element as trigger
    if (refs.current[0]?.current) {
      observer.observe(refs.current[0].current)
    }

    return () => observer.disconnect()
  }, [staggerDelay, threshold, rootMargin, triggered])

  return refs.current
}

/**
 * Hook for parallax scroll effects
 * @param {Object} options - Configuration options
 * @returns {Object} style object for parallax effect
 */
export function useParallax(options = {}) {
  const {
    speed = 0.5,
    direction = 'vertical'
  } = options

  const [offset, setOffset] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      
      const rect = ref.current.getBoundingClientRect()
      const scrolled = window.pageYOffset
      const rate = scrolled * speed
      
      if (direction === 'vertical') {
        setOffset(rate)
      } else {
        setOffset(rate)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed, direction])

  const style = {
    transform: direction === 'vertical' 
      ? `translateY(${offset}px)` 
      : `translateX(${offset}px)`
  }

  return [ref, style]
}

/**
 * Hook for mouse-based animations
 * @param {Object} options - Configuration options
 * @returns {Object} Mouse position and handlers
 */
export function useMouseAnimation(options = {}) {
  const {
    scale = 1.05,
    rotation = 5,
    dampening = 0.1
  } = options

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * dampening
    const y = (e.clientY - rect.top - rect.height / 2) * dampening
    
    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition({ x: 0, y: 0 })
  }

  const style = isHovered ? {
    transform: `
      translateX(${mousePosition.x}px) 
      translateY(${mousePosition.y}px) 
      scale(${scale}) 
      rotateX(${mousePosition.y * rotation}deg) 
      rotateY(${mousePosition.x * rotation}deg)
    `,
    transition: 'transform 0.1s ease-out'
  } : {
    transform: 'translateX(0) translateY(0) scale(1) rotateX(0) rotateY(0)',
    transition: 'transform 0.3s ease-out'
  }

  return {
    ref,
    style,
    mousePosition,
    isHovered,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  }
}

/**
 * Hook for typing animation effect
 * @param {string} text - Text to animate
 * @param {Object} options - Configuration options
 * @returns {string} Current displayed text
 */
export function useTypingAnimation(text, options = {}) {
  const {
    speed = 50,
    delay = 0,
    loop = false,
    deleteSpeed = 30,
    deleteDelay = 1000
  } = options

  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let timeout

    const animate = () => {
      if (!isDeleting) {
        // Typing phase
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1))
          setCurrentIndex(prev => prev + 1)
          timeout = setTimeout(animate, speed)
        } else if (loop) {
          // Start deleting after delay
          timeout = setTimeout(() => {
            setIsDeleting(true)
            animate()
          }, deleteDelay)
        }
      } else {
        // Deleting phase
        if (currentIndex > 0) {
          setDisplayText(text.slice(0, currentIndex - 1))
          setCurrentIndex(prev => prev - 1)
          timeout = setTimeout(animate, deleteSpeed)
        } else {
          // Start typing again
          setIsDeleting(false)
          timeout = setTimeout(animate, delay)
        }
      }
    }

    timeout = setTimeout(animate, delay)
    
    return () => clearTimeout(timeout)
  }, [text, speed, delay, loop, deleteSpeed, deleteDelay, currentIndex, isDeleting])

  return displayText
}

/**
 * Hook for count-up animation
 * @param {number} end - End number
 * @param {Object} options - Configuration options
 * @returns {number} Current count value
 */
export function useCountUp(end, options = {}) {
  const {
    duration = 2000,
    delay = 0,
    easing = 'easeOutQuart',
    decimals = 0,
    onComplete
  } = options

  const [count, setCount] = useState(0)
  const [isActive, setIsActive] = useState(false)

  // Easing functions
  const easingFunctions = {
    linear: t => t,
    easeOutQuart: t => 1 - Math.pow(1 - t, 4),
    easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
  }

  useEffect(() => {
    let startTime = null
    let animationFrame = null

    const animate = (currentTime) => {
      if (startTime === null) {
        startTime = currentTime
      }

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easingFunctions[easing] ? easingFunctions[easing](progress) : progress
      
      const currentCount = easedProgress * end
      setCount(Number(currentCount.toFixed(decimals)))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    if (isActive) {
      const timeout = setTimeout(() => {
        animationFrame = requestAnimationFrame(animate)
      }, delay)

      return () => {
        clearTimeout(timeout)
        if (animationFrame) {
          cancelAnimationFrame(animationFrame)
        }
      }
    }
  }, [end, duration, delay, easing, decimals, onComplete, isActive])

  const start = () => setIsActive(true)
  const reset = () => {
    setIsActive(false)
    setCount(0)
  }

  return { count, start, reset, isActive }
}