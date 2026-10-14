import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: fileURLToPath(new URL('./tools/admin', import.meta.url)),
  publicDir: false,
  // Keep concurrent public/admin dev servers from replacing each other's optimized dependencies.
  cacheDir: fileURLToPath(new URL('./node_modules/.vite-admin', import.meta.url)),
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5190, strictPort: true },
  build: { outDir: fileURLToPath(new URL('./dist-admin', import.meta.url)), emptyOutDir: true },
})
