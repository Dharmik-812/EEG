// Safe re-exports with lightweight fallbacks so pages can import from ../animations
export { useGSAP } from './hooks/useGSAP'

// Minimal no-op hooks to prevent crashes if specific hooks are missing
export function useScrollReveal() { }
export function useSplitText() { }


