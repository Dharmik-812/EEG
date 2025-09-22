// Loads images and audio assets from project and provides lookup
export class AssetManager {
  constructor(assets = []) {
    this.assets = assets
    this.images = new Map()
    this.audios = new Map()
    this._preload()
  }

  _preload() {
    for (const a of this.assets) {
      if (a.type === 'image') {
        const img = new Image()
        img.src = a.src
        this.images.set(a.id, img)
      } else if (a.type === 'audio') {
        const audio = new Audio(a.src)
        audio.preload = 'auto'
        this.audios.set(a.id, audio)
      }
    }
  }

  getImage(id) { return this.images.get(id) || null }
  getAudio(id) { return this.audios.get(id) || null }
}
