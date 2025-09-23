import { useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { buildWebHTML } from '../../engine/exporter'
import { useLayoutStore } from '../../store/layoutStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Undo2, Redo2, ZoomIn, ZoomOut, Grid3X3, Play as PlayIcon, Square, 
  Clipboard, Download, GraduationCap, PanelBottom, PanelBottomClose, Send,
  Move, RotateCcw, Scale, Hand, MousePointer, Layers, Eye, EyeOff,
  Settings, Palette, Wand2, Camera, Maximize, Lock, Unlock, AlignCenter,
  FlipHorizontal, FlipVertical, Copy, Scissors, RefreshCw, BookOpen,
  Sparkles, Target, Gamepad2, Code, Brush, Type, Image, Volume2, Box
} from 'lucide-react'
import AchievementNotification from '../AchievementNotification'

const TRANSFORM_MODES = {
  SELECT: 'select',
  MOVE: 'move', 
  ROTATE: 'rotate',
  SCALE: 'scale',
  PAN: 'pan'
}

const SNAP_VALUES = [1, 8, 16, 32, 64, 128]

export default function EnhancedToolbar({ onPlay, onSubmit, onTutorial }) {
  const { 
    setZoom, zoom, toggleGrid, grid, setMode, mode, exportProject, newProject, 
    project, undo, redoAction, transformMode, setTransformMode, snapToGrid,
    toggleSnapToGrid, gridSize, setGridSize
  } = useEditorStore(s => ({
    setZoom: s.setZoom,
    zoom: s.zoom,
    toggleGrid: s.toggleGrid,
    grid: s.grid,
    setMode: s.setMode,
    mode: s.mode,
    exportProject: s.exportProject,
    newProject: s.newProject,
    project: s.project,
    undo: s.undo,
    redoAction: s.redoAction,
    transformMode: s.transformMode || TRANSFORM_MODES.SELECT,
    setTransformMode: s.setTransformMode,
    snapToGrid: s.snapToGrid || false,
    toggleSnapToGrid: s.toggleSnapToGrid,
    gridSize: s.gridSize || 32,
    setGridSize: s.setGridSize
  }))
  
  const { showBottom, toggleBottom } = useLayoutStore(s => ({ 
    showBottom: s.showBottom, 
    toggleBottom: s.toggleBottom 
  }))

  const [showSnapMenu, setShowSnapMenu] = useState(false)
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementData, setAchievementData] = useState({})

  const showAchievementNotification = (title, description, icon, variant = 'eco') => {
    setAchievementData({ title, description, icon, variant })
    setShowAchievement(true)
  }

  function downloadWebBuild() {
    try {
      const html = buildWebHTML(project)
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = (project.name || 'game') + '.html'
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
      showAchievementNotification(
        "Game Exported! 🚀",
        "Your eco-game is ready to share with the world!",
        Download
      )
    } catch (e) {
      console.error(e)
    }
  }

  const toolGroups = [
    {
      name: 'Project',
      tools: [
        { id: 'new', icon: Plus, label: 'New Project', action: () => {
          newProject()
          showAchievementNotification("Fresh Start! 🌱", "New project created. Let's build something amazing!", Plus)
        }},
        { id: 'save', icon: Clipboard, label: 'Copy JSON', action: () => navigator.clipboard.writeText(exportProject()) },
        { id: 'export', icon: Download, label: 'Export Game', action: downloadWebBuild },
      ]
    },
    {
      name: 'Edit',
      tools: [
        { id: 'undo', icon: Undo2, label: 'Undo (Ctrl+Z)', action: undo, shortcut: 'Ctrl+Z' },
        { id: 'redo', icon: Redo2, label: 'Redo (Ctrl+Y)', action: redoAction, shortcut: 'Ctrl+Y' },
        { id: 'copy', icon: Copy, label: 'Copy', action: () => {}, shortcut: 'Ctrl+C' },
        { id: 'cut', icon: Scissors, label: 'Cut', action: () => {}, shortcut: 'Ctrl+X' },
      ]
    },
    {
      name: 'Transform',
      tools: [
        { 
          id: 'select', 
          icon: MousePointer, 
          label: 'Select Tool', 
          action: () => setTransformMode?.(TRANSFORM_MODES.SELECT),
          active: transformMode === TRANSFORM_MODES.SELECT
        },
        { 
          id: 'move', 
          icon: Move, 
          label: 'Move Tool (W)', 
          action: () => setTransformMode?.(TRANSFORM_MODES.MOVE),
          shortcut: 'W',
          active: transformMode === TRANSFORM_MODES.MOVE
        },
        { 
          id: 'rotate', 
          icon: RotateCcw, 
          label: 'Rotate Tool (E)', 
          action: () => setTransformMode?.(TRANSFORM_MODES.ROTATE),
          shortcut: 'E',
          active: transformMode === TRANSFORM_MODES.ROTATE
        },
        { 
          id: 'scale', 
          icon: Scale, 
          label: 'Scale Tool (R)', 
          action: () => setTransformMode?.(TRANSFORM_MODES.SCALE),
          shortcut: 'R',
          active: transformMode === TRANSFORM_MODES.SCALE
        },
        { 
          id: 'pan', 
          icon: Hand, 
          label: 'Pan Tool (Q)', 
          action: () => setTransformMode?.(TRANSFORM_MODES.PAN),
          shortcut: 'Q',
          active: transformMode === TRANSFORM_MODES.PAN
        },
      ]
    },
    {
      name: 'View',
      tools: [
        { id: 'zoom-out', icon: ZoomOut, label: 'Zoom Out', action: () => setZoom(Math.max(0.1, zoom - 0.1)) },
        { id: 'zoom-reset', icon: Target, label: `${Math.round(zoom*100)}%`, action: () => setZoom(1) },
        { id: 'zoom-in', icon: ZoomIn, label: 'Zoom In', action: () => setZoom(Math.min(5, zoom + 0.1)) },
        { 
          id: 'grid', 
          icon: Grid3X3, 
          label: grid ? 'Hide Grid' : 'Show Grid', 
          action: toggleGrid,
          active: grid 
        },
        { id: 'snap-settings', icon: Settings, label: 'Snap Settings', action: () => setShowSnapMenu(!showSnapMenu) },
      ]
    },
    {
      name: 'Create',
      tools: [
        { id: 'sprite', icon: Image, label: 'Add Sprite', action: () => {} },
        { id: 'text', icon: Type, label: 'Add Text', action: () => {} },
        { id: 'audio', icon: Volume2, label: 'Add Audio', action: () => {} },
        { id: 'collider', icon: Box, label: 'Add Collider', action: () => {} },
        { id: 'particle', icon: Sparkles, label: 'Add Particles', action: () => {} },
      ]
    },
    {
      name: 'Playback',
      tools: [
        { 
          id: 'play', 
          icon: mode === 'play' ? Square : PlayIcon, 
          label: mode === 'play' ? 'Stop' : 'Play', 
          action: () => {
            onPlay()
            if (mode !== 'play') {
              showAchievementNotification("Game Started! 🎮", "Testing your creation in real-time!", Gamepad2)
            }
          },
          variant: mode === 'play' ? 'stop' : 'play'
        },
      ]
    }
  ]

  return (
    <>
      <div className="game-engine-toolbar eco-card p-4 space-y-4" data-tour="enhanced-toolbar">
        {/* Main Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {toolGroups.map((group, groupIndex) => (
            <div key={group.name} className="flex items-center gap-1">
              {group.tools.map((tool) => (
                <motion.button
                  key={tool.id}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative inline-flex items-center gap-2 px-3 py-2 rounded-lg 
                    transition-all duration-200 group
                    ${tool.active ? 
                      'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 
                      'bg-white/60 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }
                    ${tool.variant === 'play' ? 'btn-eco' : ''}
                    ${tool.variant === 'stop' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                    border border-emerald-200/50 dark:border-emerald-700/30
                  `}
                  onClick={tool.action}
                  title={tool.label + (tool.shortcut ? ` (${tool.shortcut})` : '')}
                >
                  <tool.icon className="h-4 w-4" />
                  <span className="hidden lg:inline text-sm font-medium">
                    {tool.id === 'zoom-reset' ? tool.label : tool.label.split(' ')[0]}
                  </span>
                  
                  {/* Shortcut indicator */}
                  {tool.shortcut && (
                    <span className="absolute -top-1 -right-1 text-xs bg-emerald-500 text-white rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {tool.shortcut}
                    </span>
                  )}
                </motion.button>
              ))}
              
              {/* Separator */}
              {groupIndex < toolGroups.length - 1 && (
                <div className="mx-2 h-6 w-px bg-gradient-to-b from-emerald-200 to-sky-200 dark:from-emerald-700 dark:to-sky-700" />
              )}
            </div>
          ))}
          
          {/* Special Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline !px-3 !py-2 nature-particles"
              onClick={onTutorial}
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Tutorial</span>
            </motion.button>
            
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="btn !px-4 !py-2 streak-flame"
              onClick={onSubmit}
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Submit Game</span>
            </motion.button>
          </div>
        </div>

        {/* Secondary Toolbar - Context Sensitive */}
        <div className="flex items-center justify-between px-2 py-1 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Mode: <span className="font-medium text-emerald-600">{transformMode}</span>
            </span>
            
            {snapToGrid && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-emerald-600">Snap: {gridSize}px</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBottom}
              className="text-xs px-2 py-1 rounded bg-white/60 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              {showBottom ? <PanelBottomClose className="h-3 w-3" /> : <PanelBottom className="h-3 w-3" />}
            </button>
            
            <span className="text-xs text-slate-500">
              {project?.scenes?.[0]?.entities?.length || 0} objects
            </span>
          </div>
        </div>
      </div>

      {/* Snap Settings Popup */}
      <AnimatePresence>
        {showSnapMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="fixed top-20 right-4 z-50 eco-card p-4 min-w-[200px] shadow-xl"
          >
            <h3 className="font-semibold mb-3 text-emerald-600">Grid & Snap Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={toggleSnapToGrid}
                  className="rounded border-emerald-300"
                />
                <span className="text-sm">Snap to Grid</span>
              </label>
              
              <div>
                <label className="text-sm font-medium">Grid Size:</label>
                <div className="flex gap-1 mt-1">
                  {SNAP_VALUES.map(size => (
                    <button
                      key={size}
                      onClick={() => setGridSize?.(size)}
                      className={`px-2 py-1 text-xs rounded ${
                        gridSize === size 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white/60 hover:bg-emerald-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowSnapMenu(false)}
              className="mt-3 w-full btn-outline !py-1 text-xs"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Notifications */}
      <AchievementNotification
        isVisible={showAchievement}
        onClose={() => setShowAchievement(false)}
        title={achievementData.title}
        description={achievementData.description}
        icon={achievementData.icon}
        variant={achievementData.variant}
      />
    </>
  )
}