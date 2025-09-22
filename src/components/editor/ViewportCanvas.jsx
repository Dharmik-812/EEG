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
  const camera = useEditorStore(s => s.camera)
  const setCamera = useEditorStore(s => s.setCamera)
  const addSpriteWithAsset = useEditorStore(s => s.addSpriteWithAsset)
  const project = useEditorStore(s => s.project)

  const [dragging, setDragging] = useState(null) // { offsetX, offsetY }
  const [resizing, setResizing] = useState(false)
  const [polyDrag, setPolyDrag] = useState(null) // { entityId, index }

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
      ctx.translate(camera.x, camera.y)
      ctx.fillStyle = scene.background || '#fff'
      ctx.fillRect(0,0,scene.width, scene.height)

      if (grid) {
        ctx.strokeStyle = 'rgba(0,0,0,0.05)'
        for (let x=0; x<scene.width; x+=20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,scene.height); ctx.stroke() }
        for (let y=0; y<scene.height; y+=20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(scene.width,y); ctx.stroke() }
      }

      // draw by layer order for WYSIWYG
      const layers = scene.layers && scene.layers.length ? scene.layers : [{ id: null }]
      for (const layer of layers) {
        for (const e of scene.entities.filter(en => (en.layerId||null) === (layer.id||null))) {
          const t = e.components.transform
          ctx.save()
          ctx.translate(t.x, t.y)

          // tilemap
          if (e.components.tilemap) {
            const tm = e.components.tilemap
            const img = tm.tilesetAssetId ? imagesRef.current[tm.tilesetAssetId] : null
            const totalW = tm.cols * tm.tileWidth
            const totalH = tm.rows * tm.tileHeight
            ctx.save()
            ctx.translate(-totalW/2, -totalH/2)
            if (img) {
              const tilesPerRow = Math.max(1, Math.floor(img.width / tm.tileWidth))
              for (let r = 0; r < tm.rows; r++) {
                for (let c = 0; c < tm.cols; c++) {
                  const idx = tm.data[r * tm.cols + c]
                  if (idx < 0) continue
                  const sx = (idx % tilesPerRow) * tm.tileWidth
                  const sy = Math.floor(idx / tilesPerRow) * tm.tileHeight
                  ctx.drawImage(img, sx, sy, tm.tileWidth, tm.tileHeight, c * tm.tileWidth, r * tm.tileHeight, tm.tileWidth, tm.tileHeight)
                }
              }
            } else {
              // draw grid placeholder
              ctx.strokeStyle = 'rgba(0,0,0,0.1)'
              for (let x=0; x<=totalW; x+=tm.tileWidth) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,totalH); ctx.stroke() }
              for (let y=0; y<=totalH; y+=tm.tileHeight) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(totalW,y); ctx.stroke() }
            }
            ctx.restore()
          }

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
      }

      const sel = scene.entities.find(e => e.id === selectedEntityId)
      if (sel) {
        const t = sel.components.transform
        ctx.save()
        ctx.translate(t.x, t.y)
        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth = 2
        if (!sel.components.tilemap) {
          ctx.strokeRect(-t.w/2, -t.h/2, t.w, t.h)
          // resize handle
          ctx.fillStyle = '#22c55e'
          ctx.fillRect(t.w/2 - 6, t.h/2 - 6, 12, 12)
        } else {
          const tm = sel.components.tilemap
          const totalW = tm.cols * tm.tileWidth
          const totalH = tm.rows * tm.tileHeight
          ctx.strokeRect(-totalW/2, -totalH/2, totalW, totalH)
        }

        // polygon collider handles
        if (sel.components.collider?.type === 'polygon' && Array.isArray(sel.components.collider.points)) {
          const pts = sel.components.collider.points
          const rad = (t.rotation || 0) * Math.PI/180
          const cos = Math.cos(rad), sin = Math.sin(rad)
          ctx.fillStyle = '#22c55e'
          for (let i=0;i<pts.length;i++) {
            const p = pts[i]
            const px = p.x * cos - p.y * sin
            const py = p.x * sin + p.y * cos
            ctx.fillRect(px - 4, py - 4, 8, 8)
          }
        }
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
    const x = ((evt.clientX - rect.left) * scaleX) / zoom - camera.x
    const y = ((evt.clientY - rect.top) * scaleY) / zoom - camera.y
    return { x, y }
  }

  function onMouseDown(e) {
    // Panning with middle mouse or Alt+Left
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setDragging({ pan: true, startX: e.clientX, startY: e.clientY, camX: camera.x, camY: camera.y })
      return
    }
    const scene = currentScene()
    const { x, y } = pointToScene(e)
    const hit = [...scene.entities].reverse().find(ent => {
      const t = ent.components.transform
      // tilemap bounds based on total size
      if (ent.components.tilemap) {
        const tm = ent.components.tilemap
        const totalW = tm.cols * tm.tileWidth
        const totalH = tm.rows * tm.tileHeight
        return x >= t.x - totalW/2 && x <= t.x + totalW/2 && y >= t.y - totalH/2 && y <= t.y + totalH/2
      }
      return x >= t.x - t.w/2 && x <= t.x + t.w/2 && y >= t.y - t.h/2 && y <= t.y + t.h/2
    })

    if (hit) {
      selectEntity(hit.id)

      // Polygon vertex drag detection
      if (hit.components.collider?.type === 'polygon') {
        const t = hit.components.transform
        const rad = (t.rotation || 0) * Math.PI/180
        const cos = Math.cos(rad), sin = Math.sin(rad)
        const lx = x - t.x, ly = y - t.y
        // transform to local
        const localX = lx * cos + ly * sin
        const localY = -lx * sin + ly * cos
        const pts = hit.components.collider.points || []
        for (let i=0;i<pts.length;i++) {
          const p = pts[i]
          if (Math.abs(localX - p.x) <= 6 && Math.abs(localY - p.y) <= 6) {
            setPolyDrag({ entityId: hit.id, index: i })
            return
          }
        }
      }

      // Tile painting with Ctrl
      if (e.ctrlKey && hit.components.tilemap) {
        const tm = hit.components.tilemap
        const originX = hit.components.transform.x - (tm.cols * tm.tileWidth)/2
        const originY = hit.components.transform.y - (tm.rows * tm.tileHeight)/2
        const col = Math.floor((x - originX) / tm.tileWidth)
        const row = Math.floor((y - originY) / tm.tileHeight)
        useEditorStore.getState().paintTile(hit.id, col, row, tm.paintIndex || 0)
        setDragging({ paintTilemap: true, entityId: hit.id })
        return
      }

      const t = hit.components.transform
      // check resize handle (bottom-right corner) for non-tilemap
      if (!hit.components.tilemap && x >= t.x + t.w/2 - 12 && x <= t.x + t.w/2 && y >= t.y + t.h/2 - 12 && y <= t.y + t.h/2) {
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

    // Polygon vertex dragging
    if (polyDrag) {
      const scene = currentScene()
      const ent = scene.entities.find(en => en.id === polyDrag.entityId)
      if (!ent) return
      const t = ent.components.transform
      // world to local
      const rad = (t.rotation || 0) * Math.PI/180
      const cos = Math.cos(rad), sin = Math.sin(rad)
      const lx = x - t.x, ly = y - t.y
      const localX = lx * cos + ly * sin
      const localY = -lx * sin + ly * cos
      useEditorStore.getState().updatePolygonVertex(ent.id, polyDrag.index, localX, localY)
      return
    }

    // Continue painting tilemap with Ctrl
    if (dragging?.paintTilemap) {
      const scene = currentScene()
      const ent = scene.entities.find(en => en.id === dragging.entityId)
      if (!ent) return
      const tm = ent.components.tilemap
      const originX = ent.components.transform.x - (tm.cols * tm.tileWidth)/2
      const originY = ent.components.transform.y - (tm.rows * tm.tileHeight)/2
      const col = Math.floor((x - originX) / tm.tileWidth)
      const row = Math.floor((y - originY) / tm.tileHeight)
      useEditorStore.getState().paintTile(ent.id, col, row, tm.paintIndex || 0)
      return
    }

    if (dragging?.pan) {
      const dx = (e.clientX - dragging.startX) / zoom
      const dy = (e.clientY - dragging.startY) / zoom
      setCamera(dragging.camX + dx, dragging.camY + dy)
      return
    }

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
    if (dragging.paintTilemap) return
    const nx = Math.round(x - dragging.offsetX)
    const ny = Math.round(y - dragging.offsetY)
    updateSelected(['transform', 'x'], grid ? Math.round(nx / 10) * 10 : nx)
    updateSelected(['transform', 'y'], grid ? Math.round(ny / 10) * 10 : ny)
  }

  function onMouseUp() { setDragging(null); setResizing(false); setPolyDrag(null) }

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

