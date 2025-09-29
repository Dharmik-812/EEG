import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { Toaster, toast } from 'react-hot-toast'
import { useLogStore } from './store/logStore'
import { registerAllPresets } from './animations/presets'
import { useRipple } from './animations'

// Register presets once on startup (no-op if re-imported)
try { registerAllPresets() } catch {}

// Register service worker in production with robust update flow
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      // If there's an updated SW waiting, activate it immediately
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      // Listen for new updates and activate as soon as installed
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })
    }).catch(() => {/* noop */})

    // When the active SW changes, reload to get the fresh app
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Avoid reload loops
      if (!window.__reloadingForSW) {
        window.__reloadingForSW = true
        window.location.reload()
      }
    })
  })
}

// Global accessibility: aria-live region for in-game toasts/messages
try {
  const existing = document.getElementById('aria-live-toasts')
  if (!existing) {
    const live = document.createElement('div')
    live.id = 'aria-live-toasts'
    live.setAttribute('role', 'status')
    live.setAttribute('aria-live', 'polite')
    live.style.position = 'fixed'
    live.style.inset = '0 0 auto 0'
    live.style.height = '1px'
    live.style.overflow = 'hidden'
    live.style.clip = 'rect(1px, 1px, 1px, 1px)'
    live.style.whiteSpace = 'nowrap'
    document.addEventListener('DOMContentLoaded', () => {
      try { document.body.appendChild(live) } catch {}
    })
  }
} catch {}

// Global runtime error hooks to surface issues
function formatReason(reason) {
  try {
    if (!reason) return 'Unknown error'
    if (typeof reason === 'string') return reason
    if (reason instanceof Error) return reason.message || reason.toString()
    if (typeof reason === 'object') {
      if (reason.message) return reason.message
      return JSON.stringify(reason)
    }
    return String(reason)
  } catch {
    return 'Unknown error'
  }
}

window.addEventListener('error', (e) => {
  const msg = e?.message ? String(e.message) : 'Unknown error'
  try { useLogStore.getState().add(`Error: ${msg}`) } catch {}
  try { toast.error(msg) } catch {}
})
window.addEventListener('unhandledrejection', (e) => {
  const msg = formatReason(e?.reason)
  try { useLogStore.getState().add(`Unhandled: ${msg}`) } catch {}
  try { toast.error(`Unhandled: ${msg}`) } catch {}
})

function Root() {
  // Globally enable ripple on elements with [data-ripple]
  useRipple()
  return (
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#e2e8f0' } }} />
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
