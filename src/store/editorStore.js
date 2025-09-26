import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const seedAssets = () => ([
  { id: 'asset-tree', name: 'Tree', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect x="56" y="70" width="16" height="40" fill="%238c5a3c"/><circle cx="64" cy="56" r="36" fill="%2310b981"/></svg>' },
  { id: 'asset-leaf', name: 'Leaf', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><path d="M16 64c0 30 24 48 48 48 38 0 48-48 48-80-40 0-96 16-96 32z" fill="%2322c55e"/></svg>' },
  { id: 'asset-recycle', name: 'Recycle', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><polygon points="64,12 76,34 52,34" fill="%230ea5e9"/><polygon points="16,76 38,64 38,88" fill="%230ea5e9"/><polygon points="112,76 90,88 90,64" fill="%230ea5e9"/><path d="M64 22l12 20H52l12-20zM26 72l20-12v24L26 72zm76 0l-20 12V60l20 12z" fill="%230ea5e9"/></svg>' },
  { id: 'asset-sun', name: 'Sun', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="28" fill="%23f59e0b"/><g stroke="%23f59e0b" stroke-width="8"><line x1="64" y1="4" x2="64" y2="24"/><line x1="64" y1="104" x2="64" y2="124"/><line x1="4" y1="64" x2="24" y2="64"/><line x1="104" y1="64" x2="124" y2="64"/><line x1="20" y1="20" x2="34" y2="34"/><line x1="94" y1="94" x2="108" y2="108"/><line x1="20" y1="108" x2="34" y2="94"/><line x1="94" y1="34" x2="108" y2="20"/></g></svg>' },
  { id: 'asset-wind', name: 'Wind', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><path d="M12 48h70a14 14 0 1 0-14-14" fill="none" stroke="%230ea5e9" stroke-width="10" stroke-linecap="round"/><path d="M12 80h90a16 16 0 1 1-16 16" fill="none" stroke="%230ea5e9" stroke-width="10" stroke-linecap="round"/></svg>' },
  { id: 'asset-cloud', name: 'Cloud', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><path d="M40 88h48a20 20 0 1 0-6-39 24 24 0 0 0-46 7A18 18 0 1 0 40 88z" fill="%23e2e8f0"/></svg>' },
  { id: 'asset-water', name: 'Water Drop', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><path d="M64 12c28 36 36 52 36 68a36 36 0 0 1-72 0c0-16 8-32 36-68z" fill="%230ea5e9"/></svg>' },
  { id: 'asset-panel', name: 'Solar Panel', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect x="16" y="32" width="96" height="48" rx="6" fill="%2310b981"/><g stroke="%23ffffff" stroke-width="4"><line x1="16" y1="48" x2="112" y2="48"/><line x1="16" y1="64" x2="112" y2="64"/><line x1="40" y1="32" x2="40" y2="80"/><line x1="72" y1="32" x2="72" y2="80"/></g></svg>' },
  { id: 'asset-turbine', name: 'Wind Turbine', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect x="60" y="60" width="8" height="56" fill="%2394a3b8"/><circle cx="64" cy="56" r="8" fill="%2394a3b8"/><g fill="%2394a3b8"><path d="M64 56 L108 44 L64 56 Z"/><path d="M64 56 L20 44 L64 56 Z"/><path d="M64 56 L64 12 L64 56 Z"/></g></svg>' },
  // New environmental assets
  { id: 'asset-grass-tile', name: 'Grass Tile', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23145a32"/><rect y="96" width="128" height="32" fill="%23734d26"/><g stroke="%2310b981" stroke-width="4"><path d="M8 96 l10 -20"/><path d="M24 96 l8 -18"/><path d="M40 96 l12 -22"/><path d="M60 96 l10 -20"/><path d="M80 96 l8 -18"/><path d="M100 96 l12 -22"/><path d="M120 96 l6 -14"/></g></svg>' },
  { id: 'asset-dirt-tile', name: 'Dirt Tile', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23734d26"/><g fill="%238c5a3c"><circle cx="20" cy="20" r="6"/><circle cx="80" cy="28" r="5"/><circle cx="50" cy="60" r="4"/><circle cx="100" cy="100" r="6"/></g></svg>' },
  { id: 'asset-stone', name: 'Stone', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="96" viewBox="0 0 128 96"><ellipse cx="64" cy="64" rx="56" ry="28" fill="%2394a3b8"/></svg>' },
  { id: 'asset-bush', name: 'Bush', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100"><circle cx="40" cy="60" r="30" fill="%2310b981"/><circle cx="80" cy="55" r="35" fill="%2310b981"/><circle cx="120" cy="60" r="28" fill="%2310b981"/></svg>' },
  { id: 'asset-water-tile', name: 'Water Tile', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%230ea5e9"/><g stroke="%23ffffff" stroke-opacity="0.5" stroke-width="4" fill="none"><path d="M0 32 C 16 16, 48 16, 64 32 S 112 48, 128 32"/><path d="M0 64 C 16 48, 48 48, 64 64 S 112 80, 128 64"/><path d="M0 96 C 16 80, 48 80, 64 96 S 112 112, 128 96"/></g></svg>' },
  { id: 'asset-mountain', name: 'Mountain', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="128" viewBox="0 0 200 128"><polygon points="0,128 60,40 100,88 140,32 200,128" fill="%238ca3af"/></svg>' },
  { id: 'asset-rain', name: 'Rain Overlay', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23000000" fill-opacity="0"/><g stroke="%230ea5e9" stroke-opacity="0.6" stroke-width="3"><line x1="10" y1="0" x2="0" y2="16"/><line x1="40" y1="0" x2="30" y2="16"/><line x1="70" y1="0" x2="60" y2="16"/><line x1="100" y1="0" x2="90" y2="16"/></g></svg>' },
  { id: 'asset-snow', name: 'Snow Overlay', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23000000" fill-opacity="0"/><g fill="%23ffffff" fill-opacity="0.7"><circle cx="12" cy="12" r="3"/><circle cx="40" cy="20" r="2"/><circle cx="70" cy="10" r="3"/><circle cx="96" cy="18" r="2"/><circle cx="24" cy="48" r="2"/><circle cx="80" cy="46" r="3"/><circle cx="110" cy="52" r="2"/></g></svg>' },
  { id: 'asset-lightning', name: 'Lightning', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="128" viewBox="0 0 64 128"><polygon points="24,0 40,0 28,48 44,48 8,128 24,72 8,72" fill="%23fde047"/></svg>' },
])

const defaultProject = () => ({
  version: 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  id: `p-${Date.now()}`,
  name: 'Untitled Eco Game',
  scenes: [
    {
      id: 'scene-1',
      name: 'Main',
      width: 960,
      height: 540,
      background: '#e6f7f1',
      bgm: null,
      bgmVolume: 0.6,
      layers: [ { id: 'layer-default', name: 'Layer 1' } ],
      entities: [
        {
          id: 'e-1',
          name: 'Player',
          layerId: 'layer-default',
          parentId: null,
          components: {
            transform: { x: 100, y: 100, w: 80, h: 80, rotation: 0 },
            sprite: { fill: '#10b981' },
            collider: { w: 80, h: 80, type: 'aabb' },
            rigidbody: { vx: 0, vy: 0, gravity: 0 },
            interactable: { onClick: [{ type: 'moveBy', dx: 10, dy: 0 }] },
          },
        },
      ],
    },
  ],
  assets: seedAssets(), // {id, name, type:'image'|'audio'|'script', src}
  startSceneId: 'scene-1',
  input: { left: ['ArrowLeft','KeyA'], right: ['ArrowRight','KeyD'], up: ['ArrowUp','KeyW'], down: ['ArrowDown','KeyS'], action: ['Space'] },
})

export const useEditorStore = create(
  persist(
    (set, get) => ({
      project: defaultProject(),
      selectedEntityId: null,
      selectedSceneId: 'scene-1',
      mode: 'edit', // 'edit' | 'play'
      zoom: 1,
      grid: true,
      camera: { x: 0, y: 0 },
      history: [],
      redo: [],

      newProject: () => set({ project: defaultProject(), selectedEntityId: null, selectedSceneId: 'scene-1', history: [], redo: [] }),
      loadProject: (proj) => set({ project: { ...proj, version: proj.version || 1, updatedAt: Date.now() }, selectedEntityId: null, selectedSceneId: proj.startSceneId || proj.scenes[0]?.id, history: [], redo: [] }),
      exportProject: () => JSON.stringify({ ...get().project, updatedAt: Date.now() }, null, 2),

      setZoom: (z) => set({ zoom: Math.min(3, Math.max(0.25, z)) }),
      toggleGrid: () => set(state => ({ grid: !state.grid })),
      setMode: (m) => set({ mode: m }),
      setCamera: (x, y) => set({ camera: { x, y } }),
      pushHistory: () => set(state => ({ history: [...state.history.slice(-29), JSON.stringify(state.project) ], redo: [] })),
      undo: () => set(state => {
        if (state.history.length === 0) return {}
        const prev = state.history[state.history.length - 1]
        const newHist = state.history.slice(0, -1)
        return { project: JSON.parse(prev), history: newHist, redo: [JSON.stringify(state.project), ...state.redo] }
      }),
      redoAction: () => set(state => {
        if (state.redo.length === 0) return {}
        const next = state.redo[0]
        return { project: JSON.parse(next), redo: state.redo.slice(1), history: [...state.history, JSON.stringify(state.project)] }
      }),

      currentScene: () => get().project.scenes.find(s => s.id === get().selectedSceneId),
      updateScene: (path, value) => set(state => {
        const scene = get().currentScene()
        if (!scene) return {}
        const updated = { ...state.project, updatedAt: Date.now() }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        const newScene = { ...scene }
        let target = newScene
        for (let i = 0; i < path.length - 1; i++) target = target[path[i]]
        target[path[path.length - 1]] = value
        updated.scenes[sidx] = newScene
        return { project: updated }
      }),

      selectScene: (id) => set({ selectedSceneId: id, selectedEntityId: null }),
      addScene: (name = 'New Scene') => set(state => {
        const id = `scene-${Date.now()}`
        return { project: { ...state.project, updatedAt: Date.now(), scenes: [...state.project.scenes, { id, name, width: 960, height: 540, background: '#e6f7f1', entities: [] }] } }
      }),

      selectEntity: (id) => set({ selectedEntityId: id }),
      addEntity: (kind = 'sprite') => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const id = `e-${Date.now()}`
        const layerId = scene.layers?.[0]?.id || 'layer-default'
        const base = { id, layerId, parentId: null, name: kind === 'text' ? 'Text' : (kind==='tilemap'?'Tilemap':'Sprite'), components: { transform: { x: 50, y: 50, w: 100, h: 100, rotation: 0 } } }
        if (kind === 'sprite') base.components.sprite = { fill: '#34d399' }
        if (kind === 'text') base.components.text = { value: 'Hello Earth', size: 24, color: '#065f46' }
        if (kind === 'tilemap') base.components.tilemap = { tileWidth: 32, tileHeight: 32, cols: Math.floor((scene.width-40)/32), rows: Math.floor((scene.height-40)/32), tilesetAssetId: null, paintIndex: 0, data: Array(Math.floor((scene.width-40)/32)*Math.floor((scene.height-40)/32)).fill(-1) }
        const updated = { ...state.project, updatedAt: Date.now() }
        const idx = updated.scenes.findIndex(s => s.id === scene.id)
        updated.scenes[idx] = { ...scene, entities: [...scene.entities, base] }
        return { project: updated, selectedEntityId: id }
      }),
      addSpriteWithAsset: (assetId, x = 50, y = 50, w = 100, h = 100) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const id = `e-${Date.now()}`
        const layerId = scene.layers?.[0]?.id || 'layer-default'
        const base = { id, layerId, parentId: null, name: 'Sprite', components: { transform: { x, y, w, h, rotation: 0 }, sprite: { fill: '#34d399', assetId } } }
        const updated = { ...state.project, updatedAt: Date.now() }
        const idx = updated.scenes.findIndex(s => s.id === scene.id)
        updated.scenes[idx] = { ...scene, entities: [...scene.entities, base] }
        return { project: updated, selectedEntityId: id }
      }),
      moveSelectedZ: (dir) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const id = state.selectedEntityId
        if (!id) return {}
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        // Only reorder within same layer
        const layerId = scene.entities.find(e=>e.id===id)?.layerId || null
        const sameLayer = scene.entities.filter(e=>e.layerId===layerId)
        const indices = sameLayer.map(e=>scene.entities.findIndex(x=>x.id===e.id))
        const i = indices.indexOf(scene.entities.findIndex(e=>e.id===id))
        if (i === -1) return {}
        const j = Math.max(0, Math.min(indices.length - 1, i + dir))
        if (i === j) return {}
        const entities = [...scene.entities]
        const idxA = indices[i]
        const idxB = indices[j]
        const [ent] = entities.splice(idxA, 1)
        entities.splice(idxB, 0, ent)
        const updated = { ...state.project, updatedAt: Date.now() }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      deleteSelected: () => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const id = state.selectedEntityId
        if (!id) return {}
        const updated = { ...state.project, updatedAt: Date.now() }
        const idx = updated.scenes.findIndex(s => s.id === scene.id)
        updated.scenes[idx] = { ...scene, entities: scene.entities.filter(e => e.id !== id) }
        return { project: updated, selectedEntityId: null }
      }),
      updateSelected: (path, value) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const id = state.selectedEntityId
        if (!id) return {}
        const updated = { ...state.project, updatedAt: Date.now() }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === id)
        const entity = { ...scene.entities[eidx] }
        const compKey = path[0]
        const propPath = path.slice(1)
        // Special case for entity-level props
        if (compKey === '$entity') {
          let target = entity
          for (let i = 1; i < path.length - 1; i++) target = target[path[i]]
          target[path[path.length - 1]] = value
        } else {
          entity.components = { ...entity.components }
          entity.components[compKey] = { ...entity.components[compKey] }
          let target = entity.components[compKey]
          for (let i = 0; i < propPath.length - 1; i++) target = target[propPath[i]]
          target[propPath[propPath.length - 1]] = value
        }
        const newScene = { ...scene }
        newScene.entities = [...scene.entities]
        newScene.entities[eidx] = entity
        updated.scenes[sidx] = newScene
        return { project: updated }
      }),

      addComponent: (kind) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const id = state.selectedEntityId
        if (!id) return {}
        const updated = { ...state.project, updatedAt: Date.now() }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === id)
        const entity = { ...scene.entities[eidx] }
        entity.components = { ...entity.components }
        const t = entity.components.transform || { x:0, y:0, w:100, h:100, rotation:0 }
        const defaults = {
          rigidbody: { vx: 0, vy: 0, ax: 0, ay: 0, gravity: 0, friction: 0 },
          collider: { type: 'aabb', w: t.w, h: t.h, circle: { r: Math.floor(Math.max(t.w, t.h)/2) }, points: [{x:-t.w/2,y:-t.h/2},{x:t.w/2,y:-t.h/2},{x:t.w/2,y:t.h/2},{x:-t.w/2,y:t.h/2}] },
          script: { code: "function onUpdate(event, payload, api) { /* called every frame */ }\nfunction onCollision(event, payload, api) { /* payload.other */ }\nfunction onClick(event, payload, api) { /* ... */ }" },
          audioSource: { assetId: null, volume: 1.0, loop: false },
          ui: { type: 'panel', label: 'Button', textColor: '#ffffff', textSize: 16, fill: '#0ea5e9', value: 0, min: 0, max: 100, checked: false, assetId: null, anchor: { x: 'center', y: 'center' } },
          animation: { current: '', speed: 10, blend: null },
          timeline: { duration: 5, playing: false, loop: true, t: 0, tracks: { transform: { x: [], y: [], rotation: [] } } },
        }
        if (!defaults[kind]) return {}
        entity.components[kind] = { ...defaults[kind], ...(entity.components[kind]||{}) }
        const newScene = { ...scene }
        newScene.entities = [...scene.entities]
        newScene.entities[eidx] = entity
        updated.scenes[sidx] = newScene
        return { project: updated }
      }),

      removeComponent: (kind) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const id = state.selectedEntityId
        if (!id) return {}
        const updated = { ...state.project, updatedAt: Date.now() }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === id)
        const entity = { ...scene.entities[eidx] }
        entity.components = { ...entity.components }
        delete entity.components[kind]
        const newScene = { ...scene }
        newScene.entities = [...scene.entities]
        newScene.entities[eidx] = entity
        updated.scenes[sidx] = newScene
        return { project: updated }
      }),

      // Polygon collider helpers
      updatePolygonVertex: (entityId, index, x, y) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const col = { ...(ent.components.collider || { type:'polygon', points: [] }) }
        col.points = [...(col.points || [])]
        if (!col.points[index]) return {}
        col.points[index] = { x, y }
        ent.components = { ...ent.components, collider: col }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project, updatedAt: Date.now() }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      addPolygonVertex: (entityId, x, y) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const col = { ...(ent.components.collider || { type:'polygon', points: [] }) }
        col.type = 'polygon'
        col.points = [...(col.points || []), { x, y }]
        ent.components = { ...ent.components, collider: col }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project, updatedAt: Date.now() }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      removePolygonVertexLast: (entityId) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const col = { ...(ent.components.collider || { type:'polygon', points: [] }) }
        col.points = [...(col.points || [])]
        col.points.pop()
        ent.components = { ...ent.components, collider: col }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project, updatedAt: Date.now() }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),

      importAsset: (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            const id = `asset-${Date.now()}`
            let type = 'image'
            if (file.type.startsWith('audio/')) type = 'audio'
            // allow plain text/js scripts via drag-drop later if needed
            const asset = { id, name: file.name, type, src: reader.result }
            set(state => ({ project: { ...state.project, assets: [...state.project.assets, asset] } }))
            resolve(asset)
          }
          // choose read method
          if (file.type.startsWith('image/') || file.type.startsWith('audio/')) reader.readAsDataURL(file)
          else reader.readAsText(file)
        })
      },
      addAssetFromLibrary: (asset) => set(state => {
        if (state.project.assets.some(a => a.id === asset.id)) return { project: state.project }
        return { project: { ...state.project, assets: [...state.project.assets, asset] } }
      }),

      // Layers
      addLayer: (name = 'Layer') => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const id = `layer-${Date.now()}`
        const updated = { ...state.project, updatedAt: Date.now() }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        const layers = [...(scene.layers || [])]
        layers.push({ id, name })
        updated.scenes[sidx] = { ...scene, layers }
        return { project: updated }
      }),
      renameLayer: (layerId, name) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const updated = { ...state.project, updatedAt: Date.now() }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        const layers = (scene.layers || []).map(l => l.id === layerId ? { ...l, name } : l)
        updated.scenes[sidx] = { ...scene, layers }
        return { project: updated }
      }),
      removeLayer: (layerId) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        if ((scene.layers||[]).length <= 1) return {}
        const updated = { ...state.project, updatedAt: Date.now() }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        const layers = (scene.layers || []).filter(l => l.id !== layerId)
        // Move any entities on removed layer to first layer
        const fallback = layers[0]?.id || null
        const entities = scene.entities.map(e => e.layerId === layerId ? { ...e, layerId: fallback } : e)
        updated.scenes[sidx] = { ...scene, layers, entities }
        return { project: updated }
      }),
      reorderLayer: (layerId, dir) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const layers = [...(scene.layers || [])]
        const i = layers.findIndex(l => l.id === layerId)
        if (i === -1) return {}
        const j = Math.max(0, Math.min(layers.length - 1, i + dir))
        if (i === j) return {}
        const [lay] = layers.splice(i, 1)
        layers.splice(j, 0, lay)
        const updated = { ...state.project, updatedAt: Date.now() }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        updated.scenes[sidx] = { ...scene, layers }
        return { project: updated }
      }),
      setEntityLayer: (entityId, layerId) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const entities = scene.entities.map(e => e.id === entityId ? { ...e, layerId } : e)
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),

      // Parenting
      setParent: (childId, parentId) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        // prevent self/loop
        if (childId === parentId) return {}
        const entities = scene.entities.map(e => e.id === childId ? { ...e, parentId: parentId || null } : e)
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),

      // Tilemap helpers
      paintTile: (entityId, col, row, index) => set(state => {
        // history intentionally not pushed on every tile to avoid huge stacks
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const tm = { ...ent.components.tilemap }
        if (!tm) return {}
        const cols = tm.cols, rows = tm.rows
        if (col < 0 || row < 0 || col >= cols || row >= rows) return {}
        const data = [...tm.data]
        data[row * cols + col] = index
        tm.data = data
        ent.components = { ...ent.components, tilemap: tm }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      clearTilemap: (entityId) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const tm = { ...ent.components.tilemap }
        if (!tm) return {}
        tm.data = Array(tm.cols * tm.rows).fill(-1)
        ent.components = { ...ent.components, tilemap: tm }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),

      // Animation definitions (per-entity sprite)
      addAnimationDef: (entityId, name) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const spr = { ...(ent.components.sprite || {}) }
        spr.spritesheet = { frameWidth: spr.spritesheet?.frameWidth || ent.components.transform.w, frameHeight: spr.spritesheet?.frameHeight || ent.components.transform.h, animations: { ...(spr.spritesheet?.animations || {}), [name]: { frames: [], loop: true, fps: 10 } } }
        ent.components = { ...ent.components, sprite: spr }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      removeAnimationDef: (entityId, name) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const spr = { ...(ent.components.sprite || {}) }
        const anims = { ...(spr.spritesheet?.animations || {}) }
        delete anims[name]
        spr.spritesheet = { ...(spr.spritesheet || {}), animations: anims }
        ent.components = { ...ent.components, sprite: spr }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      setAnimationFrames: (entityId, name, frames) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const spr = { ...(ent.components.sprite || {}) }
        spr.spritesheet = { ...(spr.spritesheet || {}), animations: { ...(spr.spritesheet?.animations || {}), [name]: { ...(spr.spritesheet?.animations?.[name] || { frames: [], loop: true, fps: 10 }), frames } } }
        ent.components = { ...ent.components, sprite: spr }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      setAnimationMeta: (entityId, name, meta) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const spr = { ...(ent.components.sprite || {}) }
        const cur = spr.spritesheet?.animations?.[name] || { frames: [] }
        spr.spritesheet = { ...(spr.spritesheet || {}), animations: { ...(spr.spritesheet?.animations || {}), [name]: { ...cur, ...meta } } }
        ent.components = { ...ent.components, sprite: spr }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      setSpritesheetSettings: (entityId, frameWidth, frameHeight) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const spr = { ...(ent.components.sprite || {}) }
        spr.spritesheet = { frameWidth, frameHeight, animations: { ...(spr.spritesheet?.animations || {}) } }
        ent.components = { ...ent.components, sprite: spr }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),

      // Timeline editing helpers
      setTimelinePlaying: (entityId, playing) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const tl = { ...(ent.components.timeline || { duration: 5, loop: true, t: 0, tracks: { transform: {} } }) }
        tl.playing = playing
        ent.components = { ...ent.components, timeline: tl }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      setTimelineDuration: (entityId, duration) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const tl = { ...(ent.components.timeline || { duration: 5, loop: true, t: 0, tracks: { transform: {} } }) }
        tl.duration = duration
        ent.components = { ...ent.components, timeline: tl }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      addTransformKeyframe: (entityId, prop, time, value) => set(state => {
        const scene = get().currentScene()
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === entityId)
        if (eidx === -1) return {}
        const ent = { ...scene.entities[eidx] }
        const tl = { ...(ent.components.timeline || { duration: 5, loop: true, t: 0, tracks: { transform: {} } }) }
        tl.tracks = { ...(tl.tracks || {}), transform: { ...(tl.tracks?.transform || {}) } }
        const arr = [...(tl.tracks.transform[prop] || [])]
        arr.push({ time: Math.max(0, Number(time)||0), value })
        arr.sort((a,b)=>a.time-b.time)
        tl.tracks.transform[prop] = arr
        ent.components = { ...ent.components, timeline: tl }
        const entities = [...scene.entities]
        entities[eidx] = ent
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),

      // Scenes
      removeScene: (id) => set(state => {
        get().pushHistory()
        const scenes = state.project.scenes.filter(s => s.id !== id)
        const startSceneId = state.project.startSceneId === id ? (scenes[0]?.id || null) : state.project.startSceneId
        const selectedSceneId = state.selectedSceneId === id ? (scenes[0]?.id || null) : state.selectedSceneId
        return { project: { ...state.project, scenes, startSceneId }, selectedSceneId, selectedEntityId: null }
      }),
      duplicateScene: (id) => set(state => {
        get().pushHistory()
        const src = state.project.scenes.find(s => s.id === id)
        if (!src) return {}
        const clone = JSON.parse(JSON.stringify(src))
        clone.id = `scene-${Date.now()}`
        clone.name = src.name + ' Copy'
        return { project: { ...state.project, updatedAt: Date.now(), scenes: [...state.project.scenes, clone] } }
      }),
      setStartScene: (id) => set(state => ({ project: { ...state.project, startSceneId: id } })),

      // Input mapping
      setInputBinding: (action, keys) => set(state => ({ project: { ...state.project, input: { ...state.project.input, [action]: keys } } })),

      // Enhanced component compatibility functions
      selectedEntity: null,
      setSelectedEntity: (id) => set({ selectedEntityId: id, selectedEntity: id }),
      transformMode: 'select',
      setTransformMode: (mode) => set({ transformMode: mode }),
      snapToGrid: false,
      toggleSnapToGrid: () => set(state => ({ snapToGrid: !state.snapToGrid })),
      gridSize: 32,
      setGridSize: (size) => set({ gridSize: size }),
      
      // Entity management for enhanced components
      updateEntity: (id, entity) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        if (!scene) return {}
        const updated = { ...state.project }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === id)
        if (eidx === -1) return {}
        const newScene = { ...scene }
        newScene.entities = [...scene.entities]
        newScene.entities[eidx] = entity
        updated.scenes[sidx] = newScene
        return { project: updated }
      }),
      
      removeEntity: (id) => set(state => {
        get().pushHistory()
        const scene = get().currentScene()
        if (!scene) return {}
        const updated = { ...state.project }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        const newScene = { ...scene }
        newScene.entities = scene.entities.filter(e => e.id !== id)
        updated.scenes[sidx] = newScene
        return { project: updated, selectedEntityId: id === state.selectedEntityId ? null : state.selectedEntityId }
      }),
    }),
    { name: 'aversoltix_editor' }
  )
)

