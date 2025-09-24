# Animation System Guide

This document describes the unified animation system integrated into the app: Framer Motion, GSAP (+ ScrollTrigger), Anime.js, and Lenis. Barba.js is provided as an optional experiment (disabled by default due to SPA constraints).

Contents
- Philosophy and goals
- Architecture
- Presets & hooks
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

Adding new presets
1. Create a new file under src/animations/presets/<name>.ts and register with animationManager.register('yourName', ...).
2. Export and re-export via src/animations/index.ts.
3. Use with useFramerPreset('yourName') or your GSAP hook.

QA and Lighthouse
- Test matrix: Chrome, Safari, Firefox (desktop), iOS Safari, Android Chrome.
- Verify reduced-motion toggle disables all motion and prevents heavy lib loads.
- Scroll reveal and smooth scrolling remain 60 FPS; check DevTools performance panel.
- Lighthouse (desktop): run `npx lighthouse http://localhost:5173 --view --preset=desktop` and capture Performance/Accessibility/Best Practices/SEO. Target Performance ≥ 90 with motion enabled; ≥ 95 with motion disabled.
- Known tradeoffs: smooth scrolling slightly increases main-thread work; disabled automatically for reduced motion.
