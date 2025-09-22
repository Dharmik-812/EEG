import { useEffect, useRef, useState } from 'react'
import { runProject } from '../engine/runtime'
import { useEditorStore } from '../store/editorStore'
import { useAuthStore } from '../store/authStore'
import { useSubmissionsStore } from '../store/submissionsStore'
import Toolbar from '../components/editor/Toolbar'
import HierarchyPanel from '../components/editor/HierarchyPanel'
import InspectorPanel from '../components/editor/InspectorPanel'
import ViewportCanvas from '../components/editor/ViewportCanvas'
import AssetsPanel from '../components/editor/AssetsPanel'
import ScenesPanel from '../components/editor/ScenesPanel'
import ScriptEditor from '../components/editor/ScriptEditor'
import ScriptAssistant from '../components/editor/ScriptAssistant'
import Card from '../components/Card.jsx'
import toast from 'react-hot-toast'
import HelpPanel from '../components/editor/HelpPanel'
import InputPanel from '../components/editor/InputPanel'
import TimelinePanel from '../components/editor/TimelinePanel'
import DockWorkspace from '../components/editor/Workspace'
import { useLogStore } from '../store/logStore'

export default function Editor() {
  const canvasRef = useRef(null)
  const { project, mode, setMode, exportProject } = useEditorStore(s => ({ project: s.project, mode: s.mode, setMode: s.setMode, exportProject: s.exportProject }))
  const { currentUser } = useAuthStore(s => ({ currentUser: s.currentUser }))
  const { submitGame } = useSubmissionsStore(s => ({ submitGame: s.submitGame }))
  const [runner, setRunner] = useState(null)

  useEffect(() => {
    if (mode === 'play') {
      const canvas = canvasRef.current
      const r = runProject(canvas, project, { onMessage: (m) => { toast(m); try { useLogStore.getState().add(m) } catch {} } })
      setRunner(r)
      return () => r.stop()
    } else {
      if (runner) runner.stop()
      setRunner(null)
    }
  }, [mode])

  function togglePlay() {
    setMode(mode === 'play' ? 'edit' : 'play')
  }

  function submit() {
    if (!currentUser) { toast.error('Login required to submit'); return }
    const title = prompt('Game title?') || 'Untitled Eco Game'
    const description = prompt('Short description?') || ''
    const item = submitGame({ title, description, project, ownerId: currentUser.id })
    toast.success('Game submitted for review!')
  }

  const [wsError, setWsError] = useState(null)

  return (
    <section className="space-y-4">
      <Card>
        <Toolbar onPlay={togglePlay} onSubmit={submit} />
      </Card>

      <div className="relative w-full">
        {/* Try dockable layout, fallback to basic layout on error */}
        {!wsError ? (
          <ErrorCatcher onError={setWsError}>
            <DockWorkspace mode={mode} canvasRef={canvasRef} />
          </ErrorCatcher>
        ) : (
          <Card>
            {mode === 'play' ? (
              <div className="w-full">
                <canvas ref={canvasRef} className="block mx-auto my-4 w-full h-auto max-w-full" />
              </div>
            ) : (
              <ViewportCanvas />
            )}
          </Card>
        )}
      </div>

      <Card>
        <HelpPanel />
      </Card>

      <Card>
        <ScriptEditor />
      </Card>

      <Card>
        <ScriptAssistant />
      </Card>

      <Card>
        <InputPanel />
      </Card>
    </section>
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

