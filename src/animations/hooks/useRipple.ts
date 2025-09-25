import { useEffect } from 'react'
import { shouldReduceMotion } from '../manager'
import { loadMotion } from './useMotionOne'

// Adds material-like ripple to elements with [data-ripple] attribute
export function useRipple(opts?: { color?: string; duration?: number }) {
  useEffect(() => {
    if (shouldReduceMotion()) return
    let teardown: (() => void) | undefined
    ;(async () => {
      const motion = await loadMotion()
      if (!motion) return
      const { animate, spring } = motion as any

      function createRipple(e: MouseEvent) {
        const target = e.currentTarget as HTMLElement
        if (!(target instanceof HTMLElement)) return
        const rect = target.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2
        const circle = document.createElement('span')
        circle.style.position = 'absolute'
        circle.style.borderRadius = '50%'
        circle.style.pointerEvents = 'none'
        circle.style.left = `${x}px`
        circle.style.top = `${y}px`
        circle.style.width = `${size}px`
        circle.style.height = `${size}px`
        circle.style.background = opts?.color || 'rgba(16,185,129,0.35)'
        circle.style.transform = 'scale(0)'
        circle.style.opacity = '0.6'
        circle.className = 'motion-ripple'
        const style = getComputedStyle(target)
        if (getComputedStyle(target).position === 'static') {
          target.style.position = 'relative'
        }
        target.appendChild(circle)
        // Animate
        const controls = animate(
          circle,
          { transform: ['scale(0)', 'scale(2.5)'], opacity: [0.6, 0] },
          { duration: (opts?.duration ?? 0.6), easing: 'ease-out' }
        )
        controls.finished.finally(() => circle.remove())
      }

      function onPointerDown(e: Event) {
        const me = e as MouseEvent
        const el = me.target as HTMLElement
        const btn = el?.closest('[data-ripple]') as HTMLElement | null
        if (btn) createRipple(me)
      }

      document.addEventListener('pointerdown', onPointerDown, { passive: true })
      teardown = () => document.removeEventListener('pointerdown', onPointerDown)
    })()

    return () => { try { teardown?.() } catch {} }
  }, [opts?.color, opts?.duration])
}
