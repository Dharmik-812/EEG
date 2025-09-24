import { useRef, useEffect, useState, useCallback } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, Ruler, Grid3X3, Eye, Target, MousePointer, 
  Move, RotateCcw, Scale, ZoomIn, ZoomOut, Crosshair,
  Lock, Unlock, Layers, Settings, Maximize2
} from 'lucide-react'

const TRANSFORM_MODES = {
  SELECT: 'select',
  MOVE: 'move',
  ROTATE: 'rotate', 
  SCALE: 'scale',
  PAN: 'pan'
}

export default function EnhancedViewport({ mode, canvasRef }) {
  const canvasViewRef = useRef(null)
  const overlayRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [selectedEntities, setSelectedEntities] = useState([])
  const [showRulers, setShowRulers] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showGizmos, setShowGizmos] = useState(true)
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 })
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 })

  const {
    project, zoom, setZoom, transformMode, setTransformMode, 
    snapToGrid, gridSize, selectedEntity, setSelectedEntity,
    addEntity, updateEntity
  } = useEditorStore(s => ({
    project: s.project,
    zoom: s.zoom || 1,
    setZoom: s.setZoom,
    transformMode: s.transformMode || TRANSFORM_MODES.SELECT,
    setTransformMode: s.setTransformMode,
    snapToGrid: s.snapToGrid || false,
    gridSize: s.gridSize || 32,
    selectedEntity: s.selectedEntityId,
    setSelectedEntity: s.selectEntity,
    addEntity: s.addEntity,
    updateEntity: s.updateEntity
  }))

  // Handle viewport interactions
  const handleMouseDown = useCallback((e) => {
    const rect = canvasViewRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - cameraPos.x) / zoom
    const y = (e.clientY - rect.top - cameraPos.y) / zoom

    setDragStart({ x: e.clientX, y: e.clientY, worldX: x, worldY: y })
    setIsDragging(true)

    // Handle different transform modes
    switch (transformMode) {
      case TRANSFORM_MODES.SELECT:
        // Find entity at position
        const entities = project?.scenes?.[0]?.entities || []
        const clickedEntity = entities.find(entity => {
          const transform = entity.components?.transform
          if (!transform) return false
          return (
            x >= transform.x - transform.w/2 &&
            x <= transform.x + transform.w/2 &&
            y >= transform.y - transform.h/2 &&
            y <= transform.y + transform.h/2
          )
        })
        setSelectedEntity?.(clickedEntity?.id || null)
        break
        
      case TRANSFORM_MODES.PAN:
        // Start panning
        break
        
      default:
        break
    }
  }, [transformMode, zoom, cameraPos, project])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragStart) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    switch (transformMode) {
      case TRANSFORM_MODES.PAN:
        setCameraPos(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }))
        setDragStart({ ...dragStart, x: e.clientX, y: e.clientY })
        break
        
      case TRANSFORM_MODES.MOVE:
        if (selectedEntity) {
          const entity = project?.scenes?.[0]?.entities?.find(e => e.id === selectedEntity)
          if (entity?.components?.transform) {
            let newX = dragStart.worldX + deltaX / zoom
            let newY = dragStart.worldY + deltaY / zoom
            
            if (snapToGrid) {
              newX = Math.round(newX / gridSize) * gridSize
              newY = Math.round(newY / gridSize) * gridSize
            }
            
            updateEntity?.(selectedEntity, {
              ...entity,
              components: {
                ...entity.components,
                transform: {
                  ...entity.components.transform,
                  x: newX,
                  y: newY
                }
              }
            })
          }
        }
        break
    }
  }, [isDragging, dragStart, transformMode, selectedEntity, snapToGrid, gridSize, zoom, project, updateEntity])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch (e.key.toLowerCase()) {
        case 'q':
          setTransformMode?.(TRANSFORM_MODES.SELECT)
          break
        case 'w':
          setTransformMode?.(TRANSFORM_MODES.MOVE)
          break
        case 'e':
          setTransformMode?.(TRANSFORM_MODES.ROTATE)
          break
        case 'r':
          setTransformMode?.(TRANSFORM_MODES.SCALE)
          break
        case 't':
          setTransformMode?.(TRANSFORM_MODES.PAN)
          break
        case 'g':
          setShowGrid(!showGrid)
          break
        case 'delete':
        case 'backspace':
          if (selectedEntity) {
            // Delete selected entity
            console.log('Delete entity:', selectedEntity)
          }
          break
      }
    }

    const handleWheel = (e) => {
      if (e.target.closest('.enhanced-viewport')) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setZoom(Math.max(0.1, Math.min(5, zoom * delta)))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [transformMode, zoom, showGrid, selectedEntity])

  // Render viewport content
  const renderViewport = () => {
    if (mode === 'play') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden">
            <canvas
              ref={canvasRef}
              width="800"
              height="600"
              className="block"
              style={{
                imageRendering: 'pixelated',
                background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
            {/* Game overlay UI */}
            <div className="absolute top-2 left-2 px-3 py-1 bg-black/50 text-white text-sm rounded-lg backdrop-blur">
              Playing: {project?.scenes?.[0]?.name || 'Game Scene'}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
        {/* Scene Info Header */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-slate-800 dark:text-white">
                Scene: {project?.scenes?.[0]?.name || 'Untitled Scene'}
              </div>
              <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                {project?.scenes?.[0]?.width || 800} × {project?.scenes?.[0]?.height || 600}
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 shadow-lg">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Rulers */}
        {showRulers && (
          <>
            <div className="absolute top-16 left-8 right-0 h-6 bg-white/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 z-10">
              <div className="flex items-end h-full px-2">
                {Array.from({ length: Math.ceil(800 / gridSize) }, (_, i) => (
                  <div
                    key={i}
                    className="text-xs text-slate-500 border-l border-slate-300 dark:border-slate-600 px-1 leading-none"
                    style={{ width: (gridSize * zoom) + 'px' }}
                  >
                    {i * gridSize}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute left-0 top-22 bottom-0 w-8 bg-white/80 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 z-10">
              <div className="flex flex-col justify-start items-center h-full py-2">
                {Array.from({ length: Math.ceil(600 / gridSize) }, (_, i) => (
                  <div
                    key={i}
                    className="text-xs text-slate-500 border-t border-slate-300 dark:border-slate-600 text-center leading-none"
                    style={{ height: (gridSize * zoom) + 'px', writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  >
                    {i * gridSize}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Main viewport canvas */}
        <div className="absolute inset-0 flex items-center justify-center p-4" style={{
          top: showRulers ? 88 : 70,
          left: showRulers ? 32 : 0,
        }}>
          <div 
            ref={canvasViewRef}
            className="relative bg-white dark:bg-slate-900 rounded-lg shadow-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden cursor-crosshair"
            style={{
              width: (800 * zoom) + 'px',
              height: (600 * zoom) + 'px',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Scene Background */}
            <div className="absolute inset-0" style={{
              background: project?.scenes?.[0]?.bg || '#87CEEB'
            }} />
            
            {/* Grid */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.3) 1px, transparent 0)
                  `,
                  backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
                  backgroundPosition: `${cameraPos.x % (gridSize * zoom)}px ${cameraPos.y % (gridSize * zoom)}px`
                }}
              />
            )}

            {/* Scene content */}
            <div
              className="relative w-full h-full"
              style={{
                transform: `scale(${zoom}) translate(${cameraPos.x / zoom}px, ${cameraPos.y / zoom}px)`,
                transformOrigin: '0 0'
              }}
            >
              {/* Render entities */}
              {project?.scenes?.[0]?.entities?.map(entity => {
                const transform = entity.components?.transform
                if (!transform) return null

                const isSelected = selectedEntity === entity.id

                return (
                  <div
                    key={entity.id}
                    className={`absolute border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-transparent hover:border-emerald-300 hover:bg-emerald-300/5'
                    }`}
                    style={{
                      left: transform.x - transform.w / 2,
                      top: transform.y - transform.h / 2,
                      width: transform.w,
                      height: transform.h,
                      backgroundColor: entity.components?.sprite 
                        ? 'transparent' 
                        : 'rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    {/* Entity content */}
                    <div className="w-full h-full flex items-center justify-center">
                      {entity.components?.text && (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {entity.components.text.content}
                        </span>
                      )}
                      {entity.components?.sprite && (
                        <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 rounded">
                          <div className="p-1 text-xs text-center">Sprite</div>
                        </div>
                      )}
                    </div>

                    {/* Gizmos for selected entity */}
                    {isSelected && showGizmos && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Corner handles */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-emerald-500 border border-white rounded-sm" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 border border-white rounded-sm" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-500 border border-white rounded-sm" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-500 border border-white rounded-sm" />
                        
                        {/* Center handle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                        
                        {/* Rotation handle */}
                        {transformMode === TRANSFORM_MODES.ROTATE && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                            <div className="w-1 h-6 bg-emerald-500" />
                            <div className="w-3 h-3 bg-emerald-500 border border-white rounded-full" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Selection rectangle */}
            {isDragging && transformMode === TRANSFORM_MODES.SELECT && dragStart && (
              <div
                className="absolute border-2 border-dashed border-emerald-500 bg-emerald-500/10 pointer-events-none"
                style={{
                  left: Math.min(dragStart.x, 0),
                  top: Math.min(dragStart.y, 0),
                  width: Math.abs(0 - dragStart.x),
                  height: Math.abs(0 - dragStart.y),
                }}
              />
            )}
          </div>
        </div>

        {/* Viewport controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRulers(!showRulers)}
            className={`p-2 rounded-lg backdrop-blur border ${
              showRulers 
                ? 'bg-emerald-500 text-white border-emerald-600' 
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle Rulers"
          >
            <Ruler className="h-4 w-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg backdrop-blur border ${
              showGrid 
                ? 'bg-emerald-500 text-white border-emerald-600' 
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle Grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGizmos(!showGizmos)}
            className={`p-2 rounded-lg backdrop-blur border ${
              showGizmos 
                ? 'bg-emerald-500 text-white border-emerald-600' 
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle Gizmos"
          >
            <Target className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Transform mode indicator */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1">
            {transformMode === TRANSFORM_MODES.SELECT && <MousePointer className="h-4 w-4 text-emerald-500" />}
            {transformMode === TRANSFORM_MODES.MOVE && <Move className="h-4 w-4 text-emerald-500" />}
            {transformMode === TRANSFORM_MODES.ROTATE && <RotateCcw className="h-4 w-4 text-emerald-500" />}
            {transformMode === TRANSFORM_MODES.SCALE && <Scale className="h-4 w-4 text-emerald-500" />}
            <span className="text-sm font-medium capitalize">{transformMode}</span>
          </div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs text-slate-500">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Coordinates display */}
        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500">
            X: {Math.round(-cameraPos.x / zoom)} Y: {Math.round(-cameraPos.y / zoom)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="enhanced-viewport w-full h-full relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      {renderViewport()}
    </div>
  )
}
