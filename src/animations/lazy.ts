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
        // animejs v4 can export in different ways:
        // - { default: { anime: function } }
        // - { anime: function }
        // - { default: function } (older versions)
        let animeFn = null
        
        // Try direct default export
        if (mod && typeof (mod as any).default === 'function') {
          animeFn = (mod as any).default
        }
        // Try .anime property on default
        else if (mod && (mod as any).default && typeof (mod as any).default.anime === 'function') {
          animeFn = (mod as any).default.anime
        }
        // Try .anime property on module
        else if (mod && typeof (mod as any).anime === 'function') {
          animeFn = (mod as any).anime
        }
        // Try direct function export
        else if (mod && typeof mod === 'function') {
          animeFn = mod
        }
        
        if (animeFn && typeof animeFn === 'function') {
          resolve(animeFn)
        } else {
          console.warn('animejs loaded but anime function not found in export:', mod)
          resolve(null)
        }
      } catch (err) {
        console.warn('Failed to load animejs:', err)
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
