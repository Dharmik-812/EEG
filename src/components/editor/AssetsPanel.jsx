import { useEditorStore } from '../../store/editorStore'
import { useSubmissionsStore } from '../../store/submissionsStore'

export default function AssetsPanel() {
  const { project, importAsset, updateSelected, selectedEntityId, currentScene, addAssetFromLibrary } = useEditorStore(s => ({
    project: s.project,
    importAsset: s.importAsset,
    updateSelected: s.updateSelected,
    selectedEntityId: s.selectedEntityId,
    currentScene: s.currentScene,
    addAssetFromLibrary: s.addAssetFromLibrary,
  }))
  const { libraryAssets } = useSubmissionsStore(s => ({ libraryAssets: s.libraryAssets }))

  async function onUpload(e) {
    const file = e.target.files?.[0]
    if (file) await importAsset(file)
  }

  function assignToSelected(assetId) {
    if (!selectedEntityId) return
    updateSelected(['sprite','assetId'], assetId)
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
    <div className="p-3 space-y-4" onDrop={handleDrop} onDragOver={(e)=>e.preventDefault()}>
      <div>
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase text-slate-500">Project Assets</div>
          <label className="btn-outline !px-3 !py-1 cursor-pointer">
            Upload<input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
        </div>
        <div className="mt-2 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
          {project.assets.map(a => (
            <button key={a.id} className="border rounded overflow-hidden hover:shadow"
              onClick={() => assignToSelected(a.id)}
              draggable
              onDragStart={e => { e.dataTransfer.setData('asset/id', a.id) }}
              title="Assign or drag into canvas">
              <img src={a.src} alt={a.name} className="w-full h-16 object-cover" />
            </button>
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
    </div>
  )
}

