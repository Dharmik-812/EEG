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
])

const defaultProject = () => ({
  id: `p-${Date.now()}`,
  name: 'Untitled Eco Game',
  scenes: [
    {
      id: 'scene-1',
      name: 'Main',
      width: 960,
      height: 540,
      background: '#e6f7f1',
      entities: [
        {
          id: 'e-1',
          name: 'Player',
          components: {
            transform: { x: 100, y: 100, w: 80, h: 80, rotation: 0 },
            sprite: { fill: '#10b981' },
            collider: { w: 80, h: 80 },
            rigidbody: { vx: 0, vy: 0, gravity: 0 },
            interactable: { onClick: [{ type: 'moveBy', dx: 10, dy: 0 }] },
          },
        },
      ],
    },
  ],
  assets: seedAssets(), // {id, name, type:'image', src}
  startSceneId: 'scene-1',
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

      newProject: () => set({ project: defaultProject(), selectedEntityId: null, selectedSceneId: 'scene-1' }),
      loadProject: (proj) => set({ project: proj, selectedEntityId: null, selectedSceneId: proj.startSceneId || proj.scenes[0]?.id }),
      exportProject: () => JSON.stringify(get().project, null, 2),

      setZoom: (z) => set({ zoom: Math.min(3, Math.max(0.25, z)) }),
      toggleGrid: () => set(state => ({ grid: !state.grid })),
      setMode: (m) => set({ mode: m }),

      currentScene: () => get().project.scenes.find(s => s.id === get().selectedSceneId),

      selectScene: (id) => set({ selectedSceneId: id, selectedEntityId: null }),
      addScene: (name = 'New Scene') => set(state => {
        const id = `scene-${Date.now()}`
        return { project: { ...state.project, scenes: [...state.project.scenes, { id, name, width: 960, height: 540, background: '#e6f7f1', entities: [] }] } }
      }),

      selectEntity: (id) => set({ selectedEntityId: id }),
      addEntity: (kind = 'sprite') => set(state => {
        const scene = get().currentScene()
        const id = `e-${Date.now()}`
        const base = { id, name: kind === 'text' ? 'Text' : 'Sprite', components: { transform: { x: 50, y: 50, w: 100, h: 100, rotation: 0 } } }
        if (kind === 'sprite') base.components.sprite = { fill: '#34d399' }
        if (kind === 'text') base.components.text = { value: 'Hello Earth', size: 24, color: '#065f46' }
        const updated = { ...state.project }
        const idx = updated.scenes.findIndex(s => s.id === scene.id)
        updated.scenes[idx] = { ...scene, entities: [...scene.entities, base] }
        return { project: updated, selectedEntityId: id }
      }),
      addSpriteWithAsset: (assetId, x = 50, y = 50, w = 100, h = 100) => set(state => {
        const scene = get().currentScene()
        const id = `e-${Date.now()}`
        const base = { id, name: 'Sprite', components: { transform: { x, y, w, h, rotation: 0 }, sprite: { fill: '#34d399', assetId } } }
        const updated = { ...state.project }
        const idx = updated.scenes.findIndex(s => s.id === scene.id)
        updated.scenes[idx] = { ...scene, entities: [...scene.entities, base] }
        return { project: updated, selectedEntityId: id }
      }),
      moveSelectedZ: (dir) => set(state => {
        const scene = get().currentScene()
        const id = state.selectedEntityId
        if (!id) return {}
        const sidx = state.project.scenes.findIndex(s => s.id === scene.id)
        const entities = [...scene.entities]
        const i = entities.findIndex(e => e.id === id)
        if (i === -1) return {}
        const j = Math.max(0, Math.min(entities.length - 1, i + dir))
        if (i === j) return {}
        const [ent] = entities.splice(i, 1)
        entities.splice(j, 0, ent)
        const updated = { ...state.project }
        updated.scenes[sidx] = { ...scene, entities }
        return { project: updated }
      }),
      deleteSelected: () => set(state => {
        const scene = get().currentScene()
        const id = state.selectedEntityId
        if (!id) return {}
        const updated = { ...state.project }
        const idx = updated.scenes.findIndex(s => s.id === scene.id)
        updated.scenes[idx] = { ...scene, entities: scene.entities.filter(e => e.id !== id) }
        return { project: updated, selectedEntityId: null }
      }),
      updateSelected: (path, value) => set(state => {
        const scene = get().currentScene()
        const id = state.selectedEntityId
        if (!id) return {}
        const updated = { ...state.project }
        const sidx = updated.scenes.findIndex(s => s.id === scene.id)
        const eidx = scene.entities.findIndex(e => e.id === id)
        const entity = { ...scene.entities[eidx] }
        const compKey = path[0]
        const propPath = path.slice(1)
        entity.components = { ...entity.components }
        entity.components[compKey] = { ...entity.components[compKey] }
        let target = entity.components[compKey]
        for (let i = 0; i < propPath.length - 1; i++) target = target[propPath[i]]
        target[propPath[propPath.length - 1]] = value
        const newScene = { ...scene }
        newScene.entities = [...scene.entities]
        newScene.entities[eidx] = entity
        updated.scenes[sidx] = newScene
        return { project: updated }
      }),

      importAsset: (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            const id = `asset-${Date.now()}`
            const asset = { id, name: file.name, type: 'image', src: reader.result }
            set(state => ({ project: { ...state.project, assets: [...state.project.assets, asset] } }))
            resolve(asset)
          }
          reader.readAsDataURL(file)
        })
      },
      addAssetFromLibrary: (asset) => set(state => {
        if (state.project.assets.some(a => a.id === asset.id)) return { project: state.project }
        return { project: { ...state.project, assets: [...state.project.assets, asset] } }
      }),
    }),
    { name: 'aversoltix_editor' }
  )
)

