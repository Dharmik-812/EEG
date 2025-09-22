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
}
