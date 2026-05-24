import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://72.61.229.236',
        changeOrigin: true,
        headers: {
          'Origin': 'https://admin.townsgenie.in',
          'Referer': 'https://admin.townsgenie.in/'
        }
      }
    }
  }
})
