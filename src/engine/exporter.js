// Generate a standalone HTML that plays the given project JSON using a minimal runtime
export function buildWebHTML(project) {
  const projectJson = JSON.stringify(project)
  const runtime = `
(function(){
  function makeToast(){
    const box = document.createElement('div');
    Object.assign(box.style,{ position:'fixed', top:'12px', right:'12px', display:'flex', flexDirection:'column', gap:'8px', zIndex:9999 });
    document.body.appendChild(box);
    return (text)=>{ const d=document.createElement('div'); Object.assign(d.style,{ background:'rgba(15,23,42,0.9)', color:'#fff', padding:'8px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.2)', font:'12px sans-serif' }); d.textContent=text; box.appendChild(d); setTimeout(()=>{ try{box.removeChild(d)}catch{} }, 2400) }
  }

  // Message manager for dedupe/throttle/once
  function createMessageManager(toast){
    const once = new Set();
    const recent = new Map(); // key -> timestamp (sec)
    return function message(textOrOpts, maybeOpts){
      const opts = (typeof textOrOpts === 'string') ? (maybeOpts || {}) : (textOrOpts || {})
      const text = (typeof textOrOpts === 'string') ? textOrOpts : (textOrOpts && textOrOpts.text) || ''
      const key = opts.key || text
      if (!text) return
      if (opts.once) {
        if (once.has(key)) return
        once.add(key)
      }
      const now = performance.now() / 1000
      const last = recent.get(key) || 0
      const cooldown = (opts.cooldownSec != null) ? opts.cooldownSec : 1.5
      if ((now - last) < cooldown) return
      recent.set(key, now)
      toast(text)
    }
  }

  function runProject(canvas, project){
    const ctx = canvas.getContext('2d');
    let scene = project.scenes.find(s => s.id === (project.startSceneId || (project.scenes[0] && project.scenes[0].id)));
    let last = 0; let running = true;
    const images = {}; const audios = {};
    const toast = makeToast();
    const message = createMessageManager(toast);

    // Input mapping and state
    const inputMap = Object.assign({ left:['ArrowLeft','KeyA'], right:['ArrowRight','KeyD'], up:['ArrowUp','KeyW'], down:['ArrowDown','KeyS'], action:['Space','Pointer'] }, project.input||{})
    const keys = new Set()
    const onKeyDown = e => keys.add(e.code)
    const onKeyUp = e => keys.delete(e.code)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    const onPointerDown = e => keys.add('Pointer')
    const onPointerUp = e => keys.delete('Pointer')
    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)

    function inputDown(action){ const arr = inputMap[action]||[]; return arr.some(k=>keys.has(k)) }

    // On-screen controls for touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints>0) {
      const wrap = document.createElement('div');
      Object.assign(wrap.style,{ position:'fixed', inset:'0', pointerEvents:'none', zIndex:9998 })
      const mkBtn = (label, code) => { const b=document.createElement('button'); b.type='button'; b.textContent=label; Object.assign(b.style,{ pointerEvents:'auto', touchAction:'none', userSelect:'none', background:'rgba(15,23,42,0.4)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'8px', width:'56px', height:'56px', fontSize:'14px' }); const start=(e)=>{e.preventDefault(); keys.add(code); b.style.background='rgba(16,185,129,0.5)'}; const end=(e)=>{e.preventDefault(); keys.delete(code); b.style.background='rgba(15,23,42,0.4)'}; b.addEventListener('pointerdown', start); b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); b.addEventListener('pointerleave', end); return b }
      const left = document.createElement('div'); Object.assign(left.style,{ position:'absolute', left:'12px', bottom:'12px', display:'grid', gridTemplateColumns:'repeat(3,56px)', gap:'8px' })
      const right = document.createElement('div'); Object.assign(right.style,{ position:'absolute', right:'12px', bottom:'12px', display:'grid', gridTemplateColumns:'56px', gap:'8px' })
      left.appendChild(document.createElement('div'))
      left.appendChild(mkBtn('▲','ArrowUp'))
      left.appendChild(document.createElement('div'))
      left.appendChild(mkBtn('◀','ArrowLeft'))
      left.appendChild(document.createElement('div'))
      left.appendChild(mkBtn('▶','ArrowRight'))
      left.appendChild(document.createElement('div'))
      left.appendChild(mkBtn('▼','ArrowDown'))
      left.appendChild(document.createElement('div'))
      right.appendChild(mkBtn('A','Space'))
      wrap.appendChild(left); wrap.appendChild(right); document.body.appendChild(wrap)
    }

    // Particles storage and API
    const bursts = []
    function spawnBurst({ x, y, count = 16, speed = 120, spread = Math.PI*2, life = 0.7, size = 3, color = '#22c55e', gravity = 0 }){
      const arr = []
      for(let i=0;i<count;i++){
        const ang = Math.random()*spread
        const sp = speed*(0.5+Math.random()*0.8)
        arr.push({ x, y, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp, life, maxLife: life, size: size*(0.7+Math.random()*0.6), color, gravity })
      }
      bursts.push(arr)
    }

    // Assets
    ;(project.assets||[]).forEach(a=>{ if(a.type==='image'){ const img=new Image(); img.src=a.src; images[a.id]=img } else if(a.type==='audio'){ const au=new Audio(a.src); audios[a.id]=au } });
    if (scene?.bgm) { try { const a = new Audio((project.assets.find(x=>x.id===scene.bgm)||{}).src||''); a.loop=true; a.volume=scene.bgmVolume||0.6; a.play(); } catch(e){} }
    if (scene) { canvas.width = scene.width; canvas.height = scene.height }

    // Click routing to entities
    function pointToScene(evt){ const rect=canvas.getBoundingClientRect(); const sx=(canvas.width/rect.width)||1; const sy=(canvas.height/rect.height)||1; const x=(evt.clientX-rect.left)*sx; const y=(evt.clientY-rect.top)*sy; return {x,y} }
    canvas.addEventListener('click', (evt)=>{
      if(!scene) return
      const { x,y } = pointToScene(evt)
      const hit = [...scene.entities].reverse().find(e=>{ const t=e.components?.transform; if(!t) return false; if(e.components?.tilemap){ const tm=e.components.tilemap; const tw=tm.cols*tm.tileWidth, th=tm.rows*tm.tileHeight; return x>=t.x-tw/2 && x<=t.x+tw/2 && y>=t.y-th/2 && y<=t.y+th/2 } return x>=t.x-t.w/2 && x<=t.x+t.w/2 && y>=t.y-t.h/2 && y<=t.y+t.h/2 })
      if(hit){ if(hit.components?.ui){ const ui=hit.components.ui; if(ui.type==='checkbox'){ ui.checked=!ui.checked } if(ui.type==='slider'){ const t=hit.components.transform; const ratio=Math.max(0,Math.min(1,(x-(t.x-t.w/2))/t.w)); const min=ui.min??0, max=ui.max??100; ui.value=Math.round(min+ratio*(max-min)) } }
        dispatchEvent(hit, 'onClick', { x,y })
      }
    })

    // Script compile helper
    function ensureScript(e){ const script=e.components?.script; if(!script?.code) return null; if(!script._fn){ try{ const compile=new Function("\"use strict\";"+script.code+"; return { onUpdate: (typeof onUpdate==='function')?onUpdate:null, onClick: (typeof onClick==='function')?onClick:null, onCollision: (typeof onCollision==='function')?onCollision:null }"); const handlers=compile(); script._handlers=handlers; script._fn=function(event,payload,api){ const h=handlers[event]||null; if(typeof h==='function') return h(event,payload,api) } }catch(e){ console.error('Script compile error', e); script._fn=null } } return script._fn }

    function apiFor(entity){ return { entity, input: { down: inputDown }, audio: { play:(id,opts)=>{ try{ const au=new Audio((project.assets.find(a=>a.id===id)||{}).src||''); if(opts?.volume!=null) au.volume=opts.volume; au.play() }catch(e){} }, bgm:{ play:(id,opts)=>{ try{ const au=new Audio((project.assets.find(a=>a.id===id)||{}).src||''); au.loop=opts?.loop??true; au.volume=opts?.volume??0.6; au.play() }catch(e){} }, stop:()=>{} } }, moveBy:(dx,dy)=>{ const t=entity.components?.transform; if(t){ t.x+=dx||0; t.y+=dy||0 } }, gotoScene:(sceneId)=>{ const next = project.scenes.find(s=>s.id===sceneId); if(next){ scene=next; canvas.width=scene.width; canvas.height=scene.height } }, setAnimation:()=>{}, blendTo:()=>{}, message:(textOrOpts, maybeOpts)=>message(textOrOpts, maybeOpts), particles:{ burst:(o)=>spawnBurst(o||{}) }, addEntity:(spec)=>{ const id=spec?.id || 'e-'+Date.now()+'-'+Math.floor(Math.random()*9999); const ent={ id, name:spec?.name||'Entity', components:spec?.components||{} }; scene.entities.push(ent); return ent }, removeEntity:(idOrEnt)=>{ const id=typeof idOrEnt==='string'?idOrEnt:idOrEnt?.id; const idx=scene.entities.findIndex(e=>e.id===id); if(idx>=0) scene.entities.splice(idx,1) }, entities:()=>scene.entities } }

    // Systems: timeline -> physics -> collisions -> scripts -> render
    function sampleTrack(keys, time){ if(!keys||!keys.length) return null; if(time<=keys[0].time) return keys[0].value; if(time>=keys[keys.length-1].time) return keys[keys.length-1].value; let lo=0, hi=keys.length-1; while(hi-lo>1){ const mid=(lo+hi)>>1; if(keys[mid].time<=time) lo=mid; else hi=mid } const k0=keys[lo],k1=keys[hi]; const t=(time-k0.time)/(k1.time-k0.time); return k0.value + (k1.value-k0.value)*Math.max(0,Math.min(1,t)) }

    function step(dt){
      if(!scene) return
      // timeline
      for(const e of scene.entities){ const tl=e.components?.timeline; const t=e.components?.transform; if(!tl||!t) continue; if(tl.playing===false) continue; const dur=tl.duration||5; tl.t=(tl.t||0)+dt; if((tl.loop??true)){ if(tl.t>dur) tl.t-=dur } else { if(tl.t>dur) tl.t=dur } const tr=(tl.tracks||{}).transform||{}; if(tr.x&&tr.x.length) t.x=sampleTrack(tr.x,tl.t); if(tr.y&&tr.y.length) t.y=sampleTrack(tr.y,tl.t); if(tr.rotation&&tr.rotation.length) t.rotation=sampleTrack(tr.rotation,tl.t); if(tr.w&&tr.w.length) t.w=sampleTrack(tr.w,tl.t); if(tr.h&&tr.h.length) t.h=sampleTrack(tr.h,tl.t) }
      // physics
      for(const e of scene.entities){ const t=e.components?.transform; const rb=e.components?.rigidbody; if(!t||!rb) continue; rb.vx += (rb.ax||0)*dt; rb.vy += (rb.ay||0)*dt; rb.vy += (rb.gravity||0)*dt; t.x += (rb.vx||0)*dt; t.y += (rb.vy||0)*dt; const fr=rb.friction??0; if(fr){ rb.vx *= Math.max(0,1-fr*dt); rb.vy *= Math.max(0,1-fr*dt) } }
      // update particles
      for(let bi=bursts.length-1; bi>=0; bi--){ const list=bursts[bi]; for(let pi=list.length-1; pi>=0; pi--){ const p=list[pi]; p.vy += (p.gravity||0)*dt; p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt; if(p.life<=0) list.splice(pi,1) } if(list.length===0) bursts.splice(bi,1) }

      // collisions (AABB only)
      function aabb(e,f){ const a=e.components.transform, b=f.components.transform; return Math.abs(a.x-b.x)*2<(a.w+b.w) && Math.abs(a.y-b.y)*2<(a.h+b.h) }
      for(let i=0;i<scene.entities.length;i++){ const e=scene.entities[i]; if(!e.components?.collider) continue; for(let j=i+1;j<scene.entities.length;j++){ const f=scene.entities[j]; if(!f.components?.collider) continue; if(aabb(e,f)){ dispatchEvent(e,'onCollision',{ other:f }); dispatchEvent(f,'onCollision',{ other:e }) } } }
      // scripts update
      for(const e of scene.entities){ const fn=ensureScript(e); if(fn){ try{ fn('onUpdate',{ dt }, apiFor(e)) } catch(err){ console.error('Script runtime error',err) } } }
    }

    function dispatchEvent(entity, event, payload){ const fn=ensureScript(entity); if(fn){ try{ fn(event, payload, apiFor(entity)) } catch(e){ console.error('Script event error', e) } } }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height)
      ctx.fillStyle = scene.background || '#fff'
      ctx.fillRect(0,0,canvas.width,canvas.height)
      const layers = scene.layers && scene.layers.length ? scene.layers : [{ id: null }]
      for(const layer of layers){
        const ents = scene.entities.filter(en => (en.layerId||null) === (layer.id||null))
        // tilemaps first
        for(const e of ents.filter(en=>en.components?.tilemap)){
          const t=e.components.transform, tm=e.components.tilemap
          ctx.save(); ctx.translate(t.x,t.y); const img = tm.tilesetAssetId ? images[tm.tilesetAssetId] : null
          const totalW = tm.cols*tm.tileWidth, totalH=tm.rows*tm.tileHeight
          ctx.translate(-totalW/2, -totalH/2)
          if(img){ const tilesPerRow=Math.max(1, Math.floor(img.width/tm.tileWidth)); for(let r=0;r<tm.rows;r++){ for(let c=0;c<tm.cols;c++){ const idx=tm.data[r*tm.cols+c]; if(idx<0) continue; const sx=(idx%tilesPerRow)*tm.tileWidth, sy=Math.floor(idx/tilesPerRow)*tm.tileHeight; ctx.drawImage(img, sx, sy, tm.tileWidth, tm.tileHeight, c*tm.tileWidth, r*tm.tileHeight, tm.tileWidth, tm.tileHeight) } } }
          ctx.restore()
        }
        // others
        for(const e of ents.filter(en=>!en.components?.tilemap)){
          const t=e.components.transform
          ctx.save()
          if(e.components?.ui?.anchor && !e.parentId){ const a=e.components.ui.anchor; const ax=a.x||'center', ay=a.y||'center'; let baseX=t.x, baseY=t.y; if(ax==='left') baseX=t.w/2; else if(ax==='center') baseX=scene.width/2; else if(ax==='right') baseX=scene.width-t.w/2; if(ay==='top') baseY=t.h/2; else if(ay==='center') baseY=scene.height/2; else if(ay==='bottom') baseY=scene.height-t.h/2; ctx.translate(baseX, baseY) } else { ctx.translate(t.x,t.y) }
          ctx.rotate(((t.rotation||0)*Math.PI)/180)
          ctx.imageSmoothingEnabled=false
          if(e.components.sprite){ const spr=e.components.sprite; const img=spr.assetId?images[spr.assetId]:null; if(img){ ctx.drawImage(img, -t.w/2,-t.h/2,t.w,t.h) } else { ctx.fillStyle=spr.fill||'#999'; ctx.fillRect(-t.w/2,-t.h/2,t.w,t.h) } }
if(e.components.text){ const txt=e.components.text; ctx.fillStyle=txt.color||'#000'; ctx.font=(txt.size||20)+"px sans-serif"; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(txt.value||'',0,0) }
          if(e.components.ui){ const ui=e.components.ui; if(ui.type==='panel'){ ctx.fillStyle=ui.fill||'rgba(0,0,0,0.2)'; ctx.fillRect(-t.w/2,-t.h/2,t.w,t.h) } if(ui.type==='button'){ ctx.fillStyle=ui.fill||'#0ea5e9'; ctx.fillRect(-t.w/2,-t.h/2,t.w,t.h); ctx.fillStyle=ui.textColor||'#fff'; ctx.font=(ui.textSize||16)+"px sans-serif"; ctx.textAlign='center'; ctx.textBaseline='middle'; if(ui.label) ctx.fillText(ui.label,0,0) } if(ui.type==='label'){ ctx.fillStyle=ui.textColor||'#fff'; ctx.font=(ui.textSize||16)+"px sans-serif"; ctx.textAlign='center'; ctx.textBaseline='middle'; if(ui.label) ctx.fillText(ui.label,0,0) } if(ui.type==='image' && ui.assetId){ const img=images[ui.assetId]; if(img) ctx.drawImage(img, -t.w/2,-t.h/2,t.w,t.h) } if(ui.type==='progress'){ ctx.fillStyle=ui.fill||'#0ea5e9'; ctx.fillRect(-t.w/2,-t.h/2,(t.w)*Math.max(0,Math.min(1,(ui.value||0)/(ui.max||100))),t.h); ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.strokeRect(-t.w/2,-t.h/2,t.w,t.h) } if(ui.type==='checkbox'){ ctx.fillStyle=ui.fill||'#0ea5e9'; ctx.strokeStyle='#0ea5e9'; ctx.strokeRect(-t.w/2,-t.h/2,t.w,t.h); if(ui.checked){ ctx.beginPath(); ctx.moveTo(-t.w/3,0); ctx.lineTo(-t.w/6,t.h/3); ctx.lineTo(t.w/3,-t.h/3); ctx.stroke() } } if(ui.type==='slider'){ ctx.fillStyle='#334155'; ctx.fillRect(-t.w/2,-6,t.w,12); const ratio=Math.max(0,Math.min(1,(ui.value||0 - (ui.min||0))/((ui.max||100)-(ui.min||0)))); ctx.fillStyle=ui.fill||'#0ea5e9'; ctx.beginPath(); ctx.arc(-t.w/2 + ratio*t.w, 0, 8, 0, Math.PI*2); ctx.fill() } }
          // draw particles on top
          ctx.save(); ctx.globalCompositeOperation='lighter';
          for(const list of bursts){ for(const p of list){ const a=Math.max(0,Math.min(1,p.life/p.maxLife)); ctx.globalAlpha=a; ctx.fillStyle=p.color||'#ffffff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size||2, 0, Math.PI*2); ctx.fill() } }
          ctx.globalAlpha=1; ctx.restore()
          ctx.restore()
        }
      }
    }

    function loop(ts){ if(!running) return; const dt=(ts-last)/1000; last=ts; step(dt); draw(); requestAnimationFrame(loop) }
    requestAnimationFrame(ts=>{ last=ts; loop(ts) })

    return { stop(){ running=false; window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); canvas.removeEventListener('pointerdown', onPointerDown); window.removeEventListener('pointerup', onPointerUp) } }
  }
  window._runExportedProject = runProject;
})();
  `
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Exported 2D Game</title>
    <style>html,body{margin:0;padding:0;background:#111;color:#eee;font-family:sans-serif} .wrap{display:flex;min-height:100vh;align-items:center;justify-content:center;padding:16px} canvas{max-width:100%;height:auto;box-shadow:0 10px 30px rgba(0,0,0,.3);background:#fff}</style>
  </head>
  <body>
    <div class="wrap"><canvas id="game"></canvas></div>
    <script>${runtime}</script>
    <script>
      const project = ${projectJson};
      const canvas = document.getElementById('game');
      window._runExportedProject(canvas, project);
    </script>
  </body>
</html>`
}
