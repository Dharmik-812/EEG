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

// Register service worker in production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {/* noop */})
  })
}

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
