// Runs script components (user-provided JS) each frame and handles events
export class ScriptSystem {
  constructor(engine) { this.engine = engine }
  _ensureCompiled(script) {
    if (script._fn && script._lastCode === script.code) return true
    try {
      const compile = new Function(`"use strict";${script.code}; return {
        onStart: (typeof onStart==='function')?onStart:null,
        onUpdate: (typeof onUpdate==='function')?onUpdate:null,
        onClick: (typeof onClick==='function')?onClick:null,
        onCollision: (typeof onCollision==='function')?onCollision:null,
        onDestroy: (typeof onDestroy==='function')?onDestroy:null,
      }`)
      const handlers = compile()
      script._handlers = handlers
      script._lastCode = script.code
      script._state = script._state || {}
      script._started = false
      script._fn = function(event, payload, api) {
        const h = handlers[event] || null
        if (typeof h === 'function') return h(payload, api, script._state)
      }
      return true
    } catch (e) {
      console.error('Script compile error', e)
      try { this.engine.opts?.onError?.(e) } catch {}
      script._fn = null
      return false
    }
  }
  update(scene, dt) {
    for (const e of scene.entities) {
      const script = e.components?.script
      if (!script?.code) continue
      if (!this._ensureCompiled(script)) continue
      try {
        if (!script._started && script._handlers.onStart) {
          script._handlers.onStart({ dt: 0 }, this.engine.api(e), script._state)
          script._started = true
        }
        if (script._handlers.onUpdate) {
          script._handlers.onUpdate({ dt }, this.engine.api(e), script._state)
        }
      } catch (err) {
        console.error('Script runtime error', err)
        try { this.engine.opts?.onError?.(err) } catch {}
      }
    }
  }
}
