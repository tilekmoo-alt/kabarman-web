import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:3001' }
  },
  preview: {
    port: process.env.PORT || 4173,
    host: '0.0.0.0',
    allowedHosts: 'all'
  },
  build: {
    outDir: 'dist'
  }
})
