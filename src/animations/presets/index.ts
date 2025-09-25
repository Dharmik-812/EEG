import { registerFadePresets } from './fade'
import { registerHeroPresets } from './hero'
import { registerScrollRevealPresets } from './scrollReveal'
import { registerRouteTransitionPresets } from './routeTransitions'
import { registerUIMicroPresets } from './uiMicro'
import { registerSVGDrawPresets } from './svgDraw'
import { registerAdvancedTransitionPresets } from './advancedTransitions'

export function registerAllPresets() {
  registerFadePresets()
  registerHeroPresets()
  registerScrollRevealPresets()
  registerRouteTransitionPresets()
  registerUIMicroPresets()
  registerSVGDrawPresets()
  registerAdvancedTransitionPresets()
}
