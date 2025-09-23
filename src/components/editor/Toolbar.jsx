import { useEditorStore } from '../../store/editorStore'
import { buildWebHTML } from '../../engine/exporter'
import { useLayoutStore } from '../../store/layoutStore'
import { motion } from 'framer-motion'
import { Plus, Undo2, Redo2, ZoomIn, ZoomOut, Grid3X3, Play as PlayIcon, Square, Clipboard, Download, GraduationCap, PanelBottom, PanelBottomClose, Send } from 'lucide-react'

export default function Toolbar({ onPlay, onSubmit, onTutorial }) {
  const { setZoom, zoom, toggleGrid, grid, setMode, mode, exportProject, newProject, project, undo, redoAction } = useEditorStore(s => ({
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
  }))
  const { showBottom, toggleBottom } = useLayoutStore(s => ({ showBottom: s.showBottom, toggleBottom: s.toggleBottom }))

  function downloadWebBuild() {
    try {
      const html = buildWebHTML(project)
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = (project.name || 'game') + '.html'
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="relative flex flex-wrap items-center gap-2 p-3 rounded-xl border border-white/20 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur" data-tour="toolbar">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-400 opacity-70" />

      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-outline !px-3 !py-2" onClick={newProject} title="New">
        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New</span>
      </motion.button>
      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-outline !px-3 !py-2" onClick={undo} title="Undo (Ctrl+Z)">
        <Undo2 className="h-4 w-4" /> <span className="hidden sm:inline">Undo</span>
      </motion.button>
      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-outline !px-3 !py-2" onClick={redoAction} title="Redo (Ctrl+Y)">
        <Redo2 className="h-4 w-4" /> <span className="hidden sm:inline">Redo</span>
      </motion.button>

      <div className="mx-1 w-px h-6 bg-slate-200 dark:bg-slate-700" />

      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-outline !px-3 !py-2" onClick={() => setZoom(zoom - 0.1)} title="Zoom Out">
        <ZoomOut className="h-4 w-4" />
      </motion.button>
      <div className="text-sm w-16 text-center">{Math.round(zoom*100)}%</div>
      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-outline !px-3 !py-2" onClick={() => setZoom(zoom + 0.1)} title="Zoom In">
        <ZoomIn className="h-4 w-4" />
      </motion.button>

      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-outline !px-3 !py-2" onClick={toggleGrid} title="Toggle Grid">
        <Grid3X3 className="h-4 w-4" /> <span className="hidden sm:inline">{grid ? 'Grid On' : 'Grid Off'}</span>
      </motion.button>

      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn !px-3 !py-2" onClick={onPlay} title={mode === 'play' ? 'Stop' : 'Play'}>
        {mode === 'play' ? <Square className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
        <span className="hidden sm:inline">{mode === 'play' ? 'Stop' : 'Play'}</span>
      </motion.button>

      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-outline !px-3 !py-2" onClick={() => navigator.clipboard.writeText(exportProject())} title="Copy JSON">
        <Clipboard className="h-4 w-4" /> <span className="hidden sm:inline">Copy JSON</span>
      </motion.button>
      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-outline !px-3 !py-2" onClick={downloadWebBuild} title="Download Web Build">
        <Download className="h-4 w-4" /> <span className="hidden sm:inline">Download</span>
      </motion.button>
      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-outline !px-3 !py-2" onClick={onTutorial} title="Tutorial">
        <GraduationCap className="h-4 w-4" /> <span className="hidden sm:inline">Tutorial</span>
      </motion.button>
      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn-outline !px-3 !py-2" onClick={toggleBottom} title={showBottom ? 'Hide Bottom Panel' : 'Show Bottom Panel'}>
        {showBottom ? <PanelBottomClose className="h-4 w-4" /> : <PanelBottom className="h-4 w-4" />}
        <span className="hidden sm:inline">{showBottom ? 'Hide Bottom Panel' : 'Show Bottom Panel'}</span>
      </motion.button>
      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="btn !px-3 !py-2" onClick={onSubmit} title="Submit Game">
        <Send className="h-4 w-4" /> <span className="hidden sm:inline">Submit Game</span>
      </motion.button>
    </div>
  )
}

