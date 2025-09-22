import { useEditorStore } from '../../store/editorStore'
import { useRef, useEffect, useState } from 'react'

export default function ViewportCanvas() {
  const canvasRef = useRef(null)
  const { currentScene, selectedEntityId, selectEntity, updateSelected, zoom, grid } = useEditorStore(s => ({
    currentScene: s.currentScene,
    selectedEntityId: s.selectedEntityId,
    selectEntity: s.selectEntity,
    updateSelected: s.updateSelected,
    zoom: s.zoom,
    grid: s.grid,
  }))
  const addSpriteWithAsset = useEditorStore(s => s.addSpriteWithAsset)
  const project = useEditorStore(s => s.project)

  const [dragging, setDragging] = useState(null) // { offsetX, offsetY }
  const [resizing, setResizing] = useState(false)

  // cache images for project assets
  const imagesRef = useRef({})
  useEffect(() => {
    const map = {}
    for (const a of project.assets) {
      if (a.type === 'image') {
        const img = new Image()
        img.src = a.src
        map[a.id] = img
      }
    }
    imagesRef.current = map
  }, [project.assets])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function draw() {
      const scene = currentScene()
      if (!scene) return requestAnimationFrame(draw)
      if (canvas.width !== scene.width || canvas.height !== scene.height) {
        canvas.width = scene.width
        canvas.height = scene.height
      }

      ctx.clearRect(0,0,canvas.width,canvas.height)
      ctx.save()
      ctx.scale(zoom, zoom)
      ctx.fillStyle = scene.background || '#fff'
      ctx.fillRect(0,0,scene.width, scene.height)

      if (grid) {
        ctx.strokeStyle = 'rgba(0,0,0,0.05)'
        for (let x=0; x<scene.width; x+=20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,scene.height); ctx.stroke() }
        for (let y=0; y<scene.height; y+=20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(scene.width,y); ctx.stroke() }
      }

      for (const e of scene.entities) {
        const t = e.components.transform
        ctx.save()
        ctx.translate(t.x, t.y)
        if (e.components.sprite) {
          const spr = e.components.sprite
          if (spr.assetId && imagesRef.current[spr.assetId]) {
            ctx.drawImage(imagesRef.current[spr.assetId], -t.w/2, -t.h/2, t.w, t.h)
          } else {
            ctx.fillStyle = spr.fill || '#94a3b8'
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

      const sel = scene.entities.find(e => e.id === selectedEntityId)
      if (sel) {
        const t = sel.components.transform
        ctx.save()
        ctx.translate(t.x, t.y)
        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth = 2
        ctx.strokeRect(-t.w/2, -t.h/2, t.w, t.h)
        // resize handle
        ctx.fillStyle = '#22c55e'
        ctx.fillRect(t.w/2 - 6, t.h/2 - 6, 12, 12)
        ctx.restore()
      }
      ctx.restore()
      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)
  }, [currentScene, selectedEntityId, zoom, grid])

  function pointToScene(evt) {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = (canvasRef.current.width / rect.width) || 1
    const scaleY = (canvasRef.current.height / rect.height) || 1
    const x = ((evt.clientX - rect.left) * scaleX) / zoom
    const y = ((evt.clientY - rect.top) * scaleY) / zoom
    return { x, y }
  }

  function onMouseDown(e) {
    const scene = currentScene()
    const { x, y } = pointToScene(e)
    const hit = [...scene.entities].reverse().find(ent => {
      const t = ent.components.transform
      return x >= t.x - t.w/2 && x <= t.x + t.w/2 && y >= t.y - t.h/2 && y <= t.y + t.h/2
    })
    if (hit) {
      selectEntity(hit.id)
      const t = hit.components.transform
      // check resize handle (bottom-right corner)
      if (x >= t.x + t.w/2 - 12 && x <= t.x + t.w/2 && y >= t.y + t.h/2 - 12 && y <= t.y + t.h/2) {
        setResizing(true)
      } else {
        setDragging({ offsetX: x - t.x, offsetY: y - t.y })
      }
    } else {
      selectEntity(null)
    }
  }

  function onMouseMove(e) {
    if (!selectedEntityId) return
    const { x, y } = pointToScene(e)
    if (resizing) {
      // resize from center to pointer delta
      const scene = currentScene()
      const ent = scene.entities.find(en => en.id === selectedEntityId)
      if (!ent) return
      const t = { ...ent.components.transform }
      const w = Math.max(10, (x - t.x) * 2)
      const h = Math.max(10, (y - t.y) * 2)
      updateSelected(['transform', 'w'], grid ? Math.round(w / 10) * 10 : Math.round(w))
      updateSelected(['transform', 'h'], grid ? Math.round(h / 10) * 10 : Math.round(h))
      return
    }
    if (!dragging) return
    const nx = Math.round(x - dragging.offsetX)
    const ny = Math.round(y - dragging.offsetY)
    updateSelected(['transform', 'x'], grid ? Math.round(nx / 10) * 10 : nx)
    updateSelected(['transform', 'y'], grid ? Math.round(ny / 10) * 10 : ny)
  }

  function onMouseUp() { setDragging(null); setResizing(false) }

  function onDrop(e) {
    e.preventDefault()
    const assetId = e.dataTransfer.getData('asset/id')
    if (!assetId) return
    const { x, y } = pointToScene(e)
    addSpriteWithAsset(assetId, x, y, 100, 100)
  }

  function onDragOver(e) { e.preventDefault() }

  return (
    <div className="relative w-full overflow-auto border rounded-xl bg-slate-50 dark:bg-slate-900">
      <canvas
        ref={canvasRef}
        className="block mx-auto my-4 shadow w-full h-auto max-w-full"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onDrop={onDrop}
        onDragOver={onDragOver}
      />
    </div>
  )
}

