import { Engine } from './core/Engine.js'

export function runProject(canvas, project, opts = {}) {
  // Runtime Error Boundary
  const showError = (err) => {
    console.error(err)
    if (document.getElementById('engine-error-overlay')) return // Already showing

    // Pause if engine exists
    try { if (typeof engine !== 'undefined') engine.pause() } catch { }

    const div = document.createElement('div')
    div.id = 'engine-error-overlay'
    div.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(20,0,0,0.9);color:#ff6b6b;font-family:monospace;padding:20px;z-index:99999;overflow:auto;pointer-events:auto;backdrop-filter:blur(4px);'
    div.innerHTML = `
      <h2 style="margin:0 0 10px 0;color:#ff4444">Runtime Error</h2>
      <p style="color:#ddd;margin-bottom:15px">The game encountered a crash.</p>
      <pre style="background:rgba(0,0,0,0.5);padding:15px;border:1px solid #552222;border-radius:4px;white-space:pre-wrap;word-break:break-all;">${err.stack || err.message || err}</pre>
      <button onclick="location.reload()" style="margin-top:20px;padding:8px 16px;background:#444;border:none;color:white;cursor:pointer;border-radius:4px;font-weight:bold;">Reload Page</button>
      <button onclick="this.parentElement.remove()" style="margin-top:20px;margin-left:10px;padding:8px 16px;background:transparent;border:1px solid #666;color:#ccc;cursor:pointer;border-radius:4px;">Dismiss</button>
    `
    // Append to canvas parent if possible to stay within game frame, else body
    const container = canvas.parentElement || document.body

    // Ensure relative positioning on container if strictly creating overlay inside
    if (container !== document.body && getComputedStyle(container).position === 'static') {
      container.style.position = 'relative'
    }
    container.appendChild(div)
  }

  // Pass error handler to engine options
  opts.onError = (e) => { showError(e); opts.onErrorOriginal?.(e) }
  opts.onErrorOriginal = opts.onError // Preserve original if passed

  const engine = new Engine(canvas, project, opts)
  // Preload assets then start
  engine.preloadAssets(opts.onProgress)
    .then(() => engine.start())
    .catch(showError)

  // Bridge engine.onMessage to global aria-live region
  try {
    const orig = opts.onMessage
    engine.opts.onMessage = (m) => {
      try { orig?.(m) } catch { }
      try {
        const live = document.getElementById('aria-live-toasts')
        if (live && typeof m === 'string' && m) {
          const n = document.createElement('div')
          n.textContent = m
          live.appendChild(n)
          setTimeout(() => { try { live.removeChild(n) } catch { } }, 3000)
        }
      } catch { }
    }
  } catch { }
  return {
    stop() { engine.destroy() },
    getScore() { return engine.scenes.score }
  }
}

