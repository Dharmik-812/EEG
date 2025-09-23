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
      { id: 'd-hero', name: 'Hero', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%230ea5e9"/></linearGradient></defs><circle cx="64" cy="64" r="40" fill="url(%23g)"/><circle cx="52" cy="52" r="8" fill="%23ffffff" fill-opacity="0.7"/></svg>' },
      { id: 'd-recycle', name: 'Recycle', type: 'image', src: demoSVG.recycle },
      { id: 'd-bin', name: 'Bin', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%23059e73"/></linearGradient></defs><rect x="24" y="28" width="80" height="80" rx="12" fill="url(%23gb)"/><rect x="20" y="18" width="88" height="14" rx="7" fill="%2310b981"/><g fill="%23ffffff" transform="translate(64,70)"><polygon points="0,-18 10,2 -10,2"/><polygon points="-22,6 -4,-4 -4,14"/><polygon points="22,6 4,14 4,-4"/></g></svg>' },
      { id: 'd-heavy', name: 'Heavy', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23ef4444"/><stop offset="100%" stop-color="%23dc2626"/></linearGradient></defs><rect width="128" height="128" rx="24" fill="url(%23r)"/><path d="M32 32 L96 96 M96 32 L32 96" stroke="%23ffffff" stroke-width="10" stroke-linecap="round"/></svg>' },
    ],
    input: { left: ['ArrowLeft','KeyA'], right: ['ArrowRight','KeyD'], up: ['ArrowUp','KeyW'], down: ['ArrowDown','KeyS'], action: ['Space'] },
  }
  p1.scenes[0].entities = [
    { id: 'tip', name: 'Tip', components: { transform: { x: 480, y: 50, w: 540, h: 24 }, text: { value: 'Move with WASD/Arrows. Collect bins, avoid heavy trash!', size: 18, color: '#065f46' } } },
    { id: 'score', name: 'ScoreLabel', components: { transform: { x: 80, y: 24, w: 160, h: 24 }, text: { value: 'Recycled: 0', size: 16, color: '#065f46' } } },
    { id: 'fx1', name: 'Ambient', components: { transform: { x: 480, y: 80, w: 10, h: 10 }, emitter: { rate: 4, speed: 60, size: 2, life: 0.8, color: '#a7f3d0' } } },
    // Tutorial overlay UI
    { id: 'tut-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Welcome to Recycle Runner!', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const es=api.entities(); const ts=es.find(x=>x.name==='TutScript'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const es=api.entities(); const ts=es.find(x=>x.name==='TutScript'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Agenda — Learn to identify recyclables and avoid contamination.', 'Objective — Collect green recycling; avoid red heavy trash.', 'Impact — Recycling cuts landfill use and saves energy.', 'Controls — Move with WASD/Arrows; Space/tap to restart.', 'Challenge — Beat your best and notice safe/unsafe items.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.name==='TutLabel'); const panel=es.find(x=>x.name==='TutPanel'); const next=es.find(x=>x.name==='TutNext'); const skip=es.find(x=>x.name==='TutSkip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

{ id: 'e-hero', name: 'Hero', components: { transform: { x: 120, y: 120, w: 80, h: 80, rotation: 0 }, sprite: { assetId: 'd-hero' }, rigidbody: { vx: 0, vy: 0, gravity: 0 }, collider: { type: 'aabb', w: 80, h: 80 }, script: { code: "let recycled=0, dead=false, mt=0; function onUpdate(event,payload,api){ mt+=payload.dt; if(dead){ if(api.input.down('action')){ const es=api.entities(); for(const ent of es){ if(ent.name==='Recycle'||ent.name==='Heavy') api.removeEntity(ent) } const t=api.entity.components.transform; t.x=120; t.y=120; recycled=0; dead=false; const lab=es.find(x=>x.name==='ScoreLabel'); if(lab){ lab.components.text.value='Recycled: 0' } api.particles.burst({ x: t.x, y: t.y, count: 18, speed: 120, life: 0.6, size: 3, color: '#22c55e' }); api.audio.tone({ frequency: 660, duration: 0.08 }); api.message({ text: 'Restarted!', key: 'rr-restart', cooldownSec: 2 }) } return } const s=180; if(api.input.down('left'))api.moveBy(-s*payload.dt,0); if(api.input.down('right'))api.moveBy(s*payload.dt,0); if(api.input.down('up'))api.moveBy(0,-s*payload.dt); if(api.input.down('down'))api.moveBy(0,s*payload.dt); } function onCollision(event,payload,api){ const other=payload.other?.name; const es=api.entities(); const lab=es.find(x=>x.name==='ScoreLabel'); if(other==='Recycle'||other==='Bin'){ recycled++; if(lab){ lab.components.text.value='Recycled: '+recycled } const pt=payload.other?.components?.transform; if(pt){ api.particles.burst({ x: pt.x, y: pt.y, count: 14, speed: 120, life: 0.6, size: 3, color: '#22c55e' }) } api.audio.tone({ frequency: 880, duration: 0.1 }); if(mt>1.2){ mt=0; api.message({ text: 'Recycled '+recycled+' items — great job!', key: 'rr-recycled', cooldownSec: 2 }) } api.removeEntity(payload.other) } if(other==='Heavy'){ dead=true; const t=api.entity.components.transform; api.particles.burst({ x: t.x, y: t.y, count: 24, speed: 140, life: 0.7, size: 4, color: '#ef4444' }); api.audio.tone({ frequency: 180, duration: 0.2 }); api.message({ text: 'Game Over — press Space to restart', key: 'rr-gameover', cooldownSec: 3 }) } }" } } },
    { id: 'spawner', name: 'Spawner', components: { transform: { x: 480, y: 270, w: 960, h: 540 }, script: { code: "let t=0; function onUpdate(e,p,api){ t+=p.dt; if(t>1.0){ t=0; const es=api.entities(); const hero=es.find(x=>x.id==='e-hero'); let x=120+Math.random()*720; let y=120+Math.random()*360; if(hero){ const ht=hero.components.transform; let tries=0; while(tries<5 && Math.hypot((x-ht.x),(y-ht.y))<120){ x=120+Math.random()*720; y=120+Math.random()*360; tries++; } } if(Math.random()<0.75){ api.addEntity({ name:'Recycle', components:{ transform:{x:x,y:y,w:60,h:60}, sprite:{assetId:'d-bin'}, collider:{type:'aabb',w:60,h:60} } }) } else { api.addEntity({ name:'Heavy', components:{ transform:{x:x,y:y,w:50,h:50}, sprite:{assetId:'d-heavy'}, collider:{type:'aabb',w:50,h:50} } }) } } }" } } },
  ]

  // 2) Wind Farm Builder (click to add turbines and cut CO₂)
  const p2 = {
    id: 'p-demo2', name: 'Wind Farm Builder', startSceneId: 'scene-1',
    scenes: [baseScene('scene-1')],
    assets: [ { id: 'd-turbine', name: 'Turbine', type: 'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2394a3b8"/><stop offset="100%" stop-color="%2378859b"/></linearGradient></defs><rect x="60" y="60" width="8" height="56" fill="url(%23tg)"/><circle cx="64" cy="56" r="8" fill="url(%23tg)"/><g fill="url(%23tg)"><path d="M64 56 L112 44 L64 56 Z"/><path d="M64 56 L16 44 L64 56 Z"/><path d="M64 56 L64 10 L64 56 Z"/></g></svg>' } ],
  }
  p2.scenes[0].entities = [
    // Tutorial overlay UI
    { id: 'tut2-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut2-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Build turbines!', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut2-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const es=api.entities(); const ts=es.find(x=>x.id==='tut2-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut2-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const es=api.entities(); const ts=es.find(x=>x.id==='tut2-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut2-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Agenda — How wind power reduces CO₂.', 'Objective — Click to place turbines; try spacing and layout.', 'Impact — Each turbine cuts 50 kg CO₂/day in this model.', 'Consider — Good siting balances output and wildlife.', 'Explore — Build patterns and compare results.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut2-label'); const panel=es.find(x=>x.id==='tut2-panel'); const next=es.find(x=>x.id==='tut2-next'); const skip=es.find(x=>x.id==='tut2-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

    { id: 'e-msg', name: 'Tip', components: { transform: { x: 480, y: 60, w: 400, h: 40, rotation: 0 }, text: { value: 'Click to build wind turbines. Each cuts CO₂ by 50kg/day!', size: 18, color: '#065f46' } } },
    { id: 'hud-co2', name: 'CO2', components: { transform: { x: 480, y: 90, w: 420, h: 20 }, ui: { type: 'progress', value: 0, max: 100, fill: '#93c5fd', anchor: { x:'center', y:'top' } } } },
    { id: 'fx2', name: 'Breeze', components: { transform: { x: 480, y: 120, w: 10, h: 10 }, emitter: { rate: 6, speed: 70, size: 2, life: 0.7, color: '#93c5fd' } } },
{ id: 'e-spawner', name: 'Spawner', components: { transform: { x: 480, y: 270, w: 960, h: 540 }, script: { code: "let co2=0; const target=500; function onClick(e,p,api){ const x=p.x, y=p.y; api.addEntity({ name:'Turbine', components:{ transform:{x:x,y:y,w:12,h:12,rotation:0}, sprite:{assetId:'d-turbine'}, collider:{type:'aabb',w:64,h:64}, script:{ code: 'let t=0,b=0; function onUpdate(e,p,api){ t+=p.dt; b+=p.dt; const tr=api.entity.components.transform; const s=Math.min(1,0.2+t*2.0); tr.w=64*s; tr.h=64*s; tr.rotation=((tr.rotation||0)+120*p.dt)%360; if(b>0.8){ b=0; api.particles.burst({ x: tr.x, y: tr.y-20, count: 8, speed: 80, life: 0.5, size: 2, color: \"#93c5fd\" }); } }' } } }); api.particles.burst({ x:x, y:y, count: 12, speed: 100, life: 0.6, size: 2, color: '#93c5fd' }); api.audio.tone({ frequency: 520, duration: 0.1 }); co2+=50; const es=api.entities(); const hud=es.find(x=>x.name==='CO2'); if(hud){ const val=Math.min(100, Math.round(100*co2/target)); hud.components.ui.value=val; if(val===100){ api.audio.tone({ frequency: 1200, duration: 0.2 }); api.message({ text: 'Wind goal achieved!', key: 'wf-goal', once: true }) } } api.message({ text: 'Clean energy built! CO2 reduced '+co2+' kg/day', key: 'wf-co2', cooldownSec: 2 }); }" } } },
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
    { id: 'tut3-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Agenda — Demand-side energy efficiency basics.', 'Objective — Drag the slider to lower usage.', 'Impact — Lower demand shifts the grid greener.', 'Actions — LEDs, standby off, smart thermostats.', 'Explore — Click for tips and try different values.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut3-label'); const panel=es.find(x=>x.id==='tut3-panel'); const next=es.find(x=>x.id==='tut3-next'); const skip=es.find(x=>x.id==='tut3-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

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
    { id: 'tut4-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Agenda — Why wetlands matter for climate and habitat.', 'Objective — Hold Ctrl+drag to restore water tiles.', 'Impact — Wetlands store carbon, buffer floods, aid wildlife.', 'Consider — Connect patches to allow healthy flow.', 'Tools — Clear with Inspector if you want a reset.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut4-label'); const panel=es.find(x=>x.id==='tut4-panel'); const next=es.find(x=>x.id==='tut4-next'); const skip=es.find(x=>x.id==='tut4-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

    { id: 'tm', name: 'Water Tiles', components: { transform: { x: 480, y: 270, w: tw*tmCols, h: th*tmRows }, tilemap: { tileWidth: tw, tileHeight: th, cols: tmCols, rows: tmRows, tilesetAssetId: 'd-water', paintIndex: 0, data: Array(tmCols*tmRows).fill(-1).map((_,i)=> (i%tmCols===0||i%tmCols===tmCols-1||Math.floor(i/tmCols)===0||Math.floor(i/tmCols)===tmRows-1)?0:-1) } } },
    { id: 'tip', name: 'Tip', components: { transform: { x: 480, y: 40, w: 440, h: 24 }, text: { value: 'Hold Ctrl and paint water tiles — wetlands store carbon.', size: 18, color: '#065f46' } } },
    { id: 'fx3', name: 'Mist', components: { transform: { x: 480, y: 250, w: 10, h: 10 }, emitter: { rate: 5, speed: 50, size: 2, life: 0.9, color: '#60a5fa' } } },
  ]

  // 5) Trash Cleanup (click trash near pointer)
const p5 = { id: 'p-demo5', name: 'Trash Cleanup', startSceneId: 'scene-1', scenes: [baseScene('scene-1')], assets: [ { id: 'd-heavy', name:'Heavy Trash', type:'image', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="r2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23ef4444"/><stop offset="100%" stop-color="%23dc2626"/></linearGradient></defs><rect width="128" height="128" rx="24" fill="url(%23r2)"/><path d="M32 32 L96 96 M96 32 L32 96" stroke="%23ffffff" stroke-width="10" stroke-linecap="round"/></svg>' } ] }
  p5.scenes[0].entities = [
    // Tutorial overlay UI
    { id: 'tut5-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut5-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Trash Cleanup tutorial', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut5-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut5-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut5-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut5-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut5-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Agenda — Ocean litter and cleanup action.', 'Objective — Click near trash to remove it.', 'Impact — Cleanup protects wildlife and water quality.', 'Habits — Reduce, reuse, and take trash with you.', 'Challenge — Clear as much as you can.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut5-label'); const panel=es.find(x=>x.id==='tut5-panel'); const next=es.find(x=>x.id==='tut5-next'); const skip=es.find(x=>x.id==='tut5-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

    { id: 'tip', name: 'Tip', components: { transform: { x: 480, y: 50, w: 420, h: 24 }, text: { value: 'Click near trash to remove it from the water.', size: 18, color: '#065f46' } } },
    { id: 'cleaned', name: 'CleanedLabel', components: { transform: { x: 140, y: 24, w: 200, h: 24 }, text: { value: 'Cleaned: 0', size: 16, color: '#065f46' } } },
{ id: 'sp', name: 'Spawner', components: { transform:{ x:480,y:270,w:960,h:540 }, script:{ code: "let t=0, cleaned=0; function onUpdate(e,p,api){ t+=p.dt; if(t>1.2){ t=0; const x=100+Math.random()*760; const y=120+Math.random()*360; api.addEntity({ name:'Trash', components:{ transform:{x:x,y:y,w:40,h:40}, sprite:{ assetId:'d-heavy' }, collider:{ type:'aabb', w:40, h:40 } } }) } } function onClick(e,p,api){ const es=api.entities(); const label=es.find(x=>x.name==='CleanedLabel'); for(const ent of es){ if(ent.name==='Trash'){ const t=ent.components.transform; if(Math.abs(t.x-p.x)<30 && Math.abs(t.y-p.y)<30){ cleaned++; if(label){ label.components.text.value='Cleaned: '+cleaned } api.particles.burst({ x: t.x, y: t.y, count: 12, speed: 100, life: 0.6, size: 2, color: '#60a5fa' }); api.audio.tone({ frequency: 760, duration: 0.08 }); api.removeEntity(ent); api.message({ text: 'Ocean cleaned a bit!', key: 'tc-clean', cooldownSec: 2 }) } } } }" } } },
  ]

  // 6) Tree Planter (click to plant trees)
  const p6 = { id:'p-demo6', name:'Tree Planter', startSceneId:'scene-1', scenes:[baseScene('scene-1')], assets:[ { id:'d-tree', name:'Tree', type:'image', src:'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect x="56" y="70" width="16" height="40" fill="%238c5a3c"/><circle cx="64" cy="56" r="36" fill="%2310b981"/></svg>' } ] }
  p6.scenes[0].entities = [
    // Tutorial overlay UI
    { id: 'tut6-panel', name: 'TutPanel', components: { transform: { x: 480, y: 24, w: 840, h: 48 }, ui: { type: 'panel', fill: 'rgba(15,23,42,0.6)', anchor: { x:'center', y:'top' } } } },
    { id: 'tut6-label', name: 'TutLabel', components: { transform: { x: 480, y: 24, w: 800, h: 48 }, ui: { type: 'label', label: 'Tree Planter tutorial', textSize: 14, textColor: '#fff', anchor: { x:'center', y:'top' } } } },
    { id: 'tut6-next', name: 'TutNext', components: { transform: { x: 840, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Next', fill: '#10b981', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut6-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=Math.min((st.steps||[]).length, (st.step||0)+1); ts.components.script.state=st }" } } },
    { id: 'tut6-skip', name: 'TutSkip', components: { transform: { x: 750, y: 24, w: 90, h: 36 }, ui: { type: 'button', label: 'Skip', fill: '#334155', textColor: '#fff', textSize: 14, anchor: { x:'right', y:'top' } }, script: { code: "function onClick(e,p,api){ const ts=api.entities().find(x=>x.id==='tut6-script'); if(!ts) return; const st=ts.components.script.state||{}; st.step=(st.steps||[]).length; ts.components.script.state=st }" } } },
    { id: 'tut6-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Agenda — Trees for carbon capture and biodiversity.', 'Objective — Click to plant; explore spacing and patterns.', 'Impact — Every 3 trees shows a tip; forests cool cities.', 'Consider — Use native species and a diverse mix.', 'Explore — Try different layouts!' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut6-label'); const panel=es.find(x=>x.id==='tut6-panel'); const next=es.find(x=>x.id==='tut6-next'); const skip=es.find(x=>x.id==='tut6-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

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
    { id: 'tut7-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Agenda — How rooftop solar meets energy targets.', 'Objective — Click to place panels and fill the bar.', 'Impact — Each panel adds clean capacity; hit 100 to win.', 'Consider — Orientation, tilt and shade matter.', 'Explore — Test layouts like rows or clusters.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut7-label'); const panel=es.find(x=>x.id==='tut7-panel'); const next=es.find(x=>x.id==='tut7-next'); const skip=es.find(x=>x.id==='tut7-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

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
    { id: 'tut8-script', name: 'TutScript', components: { transform: { x: 0, y: 0, w: 10, h: 10 }, script: { code: "let inited=false; function onUpdate(e,p,api){ const self=api.entity; if(!inited){ inited=true; self.components.script.state={ step:0, steps:[ 'Agenda — Benefits of shifting to active travel.', 'Objective — Press the button to toggle bike mode.', 'Impact — Biking cuts CO₂ and improves health.', 'Habits — Combine bike + transit; try short trips.', 'Explore — Toggle and imagine weekly bike goals.' ] } } const st=self.components.script.state||{step:0,steps:[]}; const es=api.entities(); const label=es.find(x=>x.id==='tut8-label'); const panel=es.find(x=>x.id==='tut8-panel'); const next=es.find(x=>x.id==='tut8-next'); const skip=es.find(x=>x.id==='tut8-skip'); if(st.step>=st.steps.length){ if(panel) api.removeEntity(panel); if(label) api.removeEntity(label); if(next) api.removeEntity(next); if(skip) api.removeEntity(skip); api.removeEntity(self); return } if(label){ label.components.ui.label = st.steps[st.step] } }" } } },

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
{ id: 'dq-01', quiz: { title: 'Renewables 101', topic: 'Energy', difficulty: 'easy', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which is NOT renewable?', options: ['Wind','Solar','Coal','Hydro'], answerIndex: 2 },
          { id: 'q2', type: 'mcq', question: 'Main material of most solar cells?', options: ['Aluminum','Silicon','Copper','Iron'], answerIndex: 1 },
          { id: 'q3', type: 'mcq', question: 'Geothermal energy comes from…', options: ['Earth’s internal heat','Ocean tides only','Lightning','Car engines'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Which factor improves rooftop solar output?', options: ['Proper orientation/tilt','Painting panels black','More shade','Dirty panels'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Hydroelectric plants use the energy of…', options: ['Falling water','Underground oil','Jet fuel','Coal steam'], answerIndex: 0 }
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
{ id: 'dq-02', quiz: { title: 'Recycling Basics', topic: 'Waste', difficulty: 'easy', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which is commonly recyclable curbside?', options: ['Plastic bags','Glass bottles','Greasy pizza boxes','Ceramics'], answerIndex: 1 },
          { id: 'q2', type: 'mcq', question: 'Before recycling a container, you should…', options: ['Crush it','Rinse it','Break it','Burn it'], answerIndex: 1 },
          { id: 'q3', type: 'mcq', question: 'Which plastics are most commonly recycled?', options: ['#1 PET and #2 HDPE','#7 only','All plastics equally','None'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Which item should NOT go in mixed recycling?', options: ['Plastic film/bags','Metal cans','Cardboard','Paper'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Best practice for pizza boxes:', options: ['Recycle clean parts, compost/landfill greasy parts','Recycle entire box greasy or not','Always landfill','Always compost'], answerIndex: 0 }
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
{ id: 'dq-03', quiz: { title: 'Water Conservation', topic: 'Water', difficulty: 'easy', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Best way to save water at home?', options: ['Longer showers','Fix leaks','Water lawn at noon','Leave tap running'], answerIndex: 1 },
          { id: 'q2', type: 'mcq', question: 'Which uses the most water indoors?', options: ['Toilet','Kitchen sink','Shower','Washing machine'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Which irrigation saves most water?', options: ['Drip irrigation','Sprinklers at noon','Flood irrigation','Runoff channels'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Which fixture saves water?', options: ['Low-flow showerhead','Always-open tap','Leaky faucet','Old toilets'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Greywater can be reused for…', options: ['Landscape irrigation (where allowed)','Drinking without treatment','Bathing without treatment','None'], answerIndex: 0 }
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
{ id: 'dq-04', quiz: { title: 'Biodiversity', topic: 'Ecology', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Biodiversity refers to…', options: ['Life variety','Number of trees','Animals only','Plants only'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Best for urban biodiversity?', options: ['Paving greens','Plant native species','Use pesticides widely','Remove trees'], answerIndex: 1 },
          { id: 'q3', type: 'mcq', question: 'Pollinators help plants by…', options: ['Enabling reproduction','Spreading pests','Removing nutrients','Blocking sun'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Habitat fragmentation can be reduced by…', options: ['Wildlife corridors','More roads','Removing parks','Fencing everywhere'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Invasive species often…', options: ['Outcompete native species','Increase diversity','Improve soil always','Have no effect'], answerIndex: 0 }
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
{ id: 'dq-05', quiz: { title: 'Carbon Footprint', topic: 'Climate', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Personal footprint can drop by…', options: ['Flying more','Reducing energy use','Idling car','Single-use plastics'], answerIndex: 1 },
          { id: 'q2', type: 'mcq', question: 'Which has the lowest CO₂ per km?', options: ['Car (solo)','Bus','Bike','Motorbike'], answerIndex: 2 },
          { id: 'q3', type: 'mcq', question: 'Which diet change often lowers emissions?', options: ['More plant-based meals','More red meat daily','Food flown long distances','More waste'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Which home action cuts emissions?', options: ['Insulate & seal drafts','Windows open in winter','Inefficient bulbs','Higher thermostat in summer'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Which travel choice lowers emissions most?', options: ['Train over short flights','Frequent private jets','Driving solo long distances','Idling'], answerIndex: 0 }
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
{ id: 'dq-06', quiz: { title: 'Composting', topic: 'Waste', difficulty: 'easy', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which item belongs in a compost bin?', options: ['Vegetable scraps','Plastic wrapper','Glass shards','Aluminum foil'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Which is a “brown” material for compost?', options: ['Dry leaves','Cooked pasta','Yogurt cup','Metal can'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'What helps a compost pile break down faster?', options: ['Turning to add air','Sealing it airtight','Adding plastic daily','Adding more salt'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Which should NOT be composted?', options: ['Meat & dairy','Fruit peels','Coffee grounds','Tea leaves'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'An ideal compost mix is…', options: ['Browns + greens + air + moisture','Only greens','Only browns','Plastics and leaves'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
{ id: 'dq-07', quiz: { title: 'Air Pollution', topic: 'Climate', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which action most helps reduce urban air pollution?', options: ['Using public transport','Idling your car','Burning leaves','Using diesel generators'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Which pollutant is a major component of smog?', options: ['Ground-level ozone (O₃)','Oxygen (O₂)','Nitrogen (N₂)','Water (H₂O)'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Which household habit improves indoor air quality?', options: ['Using kitchen exhaust while cooking','Burning trash in the yard','Smoking indoors','Blocking vents'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'PM2.5 refers to…', options: ['Fine particles ≤2.5µm','2.5% oxygen','CO levels','Ozone thickness'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Which heating choice reduces air pollution?', options: ['Electric heat pump','Open coal stove','Diesel generator','Trash burning'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
{ id: 'dq-08', quiz: { title: 'Ocean Health', topic: 'Water', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which action best protects ocean ecosystems?', options: ['Reducing single-use plastics','Dumping wastewater offshore','Trawling coral reefs','Feeding wild fish bread'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Ocean acidification is mainly caused by…', options: ['CO₂ absorbed by seawater','Extra oxygen in water','Too much salt','Lack of sunlight'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Marine Protected Areas (MPAs) help by…', options: ['Allowing ecosystems to recover','Increasing overfishing','Raising water temperature','Adding plastic habitat'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Which practice reduces bycatch?', options: ['Selective gear (e.g., TEDs)','Trawling reefs','Dynamite fishing','Ghost nets'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Seagrass meadows…', options: ['Store “blue carbon”','Increase acidity','Produce plastics','Heat oceans'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
{ id: 'dq-09', quiz: { title: 'Sustainable Transport', topic: 'Energy', difficulty: 'easy', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which mode has the lowest carbon emissions?', options: ['Walking/Cycling','Single-occupancy car','Taxi','Motorbike'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'A good commute strategy to cut footprints is…', options: ['Bike + transit combo','Driving faster','Idling at pick-up','Riding alone daily'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Which driving habit saves fuel?', options: ['Smooth acceleration','Hard braking','Excessive idling','Over-inflating tires'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'EV charging is cleanest when powered by…', options: ['Renewable sources','Diesel generators','Idling cars','Coal stoves'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Transport demand can be reduced by…', options: ['Remote work','More single-occupancy trips','Empty bus runs','High-speed idling'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
{ id: 'dq-10', quiz: { title: 'Green Buildings', topic: 'Energy', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which upgrade most improves efficiency?', options: ['Insulation','Bigger TV','More halogen bulbs','Open windows in winter'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Which windows reduce heat loss?', options: ['Double/triple glazing','Single pane','Broken seals','Always-open windows'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Passive solar design focuses on…', options: ['Using sun via orientation/shading','Running AC full-time','Blocking daylight','Painting roofs black'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Air sealing targets…', options: ['Leakage paths','Window area','Wall color','Wi‑Fi signals'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Heat pumps provide…', options: ['Efficient heating & cooling','Only heating via boilers','Only cooling with water','No efficiency gains'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() }
{ id: 'dq-11', quiz: { title: 'Plastic Pollution', topic: 'Waste', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Common source of microplastics is…', options: ['Synthetic clothing fibers','Sand','Sea salt only','Glass bottles'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Best way to reduce plastic waste?', options: ['Refill/reuse containers','Use more disposables','Burn plastic at home','Throw all in landfill'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Which is usually NOT curbside-recyclable?', options: ['Plastic bags/film','Paper','Metal cans','Cardboard'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Which alternative reduces plastic waste?', options: ['Refill stations','More single-use cups','Thicker plastic bags','Microbeads cosmetics'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Nurdles are…', options: ['Plastic pellets','Glass beads','Fish eggs','Rock salt'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() },
{ id: 'dq-12', quiz: { title: 'Deforestation', topic: 'Forests', difficulty: 'hard', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'A key impact of deforestation is…', options: ['Biodiversity loss & CO₂ emissions','Lower rainfall everywhere','Instant soil recovery','More habitat for all species'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Which practice helps reduce deforestation?', options: ['Sustainable forestry certification','Illegal logging','Slash-and-burn','Unplanned road building'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Reforestation means…', options: ['Planting trees where forests were removed','Cutting old-growth only','Replacing forests with farms','Draining wetlands'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Agroforestry…', options: ['Combines trees with crops','Removes all trees','Is monoculture only','Bans shade'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'A common driver of deforestation is…', options: ['Commodity expansion','Tree planting','Urban parks','Wetland restoration'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() }
{ id: 'dq-13', quiz: { title: 'Soil Health', topic: 'Agriculture', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which practice improves soil health?', options: ['Cover crops','Bare fallow all year','Over-tillage','Excess salt'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Soil organic matter helps by…', options: ['Storing water & nutrients','Making soil sterile','Blocking roots','Salinizing soil'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'A method to reduce erosion is…', options: ['Contour farming','Removing all vegetation','Steeper slopes','Exposed topsoil'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Minimal tillage helps by…', options: ['Reducing disturbance','Exposing topsoil','Breaking aggregates','Salting soil'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Soil pH affects…', options: ['Nutrient availability','Sunrise time','Wind speed','Star visibility'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() }
{ id: 'dq-14', quiz: { title: 'Food Waste', topic: 'Waste', difficulty: 'easy', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which action cuts household food waste?', options: ['Meal planning','Buying impulsively','Ignoring dates & storage','Cooking excessive amounts'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Which helps keep food fresh longer?', options: ['Proper storage temperature','Leaving fridge door open','Room-temp dairy','Unsealed containers'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Unavoidable food scraps should be…', options: ['Composted','Flushed','Thrown on street','Burned indoors'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: '“Best before” date typically indicates…', options: ['Quality; often safe after','Unsafe after midnight','Mandatory discard','Product recall'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Leftovers should be stored…', options: ['Promptly cooled and sealed','Left out overnight','Uncovered in warm oven','On windowsill'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() }
{ id: 'dq-15', quiz: { title: 'Circular Economy', topic: 'Sustainability', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'A circular economy aims to…', options: ['Keep materials in use longer','Use more landfills','Speed up extraction','Design for single-use'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Product-as-a-service is…', options: ['Leasing/servitizing products','One-time disposable sales','Illegal refurbishment','Mandatory ownership'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'A key design strategy is…', options: ['Design for repair & reuse','Hard-to-open cases','Glued-in batteries only','No spare parts'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Remanufacturing is…', options: ['Rebuilding to like-new','Incinerating','Downcycling only','Landfilling'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Design for disassembly enables…', options: ['Easy repair/reuse','Harder recycling','Permanent glues everywhere','Single-use parts'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() }
{ id: 'dq-16', quiz: { title: 'Energy Efficiency', topic: 'Energy', difficulty: 'easy', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which bulb is most efficient?', options: ['LED','Incandescent','Halogen','CFL (older type)'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: '“Phantom loads” are reduced by…', options: ['Unplugging/using power strips','Leaving everything on','Higher thermostat always','Blocking vents'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Which label indicates efficient appliances?', options: ['ENERGY STAR/efficiency rating','No label','“High watt” only','Random sticker'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Which setting saves HVAC energy?', options: ['Programmable thermostats','Open windows in winter','Constant max heat','Doors open'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Standby power can be cut by…', options: ['Smart strips','Always-on chargers','Bigger power bricks','Higher voltage outlets'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() }
{ id: 'dq-17', quiz: { title: 'Wastewater Treatment', topic: 'Water', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Primary treatment mainly…', options: ['Removes solids by settling','Adds perfume','Dyes water blue','Removes all microbes'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'You should NOT flush…', options: ['Wipes','Toilet paper','Water','Dilute soap'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Households can reduce loads by…', options: ['Low-flow fixtures','Running taps constantly','Pouring oil in sink','Flushing paint'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Secondary treatment uses…', options: ['Biological processes','Only screening','Nuclear filters','Sand pits only'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Fats, oils, and grease should…', options: ['Be collected & disposed','Go down sink','Be flushed','Mixed with paint'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() }
{ id: 'dq-18', quiz: { title: 'Urban Heat Islands', topic: 'Climate', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which reduces urban heat islands?', options: ['Trees/green roofs','Dark roofs','More asphalt','Removing parks'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: '“Cool roofs” are…', options: ['High-reflectance roofs','Heaters on roofs','Mirrors indoors','Black tar roofs'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'Pavement strategy to cool cities:', options: ['Permeable/cool pavements','Hotter pavements','More car lanes only','Concrete without shade'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Street trees help by…', options: ['Shading & evapotranspiration','Blocking wind only','Heating asphalt','Absorbing CO in roots'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Cool roofs are typically…', options: ['Light/reflective','Dark/absorptive','Heated','Sticky tar'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() }
{ id: 'dq-19', quiz: { title: 'Green Tech', topic: 'Sustainability', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Which is a renewable energy source?', options: ['Geothermal','Diesel','Coal','Peat'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'A smart grid helps by…', options: ['Balancing demand with renewables','Wasting energy at night','Ignoring outages','Blocking distributed energy'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'An example of energy storage is…', options: ['Battery systems','Open windows','More diesel tanks','Incandescent lamps'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Demand response means…', options: ['Shifting loads in time','Burning more diesel','Running lights 24/7','Banning households'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Example of low-carbon heating:', options: ['Heat pump','Coal furnace','Diesel boiler','Open fire pit'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() }
{ id: 'dq-20', quiz: { title: 'Ecosystem Services', topic: 'Ecology', difficulty: 'medium', xp: 100, questions: [
          { id: 'q1', type: 'mcq', question: 'Pollination is typically considered a…', options: ['Regulating service','Provisioning service','Cultural service','No service'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', question: 'Wetlands provide which services?', options: ['Flood control & water purification','More dust storms','Noise pollution','Ozone depletion'], answerIndex: 0 },
          { id: 'q3', type: 'mcq', question: 'A cultural ecosystem service example is…', options: ['Recreation in parks','Drinking water','Timber','Coal mining'], answerIndex: 0 },
          { id: 'q4', type: 'mcq', question: 'Provisioning services provide…', options: ['Goods like food & water','Cultural values only','Regulating climate only','No tangible goods'], answerIndex: 0 },
          { id: 'q5', type: 'mcq', question: 'Regulating services include…', options: ['Pollination & flood control','Video games','Poetry readings','Sculptures'], answerIndex: 0 },
        ] }, ownerId: 'system', status: 'approved', approvedAt: new Date().toISOString() }
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

