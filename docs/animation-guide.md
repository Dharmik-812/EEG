# Animation System Guide

This document describes the unified animation system integrated into the app: Framer Motion, Motion One, GSAP (+ ScrollTrigger), Anime.js, and Lenis. Barba.js is included via an SPA bridge (disabled by default to avoid conflicts with React Router; see below).

Contents
- Philosophy and goals
- Architecture
- Presets & hooks
- Motion One
- Barba.js (SPA bridge)
- Smooth scrolling
- Accessibility
- Performance guidelines
- Playground
- Adding new presets
- QA and Lighthouse

Philosophy and goals
- Modular, scalable, and tree-shakeable
- Accessible by default (prefers-reduced-motion honored + user toggle)
- High performance: transforms/opacity, lazy-load heavy libs, cleanup properly
- Developer-friendly presets and hooks

Architecture
- AnimationManager (src/animations/manager.ts) provides tokens (durations/easings) and a registry for presets.
- Lazy loaders (src/animations/lazy.ts) dynamically import GSAP, ScrollTrigger, Anime.js, and Lenis on idle, and only when reduced motion is not requested.
- Hooks live in src/animations/hooks and provide ergonomic integration points.
- Presets live in src/animations/presets and are registered at import time via helper functions.

Presets & hooks
- Framer presets
  - fadeInUp: common fade + translateY
  - staggerGrid: container/item pair for grid reveals
  - heroEntrance: hero heading, subtext, and media entrance
  - route.transition: page transitions
  - buttonMicro: hover/tap micro-interactions
  - modalInOut: modal show/hide
- GSAP presets
  - scrollReveal: default values for scroll reveal
  - parallax: simple factor configuration, used by GSAP in hooks
- SVG presets
  - svgDraw: Anime.js stroke-draw config

Hooks
- useFramerPreset(name): returns a preset for use with motion components
- useGSAP(setup): dynamically loads GSAP + ScrollTrigger and runs setup with cleanup
- useScrollReveal(selector[], options): sets reveal animations for queried elements
- useLenis({ smooth }): initializes Lenis and syncs to ScrollTrigger
- useSVGAnimation(ref, options): draws SVG paths using Anime.js
- loadMotion(): dynamic import for Motion One APIs (animate, timeline, spring)
- useRipple(): adds Material-like motion ripple to any [data-ripple] element
- useSplitText(ref): letter-by-letter reveal using Motion One
- useBarbaTransitions({ enabled }): experimental SPA bridge that triggers basic fade transitions on route changes

Smooth scrolling
- Lenis is initialized in App via useLenis. It’s disabled when reduced motion is active.
- ScrollTrigger is synchronized with Lenis’ rAF loop.
- Locomotive Scroll can be integrated similarly if preferred.

Accessibility
- A global user toggle is available in the navbar. It persists to localStorage and overrides system settings.
- prefers-reduced-motion is respected globally. When enabled, Framer presets return zero-motion variants and heavy libs are not loaded.

Performance guidelines
- Prefer transform/opacity; avoid animating layout properties (width/height/top/left) when possible.
- Use GSAP ScrollTrigger only for elements in viewport; use once where possible.
- Lazy-load heavy libraries (GSAP, Anime.js, Lenis) and only when needed.
- Cleanup ScrollTriggers and animation instances on unmount.

Playground
- Visit /animation-playground for live demos and adjustable controls.
- Demos include: scroll reveal, SVG draw, split-text letter reveals, ripple buttons.

Adding new presets
1. Create a new file under src/animations/presets/<name>.ts and register with animationManager.register('yourName', ...).
2. Export and re-export via src/animations/index.ts.
3. Use with useFramerPreset('yourName') or your GSAP hook.

Motion One
- Motion One (package: `motion`) powers light-weight WAAPI-based micro-interactions and letter reveals.
- We lazy-load Motion One before using it to keep the initial bundle small.

Barba.js (SPA bridge)
- Barba is traditionally designed for MPA navigation. In a React Router SPA, intercepting Link clicks will cause conflicts.
- We include an optional SPA bridge that initializes Barba and triggers its transitions around route changes, without taking over navigation. Keep it disabled by default.
- Enable cautiously by flipping `useBarbaTransitions({ enabled: true })` in App and validating there are no conflicts.

QA and Lighthouse
- Test matrix: Chrome, Safari, Firefox (desktop), iOS Safari, Android Chrome.
- Verify reduced-motion toggle disables all motion and prevents heavy lib loads.
- Scroll reveal and smooth scrolling remain 60 FPS; check DevTools performance panel.
- Lighthouse (desktop): run `npx lighthouse http://localhost:5173 --view --preset=desktop` and capture Performance/Accessibility/Best Practices/SEO. Target Performance ≥ 90 with motion enabled; ≥ 95 with motion disabled.
- Known tradeoffs: smooth scrolling slightly increases main-thread work; disabled automatically for reduced motion.
