// Scene and entity management; builds scenes from project JSON
import { Scene } from './Scene.js'

export class SceneManager {
  constructor(project, assetManager) {
    this.project = project
    this.assets = assetManager
    this.scenes = (project.scenes || []).map(s => new Scene(s))
    this.currentId = project.startSceneId || this.scenes[0]?.id
    this.score = 0
  }

  current() {
    return this.scenes.find(s => s.id === this.currentId) || null
  }

  goto(id) {
    const next = this.scenes.find(s => s.id === id)
    if (!next) return
    this.currentId = id
  }

  addEntityToCurrent(entitySpec) {
    const scene = this.current()
    if (!scene) return null
    const id = entitySpec?.id || `e-${Date.now()}-${Math.floor(Math.random()*9999)}`
    const ent = { id, name: entitySpec?.name || 'Entity', components: entitySpec?.components || {}, layerId: entitySpec?.layerId || null }
    scene.entities.push(ent)
    return ent
  }

  removeEntityFromCurrent(idOrEnt) {
    const scene = this.current()
    if (!scene) return
    const id = typeof idOrEnt === 'string' ? idOrEnt : idOrEnt?.id
    const idx = scene.entities.findIndex(e => e.id === id)
    if (idx >= 0) scene.entities.splice(idx, 1)
  }

  serialize() {
    return {
      ...this.project,
      scenes: this.scenes.map(s => ({
        id: s.id,
        name: s.name,
        width: s.width,
        height: s.height,
        background: s.background,
        bgm: s.bgm,
        bgmVolume: s.bgmVolume,
        layers: s.layers,
        entities: s.entities,
      })),
      startSceneId: this.currentId,
    }
  }
}
