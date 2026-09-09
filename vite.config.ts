import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Matches team-management-api's own dev port (see src/Api/Properties/launchSettings.json
      // in that repo — the "https" launch profile). Adjust VITE_API_BASE_URL in .env instead of
      // relying on this proxy in most cases.
      '/api': {
        target: 'https://localhost:7058',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
