import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLogStore = create(persist((set, get) => ({
  logs: [],
  add: (message, level = 'info', stack = null) => set(state => ({ 
    logs: [...state.logs, { 
      timestamp: Date.now(), 
      message, 
      level, 
      stack 
    }] 
  })),
  clearLogs: () => set({ logs: [] }),
}), { name: 'aversoltix_logs' }))
