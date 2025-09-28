import { useEffect, useRef, useState } from 'react'
import { runProject } from '../engine/runtime'
import { useEditorStore } from '../store/editorStore'
import { useAuthStore } from '../store/authStore'
import { useSubmissionsStore } from '../store/submissionsStore'
import ModernLayout from '../components/editor/ModernLayout'
import ModernSceneToolbar from '../components/editor/ModernSceneToolbar'
import ModernHierarchyPanel from '../components/editor/ModernHierarchyPanel'
import ModernInspector from '../components/editor/ModernInspector'
import ModernConsolePanel from '../components/editor/ModernConsolePanel'
import EnhancedViewport from '../components/editor/EnhancedViewport'
import TutorialTour from '../components/editor/TutorialTour'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { useLogStore } from '../store/logStore'
import SEO from '../components/SEO.jsx'
import AchievementNotification from '../components/AchievementNotification'

// Minimal runtime schema validation to ensure only supported editor projects are loaded
function validateProjectSchema(data){
  try{
    if(typeof data !== 'object' || !data) return false
    if(!Array.isArray(data.scenes) || data.scenes.length === 0) return false
    for(const s of data.scenes){
      if(typeof s.id !== 'string') return false
      if(!Array.isArray(s.entities)) return false
      for(const e of s.entities){
        if(typeof e !== 'object' || !e) return false
        if(typeof e.id !== 'string') return false
        if(typeof e.components !== 'object' || !e.components) return false
        // only allow known component keys
        const allowed = new Set(['transform','sprite','text','ui','rigidbody','collider','tilemap','script','emitter','audioSource'])
        for(const k of Object.keys(e.components)){
          if(!allowed.has(k)) return false
        }
      }
    }
    // assets must be images or audio only
    if(data.assets && !Array.isArray(data.assets)) return false
    if(Array.isArray(data.assets)){
      for(const a of data.assets){
        if(typeof a.id !== 'string') return false
        if(a.type !== 'image' && a.type !== 'audio') return false
        if(typeof a.src !== 'string') return false
      }
    }
    return true
  }catch{ return false }
}

export default function ModernEditor() {
  const canvasRef = useRef(null)
  const [runner, setRunner] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementData, setAchievementData] = useState({})
  const [showTutorial, setShowTutorial] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showRulers, setShowRulers] = useState(false)
  
  // Modern layout state
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [bottomCollapsed, setBottomCollapsed] = useState(false)
  const [hierarchyTab, setHierarchyTab] = useState('hierarchy')
  const [consoleTab, setConsoleTab] = useState('console')

  const { currentUser } = useAuthStore(s => ({ currentUser: s.currentUser }))
  const { submitGame, approvedGames, seedDemos } = useSubmissionsStore(s => ({ submitGame: s.submitGame, approvedGames: s.approvedGames, seedDemos: s.seedDemos }))
  const { project, mode, setMode, selectedEntityId, selectEntity, addEntity, deleteSelected, loadProject, importAsset } = useEditorStore(s => ({
    project: s.project,
    mode: s.mode,
    setMode: s.setMode,
    selectedEntityId: s.selectedEntityId,
    selectEntity: s.selectEntity,
    addEntity: s.addEntity,
    deleteSelected: s.deleteSelected,
    loadProject: s.loadProject,
    importAsset: s.importAsset
  }))

  // Get logs from store
  const { logs, clearLogs } = useLogStore(s => ({ logs: s.logs, clearLogs: s.clearLogs }))

  useEffect(() => {
    // Initialize editor loading
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // Autosave & restore
  useEffect(() => {
    try {
      const saved = localStorage.getItem('eeg/editor/autosave')
      if (saved) {
        const should = confirm('Restore last autosave?')
        if (should) {
          const parsed = JSON.parse(saved)
          if (validateProjectSchema(parsed)) {
            loadProject(parsed)
            toast.success('Autosaved project restored!')
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore autosaved project:', error)
    }
  }, [loadProject])

  // Autosave every 10 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      try {
        const currentProject = useEditorStore.getState().project
        localStorage.setItem('eeg/editor/autosave', JSON.stringify(currentProject))
      } catch (error) {
        console.error('Autosave failed:', error)
      }
    }, 10000)

    return () => clearInterval(saveInterval)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault()
          try {
            const currentProject = useEditorStore.getState().project
            localStorage.setItem('eeg/editor/autosave', JSON.stringify(currentProject))
            toast.success('Project saved!')
          } catch (error) {
            console.error('Save failed:', error)
            toast.error('Save failed')
          }
        } else if (e.key === 'p') {
          e.preventDefault()
          setMode(mode === 'play' ? 'edit' : 'play')
        } else if (e.key === 'z') {
          e.preventDefault()
          useEditorStore.getState().undo?.()
        } else if (e.key === 'y') {
          e.preventDefault()
          useEditorStore.getState().redoAction?.()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, setMode])

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
  }, [mode, project])

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
          message="Initializing Modern Game Engine..." 
          variant="recycle" 
        />
      </div>
    )
  }

  return (
    <>
      <SEO title="Modern Game Engine" description="Professional 2D game engine with modern dark theme interface for creating environmental education games." />
      
      <ModernLayout
        leftPanel={
          <ModernHierarchyPanel
            activeTab={hierarchyTab}
            onTabChange={setHierarchyTab}
            project={project}
            selectedEntityId={selectedEntityId}
            onSelectEntity={selectEntity}
            onAddEntity={addEntity}
            onDeleteEntity={deleteSelected}
            onSelectAsset={(assetId) => console.log('Select asset:', assetId)}
            onDeleteAsset={(assetId) => console.log('Delete asset:', assetId)}
            onImportAsset={async (file) => {
              try {
                await importAsset(file)
                toast.success('Asset imported successfully!')
              } catch (error) {
                toast.error('Failed to import asset')
              }
            }}
          />
        }
        centerPanel={
          <div className="flex-1 flex flex-col">
            <ModernSceneToolbar
              mode={mode}
              onModeChange={setMode}
              isPlaying={mode === 'play'}
              onPlay={() => setMode('play')}
              onPause={() => setMode('edit')}
              onStop={() => setMode('edit')}
              onReset={() => {
                if (runner) {
                  runner.destroy()
                  setRunner(null)
                }
                setMode('edit')
              }}
              onSave={() => {
                try {
                  const currentProject = useEditorStore.getState().project
                  localStorage.setItem('eeg/editor/autosave', JSON.stringify(currentProject))
                  toast.success('Project saved!')
                } catch (error) {
                  console.error('Save failed:', error)
                  toast.error('Save failed')
                }
              }}
              onLoad={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.json'
                input.onchange = (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    try {
                      const data = JSON.parse(reader.result)
                      if (validateProjectSchema(data)) {
                        loadProject(data)
                        toast.success('Project loaded successfully!')
                      } else {
                        toast.error('Invalid project file. Please load a valid EEG project JSON.')
                      }
                    } catch (err) {
                      console.error('Error loading project:', err)
                      toast.error('Failed to load project. Invalid JSON format.')
                    }
                  }
                  reader.readAsText(file)
                }
                input.click()
              }}
              onExport={() => {
                try {
                  const { project } = useEditorStore.getState()
                  const { buildWebHTML } = require('../engine/exporter')
                  const html = buildWebHTML(project)
                  const blob = new Blob([html], { type: 'text/html' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = (project?.name || 'game') + '.html'
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                  URL.revokeObjectURL(url)
                  toast.success('Exported web build (.html)')
                } catch (err) {
                  console.error(err)
                  toast.error('Export failed')
                }
              }}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
              showRulers={showRulers}
              onToggleRulers={() => setShowRulers(!showRulers)}
              snapToGrid={useEditorStore.getState().snapToGrid}
              onToggleSnap={() => useEditorStore.getState().toggleSnapToGrid?.()}
              gridSize={useEditorStore.getState().gridSize}
              onGridSizeChange={(size) => useEditorStore.getState().setGridSize?.(size)}
              zoom={useEditorStore.getState().zoom || 1}
              onZoomChange={(zoom) => useEditorStore.getState().setZoom?.(zoom)}
              onZoomReset={() => useEditorStore.getState().setZoom?.(1)}
              onZoomFit={() => {
                const parent = document.querySelector('[data-viewport-container]')
                if (parent) {
                  const w = parent.clientWidth - 64
                  const h = parent.clientHeight - 140
                  const fit = Math.max(0.25, Math.min(3, Math.min(w/800, h/600)))
                  useEditorStore.getState().setZoom?.(fit)
                }
              }}
              onShowSettings={() => console.log('Show settings')}
              onShowHelp={() => setShowTutorial(true)}
            />
            
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="relative bg-slate-800 rounded-lg shadow-2xl border-2 border-slate-600 overflow-hidden" style={{ width: 960, height: 600 }}>
                <EnhancedViewport mode={mode} canvasRef={canvasRef} showGrid={showGrid} showRulers={showRulers} />
              </div>
            </div>
          </div>
        }
        rightPanel={
          <ModernInspector
            selectedEntity={project?.scenes?.[0]?.entities?.find(e => e.id === selectedEntityId)}
            onUpdateEntity={(id, entity) => {
              const scene = project?.scenes?.[0]
              if (!scene) return
              const updated = { ...project }
              const sidx = updated.scenes.findIndex(s => s.id === scene.id)
              const eidx = scene.entities.findIndex(e => e.id === id)
              if (eidx === -1) return
              const newScene = { ...scene }
              newScene.entities = [...scene.entities]
              newScene.entities[eidx] = entity
              updated.scenes[sidx] = newScene
              useEditorStore.getState().loadProject(updated)
            }}
            onRemoveComponent={(componentType) => {
              if (!selectedEntityId) return
              const scene = project?.scenes?.[0]
              if (!scene) return
              const entity = scene.entities.find(e => e.id === selectedEntityId)
              if (!entity) return
              const updated = { ...entity }
              delete updated.components[componentType]
              const updatedProject = { ...project }
              const sidx = updatedProject.scenes.findIndex(s => s.id === scene.id)
              const eidx = scene.entities.findIndex(e => e.id === selectedEntityId)
              updatedProject.scenes[sidx].entities[eidx] = updated
              useEditorStore.getState().loadProject(updatedProject)
            }}
            onAddComponent={(componentType) => {
              if (!selectedEntityId) return
              const scene = project?.scenes?.[0]
              if (!scene) return
              const entity = scene.entities.find(e => e.id === selectedEntityId)
              if (!entity) return
              const updated = { ...entity }
              updated.components = { ...updated.components }
              const defaults = {
                rigidbody: { vx: 0, vy: 0, ax: 0, ay: 0, gravity: 0, friction: 0 },
                collider: { type: 'aabb', w: 100, h: 100, isTrigger: false, layer: 0 },
                script: { code: "function onUpdate(event, payload, api) { /* called every frame */ }" },
                audioSource: { assetId: null, volume: 1.0, loop: false }
              }
              if (defaults[componentType]) {
                updated.components[componentType] = defaults[componentType]
                const updatedProject = { ...project }
                const sidx = updatedProject.scenes.findIndex(s => s.id === scene.id)
                const eidx = scene.entities.findIndex(e => e.id === selectedEntityId)
                updatedProject.scenes[sidx].entities[eidx] = updated
                useEditorStore.getState().loadProject(updatedProject)
              }
            }}
          />
        }
        bottomPanel={
          <ModernConsolePanel
            activeTab={consoleTab}
            onTabChange={setConsoleTab}
            logs={logs}
            onClearLogs={clearLogs}
            selectedEntity={project?.scenes?.[0]?.entities?.find(e => e.id === selectedEntityId)}
            onUpdateScript={(id, code) => {
              const scene = project?.scenes?.[0]
              if (!scene) return
              const entity = scene.entities.find(e => e.id === id)
              if (!entity) return
              const updated = { ...entity }
              updated.components = { ...updated.components, script: { ...updated.components.script, code } }
              const updatedProject = { ...project }
              const sidx = updatedProject.scenes.findIndex(s => s.id === scene.id)
              const eidx = scene.entities.findIndex(e => e.id === id)
              updatedProject.scenes[sidx].entities[eidx] = updated
              useEditorStore.getState().loadProject(updatedProject)
            }}
            onRunScript={(id) => console.log('Run script:', id)}
            onStopScript={(id) => console.log('Stop script:', id)}
            isRunning={false}
          />
        }
        leftCollapsed={leftCollapsed}
        rightCollapsed={rightCollapsed}
        bottomCollapsed={bottomCollapsed}
        onLeftToggle={() => setLeftCollapsed(!leftCollapsed)}
        onRightToggle={() => setRightCollapsed(!rightCollapsed)}
        onBottomToggle={() => setBottomCollapsed(!bottomCollapsed)}
      />

      <TutorialTour open={showTutorial} onClose={() => setShowTutorial(false)} />

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
