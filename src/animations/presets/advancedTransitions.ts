import { animationManager } from '../manager'

export function registerAdvancedTransitionPresets() {
  // Enhanced route transitions with different effects per route
  animationManager.register('route.zoom', ({ reduced } = {}) => {
    if (reduced) return {
      initial: { opacity: 1, scale: 1 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 1, scale: 1 },
    }
    return {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      exit: { opacity: 0, scale: 1.05, transition: { duration: 0.4 } },
    }
  })

  animationManager.register('route.slideUp', ({ reduced } = {}) => {
    if (reduced) return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 1, y: 0 },
    }
    return {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
      exit: { opacity: 0, y: -30, transition: { duration: 0.4 } },
    }
  })

  animationManager.register('route.slideLeft', ({ reduced } = {}) => {
    if (reduced) return {
      initial: { opacity: 1, x: 0 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 1, x: 0 },
    }
    return {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
      exit: { opacity: 0, x: -50, transition: { duration: 0.5 } },
    }
  })

  // Stagger container for complex layouts
  animationManager.register('stagger.dramatic', ({ reduced } = {}) => {
    const base = reduced ? {} : { staggerChildren: 0.12, delayChildren: 0.2 }
    return {
      container: {
        initial: { opacity: reduced ? 1 : 0 },
        animate: { opacity: 1, transition: base },
      },
      item: {
        initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 80, scale: reduced ? 1 : 0.8 },
        animate: { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          transition: { 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1] 
          } 
        },
      },
    }
  })
}