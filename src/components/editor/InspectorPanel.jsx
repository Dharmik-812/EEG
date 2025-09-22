import { useEditorStore } from '../../store/editorStore'

export default function InspectorPanel() {
  const { currentScene, selectedEntityId, updateSelected } = useEditorStore(s => ({
    currentScene: s.currentScene,
    selectedEntityId: s.selectedEntityId,
    updateSelected: s.updateSelected,
  }))
  const addComponent = useEditorStore(s => s.addComponent)
  const removeComponent = useEditorStore(s => s.removeComponent)

  const scene = currentScene()
  const ent = scene.entities.find(e => e.id === selectedEntityId)

  if (!ent) {
    const updateScene = useEditorStore.getState().updateScene
    const audioAssets = useEditorStore.getState().project.assets.filter(a => a.type === 'audio')
    return (
      <div className="p-3 space-y-3">
        <div className="text-xs uppercase text-slate-500">Scene</div>
        <label className="text-xs block">Name<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={scene.name} onChange={e => updateScene(['name'], e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs">Width<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={scene.width} onChange={e => updateScene(['width'], Number(e.target.value))} /></label>
          <label className="text-xs">Height<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={scene.height} onChange={e => updateScene(['height'], Number(e.target.value))} /></label>
        </div>
        <label className="text-xs block">Background<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={scene.background} onChange={e => updateScene(['background'], e.target.value)} placeholder="#e6f7f1" /></label>
        <div>
          <div className="text-xs uppercase text-slate-500 mb-1">Background Music</div>
          <label className="text-xs block">Asset<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={scene.bgm || ''} onChange={e => updateScene(['bgm'], e.target.value || null)}>
            <option value="">None</option>
            {audioAssets.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
          </select></label>
          <label className="text-xs block">Volume<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" step="0.01" value={scene.bgmVolume ?? 0.6} onChange={e => updateScene(['bgmVolume'], Number(e.target.value))} /></label>
        </div>
      </div>
    )
  }

  const t = ent.components.transform
  const spr = ent.components.sprite
  const txt = ent.components.text
  const rb = ent.components.rigidbody
  const col = ent.components.collider
  const scr = ent.components.script
  const aud = ent.components.audioSource
  const ui = ent.components.ui
  const anim = ent.components.animation
  const tm = ent.components.tilemap

  return (
    <div className="p-3 space-y-3" data-tour="inspector">
      <div className="text-xs uppercase text-slate-500">Transform</div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs">X<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={t.x} onChange={e=>updateSelected(['transform','x'], Number(e.target.value))} /></label>
        <label className="text-xs">Y<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={t.y} onChange={e=>updateSelected(['transform','y'], Number(e.target.value))} /></label>
        <label className="text-xs">W<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={t.w} onChange={e=>updateSelected(['transform','w'], Number(e.target.value))} /></label>
        <label className="text-xs">H<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={t.h} onChange={e=>updateSelected(['transform','h'], Number(e.target.value))} /></label>
        <label className="text-xs">Rot<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={t.rotation} onChange={e=>updateSelected(['transform','rotation'], Number(e.target.value))} /></label>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="text-xs uppercase text-slate-500">Add Component</div>
        {['rigidbody','collider','script','audioSource','ui','animation'].map(k => (
          <button key={k} className="btn-outline !px-2 !py-1 text-xs" onClick={() => addComponent(k)}>{k}</button>
        ))}
        {!tm && (
          <button className="btn-outline !px-2 !py-1 text-xs" onClick={() => addComponent('tilemap')}>tilemap</button>
        )}
      </div>

      {spr && (
        <div>
          <div className="text-xs uppercase text-slate-500 mb-1">Sprite</div>
          <label className="text-xs block">Fill Color<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={spr.fill || ''} onChange={e=>updateSelected(['sprite','fill'], e.target.value)} placeholder="#34d399" /></label>
          {spr.assetId && (
            <div className="text-xs text-slate-500 mt-1">Asset: {spr.assetId}</div>
          )}
        </div>
      )}

      <div>
        <div className="text-xs uppercase text-slate-500 mb-1">Entity</div>
        <label className="text-xs block">Name<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={ent.name||''} onChange={e=>updateSelected(['$entity','name'], e.target.value)} /></label>
        <label className="text-xs block">Layer<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={ent.layerId||''} onChange={e=>updateSelected(['$entity','layerId'], e.target.value)}>
          {(currentScene().layers||[]).map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
        </select></label>
      </div>

      {txt && (
        <div>
          <div className="text-xs uppercase text-slate-500 mb-1">Text</div>
          <label className="text-xs block">Value<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={txt.value} onChange={e=>updateSelected(['text','value'], e.target.value)} /></label>
          <label className="text-xs block">Size<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={txt.size} onChange={e=>updateSelected(['text','size'], Number(e.target.value))} /></label>
          <label className="text-xs block">Color<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={txt.color} onChange={e=>updateSelected(['text','color'], e.target.value)} /></label>
        </div>
      )}

      {rb && (
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase text-slate-500">Rigidbody</div>
            <button className="text-xs text-red-500" onClick={() => removeComponent('rigidbody')}>Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <label className="text-xs">vx<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={rb.vx||0} onChange={e=>updateSelected(['rigidbody','vx'], Number(e.target.value))} /></label>
            <label className="text-xs">vy<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={rb.vy||0} onChange={e=>updateSelected(['rigidbody','vy'], Number(e.target.value))} /></label>
            <label className="text-xs">ax<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={rb.ax||0} onChange={e=>updateSelected(['rigidbody','ax'], Number(e.target.value))} /></label>
            <label className="text-xs">ay<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={rb.ay||0} onChange={e=>updateSelected(['rigidbody','ay'], Number(e.target.value))} /></label>
            <label className="text-xs">gravity<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={rb.gravity||0} onChange={e=>updateSelected(['rigidbody','gravity'], Number(e.target.value))} /></label>
            <label className="text-xs">friction<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" step="0.01" value={rb.friction||0} onChange={e=>updateSelected(['rigidbody','friction'], Number(e.target.value))} /></label>
          </div>
        </div>
      )}

      {col && (
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase text-slate-500">Collider</div>
            <button className="text-xs text-red-500" onClick={() => removeComponent('collider')}>Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <label className="text-xs">Type<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={col.type||'aabb'} onChange={e=>updateSelected(['collider','type'], e.target.value)}><option value="aabb">AABB</option><option value="circle">Circle</option><option value="polygon">Polygon</option></select></label>
            {col.type !== 'circle' && col.type !== 'polygon' && (
              <>
                <label className="text-xs">w<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={col.w||t.w} onChange={e=>updateSelected(['collider','w'], Number(e.target.value))} /></label>
                <label className="text-xs">h<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={col.h||t.h} onChange={e=>updateSelected(['collider','h'], Number(e.target.value))} /></label>
              </>
            )}
            {col.type === 'circle' && (
              <label className="text-xs">r<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={col.circle?.r || Math.floor(Math.max(t.w,t.h)/2)} onChange={e=>updateSelected(['collider','circle','r'], Number(e.target.value))} /></label>
            )}
            {col.type === 'polygon' && (
              <div className="col-span-2 space-y-2">
                <div className="text-xs text-slate-500">Drag green squares in the canvas to adjust vertices.</div>
                <div className="flex gap-2">
                  <button className="btn-outline !px-2 !py-1 text-xs" onClick={() => useEditorStore.getState().addPolygonVertex(ent.id, 0, 0)}>+ Vertex</button>
                  <button className="btn-outline !px-2 !py-1 text-xs" onClick={() => useEditorStore.getState().removePolygonVertexLast(ent.id)}>Remove Last</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {anim && (
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase text-slate-500">Animation</div>
            <button className="text-xs text-red-500" onClick={() => removeComponent('animation')}>Remove</button>
          </div>
          <label className="text-xs block">Current<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={anim.current||''} onChange={e=>updateSelected(['animation','current'], e.target.value)} placeholder="walk" /></label>
          <label className="text-xs block">Speed (fps)<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={anim.speed||10} onChange={e=>updateSelected(['animation','speed'], Number(e.target.value))} /></label>
        </div>
      )}

      {scr && (
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase text-slate-500">Script</div>
            <button className="text-xs text-red-500" onClick={() => removeComponent('script')}>Remove</button>
          </div>
          <textarea className="w-full h-40 mt-1 rounded border bg-transparent px-2 py-1 font-mono text-xs" value={scr.code||''} onChange={e=>updateSelected(['script','code'], e.target.value)} placeholder={"function onUpdate(event, payload, api) { }"} />
        </div>
      )}

      {aud && (
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase text-slate-500">Audio Source</div>
            <button className="text-xs text-red-500" onClick={() => removeComponent('audioSource')}>Remove</button>
          </div>
          <label className="text-xs block">Asset Id<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={aud.assetId||''} onChange={e=>updateSelected(['audioSource','assetId'], e.target.value)} placeholder="asset-..." /></label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <label className="text-xs">Volume<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" step="0.01" value={aud.volume||1} onChange={e=>updateSelected(['audioSource','volume'], Number(e.target.value))} /></label>
            <label className="text-xs">Loop<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={aud.loop? 'true':'false'} onChange={e=>updateSelected(['audioSource','loop'], e.target.value === 'true')}><option value="false">No</option><option value="true">Yes</option></select></label>
          </div>
        </div>
      )}

      {ui && (
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase text-slate-500">UI</div>
            <button className="text-xs text-red-500" onClick={() => removeComponent('ui')}>Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <label className="text-xs">Type<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={ui.type||'panel'} onChange={e=>updateSelected(['ui','type'], e.target.value)}><option value="panel">Panel</option><option value="button">Button</option><option value="label">Label</option><option value="image">Image</option><option value="progress">Progress</option><option value="checkbox">Checkbox</option><option value="slider">Slider</option></select></label>
            <label className="text-xs">Text<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={ui.label||''} onChange={e=>updateSelected(['ui','label'], e.target.value)} /></label>
            <label className="text-xs">Text Size<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={ui.textSize||16} onChange={e=>updateSelected(['ui','textSize'], Number(e.target.value))} /></label>
            <label className="text-xs">Text Color<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={ui.textColor||'#fff'} onChange={e=>updateSelected(['ui','textColor'], e.target.value)} /></label>
            <label className="text-xs">Fill<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={ui.fill||'#0ea5e9'} onChange={e=>updateSelected(['ui','fill'], e.target.value)} /></label>
            {ui.type==='image' && (
              <label className="text-xs">Asset Id<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={ui.assetId||''} onChange={e=>updateSelected(['ui','assetId'], e.target.value)} placeholder="asset-..." /></label>
            )}
            {ui.type==='progress' && (
              <>
              <label className="text-xs">Value<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={ui.value||0} onChange={e=>updateSelected(['ui','value'], Number(e.target.value))} /></label>
              <label className="text-xs">Max<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={ui.max||100} onChange={e=>updateSelected(['ui','max'], Number(e.target.value))} /></label>
              </>
            )}
            {ui.type==='checkbox' && (
              <label className="text-xs">Checked<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={ui.checked?'true':'false'} onChange={e=>updateSelected(['ui','checked'], e.target.value==='true')}><option value="false">No</option><option value="true">Yes</option></select></label>
            )}
            {ui.type==='slider' && (
              <>
              <label className="text-xs">Value<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={ui.value||0} onChange={e=>updateSelected(['ui','value'], Number(e.target.value))} /></label>
              <label className="text-xs">Min<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={ui.min||0} onChange={e=>updateSelected(['ui','min'], Number(e.target.value))} /></label>
              <label className="text-xs">Max<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={ui.max||100} onChange={e=>updateSelected(['ui','max'], Number(e.target.value))} /></label>
              </>
            )}
            <label className="text-xs">Anchor X<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={ui.anchor?.x||'center'} onChange={e=>updateSelected(['ui','anchor','x'], e.target.value)}><option value="left">left</option><option value="center">center</option><option value="right">right</option></select></label>
            <label className="text-xs">Anchor Y<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={ui.anchor?.y||'center'} onChange={e=>updateSelected(['ui','anchor','y'], e.target.value)}><option value="top">top</option><option value="center">center</option><option value="bottom">bottom</option></select></label>
          </div>
        </div>
      )}

      {tm && (
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase text-slate-500">Tilemap</div>
            <button className="text-xs text-red-500" onClick={() => removeComponent('tilemap')}>Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <label className="text-xs">Tile W<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={tm.tileWidth} onChange={e=>updateSelected(['tilemap','tileWidth'], Number(e.target.value))} /></label>
            <label className="text-xs">Tile H<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={tm.tileHeight} onChange={e=>updateSelected(['tilemap','tileHeight'], Number(e.target.value))} /></label>
            <label className="text-xs">Cols<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={tm.cols} onChange={e=>updateSelected(['tilemap','cols'], Number(e.target.value))} /></label>
            <label className="text-xs">Rows<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={tm.rows} onChange={e=>updateSelected(['tilemap','rows'], Number(e.target.value))} /></label>
            <label className="text-xs col-span-2">Tileset Asset Id<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="text" value={tm.tilesetAssetId||''} onChange={e=>updateSelected(['tilemap','tilesetAssetId'], e.target.value)} placeholder="asset-..." /></label>
            <label className="text-xs col-span-2">Paint Index<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={tm.paintIndex||0} onChange={e=>updateSelected(['tilemap','paintIndex'], Number(e.target.value))} /></label>
            <div className="col-span-2 text-xs text-slate-500">Tip: Hold Ctrl and drag on the tilemap in the canvas to paint.</div>
            <button className="btn-outline !px-2 !py-1 text-xs col-span-2" onClick={() => useEditorStore.getState().clearTilemap(ent.id)}>Clear All</button>
          </div>
        </div>
      )}
    </div>
  )
}
