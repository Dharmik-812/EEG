// Updates animation state and frame indices
export class AnimationSystem {
  constructor(engine) { this.engine = engine }
  update(scene, dt) {
    for (const e of scene.entities) {
      const anim = e.components?.animation
      const spr = e.components?.sprite
      if (!anim || !spr?.spritesheet) continue
      if (!anim.current) continue
      const def = spr.spritesheet.animations?.[anim.current]
      if (!def || !Array.isArray(def.frames) || def.frames.length === 0) continue
      const fps = (spr.spritesheet.animations?.[anim.current]?.fps) ?? (anim.speed ?? 10)
      anim.time = (anim.time || 0) + dt
      const frameAdvance = Math.floor(anim.time * fps)
      if (frameAdvance > 0) {
        anim.frameIndex = ((anim.frameIndex || 0) + frameAdvance) % def.frames.length
        anim.time = anim.time - frameAdvance / fps
      }

      // Handle blending to a target animation
      if (anim.blend && anim.blend.target) {
        const tDef = spr.spritesheet.animations?.[anim.blend.target]
        if (tDef && tDef.frames && tDef.frames.length) {
          const tfps = tDef.fps ?? fps
          anim.blend.time = (anim.blend.time || 0) + dt
          const tAdvance = Math.floor((anim.blend.timeIndex || 0) + anim.blend.time * tfps)
          if (tAdvance > 0) {
            anim.blend.frameIndex = ((anim.blend.frameIndex || 0) + tAdvance) % tDef.frames.length
            anim.blend.time = anim.blend.time - tAdvance / tfps
          }
          anim.blend.elapsed = (anim.blend.elapsed || 0) + dt
          if (anim.blend.elapsed >= (anim.blend.duration || 0.2)) {
            // finalize switch
            anim.current = anim.blend.target
            anim.frameIndex = anim.blend.frameIndex || 0
            anim.time = 0
            anim.blend = null
          }
        } else {
          // invalid target
          anim.blend = null
        }
      }
    }
  }
}
