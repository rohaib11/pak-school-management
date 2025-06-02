// vite.main.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist/main',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/main/main.js'),
      formats: ['cjs'], // Ensure CommonJS for Electron
    },
    rollupOptions: {
      external: [
        'electron', 'path', 'fs', 'better-sqlite3', 'nanoid',
        './handlers/studentHandlers',
        './handlers/teacherHandlers',
        './handlers/classHandlers',
        './handlers/subjectHandlers',
        './handlers/authHandlers',
        './handlers/feeAssignmentHandlers',
        './handlers/categoryHandlers',
        './handlers/userHandlers'
      ],
    },
    minify: false // Optional: disable minification for debugging
  }
});
