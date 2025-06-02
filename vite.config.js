import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: './', // ✅ Ensures assets work with file:// in production
  plugins: [react()],
  root: 'src/renderer', // ✅ Points to your React source
  build: {
    outDir: '../../dist/renderer', // ✅ Matches your Electron build output
    emptyOutDir: true, // ✅ Ensures clean rebuild
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html'), // ✅ Main entry
    },
  },
})
