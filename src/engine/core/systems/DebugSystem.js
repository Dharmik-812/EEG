
export class DebugSystem {
    /**
     * @param {import('../Engine').Engine} engine
     */
    constructor(engine) {
        this.engine = engine
        this.fps = 0
        this.frames = 0
        this.lastTime = performance.now()
        // Listen for debug toggle (F3)
        this._onKey = (e) => {
            if (e.code === 'F3') {
                this.engine.debug = !this.engine.debug
            }
        }
        window.addEventListener('keydown', this._onKey)
    }

    destroy() {
        window.removeEventListener('keydown', this._onKey)
    }

    update(scene, dt) {
        this.frames++
        const now = performance.now()
        if (now - this.lastTime >= 1000) {
            this.fps = this.frames
            this.frames = 0
            this.lastTime = now
        }
    }

    draw(scene, ctx) {
        if (!this.engine.debug) return

        // Draw Colliders
        ctx.save()
        ctx.lineWidth = 1
        for (const e of scene.entities) {
            const t = e.components?.transform
            const c = e.components?.collider
            if (!t || !c) continue

            ctx.beginPath()
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'

            if (c.type === 'circle') {
                const r = c.circle?.r || t.w / 2
                ctx.arc(t.x, t.y, r, 0, Math.PI * 2)
            } else if (c.type === 'polygon') {
                // Simple point connecting
                const pts = c.points || []
                if (pts.length) {
                    const rad = ((t.rotation || 0) * Math.PI) / 180
                    const cos = Math.cos(rad), sin = Math.sin(rad)
                    const first = pts[0]
                    const fx = t.x + first.x * cos - first.y * sin
                    const fy = t.y + first.x * sin + first.y * cos
                    ctx.moveTo(fx, fy)
                    for (let i = 1; i < pts.length; i++) {
                        const p = pts[i]
                        const px = t.x + p.x * cos - p.y * sin
                        const py = t.y + p.x * sin + p.y * cos
                        ctx.lineTo(px, py)
                    }
                    ctx.closePath()
                }
            } else {
                // AABB or generic rect (respect rotation for viz)
                const w = c.w || t.w
                const h = c.h || t.h
                if (t.rotation) {
                    ctx.translate(t.x, t.y)
                    ctx.rotate((t.rotation * Math.PI) / 180)
                    ctx.rect(-w / 2, -h / 2, w, h)
                    ctx.rotate(-(t.rotation * Math.PI) / 180)
                    ctx.translate(-t.x, -t.y)
                } else {
                    ctx.rect(t.x - w / 2, t.y - h / 2, w, h)
                }
            }
            ctx.stroke()
        }
        ctx.restore()

        // Draw FPS and Entity Count Overlay
        ctx.save()
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.fillRect(0, 0, 140, 50)
        ctx.fillStyle = '#0f0'
        ctx.font = '12px monospace'
        ctx.textBaseline = 'top'
        ctx.fillText(`FPS: ${this.fps}`, 10, 10)
        ctx.fillText(`Entities: ${scene.entities.length}`, 10, 28)
        ctx.restore()
    }
}
