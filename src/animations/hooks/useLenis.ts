import { useEffect, useRef } from 'react'
import { shouldReduceMotion } from '../manager'
import { loadLenis, loadScrollTrigger, loadGSAP } from '../lazy'

export function useLenis({ smooth = true } = {}) {
  const lenisRef = useRef<any>(null)

  useEffect(() => {
    let active = true
    if (!smooth || shouldReduceMotion()) return

    ;(async () => {
      const Lenis = await loadLenis()
      if (!Lenis || !active) return
      const lenis = new (Lenis as any)({
        duration: 1.1,
        smoothWheel: true,
        smoothTouch: false,
      })
      lenisRef.current = lenis

      // Tie GSAP ScrollTrigger to Lenis
      const gsap = await loadGSAP()
      const pair = await loadScrollTrigger(gsap as any)
      if (pair) {
        const { ScrollTrigger } = pair
        function raf(time: number) {
          lenis.raf(time)
          requestAnimationFrame(raf)
          if (ScrollTrigger?.update) ScrollTrigger.update()
        }
        requestAnimationFrame(raf)
      }
    })()

    return () => {
      active = false
      try { lenisRef.current?.destroy?.() } catch {}
      lenisRef.current = null
    }
  }, [smooth])

  return lenisRef
}
