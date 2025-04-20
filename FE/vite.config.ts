import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '5ffb-2a09-bac5-d5cf-2646-00-3d0-42.ngrok-free.app',
    ],
  },
  css: {
    postcss: './postcss.config.js'
  }
})