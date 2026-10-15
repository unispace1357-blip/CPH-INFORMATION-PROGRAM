import { mkdtemp, readFile, writeFile, mkdir, rm, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join, relative, isAbsolute, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPublicDataset } from '../src/data/createPublicDataset.ts'
import { parseHotelDataset } from '../src/data/validateHotelDataset.ts'
import { assertNoAdminAssets } from './build-production.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
export const PUBLIC_TEST_OUTPUT = resolve(root, 'dist-public-test')

/** Explicit, separately labelled DEMO build; never invokes or relaxes production validation. */
export async function buildPublicTest(options: { facilitiesFile?: string; hotelFile?: string; outDir?: string; base?: string } = {}): Promise<void> {
  const outDir = resolve(options.outDir ?? PUBLIC_TEST_OUTPUT)
  if (outDir !== PUBLIC_TEST_OUTPUT) {
    const rel = relative(await realpath(tmpdir()), await realpath(dirname(outDir)))
    if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error('Unsafe public test output directory')
  }
  const base = options.base ?? process.env.CPH_TEST_BASE_PATH ?? '/CPH-INFORMATION-PROGRAM/'
  if (base !== './' && !/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('Use ./ or an absolute directory path for the public test base')
  await rm(outDir, { recursive: true, force: true })
  const directory = await mkdtemp(join(tmpdir(), 'cph-demo-snapshot-'))
  const previous = process.env.CPH_PUBLIC_TEST_DATA_DIR
  try {
    const facilities = createPublicDataset(JSON.parse(await readFile(options.facilitiesFile ?? join(root, 'src/data/facilities.json'), 'utf8')))
    const hotel = parseHotelDataset(JSON.parse(await readFile(options.hotelFile ?? join(root, 'src/data/hotel.json'), 'utf8')))
    if (facilities.dataStatus !== 'demo' || hotel.dataStatus !== 'demo') throw new Error('Public test builds require both datasets to remain demo.')
    await writeFile(join(directory, 'facilities.json'), JSON.stringify(facilities))
    await writeFile(join(directory, 'hotel.json'), JSON.stringify(hotel))
    process.env.CPH_PUBLIC_TEST_DATA_DIR = directory
    const { build } = await import('vite')
    await build({ root, configFile: join(root, 'vite.config.ts'), mode: 'public-test', base, build: { outDir, emptyOutDir: true, sourcemap: false } })
    for (const route of ['staff', 'guest']) {
      await mkdir(join(outDir, route))
      await writeFile(join(outDir, route, 'index.html'), `<!doctype html><meta charset="utf-8"><title>CPH Public Test</title><script>location.replace(new URL('../#/${route}',location.href).href)</script>`)
    }
    const basePath = base === './' ? '/' : base
    await writeFile(join(outDir, '404.html'), `<!doctype html><meta charset="utf-8"><title>CPH Public Test</title><script>const base=${JSON.stringify(basePath)};const route=location.pathname.startsWith(base)?location.pathname.slice(base.length):'not-found';location.replace(base+'#/'+route+location.search)</script>`)
    await writeFile(join(outDir, '.nojekyll'), '')
    await assertNoAdminAssets(outDir)
    console.log(`PASS: explicit public test DEMO build (${facilities.facilities.length} facilities); local admin excluded; production gate unchanged`)
  } catch (error) {
    await rm(outDir, { recursive: true, force: true })
    throw error
  } finally {
    if (previous === undefined) delete process.env.CPH_PUBLIC_TEST_DATA_DIR
    else process.env.CPH_PUBLIC_TEST_DATA_DIR = previous
    await rm(directory, { recursive: true, force: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await buildPublicTest() }
  catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 }
}
