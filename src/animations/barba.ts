import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { shouldReduceMotion } from './manager'

export function useBarbaTransitions({ enabled = false }: { enabled?: boolean } = {}) {
  const location = useLocation()
  useEffect(() => {
    if (!enabled || shouldReduceMotion()) return
    let destroy: (() => void) | undefined
    let ctx: any
    ;(async () => {
      // Dynamically import Barba core
      const mod = await import('@barba/core')
      const barba = (mod as any).default || mod

      // Initialize once
      if (!barba?.initialized) {
        try {
          barba.init({
            preventRunning: true,
            timeout: 10000,
            transitions: [
              {
                name: 'fade',
                leave(data: any) {
                  const el = data.current?.container || document.querySelector('main')
                  if (!el) return
                  return new Promise<void>((res) => {
                    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, easing: 'ease' }).finished.then(() => res())
                  })
                },
                enter(data: any) {
                  const el = data.next?.container || document.querySelector('main')
                  if (!el) return
                  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease' })
                },
              },
            ],
          })
        } catch {}
      }

      // Manually inform Barba of a view change (SPA bridge)
      try {
        // Create synthetic data for transitions
        const current = { namespace: (window as any).__barba_ns || 'view', url: { path: (window as any).__barba_path || '/' } }
        const next = { namespace: 'view', url: { path: location.pathname } }
        ;(window as any).__barba_ns = 'view'
        ;(window as any).__barba_path = location.pathname
        // Trigger a minimal leave/enter sequence if transitions exist
        const t = (barba?.transitions || [])[0]
        if (t?.leave) await t.leave({ current, next, trigger: 'spa' })
        if (t?.enter) await t.enter({ current, next, trigger: 'spa' })
      } catch {}

      destroy = () => {
        // Keep Barba initialized but no-op cleanup (we didn't mount containers)
      }
    })()

    return () => { try { destroy?.() } catch {} }
  }, [enabled, location.pathname])
}
