import { useEffect } from 'react'
import { loadAnime } from '../lazy'
import { shouldReduceMotion } from '../manager'

export function useSVGAnimation(ref: React.RefObject<SVGElement | null>, options?: { draw?: boolean; duration?: number }) {
  useEffect(() => {
    if (!ref.current || shouldReduceMotion()) return
    let anime: any
    let instance: any
    let cancelled = false
    ;(async () => {
      anime = await loadAnime()
      if (!anime || !ref.current || cancelled) return

      const paths = ref.current.querySelectorAll('path, circle, rect, line, polyline, polygon') as NodeListOf<SVGPathElement>
      const stack: any[] = []
      paths.forEach((p) => {
        const length = (p as any).getTotalLength?.() ?? 300
        p.style.strokeDasharray = String(length)
        p.style.strokeDashoffset = String(length)
        const anim = anime({
          targets: p,
          strokeDashoffset: [length, 0],
          easing: 'easeInOutSine',
          duration: options?.duration ?? 1200,
          autoplay: true,
        })
        stack.push(anim)
      })
      instance = stack
    })()

    return () => {
      cancelled = true
      try { instance?.forEach?.((a: any) => a.pause?.()) } catch {}
    }
  }, [ref])
}
