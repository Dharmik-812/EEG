import { useEditorStore } from '../../store/editorStore'

export default function SimpleEnhancedToolbar({ onPlay, onSubmit }) {
  const { mode, project } = useEditorStore(s => ({
    mode: s.mode,
    project: s.project
  }))

  return (
    <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <button 
          className="btn" 
          onClick={onPlay}
        >
          {mode === 'play' ? 'Stop' : 'Play'}
        </button>
        <button 
          className="btn-outline"
          onClick={onSubmit}
        >
          Submit Game
        </button>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Enhanced Game Engine - {mode} mode
        </div>
        <div className="text-xs text-slate-500">
          Scene: {project?.scenes?.[0]?.name || 'Untitled'} 
          • Entities: {project?.scenes?.[0]?.entities?.length || 0}
        </div>
      </div>
    </div>
  )
}