// electron.vite.config.js
import { defineConfig } from 'vite'
import { join } from 'path'
import fs from 'fs'

function copyPreloadPlugin() {
  return {
    name: 'copy-preload-plugin',
    closeBundle() {
      try {
        // ✅ Copy preload.js
        const srcPreload = join(__dirname, 'src/main/preload.js')
        const destPreload = join(__dirname, 'dist/main/preload.js')
        fs.copyFileSync(srcPreload, destPreload)
        console.log('✅ preload.js copied to dist/main')

        // ✅ Copy handler files
        const srcHandlers = join(__dirname, 'src/main/handlers')
        const destHandlers = join(__dirname, 'dist/main/handlers')
        fs.mkdirSync(destHandlers, { recursive: true })
        for (const file of fs.readdirSync(srcHandlers)) {
          if (file.endsWith('.js')) {
            fs.copyFileSync(join(srcHandlers, file), join(destHandlers, file))
          }
        }
        console.log('✅ Handler files copied to dist/main/handlers')

        // ✅ Copy db.js and userModel.js
        const srcDb = join(__dirname, 'src/main/db.js')
        const destDb = join(__dirname, 'dist/main/db.js')
        fs.copyFileSync(srcDb, destDb)

        const dbDir = join(__dirname, 'dist/main/db')
        fs.mkdirSync(dbDir, { recursive: true })
        const srcUserModel = join(__dirname, 'src/main/db/userModel.js')
        const destUserModel = join(dbDir, 'userModel.js')
        fs.copyFileSync(srcUserModel, destUserModel)

        console.log('✅ db.js and userModel.js copied to dist/main and dist/main/db')
      } catch (err) {
        console.error('❌ Failed to copy preload, handlers, or db files:', err)
      }
    }
  }
}

export default defineConfig({
  plugins: [copyPreloadPlugin()],
  build: {
    outDir: 'dist/main',
    emptyOutDir: false, // keep renderer output
    lib: {
      entry: 'src/main/main.js',
      formats: ['cjs'],
      fileName: () => '[name].js'
    },
    rollupOptions: {
      external: ['electron', 'path', 'fs', 'url']
    }
  }
})
