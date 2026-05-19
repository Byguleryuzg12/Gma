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
          if (id.endsWith('/src/data/i18n.js') || id.endsWith('\\src\\data\\i18n.js')) {
            return 'gma-i18n';
          }
          if (id.includes('/src/data/') || id.includes('\\src\\data\\')) {
            return 'gma-market-data';
          }
        }
      }
    }
  }
})
