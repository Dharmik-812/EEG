import { useEffect } from 'react'

// Lightweight hook to safely use GSAP if present
export function useGSAP(callback, deps = []) {
    useEffect(() => {
        let isCancelled = false

        async function run() {
            try {
                const mod = await import('gsap')
                const gsap = mod?.gsap || mod?.default || mod
                if (!isCancelled && gsap && typeof callback === 'function') {
                    callback(gsap)
                }
            } catch (err) {
                // If gsap isn't installed, silently skip to avoid breaking the app
                // console.warn('GSAP not available:', err)
                if (!isCancelled && typeof callback === 'function') {
                    // Provide a tiny shim with no-op timeline to avoid crashes if code expects it
                    const noop = () => ({ fromTo: () => ({ to: noop, call: noop }), to: noop, call: noop, timeline: () => ({ to: noop, fromTo: noop, call: noop }) })
                    const gsapShim = { timeline: () => ({ to: noop, fromTo: noop, call: noop }) }
                    try { callback(gsapShim) } catch { }
                }
            }
        }

        run()
        return () => { isCancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}


