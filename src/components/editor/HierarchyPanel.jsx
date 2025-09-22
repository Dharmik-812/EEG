import { useEditorStore } from '../../store/editorStore'
import { motion } from 'framer-motion'

export default function HierarchyPanel() {
  const { currentScene, selectedEntityId, selectEntity, addEntity, deleteSelected, setParent, setEntityLayer } = useEditorStore(s => ({
    currentScene: s.currentScene,
    selectedEntityId: s.selectedEntityId,
    selectEntity: s.selectEntity,
    addEntity: s.addEntity,
    deleteSelected: s.deleteSelected,
    setParent: s.setParent,
    setEntityLayer: s.setEntityLayer,
  }))

  const scene = currentScene()

  function renderTree(layerId, parentId = null, depth = 0) {
    const nodes = scene.entities.filter(e => (e.layerId === layerId) && ((e.parentId || null) === parentId))
    return nodes.map(e => (
      <div key={e.id}
           className={`flex items-center justify-between rounded-lg border ${selectedEntityId===e.id?'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20':'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
           style={{ paddingLeft: 8 + depth * 12 }}
           draggable
           onDragStart={ev => { ev.dataTransfer.setData('entity/id', e.id) }}
           onDrop={ev => { ev.preventDefault(); const child = ev.dataTransfer.getData('entity/id'); if (child) setParent(child, e.id) }}
           onDragOver={ev => ev.preventDefault()}
      >
        <button onClick={() => selectEntity(e.id)} className="text-left flex-1 px-3 py-2">{e.name}</button>
        <div className="px-2 text-xs text-slate-400">{e.parentId ? '↳' : ''}</div>
      </div>
    )).concat(nodes.flatMap(e => renderTree(layerId, e.id, depth + 1)))
  }

  return (
    <motion.div className="p-3 space-y-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="flex gap-2 flex-wrap">
        <button className="btn !px-3 !py-2" onClick={() => addEntity('sprite')}>+ Sprite</button>
        <button className="btn-outline !px-3 !py-2" onClick={() => addEntity('text')}>+ Text</button>
        <button className="btn-outline !px-3 !py-2" onClick={() => addEntity('tilemap')}>+ Tilemap</button>
        <button className="btn-outline !px-3 !py-2" onClick={deleteSelected}>Delete</button>
      </div>
      <div className="text-xs uppercase text-slate-500 mt-2">Entities</div>
      <div className="space-y-2">
        {(scene.layers || [{ id: null, name: 'Default'}]).map(l => (
          <div key={l?.id || 'default'}
               className="rounded border border-slate-200 dark:border-slate-800"
               onDrop={ev => { ev.preventDefault(); const entId = ev.dataTransfer.getData('entity/id'); if (entId) { setParent(entId, null); setEntityLayer(entId, l.id) } }}
               onDragOver={ev => ev.preventDefault()}
          >
            <div className="px-3 py-2 text-xs uppercase text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-t">{l?.name || 'Default'}</div>
            <div className="space-y-1 p-1">
              {renderTree(l?.id || null)}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
