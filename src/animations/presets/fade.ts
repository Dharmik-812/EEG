import { animationManager } from '../manager'

export function registerFadePresets() {
  animationManager.register('fadeInUp', ({ reduced } = {}) => {
    if (reduced) return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 1, y: 0 },
      transition: { duration: 0 }
    }
    return {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
    }
  })

  animationManager.register('staggerGrid', ({ reduced } = {}) => {
    const base = reduced ? {} : { staggerChildren: 0.08, delayChildren: 0.08 }
    return {
      container: {
        initial: { opacity: reduced ? 1 : 0 },
        animate: { opacity: 1, transition: base },
      },
      item: {
        initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      },
    }
  })
}
