import { animationManager } from '../manager'

export function registerSVGDrawPresets() {
  animationManager.register('svgDraw', () => ({
    duration: 1200,
    easing: 'easeInOutSine',
  }))
}
