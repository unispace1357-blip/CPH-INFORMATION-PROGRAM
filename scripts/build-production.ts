import { mkdtemp, readFile, writeFile, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { preparePublicDeployment } from '../src/data/preparePublicDeployment.ts'

const root = fileURLToPath(new URL('../', import.meta.url))

export async function assertNoAdminAssets(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await assertNoAdminAssets(path)
    else if (/\.(?:js|json|html|css|map)$/i.test(entry.name)) {
      const text = await readFile(path, 'utf8')
      if (/CPH_LOCAL_ADMIN_ONLY|CPH ADMIN MANAGER|tools\/admin\/|admin-editor-panel/.test(text)) throw new Error(`Admin asset in public output: ${entry.name}`)
    }
  }
}

/** Cross-platform build. Generated snapshots live in a temporary directory, never src/data. */
export async function buildProduction(options: { facilitiesFile?: string; hotelFile?: string; outDir?: string } = {}): Promise<void> {
  const facilities = JSON.parse(await readFile(options.facilitiesFile ?? resolve(root, 'src/data/facilities.json'), 'utf8'))
  const hotel = JSON.parse(await readFile(options.hotelFile ?? resolve(root, 'src/data/hotel.json'), 'utf8'))
  const prepared = preparePublicDeployment(facilities, hotel)
  const directory = await mkdtemp(join(tmpdir(), 'cph-public-snapshot-'))
  const previous = process.env.CPH_PUBLIC_DATA_DIR
  const outDir = options.outDir ?? resolve(root, 'dist-production')
  try {
    await writeFile(join(directory, 'facilities.json'), JSON.stringify(prepared.facilities), 'utf8')
    await writeFile(join(directory, 'hotel.json'), JSON.stringify(prepared.hotel), 'utf8')
    process.env.CPH_PUBLIC_DATA_DIR = directory
    const { build } = await import('vite')
    await build({ root, configFile: resolve(root, 'vite.config.ts'), mode: 'customer-production', build: { outDir, emptyOutDir: true, sourcemap: false } })
    await assertNoAdminAssets(outDir)
  } catch (error) {
    await rm(outDir, { recursive: true, force: true })
    throw error
  } finally {
    if (previous === undefined) delete process.env.CPH_PUBLIC_DATA_DIR
    else process.env.CPH_PUBLIC_DATA_DIR = previous
    await rm(directory, { recursive: true, force: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await buildProduction() }
  catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 }
}
