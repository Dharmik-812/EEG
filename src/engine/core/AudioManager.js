// Simple audio manager for BGM and SFX using HTMLAudioElement
export class AudioManager {
  constructor(assetManager) {
    this.assets = assetManager
    this.bgm = null
  }

  playBGM(assetId, { loop = true, volume = 0.6 } = {}) {
    const audioTpl = this.assets.getAudio(assetId)
    if (!audioTpl) return
    if (this.bgm) { this.stopBGM() }
    const a = new Audio(audioTpl.src)
    a.loop = loop
    a.volume = volume
    a.play().catch(() => {/* autoplay guard */})
    this.bgm = a
  }

  stopBGM() {
    if (this.bgm) { try { this.bgm.pause(); this.bgm.currentTime = 0 } catch {} }
    this.bgm = null
  }

  playSFX(assetId, { volume = 1.0 } = {}) {
    const tpl = this.assets.getAudio(assetId)
    if (!tpl) return
    const a = new Audio(tpl.src)
    a.volume = volume
    a.play().catch(() => {})
    return a
  }
}
