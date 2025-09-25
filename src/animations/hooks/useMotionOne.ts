import { ric, shouldReduceMotion } from '../manager'

export async function loadMotion() {
  if (typeof window === 'undefined' || shouldReduceMotion()) return null
  return new Promise((resolve) =>
    ric(async () => {
      try {
        const mod = await import('motion')
        resolve(mod)
      } catch {
        resolve(null)
      }
    })
  )
}
