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

    // Device pixel ratio for crisp rendering
    this.dpr = Math.max(1, Math.floor((window.devicePixelRatio || 1) * 100) / 100)

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
    this.paused = false
    // Global time scaling (1 = real-time). Can be modified for slow-mo/pause hooks
    this.timeScale = typeof opts.timeScale === 'number' ? Math.max(0, opts.timeScale) : 1
    this.lastTs = 0
    this.accumulator = 0
    this.fixedDt = 1 / 60 // physics step
    this.time = { elapsed: 0 }

    // Optional FPS cap for battery savings (0 = uncapped)
    this._targetFPS = Math.max(0, opts.targetFPS || 0)
    this._minFrameSec = this._targetFPS > 0 ? (1 / this._targetFPS) : 0
    this._lastDrawTs = 0

    // Seeded RNG for deterministic gameplay when desired
    const seedInput = opts.seed || project.seed || null
    this._rng = this._createSeededRng(seedInput)

    // Message manager state (throttle/dedupe/once)
    this._messageOnce = new Set()
    this._messageRecent = new Map() // key -> timestamp

    // Lightweight event/timer helpers
    this._timers = [] // { at, cb, repeat, interval }
    this._events = new Map() // name -> Set(callback)

    // Resize canvas to current scene
    const scene = this.scenes.current()
    if (scene) {
      this._applyCanvasSize(scene)
      // Start BGM if configured
      if (scene.bgm) this.audio.playBGM(scene.bgm, { loop: true, volume: scene.bgmVolume ?? 0.6 })
    }

    // Click/touch routing to UI/collidable entities
    this._onClick = (evt) => this.handlePointer(evt)
    this.canvas.addEventListener('click', this._onClick)

    // Handle visibility (pause in background) and resize (re-apply DPR)
    this._onVisibility = () => {
      if (document.hidden) this.pause(); else this.resume()
    }
    this._onResize = () => {
      const sc = this.scenes.current(); if (sc) this._applyCanvasSize(sc)
    }
    try { document.addEventListener('visibilitychange', this._onVisibility) } catch {}
    try { window.addEventListener('resize', this._onResize) } catch {}
  }

  destroy() {
    this.running = false
    this.canvas.removeEventListener('click', this._onClick)
    try { document.removeEventListener('visibilitychange', this._onVisibility) } catch {}
    try { window.removeEventListener('resize', this._onResize) } catch {}
    try { this.input?.destroy() } catch {}
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
        try { if (navigator.vibrate) navigator.vibrate(10) } catch {}
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
            const prevId = this.scenes.currentId
            this.scenes.goto(action.sceneId)
            const next = this.scenes.current()
            if (next) {
              this._applyCanvasSize(next)
              try { this.systems.find(s => typeof s.onSceneChange === 'function')?.onSceneChange() } catch {}
              this.audio.stopBGM()
              if (next.bgm) this.audio.playBGM(next.bgm, { loop: true, volume: next.bgmVolume ?? 0.6 })
              try { this.opts.onSceneChange?.(next, prevId) } catch {}
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
      // Deterministic RNG
      random: () => engine.random(),
      // Global time controls
      time: {
        get elapsed() { return engine.time.elapsed },
        get scale() { return engine.timeScale },
        set scale(v) { engine.timeScale = Math.max(0, Number(v) || 0) },
        pause: () => engine.pause(),
        resume: () => engine.resume(),
      },
      camera: {
        set: (x, y) => { engine.camera = engine.camera || { x:0, y:0, zoom:1 }; engine.camera.x = x; engine.camera.y = y },
        zoom: (z) => { engine.camera = engine.camera || { x:0, y:0, zoom:1 }; engine.camera.zoom = Math.max(0.25, Math.min(4, z)) },
        follow: (id, lerp=0.15) => { engine.camera = engine.camera || { x:0, y:0, zoom:1 }; engine.camera.followId = typeof id === 'string' ? id : id?.id; engine.camera.lerp = lerp },
        clearFollow: () => { if (engine.camera) engine.camera.followId = null },
      },
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
        get muted() { return engine.audio.muted },
        mute: () => engine.audio.mute(),
        unmute: () => engine.audio.unmute(),
        setVolume: (v) => engine.audio.setVolume(v),
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
        const id = spec?.id || `e-${Date.now()}-${Math.floor(engine.random()*9999)}`
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
    let dt = (ts - this.lastTs) / 1000
    this.lastTs = ts
    // Clamp large dt spikes (tab restore, breakpoint) for stability
    const maxDt = this.opts.maxDt || 1/15 // ~15 FPS upper dt bound
    if (dt > maxDt) dt = maxDt

    // Fixed-step update for determinism in physics
    if (!this.paused) {
      // Apply time scale to simulation
      const scaled = dt * (this.timeScale || 0)
      this.accumulator += scaled
      while (this.accumulator >= this.fixedDt) {
        this.update(this.fixedDt)
        this.time.elapsed += this.fixedDt
        this.accumulator -= this.fixedDt
      }
    }
    // FPS cap on rendering if requested
    if (this._minFrameSec > 0) {
      const sinceDraw = (ts - (this._lastDrawTs || 0)) / 1000
      if (sinceDraw >= this._minFrameSec) {
        this.draw()
        this._lastDrawTs = ts
      }
    } else {
      this.draw()
    }
    requestAnimationFrame(this._loop.bind(this))
  }

  update(dt) {
    const scene = this.scenes.current()
    if (!scene) return

    // Camera follow (center on followed entity)
    if (this.camera?.followId) {
      const ent = scene.entities.find(e => e.id === this.camera.followId)
      if (ent?.components?.transform) {
        const t = ent.components.transform
        const targetX = Math.max(0, t.x - (scene.width/2))
        const targetY = Math.max(0, t.y - (scene.height/2))
        const lerp = this.camera.lerp ?? 0.15
        this.camera.x = (this.camera.x || 0) + (targetX - (this.camera.x || 0)) * lerp
        this.camera.y = (this.camera.y || 0) + (targetY - (this.camera.y || 0)) * lerp
      }
    }

    // timers
    if (this._timers.length) {
      const now = this.time.elapsed + dt
      for (let i = this._timers.length - 1; i >= 0; i--) {
        const t = this._timers[i]
        if (now >= t.at) {
          try { t.cb() } catch {}
          if (t.repeat && t.interval) {
            t.at += t.interval
          } else {
            this._timers.splice(i, 1)
          }
        }
      }
    }
    for (const sys of this.systems) if (sys.update) sys.update(scene, dt)
  }

  draw() {
    const scene = this.scenes.current()
    if (!scene) return
    for (const sys of this.systems) if (sys.draw) sys.draw(scene, this.ctx)
  }

  async preloadAssets(onProgress) {
    await this.assets.preload(onProgress)
  }

  _applyCanvasSize(scene) {
    // Respect logical scene size; render at device pixel ratio for crispness
    this.dpr = Math.max(1, Math.floor((window.devicePixelRatio || 1) * 100) / 100)
    const w = scene.width || 960
    const h = scene.height || 540
    // Set internal buffer size and CSS size (CSS may be overridden by classes to scale responsively)
    this.canvas.width = Math.round(w * this.dpr)
    this.canvas.height = Math.round(h * this.dpr)
    // Leave CSS sizing to Tailwind classes, but ensure fallback explicit size
    if (!this.canvas.style.width) this.canvas.style.width = w + 'px'
    if (!this.canvas.style.height) this.canvas.style.height = h + 'px'
    // Apply nearest-neighbor scaling hints for pixel art mode
    const pixelArt = this.opts.pixelArt || scene.render?.pixelArt || false
    if (pixelArt) {
      this.canvas.style.imageRendering = 'pixelated'
      this.canvas.style.imageRendering = '-moz-crisp-edges'
      this.canvas.style.imageRendering = 'crisp-edges'
    } else {
      this.canvas.style.imageRendering = 'auto'
    }
    // Reset any previous transforms
    if (this.ctx?.setTransform) this.ctx.setTransform(1,0,0,1,0,0)
  }

  pause() { this.paused = true }
  resume() { this.paused = false; this.lastTs = performance.now() }
  togglePause() { this.paused ? this.resume() : this.pause() }

  // Seeded RNG helpers (xfnv1a + mulberry32)
  _createSeededRng(seedLike) {
    // If no seed provided, fall back to Math.random()
    if (seedLike == null) {
      return () => Math.random()
    }
    const seedStr = String(seedLike)
    function xfnv1a(str){
      let h = 2166136261 >>> 0
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i)
        h = Math.imul(h, 16777619)
      }
      return () => h >>> 0
    }
    function mulberry32(a){
      return function(){
        let t = a += 0x6D2B79F5
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }
    const seed = xfnv1a(seedStr)()
    const rng = mulberry32(seed)
    return rng
  }

  random() { return this._rng ? this._rng() : Math.random() }

  // Event/message/timer API for scripts
  on(name, cb) { const set = this._events.get(name) || new Set(); set.add(cb); this._events.set(name, set); return () => set.delete(cb) }
  emit(name, payload) { const set = this._events.get(name); if (!set) return; for (const cb of set) { try { cb(payload) } catch {} } }
  setTimeout(cb, delaySec) { const t = { at: this.time.elapsed + Math.max(0, delaySec||0), cb }; this._timers.push(t); return t }
  setInterval(cb, intervalSec) { const t = { at: this.time.elapsed + Math.max(0, intervalSec||0), cb, repeat: true, interval: Math.max(0, intervalSec||0) }; this._timers.push(t); return t }
  clearTimer(timerRef) { const i = this._timers.indexOf(timerRef); if (i >= 0) this._timers.splice(i, 1) }
}
