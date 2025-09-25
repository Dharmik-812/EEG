import { animationManager } from '../manager'

export function registerHeroPresets() {
  animationManager.register('heroEntrance', ({ reduced } = {}) => {
    if (reduced) return {
      image: { initial: { opacity: 1 }, animate: { opacity: 1 } },
      heading: { initial: { opacity: 1 }, animate: { opacity: 1 } },
      sub: { initial: { opacity: 1 }, animate: { opacity: 1 } },
    }

    return {
      image: {
        initial: { opacity: 0, scale: 0.98, y: 12 },
        animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
      },
      heading: {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
      },
      sub: {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 } },
      },
    }
  })
}
