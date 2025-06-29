import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'cesium': resolve(__dirname, 'node_modules/cesium')
    }
  },
  build: {
    chunkSizeWarningLimit: 2000, // Cesium is large, so increase the warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          cesium: ['cesium']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['cesium']
  },
  // Copy Cesium Assets, Widgets, and Workers to public directory
  server: {
    fs: {
      // Allow serving files from node_modules
      allow: ['..']
    }
  }
})
