import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLayoutStore = create(persist((set, get) => ({
  leftW: 300,
  rightW: 320,
  bottomH: 260,
  showBottom: true,
  setLeft: (w) => set({ leftW: Math.max(220, Math.min(600, w)) }),
  setRight: (w) => set({ rightW: Math.max(240, Math.min(600, w)) }),
  setBottom: (h) => set({ bottomH: Math.max(160, Math.min(600, h)) }),
  toggleBottom: () => set(s => ({ showBottom: !s.showBottom })),
}), { name: 'aversoltix_layout' }))
