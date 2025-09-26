import { Engine } from './core/Engine.js'

export function runProject(canvas, project, opts = {}) {
  const engine = new Engine(canvas, project, opts)
  // Preload assets then start
  engine.preloadAssets(opts.onProgress).then(() => engine.start())
  return {
    stop() { engine.destroy() },
    getScore() { return engine.scenes.score }
  }
}

