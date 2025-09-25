import { useEffect, useRef } from 'react'
import { shouldReduceMotion } from '../manager'
import { loadLenis, loadScrollTrigger, loadGSAP } from '../lazy'

export function useLenis({ smooth = true, enabled = true } = {}) {
  const lenisRef = useRef<any>(null)

  useEffect(() => {
    let active = true
    let rafId: number
    let scrollTimeout: NodeJS.Timeout
    let stuckCheckInterval: NodeJS.Timeout
    let handleWheel: (e: WheelEvent) => void
    
    // Don't initialize if disabled, not smooth, or reduced motion
    if (!enabled || !smooth || shouldReduceMotion()) return

    ;(async () => {
      const Lenis = await loadLenis()
      if (!Lenis || !active) return
      
      const lenis = new (Lenis as any)({
        duration: 0.8, // Faster for better responsiveness
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing for natural feel
        smoothWheel: true,
        smoothTouch: false,
        infinite: false,
        wheelMultiplier: 1.5, // More responsive scrolling
        touchMultiplier: 1.8,
        autoRaf: false, // We handle RAF manually for better performance
        normalizeWheel: true, // Better cross-browser wheel handling
        syncTouch: true, // Better touch scrolling
        gestureDirection: 'vertical' // Focus on vertical scrolling
      })
      lenisRef.current = lenis
      
      // Add scroll recovery mechanism to prevent getting stuck
      let lastScrollY = 0
      
      const checkScrollStuck = () => {
        const currentScrollY = window.scrollY
        if (Math.abs(currentScrollY - lastScrollY) < 1) {
          // If scroll hasn't moved much, force a small nudge
          lenis.scrollTo(currentScrollY + 0.1, { immediate: false })
        }
        lastScrollY = currentScrollY
      }
      
      // Monitor for stuck scrolling every few seconds
      stuckCheckInterval = setInterval(checkScrollStuck, 3000)
      
      // Add wheel event listener as fallback
      handleWheel = (e: WheelEvent) => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          if (lenis && typeof lenis.stop === 'function' && typeof lenis.start === 'function') {
            // Reset Lenis if it seems stuck
            lenis.stop()
            requestAnimationFrame(() => lenis.start())
          }
        }, 100)
      }
      
      window.addEventListener('wheel', handleWheel, { passive: true })

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
      if (scrollTimeout) clearTimeout(scrollTimeout)
      if (stuckCheckInterval) clearInterval(stuckCheckInterval)
      window.removeEventListener('wheel', handleWheel)
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
