import { useEffect, useRef } from 'react'
import { shouldReduceMotion } from '../manager'
import { loadGSAP, loadScrollTrigger } from '../lazy'

export function useGSAP(setup: (gsap: any, ScrollTrigger?: any) => void | (() => void), deps: any[] = []) {
  const cleanupRef = useRef<null | (() => void)>(null)
  useEffect(() => {
    let active = true
    if (shouldReduceMotion()) return
    ;(async () => {
      const gsap = await loadGSAP()
      const pair = await loadScrollTrigger(gsap as any)
      if (!gsap || !pair || !active) return
      const maybeCleanup = setup(gsap, pair.ScrollTrigger)
      if (typeof maybeCleanup === 'function') cleanupRef.current = maybeCleanup
    })()
    return () => {
      active = false
      if (cleanupRef.current) {
        try { cleanupRef.current() } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function useScrollReveal(selector: string | string[], options?: { y?: number; duration?: number; stagger?: number; once?: boolean; start?: string; end?: string; scrub?: boolean }) {
  useGSAP((gsap, ScrollTrigger) => {
    const sels = Array.isArray(selector) ? selector : [selector]
    const y = options?.y ?? 24
    const duration = options?.duration ?? 0.8
    const stagger = options?.stagger ?? 0.1

    const elements = sels.flatMap((sel) => Array.from(document.querySelectorAll<HTMLElement>(sel)))
    elements.forEach((el, i) => {
      gsap.set(el, { opacity: 0, y })
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration,
        ease: 'power3.out',
        scrollTrigger: ScrollTrigger && {
          trigger: el,
          start: options?.start ?? 'top 80%',
          end: options?.end ?? 'bottom 20%',
          once: options?.once ?? true,
        },
        delay: i * stagger,
      })
    })

    return () => {
      if (ScrollTrigger) ScrollTrigger.getAll().forEach((st: any) => st.kill())
    }
  }, [])
}
