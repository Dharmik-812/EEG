import { useEditorStore } from '../../store/editorStore'

export default function Toolbar({ onPlay, onSubmit }) {
  const { setZoom, zoom, toggleGrid, grid, setMode, mode, exportProject, newProject } = useEditorStore(s => ({
    setZoom: s.setZoom,
    zoom: s.zoom,
    toggleGrid: s.toggleGrid,
    grid: s.grid,
    setMode: s.setMode,
    mode: s.mode,
    exportProject: s.exportProject,
    newProject: s.newProject,
  }))

  return (
    <div className="flex flex-wrap items-center gap-2 p-3">
      <button className="btn-outline !px-3 !py-2" onClick={newProject}>New</button>
      <button className="btn-outline !px-3 !py-2" onClick={() => setZoom(zoom - 0.1)}>-</button>
      <div className="text-sm">{Math.round(zoom*100)}%</div>
      <button className="btn-outline !px-3 !py-2" onClick={() => setZoom(zoom + 0.1)}>+</button>

      <button className="btn-outline !px-3 !py-2" onClick={toggleGrid}>{grid ? 'Grid On' : 'Grid Off'}</button>
      <button className="btn !px-3 !py-2" onClick={onPlay}>{mode === 'play' ? 'Stop' : 'Play'}</button>
      <button className="btn-outline !px-3 !py-2" onClick={() => navigator.clipboard.writeText(exportProject())}>Copy JSON</button>
      <button className="btn !px-3 !py-2" onClick={onSubmit}>Submit Game</button>
    </div>
  )
}

