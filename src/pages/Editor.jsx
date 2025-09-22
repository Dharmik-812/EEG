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
import Card from '../components/Card.jsx'
import toast from 'react-hot-toast'

export default function Editor() {
  const canvasRef = useRef(null)
  const { project, mode, setMode, exportProject } = useEditorStore(s => ({ project: s.project, mode: s.mode, setMode: s.setMode, exportProject: s.exportProject }))
  const { currentUser } = useAuthStore(s => ({ currentUser: s.currentUser }))
  const { submitGame } = useSubmissionsStore(s => ({ submitGame: s.submitGame }))
  const [runner, setRunner] = useState(null)

  useEffect(() => {
    if (mode === 'play') {
      const canvas = canvasRef.current
      const r = runProject(canvas, project, { onMessage: (m) => toast(m) })
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

  return (
    <section className="space-y-4">
      <Card>
        <Toolbar onPlay={togglePlay} onSubmit={submit} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1">
          <HierarchyPanel />
        </Card>

        <Card className="lg:col-span-2">
          {mode === 'play' ? (
            <div className="w-full">
              <canvas ref={canvasRef} className="block mx-auto my-4 w-full h-auto max-w-full" />
            </div>
          ) : (
            <ViewportCanvas />
          )}
        </Card>

        <Card className="lg:col-span-1">
          <InspectorPanel />
        </Card>
      </div>

      <Card>
        <AssetsPanel />
      </Card>
    </section>
  )
}

