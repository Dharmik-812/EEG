// Optional WebGL renderer stub. Currently falls back to Canvas.
export class WebGLRenderSystem {
  constructor(engine) {
    this.engine = engine
    this.gl = engine.canvas.getContext('webgl') || engine.canvas.getContext('experimental-webgl')
    if (!this.gl) {
      console.warn('[Engine] WebGL not available, falling back to Canvas renderer')
      this.fallback = true
    }
  }

  draw(scene, ctx2d) {
    if (this.fallback) return // Canvas RenderSystem will handle drawing
    const gl = this.gl
    // TODO: implement minimal shader pipeline for sprites and tilemaps
    // For now, clear color to background color and do nothing else
    const bg = scene.background || '#000000'
    const r = parseInt(bg.slice(1,3),16)/255
    const g = parseInt(bg.slice(3,5),16)/255
    const b = parseInt(bg.slice(5,7),16)/255
    gl.viewport(0, 0, this.engine.canvas.width, this.engine.canvas.height)
    gl.clearColor(r, g, b, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }
}
