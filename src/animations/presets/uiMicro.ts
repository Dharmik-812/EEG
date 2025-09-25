import { animationManager } from '../manager'

export function registerUIMicroPresets() {
  animationManager.register('buttonMicro', ({ reduced } = {}) => {
    return {
      whileHover: reduced ? {} : { scale: 1.03 },
      whileTap: reduced ? {} : { scale: 0.98 },
      transition: { type: 'spring', stiffness: 280, damping: 18 },
    }
  })

  animationManager.register('modalInOut', ({ reduced } = {}) => {
    if (reduced) return {
      initial: { opacity: 1, scale: 1 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 1, scale: 1 },
    }
    return {
      initial: { opacity: 0, scale: 0.96, y: 12 },
      animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35 } },
      exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.25 } },
    }
  })
}
