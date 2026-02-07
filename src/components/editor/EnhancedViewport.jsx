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

export default function EnhancedViewport({ mode, canvasRef, showGrid: propShowGrid, showRulers: propShowRulers }) {
  const canvasViewRef = useRef(null)
  const overlayRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [selectedEntities, setSelectedEntities] = useState([])
  const [showRulers, setShowRulers] = useState(propShowRulers ?? true)
  const [showGrid, setShowGrid] = useState(propShowGrid ?? true)
  const [showGizmos, setShowGizmos] = useState(true)
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 })
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 })
  const [showZoomUI, setShowZoomUI] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggedTransform, setDraggedTransform] = useState(null)

  const {
    project, zoom, setZoom, transformMode, setTransformMode,
    snapToGrid, gridSize, selectedEntity, setSelectedEntity,
    addEntity, updateEntity, currentScene, deleteSelected, setParent
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
    updateEntity: s.updateEntity,
    currentScene: s.currentScene,
    deleteSelected: s.deleteSelected,
    setParent: s.setParent
  }))

  // Handle viewport interactions
  const handleMouseDown = useCallback((e) => {
    // Only handle left click
    if (e.button !== 0) return

    // Don't handle clicks if they're on UI elements (inspector, panels, etc.)
    // Check if the click is actually on the viewport canvas
    const isOnViewport = e.target.closest('.viewport-canvas-container')
    if (!isOnViewport) return

    const rect = canvasViewRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - cameraPos.x) / zoom
    const y = (e.clientY - rect.top - cameraPos.y) / zoom

    // Check if clicking an entity first
    const entities = project?.scenes?.[0]?.entities || []
    // Reverse to hit top elements first
    const clickedEntity = [...entities].reverse().find(entity => {
      const transform = entity.components?.transform
      if (!transform) return false
      return (
        x >= transform.x - transform.w / 2 &&
        x <= transform.x + transform.w / 2 &&
        y >= transform.y - transform.h / 2 &&
        y <= transform.y + transform.h / 2
      )
    })

    // Determine effective mode:
    // - If PAN mode is active, always pan
    // - If clicking background (no entity), pan to allow camera movement
    // - If clicking entity, use the current transform mode
    let effectiveMode = transformMode
    if (transformMode === TRANSFORM_MODES.PAN || !clickedEntity) {
      effectiveMode = TRANSFORM_MODES.PAN
    } else if (clickedEntity) {
      // When clicking an entity, use the current transform mode (move, rotate, scale, or select)
      effectiveMode = transformMode
      setSelectedEntity?.(clickedEntity.id)
    }

    setDragStart({
      x: e.clientX,
      y: e.clientY,
      worldX: x,
      worldY: y,
      initialEntityState: clickedEntity ? JSON.parse(JSON.stringify(clickedEntity)) : null,
      mode: effectiveMode
    })
    setIsDragging(true)
    // Removed: Don't deselect when clicking background to prevent inspector issues
    // User can manually deselect by pressing Escape or clicking a different entity
  }, [transformMode, zoom, cameraPos, project, setSelectedEntity])

  const historyPushedRef = useRef(false)
  const { pushHistory } = useEditorStore(s => ({ pushHistory: s.pushHistory }))

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragStart) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    const worldDeltaX = deltaX / zoom
    const worldDeltaY = deltaY / zoom

    if (dragStart.mode === TRANSFORM_MODES.PAN) {
      setCameraPos(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setDragStart(prev => ({ ...prev, x: e.clientX, y: e.clientY }))
      return
    }

    if (!selectedEntity || !dragStart.initialEntityState) return

    const initial = dragStart.initialEntityState.components.transform
    let newTransform = { ...initial }

    // Use the mode from dragStart (set at mouse down) to ensure consistency
    const effectiveMode = dragStart.mode || transformMode

    // SELECT mode should only select, not transform
    if (effectiveMode === TRANSFORM_MODES.SELECT) {
      return
    }

    switch (effectiveMode) {
      case TRANSFORM_MODES.MOVE: {
        let newX = initial.x + worldDeltaX
        let newY = initial.y + worldDeltaY

        if (snapToGrid) {
          newX = Math.round(newX / gridSize) * gridSize
          newY = Math.round(newY / gridSize) * gridSize
        }
        newTransform.x = newX
        newTransform.y = newY
        break
      }

      case TRANSFORM_MODES.ROTATE: {
        const rect = canvasViewRef.current?.getBoundingClientRect()
        if (rect) {
          // Calculate entity center in screen coordinates
          const entityCenterScreenX = rect.left + (initial.x * zoom) + cameraPos.x
          const entityCenterScreenY = rect.top + (initial.y * zoom) + cameraPos.y

          // Calculate angles from entity center to mouse positions
          const startAngle = Math.atan2(dragStart.y - entityCenterScreenY, dragStart.x - entityCenterScreenX)
          const currentAngle = Math.atan2(e.clientY - entityCenterScreenY, e.clientX - entityCenterScreenX)

          // Convert angle difference to degrees and add to initial rotation
          let rotationDelta = (currentAngle - startAngle) * (180 / Math.PI)
          newTransform.rotation = ((initial.rotation || 0) + rotationDelta) % 360
        }
        break
      }

      case TRANSFORM_MODES.SCALE: {
        const scaleFactor = 1 + (worldDeltaX + worldDeltaY) / 100
        const newScale = Math.max(0.1, (initial.scale || 1) * scaleFactor)

        newTransform.scale = newScale
        newTransform.w = initial.w * scaleFactor
        newTransform.h = initial.h * scaleFactor
        break
      }
    }

    // Use local state for smooth updates
    setDraggedTransform({ entityId: selectedEntity, transform: newTransform })

  }, [isDragging, dragStart, transformMode, selectedEntity, snapToGrid, gridSize, zoom, cameraPos])

  const handleMouseUp = useCallback(() => {
    // Commit the final transform to store
    if (draggedTransform && selectedEntity) {
      const scene = currentScene()
      const entity = scene?.entities?.find(e => e.id === selectedEntity)
      if (entity) {
        pushHistory()
        updateEntity?.(selectedEntity, {
          ...entity,
          components: {
            ...entity.components,
            transform: draggedTransform.transform
          }
        }, false)
      }
    }

    setIsDragging(false)
    setDragStart(null)
    setDraggedTransform(null)
  }, [draggedTransform, selectedEntity, currentScene, updateEntity, pushHistory])

  // Handle drag & drop for assets and entities
  const handleViewportDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    // Check if dragging an entity from hierarchy
    if (e.dataTransfer.types.includes('text/plain') || e.dataTransfer.getData('entity/id')) {
      e.dataTransfer.dropEffect = 'move'
    } else {
      e.dataTransfer.dropEffect = 'copy'
    }
    setIsDragOver(true)
  }, [])

  const handleViewportDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleViewportDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const rect = canvasViewRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - cameraPos.x) / zoom
    const y = (e.clientY - rect.top - cameraPos.y) / zoom

    // Check if dropping an entity from hierarchy
    const draggedEntityId = e.dataTransfer.getData('entity/id')
    if (draggedEntityId) {
      // Find which entity (if any) is at the drop position
      const scene = currentScene()
      const entities = scene?.entities || []
      
      // Reverse to check top entities first
      const targetEntity = [...entities].reverse().find(entity => {
        const transform = entity.components?.transform
        if (!transform || entity.id === draggedEntityId) return false
        return (
          x >= transform.x - transform.w / 2 &&
          x <= transform.x + transform.w / 2 &&
          y >= transform.y - transform.h / 2 &&
          y <= transform.y + transform.h / 2
        )
      })

      if (targetEntity) {
        // Drop on entity = set parent
        setParent?.(draggedEntityId, targetEntity.id)
      } else {
        // Drop on empty space = unparent
        setParent?.(draggedEntityId, null)
      }
      return
    }

    // Handle asset drops
    try {
      const jsonStr = e.dataTransfer.getData('application/json')
      if (!jsonStr) return

      const data = JSON.parse(jsonStr)
      if (data.type === 'asset' && data.asset) {
        // Create new entity
        const newEntity = {
          id: `entity-${Date.now()}`,
          name: data.asset.name,
          components: {
            transform: {
              x: x,
              y: y,
              w: 64,
              h: 64,
              rotation: 0,
              scale: 1
            },
            sprite: {
              assetId: data.asset.id,
              tint: '#ffffff',
              opacity: 1,
              flipX: false,
              flipY: false
            }
          }
        }

        if (snapToGrid) {
          newEntity.components.transform.x = Math.round(x / gridSize) * gridSize
          newEntity.components.transform.y = Math.round(y / gridSize) * gridSize
        }

        addEntity?.(newEntity)
        setSelectedEntity?.(newEntity.id)
      }
    } catch (error) {
      console.error('Error handling drop:', error)
    }
  }, [cameraPos, zoom, snapToGrid, gridSize, addEntity, setSelectedEntity, setParent, currentScene])

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    // Only if over canvas
    if (e.target.closest('.viewport-canvas-container')) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(Math.max(0.1, Math.min(5, zoom * delta)))
    }
  }, [zoom, setZoom])

  // Attach global listeners for mouse up (in case drag ends outside)
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isDragging, handleMouseUp, handleMouseMove])

  // Attach non-passive wheel listener
  useEffect(() => {
    const el = canvasViewRef.current
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false })
    }
    return () => {
      if (el) el.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle keyboard shortcuts if user is typing in an input field
      const activeElement = document.activeElement
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      )

      if (isTyping) return

      // Delete key to delete selected entity
      if (e.key === 'Delete' && selectedEntity) {
        e.preventDefault()
        deleteSelected?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedEntity, deleteSelected])


  // Render viewport content
  const renderViewport = () => {
    if (mode === 'play') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black p-4">
          <div className="relative bg-black rounded-sm shadow-2xl border border-slate-700 overflow-hidden">
            <canvas
              ref={canvasRef}
              width="800"
              height="600"
              className="block"
              style={{
                imageRendering: 'pixelated',
                background: project?.scenes?.[0]?.bg || '#000',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          </div>
        </div>
      )
    }

    return (
      <div className="relative w-full h-full bg-slate-900 overflow-hidden select-none" data-viewport-container>

        {/* Rulers */}
        {showRulers && (
          <>
            <div className="absolute top-0 left-8 right-0 h-8 bg-slate-800 border-b border-slate-700 z-10 flex items-end overflow-hidden">
              {Array.from({ length: Math.ceil(2000 / gridSize) }, (_, i) => (
                <div
                  key={i}
                  className="border-l border-slate-600 text-[10px] text-slate-500 pl-1 pb-1"
                  style={{
                    width: (gridSize * zoom) + 'px',
                    transform: `translateX(${cameraPos.x % (gridSize * zoom)}px)`,
                    flexShrink: 0
                  }}
                >
                  {i * gridSize}
                </div>
              ))}
            </div>
            <div className="absolute left-0 top-8 bottom-0 w-8 bg-slate-800 border-r border-slate-700 z-10 flex flex-col items-end overflow-hidden">
              {Array.from({ length: Math.ceil(2000 / gridSize) }, (_, i) => (
                <div
                  key={i}
                  className="border-t border-slate-600 text-[10px] text-slate-500 pr-1 pt-1"
                  style={{
                    height: (gridSize * zoom) + 'px',
                    transform: `translateY(${cameraPos.y % (gridSize * zoom)}px)`,
                    flexShrink: 0
                  }}
                >
                  {i * gridSize}
                </div>
              ))}
            </div>
            <div className="absolute top-0 left-0 w-8 h-8 bg-slate-800 border-r border-b border-slate-700 z-20 flex items-center justify-center">
              <Target className="w-4 h-4 text-slate-500" />
            </div>
          </>
        )}

        {/* Main Canvas Area */}
        <div
          ref={canvasViewRef}
          className="viewport-canvas-container absolute inset-0 w-full h-full cursor-crosshair outline-none"
          style={{ touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onDragOver={handleViewportDragOver}
          onDragLeave={handleViewportDragLeave}
          onDrop={handleViewportDrop}
        >
          {/* Zoom controls overlay */}
          <div className="absolute top-12 right-4 z-30 flex flex-col gap-2">
            <div className="bg-slate-800 rounded-lg p-1 border border-slate-700 flex flex-col shadow-xl">
              <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white" onClick={() => setZoom(Math.min(3, zoom + 0.1))}><ZoomIn className="w-4 h-4" /></button>
              <div className="h-px bg-slate-700 mx-2" />
              <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}><ZoomOut className="w-4 h-4" /></button>
              <div className="h-px bg-slate-700 mx-2" />
              <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white" onClick={() => setZoom(1)}><Target className="w-4 h-4" /></button>
            </div>
          </div>

          {/* World Layer */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              transform: `translate(${cameraPos.x}px, ${cameraPos.y}px) scale(${zoom})`, // Apply camera Pan here
              transformOrigin: '0 0'
            }}
          >
            {/* Scene Background Color */}
            <div
              className="absolute"
              style={{
                top: 0, left: 0, width: 800, height: 600, // Game World Size
                background: project?.scenes?.[0]?.bg || '#333'
              }}
            />

            {/* Grid */}
            {showGrid && (
              <div
                className="absolute inset-[-2000px] pointer-events-none opacity-20"
                style={{
                  backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                  backgroundSize: `${gridSize}px ${gridSize}px`
                }}
              />
            )}

            {/* Entities - sorted by collider layer (higher layer = drawn on top) */}
            {project?.scenes?.[0]?.entities
              ?.slice()
              .sort((a, b) => {
                const layerA = a.components?.collider?.layer ?? 0
                const layerB = b.components?.collider?.layer ?? 0
                return layerA - layerB
              })
              .map(entity => {
              const transform = entity.components?.transform
              if (!transform) return null
              const isSelected = selectedEntity === entity.id

              // Use dragged transform if this entity is being dragged
              const displayTransform = (draggedTransform && draggedTransform.entityId === entity.id)
                ? draggedTransform.transform
                : transform

              return (
                <motion.div
                  key={entity.id}
                  className={`absolute pointer-events-auto select-none ${isSelected ? 'ring-2 ring-emerald-500 z-10' : 'hover:ring-1 hover:ring-white/50'}`}
                  style={{
                    left: displayTransform.x - displayTransform.w / 2,
                    top: displayTransform.y - displayTransform.h / 2,
                    width: displayTransform.w,
                    height: displayTransform.h,
                    rotate: displayTransform.rotation || 0,
                    scale: displayTransform.scale || 1
                  }}
                  initial={false}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.dataTransfer.dropEffect = 'move'
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const draggedEntityId = e.dataTransfer.getData('entity/id')
                    if (draggedEntityId && draggedEntityId !== entity.id) {
                      setParent?.(draggedEntityId, entity.id)
                    }
                  }}
                >
                  {/* Entity Visuals */}
                  {entity.components?.sprite ? (
                    (() => {
                      const spr = entity.components.sprite
                      const assetId = spr.assetId
                      const asset = project.assets.find(a => a.id === assetId)
                      
                      // Check for primitive SVG first
                      if (spr.primitiveSVG) {
                        return (
                          <img
                            src={spr.primitiveSVG}
                            alt={entity.name}
                            className="w-full h-full object-fill pointer-events-none"
                            style={{
                              imageRendering: 'auto',
                              opacity: spr.opacity ?? 1,
                              filter: spr.tint ? `drop-shadow(0 0 0 ${spr.tint})` : 'none'
                            }}
                          />
                        )
                      }
                      
                      // Then check for asset
                      if (asset) {
                        return (
                          <img
                            src={asset.src}
                            alt={entity.name}
                            className="w-full h-full object-fill pointer-events-none"
                            style={{
                              imageRendering: 'pixelated',
                              opacity: spr.opacity ?? 1,
                              filter: spr.tint ? `drop-shadow(0 0 0 ${spr.tint})` : 'none'
                            }}
                          />
                        )
                      }
                      
                      // Fallback to colored rectangle
                      return (
                        <div 
                          className="w-full h-full border border-slate-500 flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: spr.fill || '#94a3b8' }}
                        >
                          <div className="text-[10px] text-slate-400 truncate px-1">{entity.name}</div>
                        </div>
                      )
                    })()
                  ) : (
                    <div className="w-full h-full bg-emerald-500/20 border border-emerald-500 rounded flex items-center justify-center">
                      <span className="text-xs text-emerald-100">{entity.name}</span>
                    </div>
                  )}

                  {/* Transform Gizmos (Only Visuals) */}
                  {isSelected && showGizmos && (
                    <div className="absolute -inset-2 border-2 border-transparent">
                      {/* Visual handles - interaction is handled by main mouseMove logic for now */}
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-emerald-500 border border-white" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 border border-white" />
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-500 border border-white" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-500 border border-white" />

                      {/* Rotate Handle */}
                      {transformMode === TRANSFORM_MODES.ROTATE && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-emerald-500">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full border border-white" />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Drag Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-emerald-500/10 border-4 border-emerald-500 border-dashed z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/90 text-white px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center animate-bounce">
                <Target className="w-10 h-10 text-emerald-500 mb-2" />
                <span className="font-bold text-lg">Drop Asset Here</span>
                <span className="text-sm text-slate-400">Release to add to scene</span>
              </div>
            </div>
          )}

          {/* Info Badge */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-300 flex items-center gap-2 pointer-events-none">
            <MousePointer className="w-3 h-3 text-emerald-500" />
            {transformMode.toUpperCase()}
            <span className="w-px h-3 bg-slate-600" />
            X: {Math.round(-cameraPos.x)} Y: {Math.round(-cameraPos.y)}
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="enhanced-viewport w-full h-full relative bg-slate-950 rounded-lg overflow-hidden">
      {renderViewport()}
    </div>
  )
}
