import { useEditorStore } from '../../store/editorStore'
import { buildWebHTML } from '../../engine/exporter'
import { useLayoutStore } from '../../store/layoutStore'

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
    <div className="flex flex-wrap items-center gap-2 p-3" data-tour="toolbar">
      <button className="btn-outline !px-3 !py-2" onClick={newProject}>New</button>
      <button className="btn-outline !px-3 !py-2" onClick={undo} title="Undo (Ctrl+Z)">Undo</button>
      <button className="btn-outline !px-3 !py-2" onClick={redoAction} title="Redo (Ctrl+Y)">Redo</button>
      <div className="mx-2 w-px h-6 bg-slate-200 dark:bg-slate-700" />
      <button className="btn-outline !px-3 !py-2" onClick={() => setZoom(zoom - 0.1)}>-</button>
      <div className="text-sm">{Math.round(zoom*100)}%</div>
      <button className="btn-outline !px-3 !py-2" onClick={() => setZoom(zoom + 0.1)}>+</button>

      <button className="btn-outline !px-3 !py-2" onClick={toggleGrid}>{grid ? 'Grid On' : 'Grid Off'}</button>
      <button className="btn !px-3 !py-2" onClick={onPlay}>{mode === 'play' ? 'Stop' : 'Play'}</button>
      <button className="btn-outline !px-3 !py-2" onClick={() => navigator.clipboard.writeText(exportProject())}>Copy JSON</button>
      <button className="btn-outline !px-3 !py-2" onClick={downloadWebBuild}>Download Web Build</button>
      <button className="btn-outline !px-3 !py-2" onClick={onTutorial}>Tutorial</button>
      <button className="btn-outline !px-3 !py-2" onClick={toggleBottom}>{showBottom ? 'Hide Bottom Panel' : 'Show Bottom Panel'}</button>
      <button className="btn !px-3 !py-2" onClick={onSubmit}>Submit Game</button>
    </div>
  )
}

