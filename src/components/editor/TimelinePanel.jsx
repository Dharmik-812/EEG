import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { 
  Play, Pause, Square, SkipBack, SkipForward, 
  ZoomIn, ZoomOut, Lock, Unlock, Eye, EyeOff,
  Plus, Trash2, Move, RotateCw, Scale, GripVertical
} from 'lucide-react'

const TRACK_HEIGHT = 40
const RULER_HEIGHT = 30
const TRACK_HEADER_WIDTH = 200
const MIN_PIXELS_PER_SECOND = 50
const MAX_PIXELS_PER_SECOND = 500

export default function TimelinePanel() {
  const scene = useEditorStore(s => s.currentScene())
  const selectedEntityId = useEditorStore(s => s.selectedEntityId)
  const ent = scene?.entities?.find(e => e.id === selectedEntityId)
  
  const [zoom, setZoom] = useState(100) // pixels per second
  const [scrollX, setScrollX] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedKeyframes, setSelectedKeyframes] = useState(new Set())
  const [draggingKeyframe, setDraggingKeyframe] = useState(null)
  const [draggingPlayhead, setDraggingPlayhead] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [snapInterval, setSnapInterval] = useState(0.1) // seconds
  
  const timelineRef = useRef(null)
  const playheadRef = useRef(null)
  const animationFrameRef = useRef(null)
  
  const timeline = ent?.components?.timeline || { duration: 5, playing: false, loop: true, t: 0, tracks: { transform: {} } }
  const duration = timeline.duration || 5
  const tracks = timeline.tracks?.transform || {}
  
  const setTimelineDuration = useEditorStore(s => s.setTimelineDuration)
  const setTimelinePlaying = useEditorStore(s => s.setTimelinePlaying)
  const addTransformKeyframe = useEditorStore(s => s.addTransformKeyframe)
  const updateEntity = useEditorStore(s => s.updateEntity)
  
  // Animation loop
  useEffect(() => {
    if (isPlaying && ent) {
      const startTime = performance.now() / 1000
      let lastTime = currentTime
      
      const animate = () => {
        const elapsed = (performance.now() / 1000) - startTime
        const newTime = (lastTime + elapsed) % duration
        setCurrentTime(newTime)
        
        // Update entity timeline
        if (ent) {
          const updated = { ...ent }
          updated.components = { ...updated.components }
          updated.components.timeline = { ...timeline, t: newTime, playing: true }
          updateEntity(ent.id, updated, false)
        }
        
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, ent, duration, currentTime])
  
  // Sync with entity timeline
  useEffect(() => {
    if (ent?.components?.timeline?.t !== undefined) {
      setCurrentTime(ent.components.timeline.t || 0)
    }
    setIsPlaying(ent?.components?.timeline?.playing || false)
  }, [ent?.components?.timeline?.t, ent?.components?.timeline?.playing])
  
  const pixelsPerSecond = useMemo(() => {
    return Math.max(MIN_PIXELS_PER_SECOND, Math.min(MAX_PIXELS_PER_SECOND, zoom))
  }, [zoom])
  
  const timelineWidth = duration * pixelsPerSecond
  
  const handlePlay = () => {
    if (!ent) return
    const newPlaying = !isPlaying
    setIsPlaying(newPlaying)
    setTimelinePlaying(ent.id, newPlaying)
  }
  
  const handleStop = () => {
    if (!ent) return
    setIsPlaying(false)
    setCurrentTime(0)
    setTimelinePlaying(ent.id, false)
    const updated = { ...ent }
    updated.components = { ...updated.components }
    updated.components.timeline = { ...timeline, t: 0, playing: false }
    updateEntity(ent.id, updated, false)
  }
  
  const handleTimeChange = (newTime) => {
    const clampedTime = Math.max(0, Math.min(duration, newTime))
    setCurrentTime(clampedTime)
    if (ent) {
      const updated = { ...ent }
      updated.components = { ...updated.components }
      updated.components.timeline = { ...timeline, t: clampedTime }
      updateEntity(ent.id, updated, false)
    }
  }
  
  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - TRACK_HEADER_WIDTH
    const time = (x + scrollX) / pixelsPerSecond
    handleTimeChange(time)
  }
  
  const handlePlayheadDrag = useCallback((e) => {
    if (!draggingPlayhead || !timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - TRACK_HEADER_WIDTH
    const time = (x + scrollX) / pixelsPerSecond
    const snappedTime = snapToGrid ? Math.round(time / snapInterval) * snapInterval : time
    handleTimeChange(snappedTime)
  }, [draggingPlayhead, scrollX, pixelsPerSecond, snapToGrid, snapInterval])
  
  useEffect(() => {
    if (draggingPlayhead) {
      const handleMouseMove = (e) => handlePlayheadDrag(e)
      const handleMouseUp = () => setDraggingPlayhead(false)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggingPlayhead, handlePlayheadDrag])
  
  const handleKeyframeClick = (e, track, keyframe, index) => {
    e.stopPropagation()
    const newSelected = new Set(selectedKeyframes)
    const key = `${track}-${index}`
    if (e.shiftKey) {
      if (newSelected.has(key)) {
        newSelected.delete(key)
      } else {
        newSelected.add(key)
      }
    } else {
      newSelected.clear()
      newSelected.add(key)
    }
    setSelectedKeyframes(newSelected)
  }
  
  const handleKeyframeDrag = useCallback((e, track, keyframe, index) => {
    e.stopPropagation()
    setDraggingKeyframe({ track, keyframe, index, startX: e.clientX, startTime: keyframe.time })
  }, [])
  
  useEffect(() => {
    if (draggingKeyframe && ent) {
      const handleMouseMove = (e) => {
        if (!timelineRef.current) return
        const rect = timelineRef.current.getBoundingClientRect()
        const deltaX = e.clientX - draggingKeyframe.startX
        const deltaTime = deltaX / pixelsPerSecond
        const newTime = draggingKeyframe.startTime + deltaTime
        const snappedTime = snapToGrid ? Math.round(newTime / snapInterval) * snapInterval : newTime
        const clampedTime = Math.max(0, Math.min(duration, snappedTime))
        
        // Update keyframe time
        const updated = { ...ent }
        const tl = { ...timeline }
        tl.tracks = { ...tl.tracks, transform: { ...tracks } }
        const arr = [...(tl.tracks.transform[draggingKeyframe.track] || [])]
        arr[draggingKeyframe.index] = { ...arr[draggingKeyframe.index], time: clampedTime }
        arr.sort((a, b) => a.time - b.time)
        tl.tracks.transform[draggingKeyframe.track] = arr
        updated.components = { ...updated.components, timeline: tl }
        updateEntity(ent.id, updated, false)
      }
      
      const handleMouseUp = () => {
        setDraggingKeyframe(null)
      }
      
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggingKeyframe, ent, pixelsPerSecond, snapToGrid, snapInterval, duration, timeline, tracks, updateEntity])
  
  const handleAddKeyframe = (track) => {
    if (!ent) return
    const transform = ent.components?.transform || {}
    let value = 0
    if (track === 'x') value = transform.x || 0
    else if (track === 'y') value = transform.y || 0
    else if (track === 'rotation') value = transform.rotation || 0
    else if (track === 'w') value = transform.w || 100
    else if (track === 'w') value = transform.h || 100
    
    addTransformKeyframe(ent.id, track, currentTime, value)
  }
  
  const handleDeleteKeyframes = () => {
    if (!ent || selectedKeyframes.size === 0) return
    const updated = { ...ent }
    const tl = { ...timeline }
    tl.tracks = { ...tl.tracks, transform: { ...tracks } }
    
    selectedKeyframes.forEach(key => {
      const [track, indexStr] = key.split('-')
      const index = parseInt(indexStr)
      if (tl.tracks.transform[track] && tl.tracks.transform[track][index]) {
        const arr = [...tl.tracks.transform[track]]
        arr.splice(index, 1)
        tl.tracks.transform[track] = arr
      }
    })
    
    updated.components = { ...updated.components, timeline: tl }
    updateEntity(ent.id, updated, false)
    setSelectedKeyframes(new Set())
  }
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = (time % 60).toFixed(2)
    return `${minutes}:${seconds.padStart(5, '0')}`
  }
  
  const getTrackLabel = (track) => {
    const labels = {
      x: 'Position X',
      y: 'Position Y',
      rotation: 'Rotation',
      w: 'Scale X',
      h: 'Scale Y'
    }
    return labels[track] || track
  }
  
  const getTrackIcon = (track) => {
    if (track === 'x' || track === 'y') return Move
    if (track === 'rotation') return RotateCw
    if (track === 'w' || track === 'h') return Scale
    return Move
  }
  
  const renderRuler = () => {
    const majorInterval = duration > 10 ? 1 : duration > 5 ? 0.5 : 0.25
    const minorInterval = majorInterval / 5
    const marks = []
    
    for (let t = 0; t <= duration; t += minorInterval) {
      const isMajor = Math.abs(t % majorInterval) < 0.01
      marks.push({ time: t, isMajor })
    }
    
    return (
      <div className="relative h-full bg-slate-800 border-b border-slate-700">
        {marks.map((mark, i) => {
          const x = mark.time * pixelsPerSecond - scrollX
          if (x < -50 || x > timelineWidth + 50) return null
          return (
            <div
              key={i}
              className="absolute top-0 border-l border-slate-600"
              style={{
                left: `${TRACK_HEADER_WIDTH + x}px`,
                height: mark.isMajor ? '100%' : '50%',
                borderColor: mark.isMajor ? 'rgb(71, 85, 105)' : 'rgb(51, 65, 85)'
              }}
            >
              {mark.isMajor && (
                <span className="absolute top-1 left-1 text-xs text-slate-400">
                  {formatTime(mark.time)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }
  
  const renderTrack = (track, keyframes = []) => {
    const Icon = getTrackIcon(track)
    const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time)
    
    return (
      <div key={track} className="flex border-b border-slate-700">
        {/* Track Header */}
        <div className="flex items-center justify-between px-3 bg-slate-750 border-r border-slate-700" style={{ width: TRACK_HEADER_WIDTH, height: TRACK_HEIGHT }}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-300 truncate">{getTrackLabel(track)}</span>
          </div>
          <button
            onClick={() => handleAddKeyframe(track)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Add Keyframe"
          >
            <Plus className="h-3 w-3 text-slate-400" />
          </button>
        </div>
        
        {/* Track Timeline */}
        <div 
          className="relative flex-1 bg-slate-900 cursor-pointer"
          style={{ height: TRACK_HEIGHT }}
          onClick={handleTimelineClick}
        >
          {/* Grid lines */}
          {Array.from({ length: Math.ceil(duration / snapInterval) + 1 }, (_, i) => {
            const time = i * snapInterval
            const x = time * pixelsPerSecond - scrollX
            if (x < 0 || x > timelineWidth) return null
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-slate-800"
                style={{ left: `${TRACK_HEADER_WIDTH + x}px` }}
              />
            )
          })}
          
          {/* Keyframes */}
          {sortedKeyframes.map((keyframe, index) => {
            const x = keyframe.time * pixelsPerSecond - scrollX
            if (x < -20 || x > timelineWidth + 20) return null
            const isSelected = selectedKeyframes.has(`${track}-${index}`)
            return (
              <div
                key={index}
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded border-2 cursor-move transition-all ${
                  isSelected 
                    ? 'bg-emerald-500 border-emerald-400 scale-110' 
                    : 'bg-slate-600 border-slate-500 hover:bg-slate-500'
                }`}
                style={{ left: `${TRACK_HEADER_WIDTH + x - 8}px` }}
                onClick={(e) => handleKeyframeClick(e, track, keyframe, index)}
                onMouseDown={(e) => handleKeyframeDrag(e, track, keyframe, index)}
                title={`${formatTime(keyframe.time)}: ${keyframe.value.toFixed(2)}`}
              />
            )
          })}
        </div>
      </div>
    )
  }
  
  if (!ent) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p className="text-sm">No entity selected</p>
          <p className="text-xs mt-1">Select an entity to edit its timeline</p>
        </div>
      </div>
    )
  }
  
  const playheadX = TRACK_HEADER_WIDTH + (currentTime * pixelsPerSecond - scrollX)

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-slate-300" />
            ) : (
              <Play className="h-4 w-4 text-slate-300" />
            )}
          </button>
          <button
            onClick={handleStop}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Stop"
          >
            <Square className="h-4 w-4 text-slate-300" />
          </button>
          <div className="h-6 w-px bg-slate-600 mx-1" />
          <button
            onClick={() => handleTimeChange(Math.max(0, currentTime - 0.1))}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Step Back"
          >
            <SkipBack className="h-4 w-4 text-slate-300" />
          </button>
          <button
            onClick={() => handleTimeChange(Math.min(duration, currentTime + 0.1))}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Step Forward"
          >
            <SkipForward className="h-4 w-4 text-slate-300" />
          </button>
          <div className="h-6 w-px bg-slate-600 mx-1" />
          <input
            type="text"
            value={formatTime(currentTime)}
            onChange={(e) => {
              const match = e.target.value.match(/(\d+):(\d+\.?\d*)/)
              if (match) {
                const minutes = parseInt(match[1]) || 0
                const seconds = parseFloat(match[2]) || 0
                handleTimeChange(minutes * 60 + seconds)
              }
            }}
            className="px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 w-20 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <span className="text-xs text-slate-400">/ {formatTime(duration)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
              className="rounded"
            />
            Snap
          </label>
          <input
            type="number"
            value={snapInterval}
            onChange={(e) => setSnapInterval(Math.max(0.01, parseFloat(e.target.value) || 0.1))}
            step="0.1"
            min="0.01"
            className="w-16 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="h-6 w-px bg-slate-600 mx-1" />
          <button
            onClick={() => setZoom(prev => Math.max(MIN_PIXELS_PER_SECOND, prev - 20))}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4 text-slate-300" />
          </button>
          <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoom)}px/s</span>
          <button
            onClick={() => setZoom(prev => Math.min(MAX_PIXELS_PER_SECOND, prev + 20))}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4 text-slate-300" />
          </button>
          {selectedKeyframes.size > 0 && (
            <>
              <div className="h-6 w-px bg-slate-600 mx-1" />
              <button
                onClick={handleDeleteKeyframes}
                className="p-2 hover:bg-red-600 rounded transition-colors"
                title="Delete Selected Keyframes"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={timelineRef}
          className="h-full overflow-auto"
          onScroll={(e) => setScrollX(e.target.scrollLeft)}
        >
          {/* Ruler */}
          <div style={{ height: RULER_HEIGHT, position: 'sticky', top: 0, zIndex: 10 }}>
            {renderRuler()}
          </div>
          
          {/* Playhead */}
          <div
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-20 pointer-events-none"
            style={{ left: `${playheadX}px` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-500" />
      </div>

          {/* Draggable Playhead */}
          <div
            className="absolute top-0 bottom-0 w-1 cursor-col-resize z-30"
            style={{ left: `${playheadX - 2}px` }}
            onMouseDown={() => setDraggingPlayhead(true)}
          />
          
          {/* Tracks */}
          <div style={{ width: `${TRACK_HEADER_WIDTH + timelineWidth}px` }}>
            {Object.keys(tracks).length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No tracks. Add keyframes to create tracks.
              </div>
            ) : (
              Object.entries(tracks).map(([track, keyframes]) => 
                renderTrack(track, keyframes || [])
              )
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t border-slate-700 bg-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>Entity: {ent.name || 'Untitled'}</span>
          <label className="flex items-center gap-2">
            <input
              type="number"
              value={duration}
              onChange={(e) => setTimelineDuration(ent.id, Math.max(0.1, parseFloat(e.target.value) || 5))}
              step="0.1"
              min="0.1"
              className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            Duration (s)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={timeline.loop !== false}
              onChange={(e) => {
                const updated = { ...ent }
                updated.components = { ...updated.components }
                updated.components.timeline = { ...timeline, loop: e.target.checked }
                updateEntity(ent.id, updated, false)
              }}
              className="rounded"
            />
            Loop
          </label>
        </div>
        <div className="text-slate-500">
          {Object.keys(tracks).length} track{Object.keys(tracks).length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
