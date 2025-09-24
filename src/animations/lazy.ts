// Dynamic imports for heavy libs + plugin wiring
import { ric, shouldReduceMotion } from './manager'

export async function loadGSAP() {
  if (typeof window === 'undefined' || shouldReduceMotion()) return null
  return new Promise((resolve) =>
    ric(async () => {
      const mod = await import('gsap')
      return resolve(mod.gsap || mod.default || mod)
    })
  )
}

export async function loadScrollTrigger(gsap?: any) {
  if (typeof window === 'undefined' || shouldReduceMotion()) return null
  return new Promise((resolve) =>
    ric(async () => {
      const base = gsap || (await loadGSAP())
      if (!base) return resolve(null)
      const stMod = await import('gsap/ScrollTrigger')
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default || stMod
      if (!base.core.globals().ScrollTrigger) base.registerPlugin(ScrollTrigger)
      resolve({ gsap: base, ScrollTrigger })
    })
  )
}

export async function loadAnime() {
  if (typeof window === 'undefined' || shouldReduceMotion()) return null
  return new Promise((resolve) =>
    ric(async () => {
      try {
        const mod = await import('animejs')
        resolve((mod as any).default || mod)
      } catch {
        resolve(null)
      }
    })
  )
}

export async function loadLenis() {
  if (typeof window === 'undefined' || shouldReduceMotion()) return null
  return new Promise((resolve) =>
    ric(async () => {
      try {
        const mod = await import('@studio-freight/lenis')
        const LenisCtor: any = (mod as any).Lenis || (mod as any).default || mod
        resolve(LenisCtor)
      } catch {
        resolve(null)
      }
    })
  )
}
