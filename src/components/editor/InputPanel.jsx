import { useEditorStore } from '../../store/editorStore'
import { useState } from 'react'

export default function InputPanel() {
  const { project, setInputBinding } = useEditorStore(s => ({ project: s.project, setInputBinding: s.setInputBinding }))
  const [local, setLocal] = useState(project.input || {})

  function updateAction(action, value) {
    const keys = value.split(',').map(s => s.trim()).filter(Boolean)
    setLocal({ ...local, [action]: keys })
    setInputBinding(action, keys)
  }

  const actions = Object.keys(local)

  return (
    <div className="p-3 space-y-2">
      <div className="text-xs uppercase text-slate-500">Input Mapping</div>
      <div className="space-y-2">
        {actions.map(a => (
          <div key={a} className="grid grid-cols-3 gap-2 items-center">
            <div className="text-sm col-span-1">{a}</div>
            <input className="col-span-2 rounded border bg-transparent px-2 py-1 text-sm" value={(local[a]||[]).join(', ')} onChange={e => updateAction(a, e.target.value)} placeholder="e.g., ArrowLeft, KeyA" />
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-500">Use KeyboardEvent.code names, comma-separated (e.g., ArrowLeft, KeyA). Changes apply immediately in Play.</div>
    </div>
  )
}
