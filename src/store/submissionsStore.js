import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const demoSVG = {
  hero: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect x="24" y="24" width="80" height="80" rx="12" fill="%2322c55e"/></svg>',
  recycle: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><polygon points="64,12 76,34 52,34" fill="%230ea5e9"/><polygon points="16,76 38,64 38,88" fill="%230ea5e9"/><polygon points="112,76 90,88 90,64" fill="%230ea5e9"/><path d="M64 22l12 20H52l12-20zM26 72l20-12v24L26 72zm76 0l-20 12V60l20 12z" fill="%230ea5e9"/></svg>',
  turbine: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect x="60" y="60" width="8" height="56" fill="%2394a3b8"/><circle cx="64" cy="56" r="8" fill="%2394a3b8"/><g fill="%2394a3b8"><path d="M64 56 L108 44 L64 56 Z"/><path d="M64 56 L20 44 L64 56 Z"/><path d="M64 56 L64 12 L64 56 Z"/></g></svg>',
  water: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%230ea5e9"/><g stroke="%23ffffff" stroke-opacity="0.5" stroke-width="4" fill="none"><path d="M0 32 C 16 16, 48 16, 64 32 S 112 48, 128 32"/><path d="M0 64 C 16 48, 48 48, 64 64 S 112 80, 128 64"/><path d="M0 96 C 16 80, 48 80, 64 96 S 112 112, 128 96"/></g></svg>'
}

function demoProjects() {
  const baseScene = (id='scene-1') => ({ id, name: 'Main', width: 960, height: 540, background: '#e6f7f1', entities: [] })
  // 1) Recycle Runner (collect recycling icons)
  const p1 = {
    id: 'p-demo1', name: 'Recycle Runner', startSceneId: 'scene-1',
    scenes: [baseScene('scene-1')],
    assets: [
      { id: 'd-hero', name: 'Hero', type: 'image', src: demoSVG.hero },
      { id: 'd-recycle', name: 'Recycle', type: 'image', src: demoSVG.recycle },
      { id: 'd-bin', name: 'Bin', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect x="28" y="32" width="72" height="80" rx="10" fill="%2322c55e"/><rect x="20" y="24" width="88" height="12" rx="6" fill="%2310b981"/></svg>' },
      { id: 'd-heavy', name: 'Heavy', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="24" fill="%23ef4444"/></svg>' },
    ],
    input: { left: ['ArrowLeft','KeyA'], right: ['ArrowRight','KeyD'], up: ['ArrowUp','KeyW'], down: ['ArrowDown','KeyS'], action: ['Space'] },
  }
  p1.scenes[0].entities = [
    { id: 'tip', name: 'Tip', components: { transform: { x: 480, y: 50, w: 540, h: 24 }, text: { value: 'Move with WASD/Arrows. Collect bins, avoid heavy trash!', size: 18, color: '#065f46' } } },
    { id: 'fx1', name: 'Ambient', components: { transform: { x: 480, y: 80, w: 10, h: 10 }, emitter: { rate: 4, speed: 60, size: 2, life: 0.8, color: '#a7f3d0' } } },
    // Tutorial overlay UI
    { id: 'tut-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Welcome to Recycle Runner!', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const es=api.entities(); const ts=es.find(x=>x.name==='TutScript'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const es=api.entities(); const ts=es.find(x=>x.name==='TutScript'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Move with WASD/Arrows or the on-screen pad.', 'Collect green bins. Each one helps reduce landfill.', 'Avoid heavy red trash — it ends the run.', 'If you crash, press Space or tap to restart.', 'Have fun and try to collect as many as you can!' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.name==='TutLabel'); const panel=es.find(x=>x.name==='TutPanel'); const next=es.find(x=>x.name==='TutNext'); const skip=es.find(x=>x.name==='TutSkip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

{ id: 'e-hero', name: 'Hero', components: { transform: { x: 120, y: 120, w: 80, h: 80, rotation: 0 }, sprite: { assetId: 'd-hero' }, rigidbody: { vx: 0, vy: 0, gravity: 0 }, collider: { type: 'aabb', w: 80, h: 80 }, script: { code: "let recycled=0, dead=false, mt=0; function onUpdate(event,payload,api){ mt+=payload.dt; if(dead){ if(api.input.down('action')){ const es=api.entities(); for(const ent of es){ if(ent.name==='Recycle'||ent.name==='Heavy') api.removeEntity(ent) } const t=api.entity.components.transform; t.x=120; t.y=120; recycled=0; dead=false; api.particles.burst({ x: t.x, y: t.y, count: 18, speed: 120, life: 0.6, size: 3, color: '#22c55e' }); api.message({ text: 'Restarted!', key: 'rr-restart', cooldownSec: 2 }) } return } const s=180; if(api.input.down('left'))api.moveBy(-s*payload.dt,0); if(api.input.down('right'))api.moveBy(s*payload.dt,0); if(api.input.down('up'))api.moveBy(0,-s*payload.dt); if(api.input.down('down'))api.moveBy(0,s*payload.dt); } function onCollision(event,payload,api){ const other=payload.other?.name; if(other==='Recycle'||other==='Bin'){ recycled++; const pt=payload.other?.components?.transform; if(pt){ api.particles.burst({ x: pt.x, y: pt.y, count: 14, speed: 120, life: 0.6, size: 3, color: '#22c55e' }) } if(mt>1.2){ mt=0; api.message({ text: 'Recycled '+recycled+' items — great job!', key: 'rr-recycled', cooldownSec: 2 }) } api.removeEntity(payload.other) } if(other==='Heavy'){ dead=true; const t=api.entity.components.transform; api.particles.burst({ x: t.x, y: t.y, count: 24, speed: 140, life: 0.7, size: 4, color: '#ef4444' }); api.message({ text: 'Game Over — press Space to restart', key: 'rr-gameover', cooldownSec: 3 }) } }" } } },
    { id: 'spawner', name: 'Spawner', components: { transform: { x: 480, y: 270, w: 960, h: 540 }, script: { code: "let t=0; function onUpdate(e,p,api){ t+=p.dt; if(t>1.0){ t=0; const x=120+Math.random()*720; const y=120+Math.random()*360; if(Math.random()<0.75){ api.addEntity({ name:'Recycle', components:{ transform:{x:x,y:y,w:60,h:60}, sprite:{assetId:'d-bin'}, collider:{type:'aabb',w:60,h:60} } }) } else { api.addEntity({ name:'Heavy', components:{ transform:{x:x,y:y,w:50,h:50}, sprite:{assetId:'d-heavy'}, collider:{type:'aabb',w:50,h:50} } }) } } }" } } },
  ]

  // 2) Wind Farm Builder (click to add turbines and cut CO₂)
  const p2 = {
    id: 'p-demo2', name: 'Wind Farm Builder', startSceneId: 'scene-1',
    scenes: [baseScene('scene-1')],
    assets: [ { id: 'd-turbine', name: 'Turbine', type: 'image', src: demoSVG.turbine } ],
  }
  p2.scenes[0].entities = [
    // Tutorial overlay UI
    { id: 'tut2-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut2-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Build turbines!', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut2-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const es=api.entities(); const ts=es.find(x=>x.id==='tut2-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut2-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const es=api.entities(); const ts=es.find(x=>x.id==='tut2-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut2-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Click to place a turbine.', 'Each turbine reduces CO2 by 50 kg/day.', 'Place a few and watch them spin!', 'Great job — experiment with layouts.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut2-label'); const panel=es.find(x=>x.id==='tut2-panel'); const next=es.find(x=>x.id==='tut2-next'); const skip=es.find(x=>x.id==='tut2-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

    { id: 'e-msg', name: 'Tip', components: { transform: { x: 480, y: 60, w: 400, h: 40, rotation: 0 }, text: { value: 'Click to build wind turbines. Each cuts CO₂ by 50kg/day!', size: 18, color: '#065f46' } } },
    { id: 'fx2', name: 'Breeze', components: { transform: { x: 480, y: 120, w: 10, h: 10 }, emitter: { rate: 6, speed: 70, size: 2, life: 0.7, color: '#93c5fd' } } },
{ id: 'e-spawner', name: 'Spawner', components: { transform: { x: 480, y: 270, w: 960, h: 540 }, script: { code: "let co2=0; function onClick(e,p,api){ const x=p.x, y=p.y; api.addEntity({ name:'Turbine', components:{ transform:{x:x,y:y,w:12,h:12,rotation:0}, sprite:{assetId:'d-turbine'}, collider:{type:'aabb',w:64,h:64}, script:{ code: 'let t=0,b=0; function onUpdate(e,p,api){ t+=p.dt; b+=p.dt; const tr=api.entity.components.transform; const s=Math.min(1,0.2+t*2.0); tr.w=64*s; tr.h=64*s; tr.rotation=((tr.rotation||0)+120*p.dt)%360; if(b>0.8){ b=0; api.particles.burst({ x: tr.x, y: tr.y-20, count: 8, speed: 80, life: 0.5, size: 2, color: \"#93c5fd\" }); } }' } } }); api.particles.burst({ x:x, y:y, count: 12, speed: 100, life: 0.6, size: 2, color: '#93c5fd' }); co2+=50; api.message({ text: 'Clean energy built! CO2 reduced '+co2+' kg/day', key: 'wf-co2', cooldownSec: 2 }); }" } } },
  ]

  // 3) Energy Saver HUD (UI demo)
  const p3 = {
    id: 'p-demo3', name: 'Energy Saver HUD', startSceneId: 'scene-1',
    scenes: [baseScene('scene-1')], assets: [],
  }
  p3.scenes[0].entities = [
    // Tutorial overlay UI
    { id: 'tut3-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut3-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Energy HUD tutorial', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut3-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut3-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut3-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut3-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut3-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'This demo shows UI widgets.', 'Drag the slider: it updates the progress bar.', 'Click anywhere for an energy-saving tip.', 'That\'s it — experiment with UI types!' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut3-label'); const panel=es.find(x=>x.id==='tut3-panel'); const next=es.find(x=>x.id==='tut3-next'); const skip=es.find(x=>x.id==='tut3-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

    { id: 'ui-progress', name: 'Charge', components: { transform: { x: 480, y: 40, w: 400, h: 20 }, ui: { type: 'progress', value: 35, max: 100, fill: '#0ea5e9', anchor: { x:'center', y:'top' } } } },
    { id: 'ui-slider', name: 'Slider', components: { transform: { x: 480, y: 80, w: 400, h: 20 }, ui: { type: 'slider', value: 35, min: 0, max: 100, fill: '#22c55e', anchor: { x:'center', y:'top' } } } },
{ id: 'overlay', name: 'Overlay', components: { transform: { x: 480, y: 270, w: 960, h: 540 }, script: { code: "function onClick(e,p,api){ api.particles.burst({ x: p.x, y: p.y, count: 12, speed: 90, life: 0.7, size: 2, color: '#0ea5e9' }); api.message({ text: 'Tip: lower usage shifts the grid to green energy.', key: 'es-tip', once: true }) }" } } },
    { id: 'txt', name: 'Label', components: { transform: { x: 480, y: 120, w: 360, h: 24 }, text: { value: 'Adjust usage: lower demand = greener grid!', size: 18, color: '#065f46' } } },
  ]

  // 4) Wetland Restoration (tilemap demo)
  const p4 = {
    id: 'p-demo4', name: 'Wetland Restoration', startSceneId: 'scene-1',
    scenes: [baseScene('scene-1')],
    assets: [ { id: 'd-water', name: 'Water', type: 'image', src: demoSVG.water } ],
  }
  const tmCols = 20, tmRows = 10, tw=32, th=32
  p4.scenes[0].entities = [
    // Tutorial overlay UI
    { id: 'tut4-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut4-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Wetland Restoration tutorial', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut4-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut4-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut4-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut4-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut4-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Hold Ctrl and drag to paint water tiles.', 'Use the tile grid to plan edges and inlets.', 'Wetlands store carbon and support biodiversity.', 'Clear all with the button in Inspector if needed.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut4-label'); const panel=es.find(x=>x.id==='tut4-panel'); const next=es.find(x=>x.id==='tut4-next'); const skip=es.find(x=>x.id==='tut4-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

    { id: 'tm', name: 'Water Tiles', components: { transform: { x: 480, y: 270, w: tw*tmCols, h: th*tmRows }, tilemap: { tileWidth: tw, tileHeight: th, cols: tmCols, rows: tmRows, tilesetAssetId: 'd-water', paintIndex: 0, data: Array(tmCols*tmRows).fill(-1).map((_,i)=> (i%tmCols===0||i%tmCols===tmCols-1||Math.floor(i/tmCols)===0||Math.floor(i/tmCols)===tmRows-1)?0:-1) } } },
    { id: 'tip', name: 'Tip', components: { transform: { x: 480, y: 40, w: 440, h: 24 }, text: { value: 'Hold Ctrl and paint water tiles — wetlands store carbon.', size: 18, color: '#065f46' } } },
    { id: 'fx3', name: 'Mist', components: { transform: { x: 480, y: 250, w: 10, h: 10 }, emitter: { rate: 5, speed: 50, size: 2, life: 0.9, color: '#60a5fa' } } },
  ]

  // 5) Trash Cleanup (click trash near pointer)
  const p5 = { id: 'p-demo5', name: 'Trash Cleanup', startSceneId: 'scene-1', scenes: [baseScene('scene-1')], assets: [ { id: 'd-heavy', name:'Heavy Trash', type:'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="24" fill="%23ef4444"/></svg>' } ] }
  p5.scenes[0].entities = [
    // Tutorial overlay UI
    { id: 'tut5-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut5-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Trash Cleanup tutorial', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut5-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut5-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut5-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut5-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut5-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Trash spawns in the water.', 'Click near a trash to remove it.', 'Clean as much as you can — keep oceans healthy!', 'Great job!' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut5-label'); const panel=es.find(x=>x.id==='tut5-panel'); const next=es.find(x=>x.id==='tut5-next'); const skip=es.find(x=>x.id==='tut5-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

    { id: 'tip', name: 'Tip', components: { transform: { x: 480, y: 50, w: 420, h: 24 }, text: { value: 'Click near trash to remove it from the water.', size: 18, color: '#065f46' } } },
{ id: 'sp', name: 'Spawner', components: { transform:{ x:480,y:270,w:960,h:540 }, script:{ code: "let t=0; function onUpdate(e,p,api){ t+=p.dt; if(t>1.2){ t=0; const x=100+Math.random()*760; const y=120+Math.random()*360; api.addEntity({ name:'Trash', components:{ transform:{x:x,y:y,w:40,h:40}, sprite:{ assetId:'d-heavy' }, collider:{ type:'aabb', w:40, h:40 } } }) } } function onClick(e,p,api){ const es=api.entities(); for(const ent of es){ if(ent.name==='Trash'){ const t=ent.components.transform; if(Math.abs(t.x-p.x)<30 && Math.abs(t.y-p.y)<30){ api.particles.burst({ x: t.x, y: t.y, count: 12, speed: 100, life: 0.6, size: 2, color: '#60a5fa' }); api.removeEntity(ent); api.message({ text: 'Ocean cleaned a bit!', key: 'tc-clean', cooldownSec: 2 }) } } } }" } } },
  ]

  // 6) Tree Planter (click to plant trees)
  const p6 = { id:'p-demo6', name:'Tree Planter', startSceneId:'scene-1', scenes:[baseScene('scene-1')], assets:[ { id:'d-tree', name:'Tree', type:'image', src:'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect x="56" y="70" width="16" height="40" fill="%238c5a3c"/><circle cx="64" cy="56" r="36" fill="%2310b981"/></svg>' } ] }
  p6.scenes[0].entities = [
    // Tutorial overlay UI
    { id: 'tut6-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut6-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Tree Planter tutorial', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut6-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut6-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut6-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut6-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut6-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Click anywhere to plant a tree.', 'Plant three trees to see a special tip!', 'Trees capture carbon and support wildlife.', 'Try different layouts!' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut6-label'); const panel=es.find(x=>x.id==='tut6-panel'); const next=es.find(x=>x.id==='tut6-next'); const skip=es.find(x=>x.id==='tut6-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

    { id:'msg', name:'Tip', components:{ transform:{ x:480,y:50,w:420,h:24 }, text:{ value:'Click to plant a tree. Trees capture carbon!', size:18, color:'#065f46' } } },
    { id:'fx4', name:'Leaves', components:{ transform:{ x:480,y:200,w:10,h:10 }, emitter:{ rate:4, speed:60, size:2, life:0.8, color:'#86efac' } } },
{ id:'pl', name:'Planter', components:{ transform:{ x:480,y:270,w:960,h:540 }, script:{ code:"let trees=0; function onClick(e,p,api){ api.addEntity({ name:'Tree', components:{ transform:{x:p.x,y:p.y,w:64,h:64}, sprite:{assetId:'d-tree'}, collider:{type:'aabb',w:64,h:64} } }); api.particles.burst({ x: p.x, y: p.y, count: 14, speed: 100, life: 0.6, size: 3, color: '#86efac' }); trees++; if(trees%3===0) api.message({ text: 'Planted '+trees+' trees — great for biodiversity!', key: 'tp-msg', cooldownSec: 3 }) }" } } },
  ]

  // 7) Solar Planner (click to add panels and increase energy)
  const p7 = { id:'p-demo7', name:'Solar Planner', startSceneId:'scene-1', scenes:[baseScene('scene-1')], assets:[ { id:'d-panel', name:'Panel', type:'image', src:'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"128\" height=\"128\"><rect x=\"16\" y=\"32\" width=\"96\" height=\"48\" rx=\"6\" fill=\"%2310b981\"/><g stroke=\"%23ffffff\" stroke-width=\"4\"><line x1=\"16\" y1=\"48\" x2=\"112\" y2=\"48\"/><line x1=\"16\" y1=\"64\" x2=\"112\" y2=\"64\"/><line x1=\"40\" y1=\"32\" x2=\"40\" y2=\"80\"/><line x1=\"72\" y1=\"32\" x2=\"72\" y2=\"80\"/></g></svg>' } ] }
  p7.scenes[0].entities = [
    // Tutorial overlay UI
    { id: 'tut7-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut7-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Solar Planner tutorial', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut7-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut7-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut7-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut7-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut7-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Click to place solar panels.', 'Each panel adds progress to the energy bar.', 'Fill to 100 to meet the target!', 'Nice — try different placements.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut7-label'); const panel=es.find(x=>x.id==='tut7-panel'); const next=es.find(x=>x.id==='tut7-next'); const skip=es.find(x=>x.id==='tut7-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

    { id:'hud', name:'Energy', components:{ transform:{ x:480,y:40,w:400,h:20 }, ui:{ type:'progress', value:0, max:100, fill:'#0ea5e9', anchor:{ x:'center', y:'top' } } } },
    { id:'fx5', name:'Sparks', components:{ transform:{ x:480,y:40,w:10,h:10 }, emitter:{ rate:3, speed:70, size:2, life:0.7, color:'#fde047' } } },
    { id:'hint', name:'Tip', components:{ transform:{ x:480,y:70,w:420,h:24 }, text:{ value:'Click to add solar panels. Fill the bar to 100!', size:16, color:'#065f46' } } },
{ id:'ol', name:'Overlay', components:{ transform:{ x:480,y:270,w:960,h:540 }, script:{ code:"let e=0; function onClick(evt,p,api){ api.addEntity({ name:'Panel', components:{ transform:{x:p.x,y:p.y,w:56,h:28}, sprite:{assetId:'d-panel'}, collider:{type:'aabb',w:56,h:28} } }); api.particles.burst({ x: p.x, y: p.y, count: 12, speed: 110, life: 0.6, size: 2, color: '#fde047' }); e=Math.min(100,e+10); const es=api.entities(); for(const ent of es){ if(ent.name==='Energy'){ ent.components.ui.value=e } } if(e===100){ api.particles.burst({ x: 480, y: 40, count: 26, speed: 140, life: 0.7, size: 3, color: '#fde047' }); api.message({ text: 'Solar target met!', key: 'sp-goal', once: true }) } }" } } },
  ]

  // 8) Bike Switch (press button to switch from car to bike)
  const p8 = { id:'p-demo8', name:'Bike Commuter', startSceneId:'scene-1', scenes:[baseScene('scene-1')], assets:[ { id:'d-bike', name:'Bike', type:'image', src:'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"128\" height=\"128\"><circle cx=\"32\" cy=\"96\" r=\"20\" fill=\"%230ea5e9\"/><circle cx=\"96\" cy=\"96\" r=\"20\" fill=\"%230ea5e9\"/><rect x=\"48\" y=\"60\" width=\"32\" height=\"8\" fill=\"%2322c55e\"/></svg>' } ] }
  p8.scenes[0].entities = [
    // Tutorial overlay UI
    { id: 'tut8-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut8-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Bike Commuter tutorial', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut8-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut8-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut8-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut8-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut8-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Press the button to toggle bike commute.', 'Bike: zero local emissions and healthy exercise!', 'Toggle back and forth — note feedback messages.', 'Nice! Consider biking more often.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut8-label'); const panel=es.find(x=>x.id==='tut8-panel'); const next=es.find(x=>x.id==='tut8-next'); const skip=es.find(x=>x.id==='tut8-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

    { id:'label', name:'Label', components:{ transform:{ x:480,y:60,w:420,h:24 }, text:{ value:'Press the button to switch to bike commute!', size:18, color:'#065f46' } } },
    { id:'fx6', name:'Dust', components:{ transform:{ x:480,y:200,w:10,h:10 }, emitter:{ rate:2, speed:80, size:2, life:0.6, color:'#cbd5e1' } } },
{ id:'btn', name:'Button', components:{ transform:{ x:480,y:120,w:160,h:40 }, ui:{ type:'button', label:'Go Bike', fill:'#22c55e', textColor:'#fff' } , script:{ code:"let bike=false; function onClick(e,p,api){ bike=!bike; if(bike){ api.message({ text: 'Great! Zero-emission commute.', key: 'bc-on', cooldownSec: 2 }); api.addEntity({ name:'Bike', components:{ transform:{x:480,y:200,w:80,h:40}, sprite:{assetId:'d-bike'} } }); api.particles.burst({ x: 480, y: 200, count: 14, speed: 90, life: 0.6, size: 2, color: '#22c55e' }); } else { const es=api.entities(); for(const ent of es){ if(ent.name==='Bike') api.removeEntity(ent) } api.particles.burst({ x: 480, y: 200, count: 12, speed: 80, life: 0.5, size: 2, color: '#cbd5e1' }); api.message({ text: 'Switched back — try biking more!', key: 'bc-off', cooldownSec: 2 }) } }" } } },
  ]

  const demos = [
    { id: 'demo-1', title: 'Recycle Runner', description: 'Collect recycling icons — reduce waste and learn recycling basics.', project: p1, ownerId: 'system', status: 'approved' },
    { id: 'demo-2', title: 'Wind Farm Builder', description: 'Place turbines to cut CO₂ and power a cleaner grid.', project: p2, ownerId: 'system', status: 'approved' },
    { id: 'demo-3', title: 'Energy Saver HUD', description: 'Interactive UI shows how demand affects green energy.', project: p3, ownerId: 'system', status: 'approved' },
    { id: 'demo-4', title: 'Wetland Restoration', description: 'Paint water tiles to restore wetlands (editor tilemap demo).', project: p4, ownerId: 'system', status: 'approved' },
    { id: 'demo-5', title: 'Trash Cleanup', description: 'Click to remove trash from water — protect marine life.', project: p5, ownerId: 'system', status: 'approved' },
    { id: 'demo-6', title: 'Tree Planter', description: 'Plant trees — boost biodiversity and capture carbon.', project: p6, ownerId: 'system', status: 'approved' },
    { id: 'demo-7', title: 'Solar Planner', description: 'Add panels to meet clean energy targets.', project: p7, ownerId: 'system', status: 'approved' },
    { id: 'demo-8', title: 'Bike Commuter', description: 'Switch from car to bike to lower emissions.', project: p8, ownerId: 'system', status: 'approved' },
  ]
  return demos
}

export const useSubmissionsStore = create(
  persist(
    (set, get) => ({
      pendingGames: [],
      approvedGames: demoProjects(),
      pendingQuizzes: [],
      approvedQuizzes: [
        { id: 'dq-01', quiz: { title: 'Renewables 101', topic: 'Energy' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-02', quiz: { title: 'Recycling Basics', topic: 'Waste' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-03', quiz: { title: 'Water Conservation', topic: 'Water' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-04', quiz: { title: 'Biodiversity', topic: 'Ecology' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-05', quiz: { title: 'Carbon Footprint', topic: 'Climate' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-06', quiz: { title: 'Composting', topic: 'Waste' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-07', quiz: { title: 'Air Pollution', topic: 'Climate' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-08', quiz: { title: 'Ocean Health', topic: 'Water' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-09', quiz: { title: 'Sustainable Transport', topic: 'Energy' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-10', quiz: { title: 'Green Buildings', topic: 'Energy' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-11', quiz: { title: 'Plastic Pollution', topic: 'Waste' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-12', quiz: { title: 'Deforestation', topic: 'Forests' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-13', quiz: { title: 'Soil Health', topic: 'Agriculture' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-14', quiz: { title: 'Food Waste', topic: 'Waste' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-15', quiz: { title: 'Circular Economy', topic: 'Sustainability' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-16', quiz: { title: 'Energy Efficiency', topic: 'Energy' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-17', quiz: { title: 'Wastewater Treatment', topic: 'Water' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-18', quiz: { title: 'Urban Heat Islands', topic: 'Climate' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-19', quiz: { title: 'Green Tech', topic: 'Sustainability' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
        { id: 'dq-20', quiz: { title: 'Ecosystem Services', topic: 'Ecology' }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
      ],
      libraryAssets: [], // global pool of community assets from submitted/approved games

      seedDemos: () => set({ approvedGames: demoProjects() }),

      _addLibraryAssets: (assets) => set(state => {
        const existing = state.libraryAssets
        const incoming = (assets || []).filter(a => a && a.type === 'image')
        const dedupById = new Map(existing.map(a => [a.id, a]))
        for (const a of incoming) { if (!dedupById.has(a.id)) dedupById.set(a.id, a) }
        return { libraryAssets: Array.from(dedupById.values()) }
      }),

      submitGame: ({ title, description, project, ownerId }) => {
        const id = `g-${Date.now()}`
        const item = { id, title, description, project, ownerId, createdAt: new Date().toISOString(), status: 'pending' }
        set(state => ({ pendingGames: [item, ...state.pendingGames] }))
        // also add assets to library immediately
        get()._addLibraryAssets(project?.assets)
        return item
      },

      submitQuiz: ({ quiz, ownerId }) => {
        const id = `q-${Date.now()}`
        const item = { id, quiz, ownerId, createdAt: new Date().toISOString(), status: 'pending' }
        set(state => ({ pendingQuizzes: [item, ...state.pendingQuizzes] }))
        return item
      },

      approveGame: (id) => {
        const item = get().pendingGames.find(i => i.id === id)
        if (!item) return
        set(state => ({
          pendingGames: state.pendingGames.filter(i => i.id !== id),
          approvedGames: [{ ...item, status: 'approved', approvedAt: new Date().toISOString() }, ...state.approvedGames],
        }))
        get()._addLibraryAssets(item.project?.assets)
      },

      rejectGame: (id) => {
        set(state => ({ pendingGames: state.pendingGames.filter(i => i.id !== id) }))
      },

      approveQuiz: (id) => {
        const item = get().pendingQuizzes.find(i => i.id === id)
        if (!item) return
        set(state => ({
          pendingQuizzes: state.pendingQuizzes.filter(i => i.id !== id),
          approvedQuizzes: [{ ...item, status: 'approved', approvedAt: new Date().toISOString() }, ...state.approvedQuizzes],
        }))
      },

      rejectQuiz: (id) => {
        set(state => ({ pendingQuizzes: state.pendingQuizzes.filter(i => i.id !== id) }))
      },
    }),
    { name: 'aversoltix_submissions' }
  )
)

