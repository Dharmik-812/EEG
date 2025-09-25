import { animationManager } from '../manager'

export function registerScrollRevealPresets() {
  animationManager.register('scrollReveal', () => ({
    base: { y: 24, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
  }))

  animationManager.register('parallax', () => ({
    // For GSAP setup hook consumption
    factor: 0.2,
  }))
}
