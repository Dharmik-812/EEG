// Handles keyboard/mouse/touch and configurable mapping
export class InputManager {
  constructor(canvas, mapping = {}) {
    this.canvas = canvas
    this.mapping = {
      left: ['ArrowLeft', 'KeyA'],
      right: ['ArrowRight', 'KeyD'],
      up: ['ArrowUp', 'KeyW'],
      down: ['ArrowDown', 'KeyS'],
      action: ['Space', 'Pointer'],
      ...mapping,
    }
    // ensure Pointer is included in action for taps
    if (!this.mapping.action.includes('Pointer')) this.mapping.action = [...this.mapping.action, 'Pointer']

    this.keys = new Set()

    this._onKeyDown = e => { this.keys.add(e.code) }
    this._onKeyUp = e => { this.keys.delete(e.code) }

    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)

    // Pointer to action mapping for touch/click hold
    this._onPointerDown = e => {
      // only treat primary button/touch as action
      this.keys.add('Pointer')
    }
    this._onPointerUp = e => { this.keys.delete('Pointer') }
    canvas.addEventListener('pointerdown', this._onPointerDown)
    window.addEventListener('pointerup', this._onPointerUp)

    // Optional on-screen virtual controls for touch devices
    this._virtual = null
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this._virtual = this._createVirtualControls()
    }
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
    this.canvas.removeEventListener('pointerdown', this._onPointerDown)
    window.removeEventListener('pointerup', this._onPointerUp)
    if (this._virtual?.remove) this._virtual.remove()
  }

  // Returns true if any bound key for an action is pressed
  down(action) {
    const keys = this.mapping[action] || []
    return keys.some(k => this.keys.has(k))
  }

  _createBtn(label, on, off, style) {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = label
    Object.assign(b.style, {
      touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
      background: 'rgba(15,23,42,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px',
      width: '56px', height: '56px', fontSize: '14px',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }, style || {})
    const start = e => { e.preventDefault(); on(); b.style.background = 'rgba(16,185,129,0.5)' }
    const end = e => { e.preventDefault(); off(); b.style.background = 'rgba(15,23,42,0.4)' }
    b.addEventListener('pointerdown', start)
    b.addEventListener('pointerup', end)
    b.addEventListener('pointercancel', end)
    b.addEventListener('pointerleave', end)
    return b
  }

  _createVirtualControls() {
    const wrap = document.createElement('div')
    Object.assign(wrap.style, {
      position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 9999,
    })
    const left = document.createElement('div')
    Object.assign(left.style, { position: 'absolute', left: '12px', bottom: '12px', display: 'grid', gridTemplateColumns: 'repeat(3,56px)', gap: '8px', pointerEvents: 'auto' })
    const right = document.createElement('div')
    Object.assign(right.style, { position: 'absolute', right: '12px', bottom: '12px', display: 'grid', gridTemplateColumns: '56px', gap: '8px', pointerEvents: 'auto' })

    const press = (code) => () => this.keys.add(code)
    const release = (code) => () => this.keys.delete(code)

    // D-pad: up, left, right, down
    const btnUp = this._createBtn('▲', press('ArrowUp'), release('ArrowUp'), { gridColumn: '2' })
    const btnLeft = this._createBtn('◀', press('ArrowLeft'), release('ArrowLeft'), { gridColumn: '1' })
    const btnRight = this._createBtn('▶', press('ArrowRight'), release('ArrowRight'), { gridColumn: '3' })
    const btnDown = this._createBtn('▼', press('ArrowDown'), release('ArrowDown'), { gridColumn: '2' })

    left.appendChild(btnUp)
    left.appendChild(btnLeft)
    left.appendChild(btnRight)
    left.appendChild(btnDown)

    // Action
    const btnAct = this._createBtn('A', press('Space'), release('Space'))
    right.appendChild(btnAct)

    wrap.appendChild(left)
    wrap.appendChild(right)
    document.body.appendChild(wrap)

    return {
      remove() { try { document.body.removeChild(wrap) } catch {} },
    }
  }
}
