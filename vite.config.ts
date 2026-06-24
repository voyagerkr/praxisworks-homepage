import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works both at a custom-domain root
  // (dev.praxisworks.dev) and under a project subpath (GitHub Pages preview).
  base: './',
  plugins: [react()],
})
