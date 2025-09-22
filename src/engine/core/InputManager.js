// Handles keyboard/mouse/touch and configurable mapping
export class InputManager {
  constructor(canvas, mapping = {}) {
    this.canvas = canvas
    this.mapping = {
      left: ['ArrowLeft', 'KeyA'],
      right: ['ArrowRight', 'KeyD'],
      up: ['ArrowUp', 'KeyW'],
      down: ['ArrowDown', 'KeyS'],
      action: ['Space'],
      ...mapping,
    }
    this.keys = new Set()

    this._onKeyDown = e => { this.keys.add(e.code) }
    this._onKeyUp = e => { this.keys.delete(e.code) }

    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
  }

  // Returns true if any bound key for an action is pressed
  down(action) {
    const keys = this.mapping[action] || []
    return keys.some(k => this.keys.has(k))
  }
}
