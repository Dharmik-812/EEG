// Central animation tokens and registry
// Lightweight TS only for developer ergonomics; no runtime types needed.

export type Easing = 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | [number, number, number, number]

export type Tokens = {
  durations: {
    xs: number
    sm: number
    md: number
    lg: number
  }
  easings: {
    standard: Easing
    entrance: Easing
    exit: Easing
    spring: {
      stiffness: number
      damping: number
      mass: number
    }
  }
}

export type Preset = (opts?: { reduced?: boolean }) => any

class AnimationManager {
  tokens: Tokens
  private registry: Map<string, Preset>

  constructor() {
    this.tokens = {
      durations: { xs: 0.15, sm: 0.35, md: 0.6, lg: 0.9 },
      easings: {
        standard: [0.22, 1, 0.36, 1],
        entrance: [0.16, 1, 0.3, 1],
        exit: [0.7, 0, 0.84, 0],
        spring: { stiffness: 220, damping: 26, mass: 1 },
      },
    }
    this.registry = new Map()
  }

  register(name: string, preset: Preset) {
    this.registry.set(name, preset)
  }

  get(name: string): Preset | undefined {
    return this.registry.get(name)
  }
}

export const animationManager = new AnimationManager()

// Helper to respect reduced motion consistently
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const explicit = localStorage.getItem('avs-reduced-motion')
    if (explicit === 'true') return true
    if (explicit === 'false') return false
  } catch {}
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// requestIdleCallback polyfill
export const ric: (cb: () => void) => void = (cb) => {
  if (typeof window === 'undefined') return cb()
  const anyWin: any = window as any
  if (anyWin.requestIdleCallback) anyWin.requestIdleCallback(cb)
  else setTimeout(cb, 1)
}
