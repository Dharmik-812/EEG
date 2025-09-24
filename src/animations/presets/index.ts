import { registerFadePresets } from './fade'
import { registerHeroPresets } from './hero'
import { registerScrollRevealPresets } from './scrollReveal'
import { registerRouteTransitionPresets } from './routeTransitions'
import { registerUIMicroPresets } from './uiMicro'
import { registerSVGDrawPresets } from './svgDraw'

export function registerAllPresets() {
  registerFadePresets()
  registerHeroPresets()
  registerScrollRevealPresets()
  registerRouteTransitionPresets()
  registerUIMicroPresets()
  registerSVGDrawPresets()
}
