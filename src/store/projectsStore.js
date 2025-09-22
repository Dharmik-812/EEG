import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProjectsStore = create(persist((set, get) => ({
  projects: [], // { id, name, data, updatedAt }
  saveCurrent: (name, data) => set(state => {
    const id = `proj-${Date.now()}`
    const item = { id, name: name || `Project ${state.projects.length+1}`, data, updatedAt: new Date().toISOString() }
    return { projects: [item, ...state.projects].slice(0, 50) }
  }),
  remove: (id) => set(state => ({ projects: state.projects.filter(p => p.id !== id) })),
}), { name: 'aversoltix_projects' }))
