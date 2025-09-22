import { useEditorStore } from '../../store/editorStore'
import { useMemo, useState } from 'react'

// Lightweight, rule-based "assistant" that explains script structure and recommends snippets
export default function ScriptAssistant() {
  const scene = useEditorStore(s => s.currentScene())
  const selectedEntityId = useEditorStore(s => s.selectedEntityId)
  const updateSelected = useEditorStore(s => s.updateSelected)
  const ent = scene?.entities?.find(e => e.id === selectedEntityId)
  const code = ent?.components?.script?.code || ''

  function explain() {
    // naive static analysis
    const lines = code.split(/\n/)
    const hasUpdate = /function\s+onUpdate\s*\(/.test(code)
    const hasClick = /function\s+onClick\s*\(/.test(code)
    const hasCollision = /function\s+onCollision\s*\(/.test(code)
    const warns = []
    if (/while\s*\(\s*true\s*\)/.test(code)) warns.push('Detected while(true) – this can freeze the game.')
    if (/setTimeout\(/.test(code)) warns.push('Avoid setTimeout for gameplay loops – use onUpdate instead.')
    if (/eval\(/.test(code)) warns.push('Avoid eval in scripts for safety.')

    const summary = [
      `Lines: ${lines.length}`,
      `Handlers: ${['onUpdate','onClick','onCollision'].filter((h,i)=>[hasUpdate,hasClick,hasCollision][i]).join(', ') || 'none'}`,
      warns.length?`Warnings: ${warns.join(' | ')}`:'No obvious issues.'
    ].join('\n')
    alert(summary)
  }

  const suggestions = useMemo(() => ([
    { label: 'Stub all handlers', code: `function onUpdate(event, payload, api) {}\nfunction onClick(event, payload, api) {}\nfunction onCollision(event, payload, api) {}` },
    { label: 'WASD movement', code: `function onUpdate(event, payload, api){const s=150;if(api.input.down('left'))api.moveBy(-s*payload.dt,0);if(api.input.down('right'))api.moveBy(s*payload.dt,0);if(api.input.down('up'))api.moveBy(0,-s*payload.dt);if(api.input.down('down'))api.moveBy(0,s*payload.dt);}` },
    { label: 'Blend to run', code: `function onClick(event,payload,api){ api.blendTo('run',0.25) }` },
    { label: 'Play SFX', code: `function onClick(event,payload,api){ api.audio.play('asset-click',{volume:0.7}) }` },
  ]), [])

  function insert(snippet) {
    const newCode = code ? (code + (code.endsWith('\n')?'':'\n') + snippet) : snippet
    updateSelected(['script','code'], newCode)
  }

  if (!ent) return <div className="p-3 text-sm text-slate-500">Select an entity with a Script to use the assistant.</div>

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase text-slate-500">Script Assistant</div>
        <button className="btn-outline !px-3 !py-1" onClick={explain}>Explain Script</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {suggestions.map(s => (
          <button key={s.label} className="btn-outline !px-2 !py-1 text-xs" onClick={()=>insert(s.code)}>{s.label}</button>
        ))}
      </div>
      <div className="text-xs text-slate-500">This assistant uses simple heuristics to suggest snippets and highlight obvious issues.</div>
    </div>
  )
}
