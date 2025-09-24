import { animationManager } from '../manager'

export function registerRouteTransitionPresets() {
  animationManager.register('route.transition', ({ reduced } = {}) => {
    if (reduced) return {
      initial: { opacity: 1, y: 0, scale: 1 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 1, y: 0, scale: 1 },
    }
    return {
      initial: { opacity: 0, y: 24, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      exit: { opacity: 0, y: -16, scale: 0.98, transition: { duration: 0.35 } },
    }
  })
}
