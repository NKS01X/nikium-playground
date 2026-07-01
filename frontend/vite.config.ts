import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['nikium-wasm'],
  },
  server: {
    proxy: {
      '/run': 'http://localhost:8080',
    },
  },
})
