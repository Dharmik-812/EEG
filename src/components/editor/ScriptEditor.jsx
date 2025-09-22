import { useEditorStore } from '../../store/editorStore'
import { useMemo, useState } from 'react'

export default function ScriptEditor() {
  const scene = useEditorStore(s => s.currentScene())
  const selectedEntityId = useEditorStore(s => s.selectedEntityId)
  const updateSelected = useEditorStore(s => s.updateSelected)
  const ent = scene?.entities?.find(e => e.id === selectedEntityId)
  const code = ent?.components?.script?.code || ''
  const [local, setLocal] = useState(code)

  const examples = useMemo(() => ([
    { name: 'Move with Arrow Keys', code: `function onUpdate(event, payload, api) {\n  const speed = 120;\n  if (api.input.down('left')) api.moveBy(-speed*payload.dt, 0);\n  if (api.input.down('right')) api.moveBy(speed*payload.dt, 0);\n  if (api.input.down('up')) api.moveBy(0, -speed*payload.dt);\n  if (api.input.down('down')) api.moveBy(0, speed*payload.dt);\n}` },
    { name: 'Play Sound on Click', code: `function onClick(event, payload, api) {\n  api.audio.play('asset-click', { volume: 0.6 });\n}` },
    { name: 'Switch Scene on Collision', code: `function onCollision(event, payload, api) {\n  api.gotoScene('scene-1');\n}` },
    { name: 'Blend to "run"', code: `function onClick(event, payload, api) {\n  api.blendTo('run', 0.3);\n}` },
  ]), [])

  function save() {
    updateSelected(['script','code'], local)
  }

  if (!ent) return <div className="p-3 text-sm text-slate-500">Select an entity, then add a Script component to edit code.</div>

  return (
    <div className="p-3 space-y-3" data-tour="script-editor">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase text-slate-500">Script Editor</div>
        <div className="flex gap-2">
          <button className="btn-outline !px-3 !py-1" onClick={()=>navigator.clipboard.writeText(local)}>Copy</button>
          <button className="btn !px-3 !py-1" onClick={save}>Save</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <textarea className="w-full h-64 rounded border bg-transparent px-2 py-2 font-mono text-xs" value={local} onChange={e=>setLocal(e.target.value)} spellCheck={false} />
        <pre className="w-full h-64 overflow-auto rounded border p-2 bg-slate-900 text-slate-200 text-xs"><code className="language-javascript" dangerouslySetInnerHTML={{ __html: window.Prism? window.Prism.highlight(local, window.Prism.languages.javascript, 'javascript') : local.replace(/&/g,'&amp;').replace(/</g,'&lt;') }} /></pre>
      </div>
      <div>
        <div className="text-xs uppercase text-slate-500 mb-1">Examples</div>
        <div className="flex flex-wrap gap-2">
          {examples.map(ex => (
            <button key={ex.name} className="btn-outline !px-2 !py-1 text-xs" onClick={()=>setLocal(ex.code)}>{ex.name}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
