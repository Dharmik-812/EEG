// JS barrel to mirror the TypeScript exports so imports like `import { ... } from "./animations"` work in JS files.
// Re-export hooks and presets from their TypeScript modules (Vite resolves these fine from JS).

export * from './manager'
export * from './lazy'
export * from './hooks/useFramerPreset'
export * from './hooks/useGSAP'
export * from './hooks/useLenis'
export * from './hooks/useSVGAnimation'
export * from './hooks/useMotionOne'
export * from './hooks/useRipple'
export * from './hooks/useSplitText'
export * from './barba'
export * from './presets/fade'
export * from './presets/hero'
export * from './presets/scrollReveal'
export * from './presets/routeTransitions'
export * from './presets/uiMicro'
export * from './presets/svgDraw'

// Provide a minimal no-op hook so imports expecting `useScrollReveal` don't fail in JS builds.
// Landing uses it optionally; real behavior can be implemented later if needed.
export function useScrollReveal() {}


