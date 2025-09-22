// Draws background, tilemaps, sprites, text, and simple UI
export class RenderSystem {
  constructor(engine) {
    this.engine = engine
  }

  draw(scene, ctx) {
    // Clear and draw background
    ctx.clearRect(0,0,this.engine.canvas.width,this.engine.canvas.height)
    ctx.fillStyle = scene.background || '#fff'
    ctx.fillRect(0,0,scene.width, scene.height)

    // Draw by layer order; tilemaps first within a layer
    const layers = scene.layers && scene.layers.length ? scene.layers : [{ id: null }]
    // Prepare tilemap cache once
    if (!this._tileCache) this._tileCache = new Map()

    for (const layer of layers) {
      const ents = scene.entities.filter(en => (en.layerId||null) === (layer.id||null))
      // Tilemaps
      for (const e of ents.filter(en => en.components?.tilemap)) {
        const t = e.components?.transform
        if (!t) continue
        ctx.save()
        ctx.translate(t.x, t.y)
        const tm = e.components.tilemap
        const img = tm.tilesetAssetId ? this.engine.assets.getImage(tm.tilesetAssetId) : null
        const totalW = tm.cols * tm.tileWidth
        const totalH = tm.rows * tm.tileHeight
        ctx.save()
        ctx.translate(-totalW/2, -totalH/2)
        if (img) {
          const key = `${e.id}:${tm.cols}x${tm.rows}:${tm.tileWidth}x${tm.tileHeight}:${tm.tilesetAssetId}:${tm.data.length}:${tm.data.reduce((a,b)=>a+((b&255)<<1),0)}`
          let entry = this._tileCache.get(key)
          if (!entry) {
            const off = document.createElement('canvas')
            off.width = totalW; off.height = totalH
            const ox = off.getContext('2d')
            ox.imageSmoothingEnabled = false
            const tilesPerRow = Math.max(1, Math.floor(img.width / tm.tileWidth))
            for (let r = 0; r < tm.rows; r++) {
              for (let c = 0; c < tm.cols; c++) {
                const idx = tm.data[r * tm.cols + c]
                if (idx < 0) continue
                const sx = (idx % tilesPerRow) * tm.tileWidth
                const sy = Math.floor(idx / tilesPerRow) * tm.tileHeight
                ox.drawImage(img, sx, sy, tm.tileWidth, tm.tileHeight, c * tm.tileWidth, r * tm.tileHeight, tm.tileWidth, tm.tileHeight)
              }
            }
            entry = { canvas: off }
            this._tileCache.clear() // keep one cache key per tilemap instance
            this._tileCache.set(key, entry)
          }
          ctx.drawImage(entry.canvas, 0, 0)
        }
        ctx.restore()
        ctx.restore()
      }
      // Other drawables
      for (const e of ents.filter(en => !en.components?.tilemap)) {
        const t = e.components?.transform
        if (!t) continue
        ctx.save()
        // UI anchoring (root only)
        if (e.components?.ui?.anchor && !e.parentId) {
          const a = e.components.ui.anchor
          const ax = a.x || 'center', ay = a.y || 'center'
          let baseX = t.x, baseY = t.y
          if (ax === 'left') baseX = t.w/2
          else if (ax === 'center') baseX = scene.width/2
          else if (ax === 'right') baseX = scene.width - t.w/2
          if (ay === 'top') baseY = t.h/2
          else if (ay === 'center') baseY = scene.height/2
          else if (ay === 'bottom') baseY = scene.height - t.h/2
          ctx.translate(baseX, baseY)
        } else {
          ctx.translate(t.x, t.y)
        }
        ctx.rotate(((t.rotation || 0) * Math.PI) / 180)
        ctx.imageSmoothingEnabled = false

      // Sprite
      if (e.components?.sprite) {
        const spr = e.components.sprite
        const img = spr.assetId ? this.engine.assets.getImage(spr.assetId) : null
        if (img) {
          if (e.components?.animation?.current && spr.spritesheet) {
            // Sprite sheet frame draw with optional blending
            const anim = e.components.animation
            const seq = spr.spritesheet.animations?.[anim.current]
            const fw = spr.spritesheet.frameWidth || t.w
            const fh = spr.spritesheet.frameHeight || t.h
            const cols = Math.max(1, Math.floor(img.width / fw))
            const frameIdxA = seq?.frames?.[anim.frameIndex || 0] || 0
            const sxA = (frameIdxA % cols) * fw
            const syA = Math.floor(frameIdxA / cols) * fh
            if (anim.blend && anim.blend.target) {
              const seqB = spr.spritesheet.animations?.[anim.blend.target]
              if (seqB && seqB.frames && seqB.frames.length) {
                const w = Math.max(0, Math.min(1, (anim.blend.elapsed || 0) / (anim.blend.duration || 0.25)))
                const frameIdxB = seqB.frames[anim.blend.frameIndex || 0] || 0
                const sxB = (frameIdxB % cols) * fw
                const syB = Math.floor(frameIdxB / cols) * fh
                // Draw A
                ctx.globalAlpha = 1 - w
                ctx.drawImage(img, sxA, syA, fw, fh, -t.w/2, -t.h/2, t.w, t.h)
                // Overlay B
                ctx.globalAlpha = w
                ctx.drawImage(img, sxB, syB, fw, fh, -t.w/2, -t.h/2, t.w, t.h)
                ctx.globalAlpha = 1
              } else {
                ctx.drawImage(img, sxA, syA, fw, fh, -t.w/2, -t.h/2, t.w, t.h)
              }
            } else {
              ctx.drawImage(img, sxA, syA, fw, fh, -t.w/2, -t.h/2, t.w, t.h)
            }
          } else {
            ctx.drawImage(img, -t.w/2, -t.h/2, t.w, t.h)
          }
        } else {
          ctx.fillStyle = spr.fill || '#999'
          ctx.fillRect(-t.w/2, -t.h/2, t.w, t.h)
        }
      }

      // Text
      if (e.components?.text) {
        const txt = e.components.text
        ctx.fillStyle = txt.color || '#000'
        ctx.font = `${txt.size || 20}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(txt.value || '', 0, 0)
      }

      // Basic UI elements (label/panel/button/etc) drawn above
      if (e.components?.ui) {
        const ui = e.components.ui
        if (ui.type === 'panel') {
          ctx.fillStyle = ui.fill || 'rgba(0,0,0,0.2)'
          ctx.fillRect(-t.w/2, -t.h/2, t.w, t.h)
        }
        if (ui.type === 'button') {
          ctx.fillStyle = ui.fill || '#0ea5e9'
          ctx.fillRect(-t.w/2, -t.h/2, t.w, t.h)
          ctx.fillStyle = ui.textColor || '#fff'
          ctx.font = `${ui.textSize||16}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          if (ui.label) ctx.fillText(ui.label, 0, 0)
        }
        if (ui.type === 'label') {
          ctx.fillStyle = ui.textColor || '#fff'
          ctx.font = `${ui.textSize||16}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          if (ui.label) ctx.fillText(ui.label, 0, 0)
        }
        if (ui.type === 'image' && ui.assetId) {
          const img = this.engine.assets.getImage(ui.assetId)
          if (img) ctx.drawImage(img, -t.w/2, -t.h/2, t.w, t.h)
        }
        if (ui.type === 'progress') {
          ctx.fillStyle = ui.fill || '#0ea5e9'
          ctx.fillRect(-t.w/2, -t.h/2, (t.w) * Math.max(0, Math.min(1, (ui.value||0)/(ui.max||100))), t.h)
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'
          ctx.strokeRect(-t.w/2, -t.h/2, t.w, t.h)
        }
        if (ui.type === 'checkbox') {
          ctx.fillStyle = ui.fill || '#0ea5e9'
          ctx.strokeStyle = '#0ea5e9'
          ctx.strokeRect(-t.w/2, -t.h/2, t.w, t.h)
          if (ui.checked) {
            ctx.beginPath()
            ctx.moveTo(-t.w/3, 0)
            ctx.lineTo(-t.w/6, t.h/3)
            ctx.lineTo(t.w/3, -t.h/3)
            ctx.stroke()
          }
        }
        if (ui.type === 'slider') {
          ctx.fillStyle = '#334155'
          ctx.fillRect(-t.w/2, -6, t.w, 12)
          const ratio = Math.max(0, Math.min(1, (ui.value||0 - (ui.min||0))/((ui.max||100)-(ui.min||0))))
          ctx.fillStyle = ui.fill || '#0ea5e9'
          ctx.beginPath()
          ctx.arc(-t.w/2 + ratio * t.w, 0, 8, 0, Math.PI*2)
          ctx.fill()
        }
      }

        ctx.restore()
      }
    }
  }
}
