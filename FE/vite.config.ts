import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '7c63-2a09-bac5-d5ce-16dc-00-247-fa.ngrok-free.app',
    ],
  },
  css: {
    postcss: './postcss.config.js'
  }
})