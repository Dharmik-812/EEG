import { useEffect, useRef, useState } from 'react'
import { runProject } from '../engine/runtime'
import { useEditorStore } from '../store/editorStore'
import { useAuthStore } from '../store/authStore'
import { useSubmissionsStore } from '../store/submissionsStore'
import SimpleEnhancedToolbar from '../components/editor/SimpleEnhancedToolbar'
import SimpleEnhancedViewport from '../components/editor/SimpleEnhancedViewport'
import EnhancedInspector from '../components/editor/EnhancedInspector'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { useLogStore } from '../store/logStore'
import SEO from '../components/SEO.jsx'
import AchievementNotification from '../components/AchievementNotification'

export default function Editor() {
  const canvasRef = useRef(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const { project, mode, setMode, exportProject, selectedEntityId, selectEntity } = useEditorStore(s => ({ 
    project: s.project, 
    mode: s.mode, 
    setMode: s.setMode, 
    exportProject: s.exportProject,
    selectedEntityId: s.selectedEntityId,
    selectEntity: s.selectEntity
  }))
  const { currentUser } = useAuthStore(s => ({ currentUser: s.currentUser }))
  const { submitGame, approvedGames, seedDemos } = useSubmissionsStore(s => ({ submitGame: s.submitGame, approvedGames: s.approvedGames, seedDemos: s.seedDemos }))
  const [runner, setRunner] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementData, setAchievementData] = useState({})

  useEffect(() => {
    // Initialize editor loading
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (mode !== 'play') {
      if (runner) runner.stop()
      setRunner(null)
      setCanvasReady(false)
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return // wait until canvas mounts
    const r = runProject(canvas, project, { onMessage: (m) => { toast(m); try { useLogStore.getState().add(m) } catch {} } })
    setRunner(r)
    return () => r.stop()
  }, [mode, project, canvasReady])

  function togglePlay() {
    setMode(mode === 'play' ? 'edit' : 'play')
  }

  const showAchievementNotification = (title, description, icon, variant = 'eco') => {
    setAchievementData({ title, description, icon, variant })
    setShowAchievement(true)
  }

  function submit() {
    if (!currentUser) { toast.error('Login required to submit'); return }
    const title = prompt('Game title?') || 'Untitled Eco Game'
    const description = prompt('Short description?') || ''
    const item = submitGame({ title, description, project, ownerId: currentUser.id })
    toast.success('Game submitted for review!')
    showAchievementNotification(
      "Game Submitted! 🎮",
      "Your eco-game is now under review. Great work, eco-warrior!",
      Send
    )
  }

  const [wsError, setWsError] = useState(null)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <SEO title="Game Engine" description="Professional 2D game engine for creating environmental education games with advanced tools and real-time preview." />
      
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="h-screen flex flex-col bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800"
      >
        {/* Enhanced Toolbar */}
        <div className="flex-shrink-0">
          <SimpleEnhancedToolbar 
            onPlay={togglePlay} 
            onSubmit={submit}
          />
        </div>

        {/* Enhanced Editor Layout */}
        <div className="flex-1 flex min-h-0 gap-2 p-2">
          {/* Left Panel - Hierarchy */}
          <div className="w-80 flex-shrink-0">
            <div className="h-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="font-semibold text-emerald-600 dark:text-emerald-400">Scene Hierarchy</h2>
                <div className="text-xs text-slate-500 mt-1">
                  Scene: {project?.scenes?.[0]?.name || 'Untitled'}
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {project?.scenes?.[0]?.entities?.map(entity => (
                    <div 
                      key={entity.id} 
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        selectedEntityId === entity.id 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' 
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      }`}
                      onClick={() => selectEntity(entity.id)}
                    >
                      <div className="text-sm font-medium">{entity.name || entity.id}</div>
                      <div className="text-xs text-slate-500">
                        {Object.keys(entity.components || {}).join(', ')}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-slate-500 py-8">
                      <div className="text-sm">No entities in scene</div>
                      <div className="text-xs mt-1">Use the inspector to add entities</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center - Viewport */}
          <div className="flex-1 min-w-0">
            <SimpleEnhancedViewport mode={mode} canvasRef={canvasRef} onCanvasReady={setCanvasReady} />
          </div>

          {/* Right Panel - Inspector */}
          <div className="w-80 flex-shrink-0">
            <EnhancedInspector />
          </div>
        </div>

      </motion.section>

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

function ErrorCatcher({ onError, children }) {
  const [err, setErr] = useState(null)
  if (err) return null
  try {
    return children
  } catch (e) {
    console.error('Workspace render error', e)
    onError?.(e)
    setErr(e)
    return null
  }
}

