import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

// Note: API keys are now handled securely on the server-side
// No need to expose them to the client anymore

// https://vite.dev/config/
export default defineConfig({
  root: '.',
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
  // Removed client-side API key exposure for security
  resolve: {
    alias: {
      '@': '/src',
    },
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
