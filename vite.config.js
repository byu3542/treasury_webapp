import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/treasury_webapp/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
