import { useEditorStore } from '../../store/editorStore'

export default function InspectorPanel() {
  const { currentScene, selectedEntityId, updateSelected } = useEditorStore(s => ({
    currentScene: s.currentScene,
    selectedEntityId: s.selectedEntityId,
    updateSelected: s.updateSelected,
  }))

  const scene = currentScene()
  const ent = scene.entities.find(e => e.id === selectedEntityId)

  if (!ent) {
    return <div className="p-3 text-sm text-slate-500">Select an entity to edit properties.</div>
  }

  const t = ent.components.transform
  const spr = ent.components.sprite
  const txt = ent.components.text

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs uppercase text-slate-500">Transform</div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs">X<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={t.x} onChange={e=>updateSelected(['transform','x'], Number(e.target.value))} /></label>
        <label className="text-xs">Y<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={t.y} onChange={e=>updateSelected(['transform','y'], Number(e.target.value))} /></label>
        <label className="text-xs">W<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={t.w} onChange={e=>updateSelected(['transform','w'], Number(e.target.value))} /></label>
        <label className="text-xs">H<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={t.h} onChange={e=>updateSelected(['transform','h'], Number(e.target.value))} /></label>
        <label className="text-xs">Rot<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={t.rotation} onChange={e=>updateSelected(['transform','rotation'], Number(e.target.value))} /></label>
      </div>

      {spr && (
        <div>
          <div className="text-xs uppercase text-slate-500 mb-1">Sprite</div>
          <label className="text-xs block">Fill Color<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={spr.fill || ''} onChange={e=>updateSelected(['sprite','fill'], e.target.value)} placeholder="#34d399" /></label>
        </div>
      )}

      {txt && (
        <div>
          <div className="text-xs uppercase text-slate-500 mb-1">Text</div>
          <label className="text-xs block">Value<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={txt.value} onChange={e=>updateSelected(['text','value'], e.target.value)} /></label>
          <label className="text-xs block">Size<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={txt.size} onChange={e=>updateSelected(['text','size'], Number(e.target.value))} /></label>
          <label className="text-xs block">Color<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={txt.color} onChange={e=>updateSelected(['text','color'], e.target.value)} /></label>
        </div>
      )}
    </div>
  )
}

