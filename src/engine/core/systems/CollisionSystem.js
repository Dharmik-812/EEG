// Detects collisions (AABB and circles) and emits events
export class CollisionSystem {
  constructor(engine) { 
    this.engine = engine 
    this._colliding = new Set() // Set of pair keys currently colliding
  }

  _pairKey(a, b) {
    const idA = a.id || ''
    const idB = b.id || ''
    return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`
  }

  static aabb(e, f) {
    const a = e.components.transform
    const b = f.components.transform
    return Math.abs(a.x - b.x) * 2 < (a.w + b.w) && Math.abs(a.y - b.y) * 2 < (a.h + b.h)
  }

  static circle(e, f) {
    const ac = e.components.collider?.circle
    const bc = f.components.collider?.circle
    if (!ac || !bc) return false
    const a = e.components.transform
    const b = f.components.transform
    const dx = a.x - b.x
    const dy = a.y - b.y
    const r = (ac.r || a.w/2) + (bc.r || b.w/2)
    return dx*dx + dy*dy <= r*r
  }

  static getPolygonWorld(e) {
    const t = e.components.transform
    const col = e.components.collider
    const pts = col?.points || []
    const rad = ((t.rotation || 0) * Math.PI) / 180
    const cos = Math.cos(rad), sin = Math.sin(rad)
    return pts.map(p => ({ x: t.x + p.x * cos - p.y * sin, y: t.y + p.x * sin + p.y * cos }))
  }

  static rectToPoly(e) {
    const t = e.components.transform
    const hw = (e.components.collider?.w || t.w)/2
    const hh = (e.components.collider?.h || t.h)/2
    const pts = [ {x:-hw,y:-hh}, {x:hw,y:-hh}, {x:hw,y:hh}, {x:-hw,y:hh} ]
    const rad = ((t.rotation || 0) * Math.PI) / 180
    const cos = Math.cos(rad), sin = Math.sin(rad)
    return pts.map(p => ({ x: t.x + p.x * cos - p.y * sin, y: t.y + p.x * sin + p.y * cos }))
  }

  static project(poly, axis) {
    let min = Infinity, max = -Infinity
    for (const p of poly) {
      const proj = (p.x * axis.x + p.y * axis.y)
      if (proj < min) min = proj
      if (proj > max) max = proj
    }
    return { min, max }
  }

  static overlap1D(a, b) { return a.max >= b.min && b.max >= a.min }

  static polyVsPoly(pa, pb) {
    // SAT on all edges
    const axes = []
    const pushEdgeNormals = (poly) => {
      for (let i=0;i<poly.length;i++) {
        const p1 = poly[i], p2 = poly[(i+1)%poly.length]
        const edge = { x: p2.x - p1.x, y: p2.y - p1.y }
        const axis = { x: -edge.y, y: edge.x }
        const len = Math.hypot(axis.x, axis.y) || 1
        axes.push({ x: axis.x/len, y: axis.y/len })
      }
    }
    pushEdgeNormals(pa); pushEdgeNormals(pb)
    for (const axis of axes) {
      const a = CollisionSystem.project(pa, axis)
      const b = CollisionSystem.project(pb, axis)
      if (!CollisionSystem.overlap1D(a,b)) return false
    }
    return true
  }

  static circleVsPoly(circleE, polyE) {
    const ac = circleE.components.collider?.circle
    if (!ac) return false
    const center = circleE.components.transform
    const r = ac.r || center.w/2
    const poly = polyE.components.collider.type==='polygon' ? CollisionSystem.getPolygonWorld(polyE) : CollisionSystem.rectToPoly(polyE)
    // axes: polygon edges + axis from center to closest vertex
    const axes = []
    for (let i=0;i<poly.length;i++) {
      const p1 = poly[i], p2 = poly[(i+1)%poly.length]
      const edge = { x: p2.x - p1.x, y: p2.y - p1.y }
      const axis = { x: -edge.y, y: edge.x }
      const len = Math.hypot(axis.x, axis.y) || 1
      axes.push({ x: axis.x/len, y: axis.y/len })
    }
    // closest vertex axis
    let closest = poly[0]; let best = Infinity
    for (const p of poly) { const d = Math.hypot(center.x - p.x, center.y - p.y); if (d < best) { best = d; closest = p } }
    const axisC = { x: (closest.x - center.x), y: (closest.y - center.y) }
    const lenC = Math.hypot(axisC.x, axisC.y) || 1
    axes.push({ x: axisC.x/lenC, y: axisC.y/lenC })
    for (const axis of axes) {
      const b = CollisionSystem.project(poly, axis)
      const c = { min: (center.x*axis.x + center.y*axis.y) - r, max: (center.x*axis.x + center.y*axis.y) + r }
      if (!CollisionSystem.overlap1D(b,c)) return false
    }
    return true
  }

  update(scene, dt) {
    const nowPairs = new Set()

    // Broadphase: simple uniform grid to reduce pair checks
    const cell = 96
    const buckets = new Map()
    const toCell = (x,y) => `${Math.floor(x/cell)},${Math.floor(y/cell)}`
    const colliders = scene.entities.filter(e => e.components?.collider && e.components?.transform)
    for (const e of colliders) {
      const t = e.components.transform
      const hw = (e.components.collider?.w || t.w)/2
      const hh = (e.components.collider?.h || t.h)/2
      const minCx = Math.floor((t.x - hw)/cell), maxCx = Math.floor((t.x + hw)/cell)
      const minCy = Math.floor((t.y - hh)/cell), maxCy = Math.floor((t.y + hh)/cell)
      for (let cy=minCy; cy<=maxCy; cy++) {
        for (let cx=minCx; cx<=maxCx; cx++) {
          const key = `${cx},${cy}`
          const arr = buckets.get(key) || []
          arr.push(e)
          buckets.set(key, arr)
        }
      }
    }

    // Narrowphase within buckets + neighbors
    const visited = new Set()
    const neighbors = [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]
    for (const [key, list] of buckets) {
      const [cx, cy] = key.split(',').map(Number)
      // Collect candidates from this and neighboring cells
      const cand = new Set(list)
      for (const [dx,dy] of neighbors) {
        const nb = buckets.get(`${cx+dx},${cy+dy}`)
        if (nb) for (const e of nb) cand.add(e)
      }
      const arr = Array.from(cand)
      for (let i=0;i<arr.length;i++) {
        const e = arr[i]
        for (let j=i+1;j<arr.length;j++) {
          const f = arr[j]
          const pairId = this._pairKey(e,f)
          if (visited.has(pairId)) continue
          visited.add(pairId)

        const typeA = e.components.collider.type || 'aabb'
        const typeB = f.components.collider.type || 'aabb'
        let collides = false
        if (typeA === 'circle' && typeB === 'circle') collides = CollisionSystem.circle(e, f)
        else if (typeA === 'circle' && (typeB === 'polygon' || typeB === 'aabb')) collides = CollisionSystem.circleVsPoly(e, f)
        else if (typeB === 'circle' && (typeA === 'polygon' || typeA === 'aabb')) collides = CollisionSystem.circleVsPoly(f, e)
        else if ((typeA === 'polygon' || typeA === 'aabb') && (typeB === 'polygon' || typeB === 'aabb')) {
          const pa = typeA === 'polygon' ? CollisionSystem.getPolygonWorld(e) : CollisionSystem.rectToPoly(e)
          const pb = typeB === 'polygon' ? CollisionSystem.getPolygonWorld(f) : CollisionSystem.rectToPoly(f)
          collides = CollisionSystem.polyVsPoly(pa, pb)
        } else collides = CollisionSystem.aabb(e, f)

        if (collides) {
          const key = this._pairKey(e, f)
          nowPairs.add(key)
          if (!this._colliding.has(key)) {
            // Enter
            this.engine.dispatchEvent(e, 'onCollisionEnter', { other: f })
            this.engine.dispatchEvent(f, 'onCollisionEnter', { other: e })
          }
          // Stay
          this.engine.dispatchEvent(e, 'onCollision', { other: f })
          this.engine.dispatchEvent(f, 'onCollision', { other: e })
          // Back-compat with previous model using 'onOverlap'
          this.engine.dispatchEvent(e, 'onOverlap', { other: f })
          this.engine.dispatchEvent(f, 'onOverlap', { other: e })
        }
      }
    }
  }
    // Exits = previously colliding but not in nowPairs
    for (const key of this._colliding) {
      if (!nowPairs.has(key)) {
        const [idA, idB] = key.split('|')
        const a = scene.entities.find(x => x.id === idA)
        const b = scene.entities.find(x => x.id === idB)
        if (a && b) {
          this.engine.dispatchEvent(a, 'onCollisionExit', { other: b })
          this.engine.dispatchEvent(b, 'onCollisionExit', { other: a })
        }
      }
    }
    this._colliding = nowPairs
  }
}
