import { useEffect, useRef, useState } from 'react'
import { runProject } from '../engine/runtime'
import { useEditorStore } from '../store/editorStore'
import { useAuthStore } from '../store/authStore'
import { useSubmissionsStore } from '../store/submissionsStore'
import EnhancedViewport from '../components/editor/EnhancedViewport'
import TutorialTour from '../components/editor/TutorialTour'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { motion } from 'framer-motion'
import { Send, Layers, Package, Code, Settings, Play, Square, RotateCcw, Save, Upload, Download, Grid3X3, Ruler } from 'lucide-react'
import { useLogStore } from '../store/logStore'
import SEO from '../components/SEO.jsx'
import AchievementNotification from '../components/AchievementNotification'

// Minimal runtime schema validation
function validateProjectSchema(data){
  try{
    if(typeof data !== 'object' || !data) return false
    if(!Array.isArray(data.scenes) || data.scenes.length === 0) return false
    return true
  }catch{ return false }
}

export default function EditorFallback() {
  const canvasRef = useRef(null)
  const [runner, setRunner] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementData, setAchievementData] = useState({})
  const [showTutorial, setShowTutorial] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showRulers, setShowRulers] = useState(false)
  const [mode, setMode] = useState('edit')

  const { currentUser } = useAuthStore(s => ({ currentUser: s.currentUser }))
  const { submitGame } = useSubmissionsStore(s => ({ submitGame: s.submitGame }))
  const { project, selectedEntityId, selectEntity, addEntity, deleteSelected, loadProject, importAsset } = useEditorStore(s => ({
    project: s.project,
    selectedEntityId: s.selectedEntityId,
    selectEntity: s.selectEntity,
    addEntity: s.addEntity,
    deleteSelected: s.deleteSelected,
    loadProject: s.loadProject,
    importAsset: s.importAsset
  }))

  const { logs, clearLogs } = useLogStore(s => ({ logs: s.logs, clearLogs: s.clearLogs }))

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // Game runtime
  useEffect(() => {
    if (mode === 'play' && canvasRef.current && project) {
      try {
        const newRunner = runProject(canvasRef.current, project, {
          onMessage: (msg) => {
            console.log('Game message:', msg)
          }
        })
        setRunner(newRunner)
      } catch (error) {
        console.error('Failed to start game:', error)
        toast.error('Failed to start game')
        setMode('edit')
      }
    } else if (mode === 'edit' && runner) {
      try {
        runner.destroy()
        setRunner(null)
      } catch (error) {
        console.error('Failed to stop game:', error)
      }
    }
  }, [mode, project, runner])

  const submit = async () => {
    if (!currentUser) {
      toast.error('Please log in to submit your game')
      return
    }

    try {
      await submitGame(project)
      setShowAchievement({
        title: "Game Submitted! 🎮",
        description: "Your eco-game is now under review. Great work, eco-warrior!",
        icon: Send,
        variant: "success"
      })
      setShowAchievement(true)
    } catch (error) {
      console.error('Submission failed:', error)
      toast.error('Failed to submit game')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner 
          size="xl" 
          message="Initializing Game Engine..." 
          variant="recycle" 
        />
      </div>
    )
  }

  return (
    <>
      <SEO title="Game Engine Editor" description="Professional 2D game engine for creating environmental education games." />
      
      <div className="h-screen flex flex-col bg-slate-900">
        {/* Simple Toolbar */}
        <div className="flex-shrink-0 bg-slate-800 text-white border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMode(mode === 'play' ? 'edit' : 'play')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === 'play' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {mode === 'play' ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {mode === 'play' ? 'Stop' : 'Play'}
              </button>
              
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-emerald-600' : 'hover:bg-slate-700'}`}
                title="Toggle Grid"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setShowRulers(!showRulers)}
                className={`p-2 rounded-lg transition-colors ${showRulers ? 'bg-emerald-600' : 'hover:bg-slate-700'}`}
                title="Toggle Rulers"
              >
                <Ruler className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTutorial(true)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium"
              >
                <span>Tutorial</span>
              </button>
              <button
                onClick={submit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
              >
                <Send className="h-4 w-4" />
                Publish
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Simple */}
          <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Hierarchy</h3>
              <div className="space-y-2">
                {project?.scenes?.[0]?.entities?.map(entity => (
                  <div
                    key={entity.id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedEntityId === entity.id 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                    onClick={() => selectEntity(entity.id)}
                  >
                    {entity.name || 'Untitled Entity'}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Assets</h3>
              <div className="space-y-2">
                {project?.assets?.map(asset => (
                  <div key={asset.id} className="p-2 bg-slate-700 rounded text-slate-300">
                    {asset.name || 'Untitled Asset'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Viewport */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative bg-slate-800 rounded-lg shadow-2xl border-2 border-slate-600 overflow-hidden" style={{ width: 960, height: 600 }}>
              <EnhancedViewport mode={mode} canvasRef={canvasRef} showGrid={showGrid} showRulers={showRulers} />
            </div>
          </div>

          {/* Right Panel - Simple Inspector */}
          <div className="w-80 bg-slate-800 border-l border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Inspector</h3>
            {selectedEntityId ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Entity Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    defaultValue={project?.scenes?.[0]?.entities?.find(e => e.id === selectedEntityId)?.name || 'Untitled'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Position X</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    defaultValue={project?.scenes?.[0]?.entities?.find(e => e.id === selectedEntityId)?.components?.transform?.x || 0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Position Y</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    defaultValue={project?.scenes?.[0]?.entities?.find(e => e.id === selectedEntityId)?.components?.transform?.y || 0}
                  />
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No entity selected</p>
            )}
          </div>
        </div>
      </div>

      <TutorialTour open={showTutorial} onClose={() => setShowTutorial(false)} />

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
