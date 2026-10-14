import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, normalizePath } from 'vite'
import { preparePublicDeployment } from './src/data/preparePublicDeployment.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const root = fileURLToPath(new URL('.', import.meta.url))
  const snapshots = new Map<string, string>()
  if (mode === 'customer-production') {
    const directory = process.env.CPH_PUBLIC_DATA_DIR
    if (!directory) throw new Error('Customer build requires a validated public snapshot. Use npm run build:production.')
    const prepared = preparePublicDeployment(JSON.parse(readFileSync(resolve(directory, 'facilities.json'), 'utf8')), JSON.parse(readFileSync(resolve(directory, 'hotel.json'), 'utf8')))
    snapshots.set(normalizePath(resolve(root, 'src/data/facilities.json')), JSON.stringify(prepared.facilities))
    snapshots.set(normalizePath(resolve(root, 'src/data/hotel.json')), JSON.stringify(prepared.hotel))
  }
  return {
    plugins: [
      {
        name: 'cph-public-build-boundary', enforce: 'pre',
        load(id) { return snapshots.get(normalizePath(id.split('?')[0]!)) ?? null },
        generateBundle(_options, bundle) {
          for (const item of Object.values(bundle)) {
            if (item.type === 'chunk' && Object.keys(item.modules).some(id => normalizePath(id).includes('/tools/admin/'))) {
              this.error('Local admin module cannot enter a public build.')
            }
          }
        },
      },
      react(),
    ],
  }
})
