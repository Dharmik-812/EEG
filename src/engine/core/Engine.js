// Core Engine orchestrator
// Provides update/draw loop, managers (assets, input, audio), scene switching, and event dispatch

import { AssetManager } from './AssetManager.js'
import { InputManager } from './InputManager.js'
import { AudioManager } from './AudioManager.js'
import { SceneManager } from './SceneManager.js'
import { RenderSystem } from './systems/RenderSystem.js'
import { PhysicsSystem } from './systems/PhysicsSystem.js'
import { CollisionSystem } from './systems/CollisionSystem.js'
import { AnimationSystem } from './systems/AnimationSystem.js'
import { ScriptSystem } from './systems/ScriptSystem.js'
import { TimelineSystem } from './systems/TimelineSystem.js'
import { WebGLRenderSystem } from './systems/WebGLRenderSystem.js'
import { ParticleSystem } from './systems/ParticleSystem.js'

export class Engine {
  constructor(canvas, project, opts = {}) {
    this.canvas = canvas
    this.project = project
    this.opts = opts

    // Renderer mode: canvas (default) or webgl (stub)
    this.renderMode = opts.renderMode || project.render?.mode || 'canvas'
    if (this.renderMode === 'webgl') {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      this.ctx = gl ? gl : canvas.getContext('2d')
    } else {
      this.ctx = canvas.getContext('2d')
    }

    this.assets = new AssetManager(project.assets || [])
    this.input = new InputManager(canvas, opts.inputMapping || project.input || {})
    this.audio = new AudioManager(this.assets)
    this.scenes = new SceneManager(project, this.assets)

    // Systems order: timeline -> animation -> physics -> collisions -> scripts -> render -> particles
    this.systems = [
      new TimelineSystem(this),
      new AnimationSystem(this),
      new PhysicsSystem(this),
      new CollisionSystem(this),
      new ScriptSystem(this),
      ...(this.renderMode === 'webgl' ? [new WebGLRenderSystem(this)] : [new RenderSystem(this)]),
    ]
    // Particle system appended last so particles draw above sprites/UI
    this.particles = new ParticleSystem(this)
    this.systems.push(this.particles)

    this.running = false
    this.lastTs = 0
    this.accumulator = 0
    this.fixedDt = 1 / 60 // physics step

    // Message manager state (throttle/dedupe/once)
    this._messageOnce = new Set()
    this._messageRecent = new Map() // key -> timestamp

    // Resize canvas to current scene
    const scene = this.scenes.current()
    if (scene) {
      this.canvas.width = scene.width
      this.canvas.height = scene.height
      // Start BGM if configured
      if (scene.bgm) this.audio.playBGM(scene.bgm, { loop: true, volume: scene.bgmVolume ?? 0.6 })
    }

    // Click/touch routing to UI/collidable entities
    this._onClick = (evt) => this.handlePointer(evt)
    this.canvas.addEventListener('click', this._onClick)
  }

  destroy() {
    this.running = false
    this.canvas.removeEventListener('click', this._onClick)
    this.audio.stopBGM()
  }

  pointToScene(evt) {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = (this.canvas.width / rect.width) || 1
    const scaleY = (this.canvas.height / rect.height) || 1
    const x = (evt.clientX - rect.left) * scaleX
    const y = (evt.clientY - rect.top) * scaleY
    return { x, y }
  }

  handlePointer(evt) {
    const scene = this.scenes.current()
    if (!scene) return
    const { x, y } = this.pointToScene(evt)
    // topmost hit test based on z-order (end of array is top)
    const hit = [...scene.entities].reverse().find(e => {
      const t = e.components?.transform
      if (!t) return false
      // Tilemap uses its own bounds
      if (e.components?.tilemap) {
        const tm = e.components.tilemap
        const tw = tm.cols * tm.tileWidth, th = tm.rows * tm.tileHeight
        return x >= t.x - tw/2 && x <= t.x + tw/2 && y >= t.y - th/2 && y <= t.y + th/2
      }
      return x >= t.x - t.w/2 && x <= t.x + t.w/2 && y >= t.y - t.h/2 && y <= t.y + t.h/2
    })
    if (hit) {
      // rudimentary UI handling
      if (hit.components?.ui) {
        const ui = hit.components.ui
        if (ui.type === 'checkbox') { ui.checked = !ui.checked }
        if (ui.type === 'slider') {
          const t = hit.components.transform
          const ratio = Math.max(0, Math.min(1, (x - (t.x - t.w/2)) / t.w))
          const min = ui.min ?? 0, max = ui.max ?? 100
          ui.value = Math.round(min + ratio * (max - min))
        }
      }
      this.dispatchEvent(hit, 'onClick', { x, y })
    }
  }

  dispatchEvent(entity, event, payload = {}) {
    // Script component handlers first
    const script = entity.components?.script
    if (script?.code && typeof script._fn === 'function') {
      try { script._fn(event, payload, this.api(entity)) } catch (e) { console.error('Script error', e) }
    }

    // Interactable action list support (compat with old project model)
    const handler = entity?.components?.interactable?.[event]
    if (handler && Array.isArray(handler)) {
      for (const action of handler) {
        switch (action.type) {
          case 'moveBy': {
            const t = entity.components.transform
            t.x += action.dx || 0
            t.y += action.dy || 0
            break
          }
          case 'addScore': {
            this.scenes.score += action.amount || 0
            break
          }
          case 'gotoScene': {
            this.scenes.goto(action.sceneId)
            const next = this.scenes.current()
            if (next) {
              this.canvas.width = next.width; this.canvas.height = next.height
              this.audio.stopBGM()
              if (next.bgm) this.audio.playBGM(next.bgm, { loop: true, volume: next.bgmVolume ?? 0.6 })
            }
            break
          }
          case 'showMessage': {
            this.opts.onMessage?.(action.text || '')
            break
          }
          case 'playSFX': {
            if (action.assetId) this.audio.playSFX(action.assetId, { volume: action.volume ?? 1.0 })
            break
          }
        }
      }
    }
  }

  // Minimal API exposed to scripts attached to an entity
  api(entity) {
    const engine = this
    return {
      entity,
      input: engine.input,
      audio: {
        play: (assetId, opts) => engine.audio.playSFX(assetId, opts),
        tone: (opts) => engine.audio.playTone(opts || {}),
        click: () => engine.audio.click(),
        success: () => engine.audio.success(),
        error: () => engine.audio.error(),
        bgm: {
          play: (assetId, opts) => engine.audio.playBGM(assetId, opts),
          stop: () => engine.audio.stopBGM(),
        },
      },
      moveBy: (dx, dy) => {
        const t = entity.components?.transform
        if (t) { t.x += dx || 0; t.y += dy || 0 }
      },
      gotoScene: (sceneId) => engine.scenes.goto(sceneId),
      setAnimation: (name) => { const a = entity.components?.animation; if (a) { a.current = name; a.time=0; a.frameIndex=0 } },
      blendTo: (name, duration=0.25) => { const a = entity.components?.animation; if (a) { a.blend = { target: name, duration, elapsed: 0, frameIndex: 0, time: 0 } } },
      message: (textOrOpts, maybeOpts) => {
        const opts = typeof textOrOpts === 'string' ? (maybeOpts || {}) : (textOrOpts || {})
        const text = typeof textOrOpts === 'string' ? textOrOpts : (textOrOpts?.text || '')
        const key = opts.key || text
        if (!text) return
        if (opts.once) {
          if (engine._messageOnce.has(key)) return
          engine._messageOnce.add(key)
        }
        const now = performance.now() / 1000
        const last = engine._messageRecent.get(key) || 0
        const cooldown = opts.cooldownSec ?? 1.5
        if ((now - last) < cooldown) return
        engine._messageRecent.set(key, now)
        engine.opts.onMessage?.(text)
      },
      particles: {
        burst: (o) => engine.particles?.burst(o || {}),
      },
      // Scene/entity helpers for gameplay scripts
      addEntity: (spec) => {
        const scene = engine.scenes.current()
        const id = spec?.id || `e-${Date.now()}-${Math.floor(Math.random()*9999)}`
        const ent = { id, name: spec?.name || 'Entity', components: spec?.components || {} }
        scene.entities.push(ent)
        return ent
      },
      removeEntity: (idOrEnt) => {
        const scene = engine.scenes.current()
        const id = typeof idOrEnt === 'string' ? idOrEnt : idOrEnt?.id
        const idx = scene.entities.findIndex(e => e.id === id)
        if (idx >= 0) scene.entities.splice(idx, 1)
      },
      entities: () => engine.scenes.current().entities,
    }
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTs = performance.now()
    requestAnimationFrame(this._loop.bind(this))
  }

  _loop(ts) {
    if (!this.running) return
    const dt = (ts - this.lastTs) / 1000
    this.lastTs = ts

    // Fixed-step update for determinism in physics
    this.accumulator += dt
    while (this.accumulator >= this.fixedDt) {
      this.update(this.fixedDt)
      this.accumulator -= this.fixedDt
    }
    // Render with the most recent state
    this.draw()
    requestAnimationFrame(this._loop.bind(this))
  }

  update(dt) {
    const scene = this.scenes.current()
    if (!scene) return
    for (const sys of this.systems) if (sys.update) sys.update(scene, dt)
  }

  draw() {
    const scene = this.scenes.current()
    if (!scene) return
    for (const sys of this.systems) if (sys.draw) sys.draw(scene, this.ctx)
  }
}
