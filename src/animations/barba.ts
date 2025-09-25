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
                name: 'default',
                leave(data: any) {
                  const el = data.current?.container || document.querySelector('main')
                  if (!el) return
                  return new Promise<void>((res) => {
                    const animation = el.animate([
                      { 
                        opacity: 1, 
                        transform: 'translateY(0) scale(1)', 
                        filter: 'blur(0px)' 
                      }, 
                      { 
                        opacity: 0, 
                        transform: 'translateY(-20px) scale(0.98)', 
                        filter: 'blur(4px)' 
                      }
                    ], { 
                      duration: 400, 
                      easing: 'cubic-bezier(0.4, 0, 0.2, 1)' 
                    })
                    animation.finished.then(() => res())
                  })
                },
                enter(data: any) {
                  const el = data.next?.container || document.querySelector('main')
                  if (!el) return
                  el.animate([
                    { 
                      opacity: 0, 
                      transform: 'translateY(20px) scale(0.98)', 
                      filter: 'blur(4px)' 
                    }, 
                    { 
                      opacity: 1, 
                      transform: 'translateY(0) scale(1)', 
                      filter: 'blur(0px)' 
                    }
                  ], { 
                    duration: 500, 
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)' 
                  })
                },
              },
              {
                name: 'slide-up',
                to: {
                  route: /\/(challenges|community|dashboard)/
                },
                leave(data: any) {
                  const el = data.current?.container || document.querySelector('main')
                  if (!el) return
                  return new Promise<void>((res) => {
                    const animation = el.animate([
                      { 
                        opacity: 1, 
                        transform: 'translateY(0) rotateX(0deg)', 
                        filter: 'brightness(1)' 
                      }, 
                      { 
                        opacity: 0, 
                        transform: 'translateY(-50px) rotateX(-5deg)', 
                        filter: 'brightness(0.8)' 
                      }
                    ], { 
                      duration: 450, 
                      easing: 'cubic-bezier(0.4, 0, 0.6, 1)' 
                    })
                    animation.finished.then(() => res())
                  })
                },
                enter(data: any) {
                  const el = data.next?.container || document.querySelector('main')
                  if (!el) return
                  el.animate([
                    { 
                      opacity: 0, 
                      transform: 'translateY(80px) rotateX(5deg)', 
                      filter: 'brightness(0.8)' 
                    }, 
                    { 
                      opacity: 1, 
                      transform: 'translateY(0) rotateX(0deg)', 
                      filter: 'brightness(1)' 
                    }
                  ], { 
                    duration: 600, 
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)' 
                  })
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
