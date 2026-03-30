import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/treasury_webapp/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          table: ['react-window', 'react-virtualized-auto-sizer'],
          utils: ['idb', 'date-fns'],
        },
      },
    },
  },
})
