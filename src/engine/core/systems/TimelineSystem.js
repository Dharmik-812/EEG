// Applies keyframed timeline tracks to entities
export class TimelineSystem {
  constructor(engine) { this.engine = engine }

  static lerp(a, b, t) { return a + (b - a) * t }

  static sampleTrack(keyframes = [], time) {
    if (!keyframes.length) return null
    if (time <= keyframes[0].time) return keyframes[0].value
    if (time >= keyframes[keyframes.length - 1].time) return keyframes[keyframes.length - 1].value
    // find bracketing keys
    let lo = 0, hi = keyframes.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (keyframes[mid].time <= time) lo = mid; else hi = mid
    }
    const k0 = keyframes[lo], k1 = keyframes[hi]
    const t = (time - k0.time) / (k1.time - k0.time)
    return TimelineSystem.lerp(k0.value, k1.value, Math.max(0, Math.min(1, t)))
  }

  update(scene, dt) {
    for (const e of scene.entities) {
      const tl = e.components?.timeline
      const t = e.components?.transform
      if (!tl || !t) continue
      if (tl.playing === false) continue
      const dur = tl.duration || 5
      tl.t = (tl.t || 0) + dt
      if (tl.loop !== false) {
        if (tl.t > dur) tl.t -= dur
      } else {
        if (tl.t > dur) tl.t = dur
      }
      const tracks = tl.tracks || {}
      const tr = tracks.transform || {}
      if (tr.x && tr.x.length) t.x = TimelineSystem.sampleTrack(tr.x, tl.t)
      if (tr.y && tr.y.length) t.y = TimelineSystem.sampleTrack(tr.y, tl.t)
      if (tr.rotation && tr.rotation.length) t.rotation = TimelineSystem.sampleTrack(tr.rotation, tl.t)
      if (tr.w && tr.w.length) t.w = TimelineSystem.sampleTrack(tr.w, tl.t)
      if (tr.h && tr.h.length) t.h = TimelineSystem.sampleTrack(tr.h, tl.t)
    }
  }
}
