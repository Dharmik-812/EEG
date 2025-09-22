import React from 'react'

export default function HelpPanel() {
  return (
    <div className="p-3 space-y-3 text-sm" data-tour="help">
      <div className="text-xs uppercase text-slate-500">In-Editor Help</div>
      <ul className="list-disc pl-5 space-y-1">
        <li>Left sidebar: add Sprites or Text; select to edit in Inspector.</li>
        <li>Drag assets from the Assets panel onto the canvas to create sprites.</li>
        <li>Switch to Play to test your scene. Click on entities to trigger onClick events.</li>
      </ul>

      <div className="text-xs uppercase text-slate-500 mt-2">Components</div>
      <ul className="list-disc pl-5 space-y-1">
        <li>Rigidbody: vx/vy (velocity), ax/ay (acceleration), gravity, friction.</li>
        <li>Collider: AABB or Circle. Collisions fire onCollision/onOverlap events.</li>
        <li>Script: Write functions onUpdate(event,payload,api), onClick(event,payload,api), onCollision(event,payload,api).</li>
        <li>Audio Source: Assign an audio asset and choose loop/volume.</li>
        <li>UI: Panel/Button/Label drawn in the scene (clickable in Play).</li>
      </ul>

      <div className="text-xs uppercase text-slate-500 mt-2">Scripting API</div>
      <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs overflow-auto"><code>{`// Example script
function onUpdate(event, payload, api) {
  if (api.input.down('right')) api.moveBy(100 * payload.dt, 0)
}
function onClick(event, payload, api) {
  api.audio.play('asset-click', { volume: 0.5 })
}
function onCollision(event, payload, api) {
  api.message('Collided with ' + (payload.other?.name || 'object'))
}`}</code></pre>

      <div className="text-xs uppercase text-slate-500 mt-2">Export</div>
      <p>Use "Download Web Build" to get a single HTML file that plays your game offline.</p>
    </div>
  )
}
