// Simple particle system with bursts and optional entity emitters
// Each particle has { x, y, vx, vy, life, maxLife, size, color, gravity }

export class ParticleSystem {
  constructor(engine) {
    this.engine = engine
    this.bursts = [] // global bursts spawned via API
  }

  // Public API: spawn an immediate burst
  burst({ x, y, count = 16, speed = 120, spread = Math.PI * 2, life = 0.7, size = 3, color = '#22c55e', gravity = 0 }) {
    const arr = []
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * spread
      const sp = speed * (0.5 + Math.random() * 0.8)
      arr.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life, maxLife: life, size: size * (0.7 + Math.random() * 0.6), color, gravity })
    }
    this.bursts.push(arr)
  }

  update(scene, dt) {
    // Update entity-based emitters (optional)
    for (const e of scene.entities) {
      const em = e.components?.emitter
      const t = e.components?.transform
      if (!em || !t) continue
      em._acc = (em._acc || 0) + dt
      // rate particles/sec
      const rate = em.rate || 0
      if (rate > 0) {
        const period = 1 / rate
        while (em._acc >= period) {
          em._acc -= period
          this.bursts.push([
            {
              x: t.x,
              y: t.y,
              vx: (Math.random() - 0.5) * (em.speed || 80),
              vy: (Math.random() - 0.5) * (em.speed || 80),
              life: em.life || 0.6,
              maxLife: em.life || 0.6,
              size: (em.size || 2) * (0.8 + Math.random() * 0.4),
              color: em.color || '#ffffff',
              gravity: em.gravity || 0,
            },
          ])
        }
      }
      // One-shot burst support
      if (em.burst && !em._didBurst) {
        const b = em.burst
        this.burst({ x: t.x, y: t.y, count: b.count || 20, speed: b.speed || 160, spread: b.spread || Math.PI * 2, life: b.life || 0.7, size: b.size || 3, color: b.color || em.color || '#ffffff', gravity: b.gravity || 0 })
        em._didBurst = true
      }
      // Remove oneshot emitter entity when done and no continuous rate
      if (em.oneShot && em._didBurst && rate <= 0) {
        // check if all particles are gone near its position by rough heuristic (skip strict check)
        // remove entity immediately after burst
        this.engine.api(e).removeEntity(e)
      }
    }

    // Update global bursts
    for (let bi = this.bursts.length - 1; bi >= 0; bi--) {
      const list = this.bursts[bi]
      for (let pi = list.length - 1; pi >= 0; pi--) {
        const p = list[pi]
        p.vy += (p.gravity || 0) * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.life -= dt
        if (p.life <= 0) list.splice(pi, 1)
      }
      if (list.length === 0) this.bursts.splice(bi, 1)
    }
  }

  draw(scene, ctx) {
    if (!ctx || typeof ctx.beginPath !== 'function') return // only canvas 2D
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (const list of this.bursts) {
      for (const p of list) {
        const a = Math.max(0, Math.min(1, p.life / p.maxLife))
        ctx.globalAlpha = a
        ctx.fillStyle = p.color || '#ffffff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size || 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }
}
