import { useEditorStore } from '../../store/editorStore'
import { motion } from 'framer-motion'

export default function ScenesPanel() {
  const {
    project,
    currentScene,
    selectScene,
    addScene,
    removeScene,
    duplicateScene,
    setStartScene,
    addLayer,
    renameLayer,
    removeLayer,
    reorderLayer,
  } = useEditorStore(s => ({
    project: s.project,
    currentScene: s.currentScene,
    selectScene: s.selectScene,
    addScene: s.addScene,
    removeScene: s.removeScene,
    duplicateScene: s.duplicateScene,
    setStartScene: s.setStartScene,
    addLayer: s.addLayer,
    renameLayer: s.renameLayer,
    removeLayer: s.removeLayer,
    reorderLayer: s.reorderLayer,
  }))
  const scene = currentScene()

  function onRenameLayer(layerId) {
    const name = prompt('Layer name?')
    if (name) renameLayer(layerId, name)
  }

  return (
    <motion.div className="p-3 space-y-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} data-tour="scenes">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase text-slate-500">Scenes</div>
        <div className="flex gap-2">
          <button className="btn-outline !px-2 !py-1 text-xs" onClick={() => addScene('New Scene')}>+ Scene</button>
        </div>
      </div>
      <div className="space-y-1">
        {project.scenes.map(s => (
          <div key={s.id} className={`flex items-center justify-between px-2 py-1 rounded border ${scene.id===s.id?'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20':'border-slate-200 dark:border-slate-800'}`}>
            <button className="text-left flex-1" onClick={() => selectScene(s.id)}>{s.name}</button>
            <div className="flex gap-1">
              <button className="btn-outline !px-2 !py-1 text-xs" title="Set start scene" onClick={() => setStartScene(s.id)}>{project.startSceneId===s.id ? '★' : '☆'}</button>
              <button className="btn-outline !px-2 !py-1 text-xs" title="Duplicate" onClick={() => duplicateScene(s.id)}>⧉</button>
              <button className="btn-outline !px-2 !py-1 text-xs" title="Delete" onClick={() => removeScene(s.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase text-slate-500">Layers</div>
          <button className="btn-outline !px-2 !py-1 text-xs" onClick={() => addLayer('Layer')}>+ Layer</button>
        </div>
        <div className="space-y-1 mt-1">
          {(scene.layers||[]).map((l, idx) => (
            <div key={l.id} className="flex items-center justify-between px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
              <div className="text-sm">{l.name}</div>
              <div className="flex gap-1">
                <button className="btn-outline !px-2 !py-1 text-xs" onClick={() => reorderLayer(l.id, -1)} disabled={idx===0}>↑</button>
                <button className="btn-outline !px-2 !py-1 text-xs" onClick={() => reorderLayer(l.id, +1)} disabled={idx===(scene.layers.length-1)}>↓</button>
                <button className="btn-outline !px-2 !py-1 text-xs" onClick={() => onRenameLayer(l.id)}>Rename</button>
                <button className="btn-outline !px-2 !py-1 text-xs" onClick={() => removeLayer(l.id)} disabled={(scene.layers||[]).length<=1}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
