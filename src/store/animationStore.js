import { create } from 'zustand'

const STORAGE_KEY = 'avs-reduced-motion'

function getSystemPrefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const initialReduced = (() => {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'true') return true
  if (saved === 'false') return false
  return getSystemPrefersReducedMotion()
})()

export const useAnimationStore = create((set, get) => ({
  reduced: initialReduced,
  setReduced: (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false')
    } catch {}
    set({ reduced: !!value })
  },
  toggle: () => {
    const v = !get().reduced
    try { localStorage.setItem(STORAGE_KEY, v ? 'true' : 'false') } catch {}
    set({ reduced: v })
  }
}))
