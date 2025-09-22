// Scene representation derived from project JSON
export class Scene {
  constructor({ id, name, width, height, background, entities = [], bgm = null, bgmVolume = 0.6, layers = [] }) {
    this.id = id
    this.name = name
    this.width = width || 960
    this.height = height || 540
    this.background = background || '#ffffff'
    this.entities = entities
    this.layers = layers
    this.bgm = bgm
    this.bgmVolume = bgmVolume
  }
}
