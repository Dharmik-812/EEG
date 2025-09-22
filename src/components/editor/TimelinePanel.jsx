import { useEffect, useMemo, useRef, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'

export default function TimelinePanel() {
  const scene = useEditorStore(s => s.currentScene())
  const selectedEntityId = useEditorStore(s => s.selectedEntityId)
  const ent = scene?.entities?.find(e => e.id === selectedEntityId)
  const [animName, setAnimName] = useState('')
  const addAnimationDef = useEditorStore(s => s.addAnimationDef)
  const removeAnimationDef = useEditorStore(s => s.removeAnimationDef)
  const setAnimationFrames = useEditorStore(s => s.setAnimationFrames)
  const setAnimationMeta = useEditorStore(s => s.setAnimationMeta)
  const setSpritesheetSettings = useEditorStore(s => s.setSpritesheetSettings)
  const addTransformKeyframe = useEditorStore(s => s.addTransformKeyframe)
  const setTimelineDuration = useEditorStore(s => s.setTimelineDuration)
  const setTimelinePlaying = useEditorStore(s => s.setTimelinePlaying)

  const spr = ent?.components?.sprite
  const animComp = ent?.components?.animation

  useEffect(() => {
    setAnimName(Object.keys(spr?.spritesheet?.animations || {})[0] || '')
  }, [selectedEntityId])

  const img = useMemo(() => {
    if (!spr?.assetId) return null
    const i = new Image()
    i.src = (useEditorStore.getState().project.assets.find(a => a.id === spr.assetId) || {}).src || ''
    return i
  }, [spr?.assetId])

  if (!ent || !spr) return (
    <div className="p-3 text-sm text-slate-500">Select a sprite entity to edit animations.</div>
  )

  const sheet = spr.spritesheet || { frameWidth: ent.components.transform.w, frameHeight: ent.components.transform.h, animations: {} }
  const animations = sheet.animations || {}
  const current = animations[animName] || { frames: [], loop: true, fps: 10 }

  function addAnim() {
    const name = prompt('Animation name?') || ''
    if (!name) return
    addAnimationDef(ent.id, name)
    setAnimName(name)
  }
  function delAnim() {
    if (!animName) return
    removeAnimationDef(ent.id, animName)
    setAnimName(Object.keys(animations).filter(n=>n!==animName)[0] || '')
  }

  function toggleFrame(idx) {
    const frames = new Set(current.frames)
    if (frames.has(idx)) frames.delete(idx); else frames.add(idx)
    const ordered = Array.from(frames).sort((a,b)=>a-b)
    setAnimationFrames(ent.id, animName, ordered)
  }

  function startBlend() {
    if (!animName) return
    const target = prompt('Blend to animation name?', animName) || animName
    const dur = Number(prompt('Blend duration (sec)?', '0.25') || '0.25')
    // use runtime API via a side-effect in the entity's animation component
    const anim = { ...(ent.components.animation || { current: animName, speed: current.fps }) }
    anim.blend = { target, duration: dur, elapsed: 0, frameIndex: 0, time: 0 }
    useEditorStore.setState(state => {
      const sc = state.project.scenes.find(s => s.id === state.selectedSceneId)
      const idx = sc.entities.findIndex(e => e.id === ent.id)
      const newEnt = { ...ent, components: { ...ent.components, animation: anim } }
      const entities = [...sc.entities]; entities[idx] = newEnt
      return { project: { ...state.project, scenes: state.project.scenes.map(s => s.id===sc.id? { ...sc, entities } : s) } }
    })
  }

  // Derive frame count from image size
  const cols = img && sheet.frameWidth ? Math.floor(img.width / sheet.frameWidth) : 0
  const rows = img && sheet.frameHeight ? Math.floor(img.height / sheet.frameHeight) : 0
  const total = Math.max(0, cols * rows)

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase text-slate-500">Timeline</div>
        <div className="flex gap-2">
          <button className="btn-outline !px-2 !py-1 text-xs" onClick={addAnim}>+ Animation</button>
          <button className="btn-outline !px-2 !py-1 text-xs" onClick={delAnim} disabled={!animName}>Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 items-center">
        <label className="text-xs">Duration (s)<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" min={0.1} step={0.1} value={ent.components.timeline?.duration || 5} onChange={e => setTimelineDuration(ent.id, Number(e.target.value)||5)} /></label>
        <label className="text-xs">Play<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={(ent.components.timeline?.playing)?'true':'false'} onChange={e=>setTimelinePlaying(ent.id, e.target.value==='true')}><option value="false">No</option><option value="true">Yes</option></select></label>
        <label className="text-xs col-span-2">Add Keyframe:
          <div className="mt-1 flex flex-wrap gap-2">
            <button className="btn-outline !px-2 !py-1 text-xs" onClick={()=>addTransformKeyframe(ent.id, 'x', ent.components.timeline?.t||0, ent.components.transform.x)}>x</button>
            <button className="btn-outline !px-2 !py-1 text-xs" onClick={()=>addTransformKeyframe(ent.id, 'y', ent.components.timeline?.t||0, ent.components.transform.y)}>y</button>
            <button className="btn-outline !px-2 !py-1 text-xs" onClick={()=>addTransformKeyframe(ent.id, 'rotation', ent.components.timeline?.t||0, ent.components.transform.rotation)}>rotation</button>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 items-center">
        <label className="text-xs">Spritesheet Frame W<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={sheet.frameWidth} onChange={e => setSpritesheetSettings(ent.id, Number(e.target.value)||sheet.frameWidth, sheet.frameHeight)} /></label>
        <label className="text-xs">Spritesheet Frame H<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={sheet.frameHeight} onChange={e => setSpritesheetSettings(ent.id, sheet.frameWidth, Number(e.target.value)||sheet.frameHeight)} /></label>
        <label className="text-xs">Animation<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={animName} onChange={e=>setAnimName(e.target.value)}>
          {Object.keys(animations).map(n => (<option key={n} value={n}>{n}</option>))}
        </select></label>
        <label className="text-xs">FPS<input className="w-full mt-1 rounded border bg-transparent px-2 py-1" type="number" value={current.fps||10} onChange={e=>setAnimationMeta(ent.id, animName, { fps: Number(e.target.value)||10 })} /></label>
        <label className="text-xs">Loop<select className="w-full mt-1 rounded border bg-transparent px-2 py-1" value={(current.loop??true)?'true':'false'} onChange={e=>setAnimationMeta(ent.id, animName, { loop: e.target.value==='true' })}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select></label>
        <button className="btn-outline !px-2 !py-1 text-xs" onClick={startBlend} disabled={!animName}>Test Blend…</button>
      </div>

      <div className="text-xs uppercase text-slate-500">Frames</div>
      {img && total>0 ? (
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 4 }}>
          {Array.from({ length: total }, (_, i) => (
            <button key={i} className={`relative border rounded overflow-hidden aspect-square ${current.frames.includes(i)?'outline outline-2 outline-emerald-500':''}`} title={`Frame ${i}`} onClick={()=>toggleFrame(i)}>
              <canvas width={sheet.frameWidth} height={sheet.frameHeight} ref={node => {
                if (!node) return
                const c = node; const ctx = c.getContext('2d')
                ctx.imageSmoothingEnabled = false
                const sx = (i % cols) * sheet.frameWidth
                const sy = Math.floor(i / cols) * sheet.frameHeight
                ctx.clearRect(0,0,c.width,c.height)
                ctx.drawImage(img, sx, sy, sheet.frameWidth, sheet.frameHeight, 0, 0, c.width, c.height)
              }} />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-500">Assign a spritesheet image to this sprite and set frame width/height above.</div>
      )}
    </div>
  )
}
