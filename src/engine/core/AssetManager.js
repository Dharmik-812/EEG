// Loads images and audio assets from project and provides lookup
export class AssetManager {
  constructor(assets = []) {
    this.assets = assets
    this.images = new Map()
    this.audios = new Map()
    this._ready = false
    this._progress = 0
  }

  async preload(onProgress) {
    const items = this.assets || []
    if (!items.length) { this._ready = true; return }
    let loaded = 0
    const report = () => {
      this._progress = items.length ? loaded / items.length : 1
      try { onProgress && onProgress(this._progress) } catch {}
    }
    const tasks = items.map(a => new Promise(resolve => {
      if (a.type === 'image') {
        const img = new Image()
        img.onload = () => { this.images.set(a.id, img); loaded++; report(); resolve() }
        img.onerror = () => { loaded++; report(); resolve() }
        img.src = a.src
      } else if (a.type === 'audio') {
        const audio = new Audio(a.src)
        audio.preload = 'auto'
        const done = () => { this.audios.set(a.id, audio); loaded++; report(); resolve() }
        audio.addEventListener('canplaythrough', done, { once: true })
        audio.addEventListener('error', done, { once: true })
        // Kick off loading
        try { audio.load() } catch {}
      } else {
        loaded++; report(); resolve()
      }
    }))
    await Promise.all(tasks)
    this._ready = true
  }

  isReady() { return this._ready }
  progress() { return this._progress }
  getImage(id) { return this.images.get(id) || null }
  getAudio(id) { return this.audios.get(id) || null }
}
