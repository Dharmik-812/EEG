export function runProject(canvas, project, opts = {}) {
  const ctx = canvas.getContext('2d')
  let scene = project.scenes.find(s => s.id === (project.startSceneId || project.scenes[0].id))
  let last = 0
  let score = 0
  let running = true

  function getEntityById(id) { return scene.entities.find(e => e.id === id) }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = scene.background || '#fff'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    for (const e of scene.entities) {
      const t = e.components.transform
      ctx.save()
      ctx.translate(t.x, t.y)
      ctx.rotate((t.rotation || 0) * Math.PI/180)
      if (e.components.sprite) {
        const spr = e.components.sprite
        if (spr.assetId) {
          const img = images[spr.assetId]
          if (img) ctx.drawImage(img, -t.w/2, -t.h/2, t.w, t.h)
          else { ctx.fillStyle = spr.fill || '#999'; ctx.fillRect(-t.w/2, -t.h/2, t.w, t.h) }
        } else {
          ctx.fillStyle = spr.fill || '#999'
          ctx.fillRect(-t.w/2, -t.h/2, t.w, t.h)
        }
      }
      if (e.components.text) {
        const txt = e.components.text
        ctx.fillStyle = txt.color || '#000'
        ctx.font = `${txt.size || 20}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(txt.value || '', 0, 0)
      }
      ctx.restore()
    }
  }

  function aabb(a, b) {
    const ta = a.components.transform, tb = b.components.transform
    return Math.abs(ta.x - tb.x) * 2 < (ta.w + tb.w) && Math.abs(ta.y - tb.y) * 2 < (ta.h + tb.h)
  }

  function step(dt) {
    for (const e of scene.entities) {
      const rb = e.components.rigidbody
      if (rb) {
        rb.vy += (rb.gravity || 0) * dt
        e.components.transform.x += rb.vx * dt
        e.components.transform.y += rb.vy * dt
      }
    }

    // simple overlap events
    for (const e of scene.entities) {
      if (!e.components.collider) continue
      for (const f of scene.entities) {
        if (e === f || !f.components?.collider) continue
        if (aabb(e, f)) triggerEvent(e, 'onOverlap', { other: f })
      }
    }
  }

  function triggerEvent(entity, event, payload) {
    const handler = entity?.components?.interactable?.[event]
    if (!handler) return
    for (const action of handler) {
      switch (action.type) {
        case 'moveBy': {
          const t = entity.components.transform
          t.x += action.dx || 0
          t.y += action.dy || 0
          break
        }
        case 'addScore': {
          score += action.amount || 0
          break
        }
        case 'gotoScene': {
          const next = project.scenes.find(s => s.id === action.sceneId)
          if (next) scene = next
          break
        }
        case 'showMessage': {
          opts.onMessage?.(action.text || '')
          break
        }
      }
    }
  }

  function onClick(evt) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = (canvas.width / rect.width) || 1
    const scaleY = (canvas.height / rect.height) || 1
    const x = (evt.clientX - rect.left) * scaleX
    const y = (evt.clientY - rect.top) * scaleY
    // find topmost entity under point
    const hit = [...scene.entities].reverse().find(e => {
      const t = e.components.transform
      return x >= t.x - t.w/2 && x <= t.x + t.w/2 && y >= t.y - t.h/2 && y <= t.y + t.h/2
    })
    if (hit) triggerEvent(hit, 'onClick', {})
  }

  const images = {}
  for (const a of project.assets || []) {
    if (a.type === 'image') {
      const img = new Image()
      img.src = a.src
      images[a.id] = img
    }
  }

  canvas.addEventListener('click', onClick)

  function loop(ts) {
    if (!running) return
    const dt = (ts - last) / 1000
    last = ts
    step(dt)
    draw()
    requestAnimationFrame(loop)
  }

  // resize canvas to scene
  canvas.width = scene.width
  canvas.height = scene.height
  last = performance.now()
  requestAnimationFrame(loop)

  return {
    stop() { running = false; canvas.removeEventListener('click', onClick) },
    getScore() { return score }
  }
}

