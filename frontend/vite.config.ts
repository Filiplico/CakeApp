import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js makes the lazily loaded cake builder chunk about 600 kB; the rest of the site stays small.
    chunkSizeWarningLimit: 700,
  },
})
