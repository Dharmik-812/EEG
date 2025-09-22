// Runs script components (user-provided JS) each frame and handles events
export class ScriptSystem {
  constructor(engine) { this.engine = engine }
  update(scene, dt) {
    for (const e of scene.entities) {
      const script = e.components?.script
      if (!script?.code) continue
      // Lazy-compile function once
      if (!script._fn) {
        try {
          const compile = new Function(`"use strict";${script.code}; return { onUpdate: (typeof onUpdate==='function')?onUpdate:null, onClick: (typeof onClick==='function')?onClick:null, onCollision: (typeof onCollision==='function')?onCollision:null }`)
          const handlers = compile()
          script._handlers = handlers
          script._fn = function(event, payload, api) {
            const h = handlers[event] || null
            if (typeof h === 'function') return h(event, payload, api)
          }
        } catch (e) {
          console.error('Script compile error', e)
          script._fn = null
        }
      }
      if (typeof script._fn === 'function') {
        try {
          script._fn('onUpdate', { dt }, this.engine.api(e))
        } catch (err) {
          console.error('Script runtime error', err)
        }
      }
    }
  }
}
