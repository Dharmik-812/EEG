import { useEffect, useRef } from 'react'
import { loadMotion } from './useMotionOne'
import { shouldReduceMotion } from '../manager'

// Split a text node into spans for letter-by-letter animation
export function useSplitText(ref: React.RefObject<HTMLElement | null>, options?: { selector?: string }) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (shouldReduceMotion()) return

    const nodes = options?.selector ? root.querySelectorAll(options.selector) : [root]

    const originals: { el: Element; html: string }[] = []
    nodes.forEach((el) => {
      const html = (el as HTMLElement).innerHTML
      originals.push({ el, html })
      const text = (el as HTMLElement).textContent || ''
      const frag = document.createDocumentFragment()
      text.split('').forEach((ch) => {
        const span = document.createElement('span')
        span.textContent = ch
        span.style.display = 'inline-block'
        span.style.willChange = 'transform, opacity'
        frag.appendChild(span)
      })
      ;(el as HTMLElement).innerHTML = ''
      el.appendChild(frag)
    })

    let cancelled = false
    ;(async () => {
      const motion = await loadMotion()
      if (!motion || cancelled) return
      const { animate, timeline } = motion as any
      nodes.forEach((el) => {
        const letters = el.querySelectorAll('span')
        animate(letters, { opacity: [0, 1], transform: ['translateY(0.5em)', 'translateY(0)'] }, { delay: (i: number) => i * 0.02, duration: 0.4, easing: 'cubic-bezier(.22,1,.36,1)' })
      })
    })()

    return () => {
      cancelled = true
      originals.forEach(({ el, html }) => ((el as HTMLElement).innerHTML = html))
    }
  }, [ref, options?.selector])
}
