import { useEffect, useRef, useState } from 'react'
import { runProject } from '../engine/runtime'
import { useEditorStore } from '../store/editorStore'
import { useAuthStore } from '../store/authStore'
import { useSubmissionsStore } from '../store/submissionsStore'
import SimpleEnhancedToolbar from '../components/editor/SimpleEnhancedToolbar'
import EnhancedViewport from '../components/editor/EnhancedViewport'
import EnhancedInspector from '../components/editor/EnhancedInspector'
import EnhancedSceneManager from '../components/editor/EnhancedSceneManager'
import EnhancedAssetManager from '../components/editor/EnhancedAssetManager'
import ScriptEditor from '../components/editor/ScriptEditor'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Layers, Package, Code, Settings, Play, Square, RotateCcw, Save, Upload, Download } from 'lucide-react'
import { useLogStore } from '../store/logStore'
import SEO from '../components/SEO.jsx'
import AchievementNotification from '../components/AchievementNotification'

const PANEL_TYPES = {
  HIERARCHY: 'hierarchy',
  INSPECTOR: 'inspector',
  ASSETS: 'assets',
  CONSOLE: 'console',
  SCRIPT: 'script'
}

export default function Editor() {
  const canvasRef = useRef(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const [activeLeftPanel, setActiveLeftPanel] = useState(PANEL_TYPES.HIERARCHY)
  const [activeRightPanel, setActiveRightPanel] = useState(PANEL_TYPES.INSPECTOR)
  const [activeBottomPanel, setActiveBottomPanel] = useState(PANEL_TYPES.CONSOLE)
  const [showBottomPanel, setShowBottomPanel] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(320)
  const [rightPanelWidth, setRightPanelWidth] = useState(320)
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250)
  
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

  const renderPanelContent = (panelType) => {
    switch (panelType) {
      case PANEL_TYPES.HIERARCHY:
        return <EnhancedSceneManager />
      case PANEL_TYPES.INSPECTOR:
        return <EnhancedInspector />
      case PANEL_TYPES.ASSETS:
        return <EnhancedAssetManager />
      case PANEL_TYPES.SCRIPT:
        return <ScriptEditor />
      case PANEL_TYPES.CONSOLE:
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">Console</h3>
            <div className="bg-slate-900 text-green-400 p-3 rounded-lg font-mono text-sm h-48 overflow-y-auto">
              <div>Unity-like Console Output</div>
              <div className="text-yellow-400">Warning: No warnings to display</div>
              <div className="text-red-400">Error: No errors to display</div>
              <div>Ready for game development!</div>
            </div>
          </div>
        )
      default:
        return <div className="p-4 text-center text-slate-500">Panel content</div>
    }
  }

  const PanelTab = ({ icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-emerald-500 text-white'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )

  return (
    <>
      <SEO title="Unity-like Game Engine" description="Professional 2D game engine with Unity-inspired interface for creating environmental education games." />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="h-screen flex flex-col bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800"
      >
        {/* Unity-style Toolbar */}
        <div className="flex-shrink-0 bg-slate-800 dark:bg-slate-900 text-white border-b border-slate-700">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    mode === 'play'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {mode === 'play' ? (
                    <>
                      <Square className="h-4 w-4" fill="currentColor" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" fill="currentColor" />
                      Play
                    </>
                  )}
                </motion.button>
                
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Pause">
                  <Square className="h-4 w-4" />
                </button>
                
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Step">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <div className="w-px h-6 bg-slate-600" />

              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Save">
                  <Save className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Load">
                  <Upload className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Export">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-300">
                Scene: {project?.scenes?.[0]?.name || 'Untitled'}
              </div>
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

        {/* Unity-style Layout */}
        <div className="flex-1 flex">
          {/* Left Panel */}
          <div className="flex flex-col bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700" style={{ width: leftPanelWidth }}>
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <PanelTab 
                icon={Layers} 
                label="Hierarchy" 
                isActive={activeLeftPanel === PANEL_TYPES.HIERARCHY}
                onClick={() => setActiveLeftPanel(PANEL_TYPES.HIERARCHY)}
              />
              <PanelTab 
                icon={Package} 
                label="Assets" 
                isActive={activeLeftPanel === PANEL_TYPES.ASSETS}
                onClick={() => setActiveLeftPanel(PANEL_TYPES.ASSETS)}
              />
            </div>
            <div className="flex-1 overflow-auto">
              {renderPanelContent(activeLeftPanel)}
            </div>
          </div>

          {/* Center - Viewport */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <EnhancedViewport mode={mode} canvasRef={canvasRef} />
            </div>
            
            {/* Bottom Panel */}
            <AnimatePresence>
              {showBottomPanel && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: bottomPanelHeight }}
                  exit={{ height: 0 }}
                  className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <PanelTab 
                      icon={Code} 
                      label="Script" 
                      isActive={activeBottomPanel === PANEL_TYPES.SCRIPT}
                      onClick={() => setActiveBottomPanel(PANEL_TYPES.SCRIPT)}
                    />
                    <PanelTab 
                      icon={Settings} 
                      label="Console" 
                      isActive={activeBottomPanel === PANEL_TYPES.CONSOLE}
                      onClick={() => setActiveBottomPanel(PANEL_TYPES.CONSOLE)}
                    />
                    <div className="ml-auto">
                      <button
                        onClick={() => setShowBottomPanel(false)}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {renderPanelContent(activeBottomPanel)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!showBottomPanel && (
              <div className="p-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowBottomPanel(true)}
                  className="text-xs px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Show Console/Script Editor
                </button>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="flex flex-col bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700" style={{ width: rightPanelWidth }}>
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <PanelTab 
                icon={Settings} 
                label="Inspector" 
                isActive={activeRightPanel === PANEL_TYPES.INSPECTOR}
                onClick={() => setActiveRightPanel(PANEL_TYPES.INSPECTOR)}
              />
            </div>
            <div className="flex-1 overflow-auto">
              {renderPanelContent(activeRightPanel)}
            </div>
          </div>
        </div>
      </motion.div>

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

