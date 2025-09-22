import { useEditorStore } from '../../store/editorStore'
import { useSubmissionsStore } from '../../store/submissionsStore'
import { motion } from 'framer-motion'

export default function AssetsPanel() {
  const { project, importAsset, updateSelected, selectedEntityId, currentScene, addAssetFromLibrary } = useEditorStore(s => ({
    project: s.project,
    importAsset: s.importAsset,
    updateSelected: s.updateSelected,
    selectedEntityId: s.selectedEntityId,
    currentScene: s.currentScene,
    addAssetFromLibrary: s.addAssetFromLibrary,
  }))
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid') // 'grid' | 'list'
  const [category, setCategory] = useState('all')
  const addComponent = useEditorStore(s => s.addComponent)
  const { libraryAssets } = useSubmissionsStore(s => ({ libraryAssets: s.libraryAssets }))

  async function onUpload(e) {
    const file = e.target.files?.[0]
    if (file) await importAsset(file)
  }

  function assignToSelected(asset) {
    if (!selectedEntityId) return
    if (asset.type === 'image') updateSelected(['sprite','assetId'], asset.id)
    if (asset.type === 'audio') {
      const ent = currentScene().entities.find(e => e.id === selectedEntityId)
      if (ent && !ent.components.audioSource) addComponent('audioSource')
      updateSelected(['audioSource','assetId'], asset.id)
    }
  }

  function addLibraryToProject(asset) {
    addAssetFromLibrary(asset)
  }

  function handleDrop(e) {
    e.preventDefault()
    const items = e.dataTransfer.items
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file && file.type.startsWith('image/')) importAsset(file)
        }
      }
    }
  }

  return (
    <motion.div className="p-3 space-y-4" onDrop={handleDrop} onDragOver={(e)=>e.preventDefault()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div>
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase text-slate-500">Project Assets</div>
          <div className="flex items-center gap-2">
            <input className="rounded border bg-transparent px-2 py-1 text-sm" placeholder="Search assets…" value={query} onChange={e=>setQuery(e.target.value)} />
            <select className="rounded border bg-transparent px-2 py-1 text-sm" value={view} onChange={e=>setView(e.target.value)}>
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
            <label className="btn-outline !px-3 !py-1 cursor-pointer">
              Upload<input type="file" accept="image/*,audio/*" className="hidden" onChange={onUpload} />
            </label>
          </div>
        </div>
        <div className={`${view==='grid' ? 'mt-2 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2' : 'mt-2 divide-y divide-slate-200 dark:divide-slate-800'}`}>
          {project.assets.filter(a => a.name?.toLowerCase().includes(query.toLowerCase())).map(a => (
            view==='grid' ? (
              <div key={a.id} className="border rounded overflow-hidden hover:shadow">
                {a.type === 'image' ? (
                  <button className="w-full" onClick={() => assignToSelected(a)} draggable onDragStart={e => { e.dataTransfer.setData('asset/id', a.id) }} title="Assign or drag into canvas">
                    <img src={a.src} alt={a.name} className="w-full h-16 object-cover" />
                  </button>
                ) : a.type === 'audio' ? (
                  <div className="p-2 text-xs flex items-center justify-between gap-2">
                    <div className="truncate" title={a.name}>🔊 {a.name}</div>
                    <div className="flex gap-1">
                      <button className="btn-outline !px-2 !py-1" onClick={() => assignToSelected(a)}>Assign</button>
                      <button className="btn-outline !px-2 !py-1" onClick={() => { const au = new Audio(a.src); au.play(); }}>Play</button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 text-xs">{a.name}</div>
                )}
              </div>
            ) : (
              <div key={a.id} className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2">
                  {a.type==='image' ? <img src={a.src} alt="" className="w-8 h-8 object-cover rounded" /> : <span>🔊</span>}
                  <div className="text-sm">{a.name}</div>
                </div>
                <div className="flex gap-1">
                  <button className="btn-outline !px-2 !py-1" onClick={() => assignToSelected(a)}>Assign</button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase text-slate-500">Community Library</div>
        <div className="mt-2 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
          {libraryAssets.map(a => (
            <div key={a.id} className="border rounded overflow-hidden">
              <img src={a.src} alt={a.name} className="w-full h-16 object-cover" draggable onDragStart={e => { e.dataTransfer.setData('asset/id', a.id); }} />
              <div className="p-1 grid grid-cols-2 gap-1">
                <button className="btn-outline !px-0 !py-1 text-xs" onClick={() => addLibraryToProject(a)}>Add</button>
                <button className="btn-outline !px-0 !py-1 text-xs" onClick={() => { addLibraryToProject(a); assignToSelected(a.id) }}>Use</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

