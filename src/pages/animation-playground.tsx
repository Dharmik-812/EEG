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

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Scroll Reveal Demo */}
              <div className="card p-6">
                <h2 className="font-semibold mb-4">🌊 Scroll Reveals</h2>
                <div className="space-y-3 text-sm">
                  <label className="flex items-center justify-between">
                    Y Offset: <input type="range" min={0} max={100} value={y} onChange={(e) => setY(Number(e.target.value))} className="ml-2" />
                  </label>
                  <label className="flex items-center justify-between">
                    Stagger: <input type="range" min={0} max={0.3} step={0.01} value={stagger} onChange={(e) => setStagger(Number(e.target.value))} className="ml-2" />
                  </label>
                </div>
                <div className="mt-4 space-y-2">
                  {items.map((n) => (
                    <motion.div 
                      key={n} 
                      data-reveal 
                      className="p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-sky-100 dark:from-emerald-900/20 dark:to-sky-900/20 border border-emerald-200 dark:border-emerald-800"
                      whileHover={{ scale: 1.02, x: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      ✨ Revealed item {n + 1}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn flex-1" data-ripple onClick={() => setCount((c) => c + 1)}>Add</button>
                  <button className="btn-outline flex-1" data-ripple onClick={() => setCount((c) => Math.max(0, c - 1))}>Remove</button>
                </div>
              </div>

              {/* SVG Animation Demo */}
              <div className="card p-6">
                <h2 className="font-semibold mb-4">🎨 SVG Animations</h2>
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 mb-4">
                  <svg ref={svgRef} viewBox="0 0 200 80" className="w-full h-20" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M10 60 Q50 10 90 40 T170 30" strokeLinecap="round" />
                    <circle cx="30" cy="50" r="8" fill="currentColor" />
                    <rect x="140" y="20" width="16" height="16" rx="2" />
                    <polygon points="100,15 110,35 90,35" fill="currentColor" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500 mb-4">Anime.js stroke drawing animation</p>
                <button 
                  className="btn w-full" 
                  data-ripple 
                  onClick={() => window.location.reload()}
                >
                  🔄 Replay Animation
                </button>
              </div>

              {/* Form Micro-interactions Demo */}
              <div className="card p-6">
                <h2 className="font-semibold mb-4">💫 Form Interactions</h2>
                <div className="space-y-4">
                  <motion.div
                    className="relative"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <motion.input
                      type="text"
                      placeholder="Focus me for animation"
                      className="w-full p-3 rounded-xl bg-white/50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                      whileFocus={{ 
                        borderColor: "#10b981",
                        boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.1)"
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                  
                  <motion.div className="relative">
                    <motion.textarea
                      placeholder="Expandable textarea"
                      className="w-full p-3 rounded-xl bg-white/50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 focus:border-sky-500 focus:outline-none transition-colors resize-none"
                      rows={2}
                      whileFocus={{
                        borderColor: "#0ea5e9",
                        boxShadow: "0 0 0 4px rgba(14, 165, 233, 0.1)",
                        scale: 1.02
                      }}
                    />
                  </motion.div>
                  
                  <motion.button
                    className="w-full btn-outline"
                    data-ripple
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ⚡ Animated Button
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Physics Demo Section */}
            <div className="mt-8 card p-6">
              <h2 className="font-semibold mb-6 text-center text-2xl">🎪 Physics & Springs Demo</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { emoji: '🎈', name: 'Balloon', physics: { type: "spring", stiffness: 200, damping: 10 } },
                  { emoji: '⚾', name: 'Bouncy', physics: { type: "spring", stiffness: 400, damping: 8 } },
                  { emoji: '🪐', name: 'Floaty', physics: { type: "spring", stiffness: 100, damping: 20 } },
                  { emoji: '🚀', name: 'Snappy', physics: { type: "spring", stiffness: 800, damping: 25 } },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="text-center p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl cursor-pointer select-none"
                    whileHover={{ 
                      scale: 1.1, 
                      y: -10,
                      transition: item.physics
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      transition: { type: "spring", stiffness: 600 }
                    }}
                    data-ripple
                  >
                    <motion.div 
                      className="text-4xl mb-2"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        y: [0, -2, 2, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    >
                      {item.emoji}
                    </motion.div>
                    <div className="font-medium">{item.name}</div>
                  </motion.div>
                ))}
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
