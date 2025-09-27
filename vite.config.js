import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { readFileSync } from 'fs'

// Load VITE_GEMINI_API_KEY from key.env so you don't have to rename it.
// This does NOT expose the raw key anywhere in the source; it's injected at build-time only.
let GEMINI_FROM_KEY_ENV = ''
try {
  const txt = readFileSync('./key.env', 'utf-8')
  const m = txt.match(/^\s*VITE_GEMINI_API_KEY\s*=\s*(.+)\s*$/m)
  if (m && m[1]) {
    GEMINI_FROM_KEY_ENV = m[1].trim()
  }
} catch {}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(
      process.env.VITE_GEMINI_API_KEY || GEMINI_FROM_KEY_ENV || ''
    ),
  },
})
