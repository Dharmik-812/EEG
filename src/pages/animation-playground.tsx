import React, { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useFramerPreset, useScrollReveal } from '../animations'
import { useSVGAnimation } from '../animations'
import { useSplitText } from '../animations'
import { useBarbaTransitions } from '../animations'

export default function AnimationPlayground() {
  const route = useFramerPreset('route.transition') as any
  // Experimental Barba bridge disabled by default to avoid conflicts in SPA
  useBarbaTransitions({ enabled: false })
  const [count, setCount] = useState(3)
  const [y, setY] = useState(24)
  const [stagger, setStagger] = useState(0.08)
  const svgRef = useRef<SVGSVGElement | null>(null)
  useSVGAnimation(svgRef, { duration: 1200 })
  const splitRef = useRef<HTMLHeadingElement | null>(null)
  useSplitText(splitRef)

  useScrollReveal(['[data-reveal]'], { y, stagger })

  const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count])

  return (
    <div className="space-y-10">
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          <motion.div key="pg" {...route}>
            <h1 ref={splitRef as any} className="text-3xl font-bold">Animation Playground</h1>
            <p className="text-slate-600 dark:text-slate-300">Try presets and tweak controls below.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-4">
                <h2 className="font-semibold">Scroll reveal controls</h2>
                <div className="flex items-center gap-3 mt-3 text-sm">
                  <label className="flex items-center gap-2">Y: <input type="range" min={0} max={100} value={y} onChange={(e) => setY(Number(e.target.value))} /></label>
                  <label className="flex items-center gap-2">Stagger: <input type="range" min={0} max={0.3} step={0.01} value={stagger} onChange={(e) => setStagger(Number(e.target.value))} /></label>
                </div>
                <div className="mt-4 space-y-2">
                  {items.map((n) => (
                    <div key={n} data-reveal className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800">Revealed item {n + 1}</div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <button className="btn" data-ripple onClick={() => setCount((c) => c + 1)}>Add item</button>
                  <button className="btn-outline" data-ripple onClick={() => setCount((c) => Math.max(0, c - 1))}>Remove item</button>
                </div>
              </div>

              <div className="card p-4">
                <h2 className="font-semibold">SVG draw (Anime.js)</h2>
                <svg ref={svgRef} viewBox="0 0 200 60" className="w-full h-24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 50 L60 10 L110 50" />
                  <circle cx="150" cy="30" r="20" />
                </svg>
                <p className="text-xs text-slate-500 mt-2">Reload page to replay draw (or tweak code to add replay button).</p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Link to="/" className="btn-outline">Back home</Link>
              <a className="btn" href="https://greensock.com/scrolltrigger/" target="_blank" rel="noreferrer">ScrollTrigger Docs</a>
            </div>
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </div>
  )
}
