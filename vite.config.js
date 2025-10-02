import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { readFileSync } from 'fs'
import { visualizer } from 'rollup-plugin-visualizer'

// Load VITE_GEMINI_API_KEY from key.env so you don't have to rename it.
// This does NOT expose the raw key anywhere in the source; it's injected at build-time only.
let GEMINI_FROM_KEY_ENV = ''
try {
  const txt = readFileSync('./key.env', 'utf-8')
  const m = txt.match(/^\s*VITE_GEMINI_API_KEY\s*=\s*(.+)\s*$/m)
  if (m && m[1]) {
    GEMINI_FROM_KEY_ENV = m[1].trim()
    console.log('✅ Loaded API key from key.env file')
  } else {
    console.warn('⚠️ Could not find VITE_GEMINI_API_KEY in key.env file')
  }
} catch (error) {
  console.warn('⚠️ Could not read key.env file:', error.message)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Build analysis and bundle visualization
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // sunburst, treemap, network
    })
  ],
  define: {
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(
      process.env.VITE_GEMINI_API_KEY || GEMINI_FROM_KEY_ENV || ''
    ),
  },
  envPrefix: ['VITE_', 'GEMINI_'],
  server: {
    proxy: {
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, '')
      }
    }
  },
  build: {
    // Slightly relax the warning threshold after splitting heavy vendors
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const p = id.split('\\').join('/');
          if (p.includes('/node_modules/gsap')) return 'vendor_gsap'
          if (p.includes('/node_modules/anime')) return 'vendor_anime'
          if (p.includes('/node_modules/framer-motion')) return 'vendor_motion'
          if (p.includes('/node_modules/@supabase')) return 'vendor_supabase'
          if (p.includes('/node_modules/lucide-react')) return 'vendor_icons'
          if (p.includes('/node_modules/react')) return 'vendor_react'
          if (p.includes('/src/animations')) return 'animations'
        }
      }
    }
  }
})
