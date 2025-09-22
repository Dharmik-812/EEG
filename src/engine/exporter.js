// Generate a standalone HTML that plays the given project JSON using a minimal runtime
export function buildWebHTML(project) {
  const projectJson = JSON.stringify(project)
  const runtime = `
(function(){
  function runProject(canvas, project){
    const ctx = canvas.getContext('2d');
    let scene = project.scenes.find(s => s.id === (project.startSceneId || project.scenes[0].id));
    let last = 0; let running = true;
    const images = {}; const audios = {};
    (project.assets||[]).forEach(a=>{ if(a.type==='image'){ const img=new Image(); img.src=a.src; images[a.id]=img } else if(a.type==='audio'){ const au=new Audio(a.src); audios[a.id]=au } });
    if (scene.bgm) { try { const a = new Audio((project.assets.find(x=>x.id===scene.bgm)||{}).src||''); a.loop=true; a.volume=scene.bgmVolume||0.6; a.play(); } catch(e){} }
    canvas.width = scene.width; canvas.height = scene.height;
    function aabb(a,b){ const ta=a.components.transform, tb=b.components.transform; return Math.abs(ta.x - tb.x)*2 < (ta.w+tb.w) && Math.abs(ta.y - tb.y)*2 < (ta.h+tb.h) }
    function step(dt){
      for(const e of scene.entities){ const rb=e.components.rigidbody; if(rb){ rb.vy+=(rb.gravity||0)*dt; e.components.transform.x+=(rb.vx||0)*dt; e.components.transform.y+=(rb.vy||0)*dt; }}
      for(const e of scene.entities){ if(!e.components.collider) continue; for(const f of scene.entities){ if(e===f||!f.components?.collider) continue; if(aabb(e,f)){ const h=e.components?.interactable?.onOverlap; if(h){ h.forEach(action=>{ if(action.type==='moveBy'){ const t=e.components.transform; t.x+=action.dx||0; t.y+=action.dy||0 } if(action.type==='gotoScene'){ const next=project.scenes.find(s=>s.id===action.sceneId); if(next){ scene=next; canvas.width=scene.width; canvas.height=scene.height } } if(action.type==='showMessage'){ alert(action.text||'') } }) } } } }
    }
    function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle=scene.background||'#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); for(const e of scene.entities){ const t=e.components.transform; ctx.save(); ctx.translate(t.x,t.y); ctx.rotate(((t.rotation||0)*Math.PI)/180); if(e.components.sprite){ const spr=e.components.sprite; if(spr.assetId && images[spr.assetId]){ ctx.drawImage(images[spr.assetId], -t.w/2,-t.h/2,t.w,t.h) } else { ctx.fillStyle=spr.fill||'#999'; ctx.fillRect(-t.w/2,-t.h/2,t.w,t.h) }} if(e.components.text){ const txt=e.components.text; ctx.fillStyle=txt.color||'#000'; ctx.font=(txt.size||20)+"px sans-serif"; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(txt.value||'',0,0) } ctx.restore() } }
    function loop(ts){ if(!running) return; const dt=(ts-last)/1000; last=ts; step(dt); draw(); requestAnimationFrame(loop) }
    requestAnimationFrame(ts=>{ last=ts; loop(ts) })
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
