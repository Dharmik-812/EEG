import { useEditorStore } from '../../store/editorStore'

export default function HierarchyPanel() {
  const { currentScene, selectedEntityId, selectEntity, addEntity, deleteSelected } = useEditorStore(s => ({
    currentScene: s.currentScene,
    selectedEntityId: s.selectedEntityId,
    selectEntity: s.selectEntity,
    addEntity: s.addEntity,
    deleteSelected: s.deleteSelected,
  }))

  const scene = currentScene()

  return (
    <div className="p-3 space-y-2">
      <div className="flex gap-2">
        <button className="btn !px-3 !py-2" onClick={() => addEntity('sprite')}>+ Sprite</button>
        <button className="btn-outline !px-3 !py-2" onClick={() => addEntity('text')}>+ Text</button>
        <button className="btn-outline !px-3 !py-2" onClick={deleteSelected}>Delete</button>
      </div>
      <div className="text-xs uppercase text-slate-500 mt-2">Entities</div>
      <div className="space-y-1">
        {scene.entities.map(e => (
          <button key={e.id} onClick={() => selectEntity(e.id)} className={`w-full text-left px-3 py-2 rounded-lg border ${selectedEntityId===e.id?'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20':'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{e.name}</button>
        ))}
      </div>
    </div>
  )
}

