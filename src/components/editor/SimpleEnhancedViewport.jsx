import { useRef, useEffect } from 'react'
import { useEditorStore } from '../../store/editorStore'

export default function SimpleEnhancedViewport({ mode, canvasRef, onCanvasReady }) {
  const { project, selectedEntityId, selectEntity } = useEditorStore(s => ({
    project: s.project,
    selectedEntityId: s.selectedEntityId,
    selectEntity: s.selectEntity
  }))

  const viewportRef = useRef(null)
  
  const handleCanvasClick = (e) => {
    if (mode === 'play') return
    
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Simple entity selection (just select first entity for now)
    const entities = project?.scenes?.[0]?.entities || []
    if (entities.length > 0 && !selectedEntityId) {
      selectEntity(entities[0].id)
    }
  }

  if (mode === 'play') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900/10 rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-full rounded shadow-xl" 
          style={{ 
            imageRendering: 'pixelated', 
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)' 
          }}
        />
      </div>
    )
  }

  // Notify parent when canvas becomes available in play mode
  useEffect(() => {
    if (mode !== 'play') {
      onCanvasReady?.(false)
      return
    }
    const id = requestAnimationFrame(() => {
      if (canvasRef?.current) onCanvasReady?.(true)
    })
    return () => cancelAnimationFrame(id)
  }, [mode])

  return (
    <div 
      ref={viewportRef}
      className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden cursor-crosshair"
      onClick={handleCanvasClick}
    >
      {/* Enhanced Viewport Header */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Enhanced 2D Viewport
        </div>
        <div className="text-xs text-slate-500">
          {project?.scenes?.[0]?.width || 800} × {project?.scenes?.[0]?.height || 600}
        </div>
      </div>

      {/* Scene Preview */}
      <div className="absolute inset-4 mt-20 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
            </svg>
          </div>
          <div className="text-lg font-semibold mb-2">Scene Preview</div>
          <div className="text-sm">
            Entities: {project?.scenes?.[0]?.entities?.length || 0}
          </div>
          {selectedEntityId && (
            <div className="text-xs mt-2 text-emerald-600 dark:text-emerald-400">
              Selected: {selectedEntityId}
            </div>
          )}
        </div>
      </div>

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.15) 1px, transparent 0)
          `,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  )
}