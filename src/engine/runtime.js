import { Engine } from './core/Engine.js'

export function runProject(canvas, project, opts = {}) {
  const engine = new Engine(canvas, project, opts)
  // Preload assets then start
  engine.preloadAssets(opts.onProgress).then(() => engine.start())
  // Bridge engine.onMessage to global aria-live region
  try {
    const orig = opts.onMessage
    engine.opts.onMessage = (m) => {
      try { orig?.(m) } catch {}
      try {
        const live = document.getElementById('aria-live-toasts')
        if (live && typeof m === 'string' && m) {
          const n = document.createElement('div')
          n.textContent = m
          live.appendChild(n)
          setTimeout(() => { try { live.removeChild(n) } catch {} }, 3000)
        }
      } catch {}
    }
  } catch {}
  return {
    stop() { engine.destroy() },
    getScore() { return engine.scenes.score }
  }
}

