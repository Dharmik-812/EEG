import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLogStore = create(persist((set, get) => ({
  logs: [],
  add: (msg) => set(state => ({ logs: [...state.logs, { time: new Date().toLocaleTimeString(), msg }] })),
  clear: () => set({ logs: [] }),
}), { name: 'aversoltix_logs' }))
