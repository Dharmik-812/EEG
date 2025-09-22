import { useEditorStore } from '../store/editorStore'
import { useProjectsStore } from '../store/projectsStore'
import Card from '../components/Card'
import { useState } from 'react'

export default function Projects() {
  const { project, loadProject, newProject, exportProject } = useEditorStore(s => ({ project: s.project, loadProject: s.loadProject, newProject: s.newProject, exportProject: s.exportProject }))
  const { projects, saveCurrent, remove } = useProjectsStore(s => ({ projects: s.projects, saveCurrent: s.saveCurrent, remove: s.remove }))
  const [query, setQuery] = useState('')

  function save() {
    const name = prompt('Project name?') || project.name || 'Untitled'
    saveCurrent(name, JSON.parse(exportProject()))
    alert('Saved to Projects')
  }
  function importJSON(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const data = JSON.parse(reader.result)
      loadProject(data)
    }
    reader.readAsText(file)
  }

  return (
    <section className="space-y-4">
      <Card>
        <div className="flex items-center justify-between p-3">
          <div className="text-lg font-semibold">Projects</div>
          <div className="flex gap-2">
            <button className="btn-outline" onClick={newProject}>New Project</button>
            <label className="btn-outline cursor-pointer">Import JSON<input type="file" accept="application/json" className="hidden" onChange={importJSON} /></label>
            <button className="btn" onClick={save}>Save Current</button>
          </div>
        </div>
      </Card>
      <Card>
        <div className="p-3">
          <input className="rounded border bg-transparent px-3 py-2 w-full" placeholder="Search projects…" value={query} onChange={e=>setQuery(e.target.value)} />
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).map(p => (
              <div key={p.id} className="border rounded-xl p-3 space-y-2">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-slate-500">Updated {new Date(p.updatedAt).toLocaleString()}</div>
                <div className="flex gap-2">
                  <button className="btn" onClick={()=>loadProject(p.data)}>Open</button>
                  <button className="btn-outline" onClick={()=>navigator.clipboard.writeText(JSON.stringify(p.data))}>Copy JSON</button>
                  <button className="btn-outline" onClick={()=>remove(p.id)}>Delete</button>
                </div>
              </div>
            ))}
            {projects.length===0 && <div className="text-sm text-slate-500">No projects yet. Create a new project or import from JSON.</div>}
          </div>
        </div>
      </Card>
    </section>
  )
}
