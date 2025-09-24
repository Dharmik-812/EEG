import { useMemo } from 'react'
import { animationManager, shouldReduceMotion } from '../manager'

export function useFramerPreset(name: string, opts?: { fallback?: any }) {
  const reduced = shouldReduceMotion()
  return useMemo(() => {
    const preset = animationManager.get(name)
    if (!preset) return opts?.fallback
    return preset({ reduced })
  }, [name, reduced])
}
