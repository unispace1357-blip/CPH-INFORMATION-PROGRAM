import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, normalizePath } from 'vite'
import { createPublicDataset } from './src/data/createPublicDataset.ts'
import { parseHotelDataset } from './src/data/validateHotelDataset.ts'

const root = fileURLToPath(new URL('.', import.meta.url))
export default defineConfig(({mode}) => {
  const publicDemo = mode === 'public-test-admin'
  const snapshots = new Map<string,string>()
  if(publicDemo){
    const directory=process.env.CPH_PUBLIC_TEST_DATA_DIR
    if(!directory)throw new Error('Web DEMO admin requires filtered public-test snapshot data.')
    const facilities=createPublicDataset(JSON.parse(readFileSync(resolve(directory,'facilities.json'),'utf8')))
    const hotel=parseHotelDataset(JSON.parse(readFileSync(resolve(directory,'hotel.json'),'utf8')))
    if(facilities.dataStatus!=='demo'||hotel.dataStatus!=='demo')
      throw new Error('Web DEMO admin cannot bundle PRODUCTION status')
    // Never package full unpublished/private facility records in a public demo editor.
    snapshots.set(normalizePath(resolve(root,'src/data/facilities.json')),JSON.stringify(facilities))
    snapshots.set(normalizePath(resolve(root,'src/data/hotel.json')),JSON.stringify(hotel))
  }
  return {
    root: fileURLToPath(new URL('./tools/admin', import.meta.url)),
    publicDir: false,
    // Keep concurrent public/admin dev servers from replacing each other's optimized dependencies.
    cacheDir: fileURLToPath(new URL('./node_modules/.vite-admin', import.meta.url)),
    plugins: [
      {
        name:'cph-filtered-web-demo-admin',
        enforce:'pre' as const,
        load(id:string){return snapshots.get(normalizePath(id.split('?')[0]!))??null},
      },
      react(),
    ],
    server: { host:'127.0.0.1',port:5190,strictPort:true },
    build: {outDir:fileURLToPath(new URL('./dist-admin',import.meta.url)),emptyOutDir:true},
  }
})
