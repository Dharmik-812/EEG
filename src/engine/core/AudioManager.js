// Simple audio manager for BGM and SFX using HTMLAudioElement
// Enhanced with optional WebAudio tone synthesis for lightweight SFX
export class AudioManager {
  constructor(assetManager) {
    this.assets = assetManager
    this.bgm = null
    // WebAudio context (lazy)
    this._ctx = null
    this._gain = null
    this._unlocked = false
    this._muted = false
    this._masterVol = 0.9
    try {
      const m = localStorage.getItem('avers_audio_muted'); if (m != null) this._muted = m === 'true'
      const v = localStorage.getItem('avers_audio_volume'); if (v != null) this._masterVol = Math.max(0, Math.min(1, parseFloat(v)))
    } catch {}
    // Best-effort unlock on first user gesture
    try { window.addEventListener('pointerdown', () => this._unlockCtx(), { once: true, passive: true }) } catch {}
  }

  _initCtx() {
    if (this._ctx) return
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      const ctx = new AC()
      const g = ctx.createGain()
      g.gain.value = this._muted ? 0 : this._masterVol
      g.connect(ctx.destination)
      this._ctx = ctx
      this._gain = g
    } catch {}
  }

  _unlockCtx() { try { this._initCtx(); if (this._ctx?.state === 'suspended') this._ctx.resume(); this._unlocked = true } catch {} }

  // Lightweight synthesized tone SFX (no asset required)
  playTone({ frequency = 880, type = 'sine', duration = 0.1, attack = 0.01, decay = 0.05, sustain = 0.0, release = 0.05, volume = 0.3 } = {}) {
    if (this._muted) return null
    this._initCtx()
    if (!this._ctx || !this._gain) return null
    const now = this._ctx.currentTime
    const o = this._ctx.createOscillator()
    const g = this._ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(frequency, now)
    o.connect(g)
    g.connect(this._gain)
    const a = Math.max(0.001, attack)
    const d = Math.max(0, decay)
    const r = Math.max(0.001, release)
    const end = now + Math.max(0.02, duration)
    const s = Math.max(0, sustain)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(volume, now + a)
    if (d > 0) g.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * (1 - s)), now + a + d)
    g.gain.exponentialRampToValueAtTime(0.0001, end + r)
    try { o.start(now) } catch {}
    try { o.stop(end + r) } catch {}
    return o
  }

  click() { return this.playTone({ frequency: 520, duration: 0.08, volume: 0.2 }) }
  success() { return this.playTone({ frequency: 880, duration: 0.12, volume: 0.25 }) }
  error() { return this.playTone({ frequency: 200, duration: 0.2, volume: 0.25 }) }
  setVolume(v) { this._masterVol = Math.max(0, Math.min(1, v)); try { localStorage.setItem('avers_audio_volume', String(this._masterVol)) } catch {}; if (this._gain && !this._muted) this._gain.gain.value = this._masterVol }
  mute() { this._muted = true; try { localStorage.setItem('avers_audio_muted', 'true') } catch {}; if (this._gain) this._gain.gain.value = 0; try { if (this.bgm) this.bgm.muted = true } catch {} }
  unmute() { this._muted = false; try { localStorage.setItem('avers_audio_muted', 'false') } catch {}; if (this._gain) this._gain.gain.value = this._masterVol; try { if (this.bgm) this.bgm.muted = false } catch {} }
  get muted() { return this._muted }

  playBGM(assetId, { loop = true, volume = 0.6 } = {}) {
    const audioTpl = this.assets.getAudio(assetId)
    if (!audioTpl) return
    if (this.bgm) { this.stopBGM() }
    const a = new Audio(audioTpl.src)
    a.loop = loop
    a.volume = this._muted ? 0 : volume
    a.muted = !!this._muted
    a.play().catch(() => {/* autoplay guard */})
    this.bgm = a
  }

  stopBGM() {
    if (this.bgm) { try { this.bgm.pause(); this.bgm.currentTime = 0 } catch {} }
    this.bgm = null
  }

  playSFX(assetId, { volume = 1.0 } = {}) {
    if (this._muted) return null
    const tpl = this.assets.getAudio(assetId)
    if (!tpl) return null
    const a = new Audio(tpl.src)
    a.volume = Math.max(0, Math.min(1, volume))
    a.play().catch(() => {})
    return a
  }
}
