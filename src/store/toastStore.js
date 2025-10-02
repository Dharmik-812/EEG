import { create } from 'zustand'

let counter = 0

export const useToastStore = create((set, get) => ({
  toasts: [], // Array<{ id, title, description, variant }>
  push: ({ title, description, variant = 'info' }) => {
    const id = `toast-${Date.now()}-${counter++}`
    const toast = { id, title, description, variant }
    set(state => ({ toasts: [...state.toasts, toast] }))
    return id
  },
  remove: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  clear: () => set({ toasts: [] })
}))
