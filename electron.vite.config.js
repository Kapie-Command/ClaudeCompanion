import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: resolve(__dirname, 'electron/main.js')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: resolve(__dirname, 'electron/preload.js')
      }
    }
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: resolve(__dirname, 'index.html')
      }
    },
    plugins: [react()]
  }
})
