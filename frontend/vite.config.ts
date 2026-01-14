import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // Automatically use next available port if 5173 is busy
    host: 'localhost', // Only localhost, no network access
  },
})
