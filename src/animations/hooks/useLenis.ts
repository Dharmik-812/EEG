import { useEffect, useRef } from 'react'
import { shouldReduceMotion } from '../manager'
import { loadLenis, loadScrollTrigger, loadGSAP } from '../lazy'

export function useLenis({ smooth = true, enabled = true } = {}) {
  const lenisRef = useRef<any>(null)

  useEffect(() => {
    let active = true
    let rafId: number
    
    // Don't initialize if disabled, not smooth, or reduced motion
    if (!enabled || !smooth || shouldReduceMotion()) return

    ;(async () => {
      const Lenis = await loadLenis()
      if (!Lenis || !active) return
      
      const lenis = new (Lenis as any)({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
        infinite: false,
      })
      lenisRef.current = lenis

      // Tie GSAP ScrollTrigger to Lenis
      const gsap = await loadGSAP()
      const pair = await loadScrollTrigger(gsap as any)
      
      function raf(time: number) {
        if (!active) return
        lenis.raf(time)
        if (pair?.ScrollTrigger?.update) pair.ScrollTrigger.update()
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    })()

    return () => {
      active = false
      if (rafId) cancelAnimationFrame(rafId)
      try { 
        if (lenisRef.current?.destroy) {
          lenisRef.current.destroy()
        }
      } catch {}
      lenisRef.current = null
    }
  }, [smooth, enabled])

  return lenisRef
}
