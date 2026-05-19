import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          if (id.endsWith('/src/allComponents.js') || id.endsWith('\\src\\allComponents.js')) {
            return 'gma-core';
          }
        }
      }
    }
  }
})
