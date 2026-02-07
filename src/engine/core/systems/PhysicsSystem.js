// Handles gravity, velocity, acceleration, and friction
export class PhysicsSystem {
  /**
   * @param {import('../Engine').Engine} engine
   */
  constructor(engine) { this.engine = engine }

  update(scene, dt) {
    for (const e of scene.entities) {
      const t = e.components?.transform
      const rb = e.components?.rigidbody
      if (!t || !rb) continue

      // Linear physics
      // acceleration
      rb.vx += (rb.ax || 0) * dt
      rb.vy += (rb.ay || 0) * dt
      // gravity
      rb.vy += (rb.gravity || 0) * dt
      // velocity integration
      t.x += (rb.vx || 0) * dt
      t.y += (rb.vy || 0) * dt

      // simple ground friction
      const friction = rb.friction ?? 0
      if (friction) {
        rb.vx *= Math.max(0, 1 - friction * dt)
        rb.vy *= Math.max(0, 1 - friction * dt)
      }

      // Angular physics
      if (rb.angularVelocity || rb.torque) {
        // Apply torque to angular velocity
        rb.angularVelocity = (rb.angularVelocity || 0) + (rb.torque || 0) * dt

        // Angular drag
        if (rb.angularDrag) {
          rb.angularVelocity *= Math.max(0, 1 - rb.angularDrag * dt)
        }

        // Apply to rotation
        t.rotation = (t.rotation || 0) + rb.angularVelocity * dt
      }
    }
  }
}
