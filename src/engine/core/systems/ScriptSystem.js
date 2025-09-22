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
          // fn(eventName, payload, api) -> dispatches to onUpdate/onClick/onCollision if defined in user code
          const wrapper = `
${script.code}
; (function(){
  const map = {
    update: (typeof onUpdate==='function') ? onUpdate : null,
    onClick: (typeof onClick==='function') ? onClick : null,
    onCollision: (typeof onCollision==='function') ? onCollision : null,
  };
  const fn = function(event, payload, api){
    const handler = map[event] || null;
    if (handler) return handler(event, payload, api);
  };
  return fn;
})()`
          script._fn = new Function('event', 'payload', 'api', `return (${wrapper})(event,payload,api)`) // returns result if any
        } catch (e) {
          console.error('Script compile error', e)
          script._fn = null
        }
      }
      if (typeof script._fn === 'function') {
        try {
          script._fn('update', { dt }, this.engine.api(e))
        } catch (err) {
          console.error('Script runtime error', err)
        }
      }
    }
  }
}
