import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { Toaster, toast } from 'react-hot-toast'
import { useLogStore } from './store/logStore'
import { registerAllPresets } from './animations/presets'

// Register presets once on startup (no-op if re-imported)
try { registerAllPresets() } catch {}

// Register service worker in production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {/* noop */})
  })
}

// Global runtime error hooks to surface issues
window.addEventListener('error', (e) => {
  try { useLogStore.getState().add(`Error: ${e.message}`) } catch {}
  try { toast.error(e.message) } catch {}
})
window.addEventListener('unhandledrejection', (e) => {
  try { useLogStore.getState().add(`Unhandled: ${e.reason?.message || e.reason}`) } catch {}
  try { toast.error(`Unhandled: ${e.reason?.message || e.reason}`) } catch {}
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#e2e8f0' } }} />
    </BrowserRouter>
  </React.StrictMode>
)
