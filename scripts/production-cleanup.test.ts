import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import { cleanProductionOutput, PRODUCTION_OUTPUT } from './clean-production.ts'
import { buildProduction } from './build-production.ts'
import { adminFacilities, adminHotel } from './admin-test-fixtures.ts'

test('failed demo preflight removes old release files before producing anything new', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cph-cleanup-test-'))
  try {
    const outDir = join(directory, 'output'), facilitiesFile = join(directory, 'facilities.json'), hotelFile = join(directory, 'hotel.json')
    await mkdir(join(outDir, 'assets'), { recursive: true }); await writeFile(join(outDir, 'assets/old.js'), 'STALE_RELEASE_SENTINEL')
    await writeFile(facilitiesFile, JSON.stringify(adminFacilities())); await writeFile(hotelFile, JSON.stringify(adminHotel()))
    await assert.rejects(() => buildProduction({ facilitiesFile, hotelFile, outDir }), /dataStatus/)
    await assert.rejects(() => readdir(outDir), { code: 'ENOENT' })
  } finally { await rm(directory, { recursive: true, force: true }) }
})
test('missing or malformed source JSON also leaves no old release output', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cph-source-error-test-'))
  try {
    const outDir = join(directory, 'output'), source = join(directory, 'bad.json')
    await mkdir(outDir); await writeFile(join(outDir, 'index.html'), 'OLD_RELEASE'); await writeFile(source, '{')
    await assert.rejects(() => buildProduction({ outDir, facilitiesFile: source }))
    await assert.rejects(() => readdir(outDir), { code: 'ENOENT' })
    await mkdir(outDir); await writeFile(join(outDir, 'index.html'), 'OLD_RELEASE')
    await assert.rejects(() => buildProduction({ outDir, facilitiesFile: join(directory, 'missing.json') }), { code: 'ENOENT' })
    await assert.rejects(() => readdir(outDir), { code: 'ENOENT' })
  } finally { await rm(directory, { recursive: true, force: true }) }
})
test('cleanup refuses source/checkout/system-temp roots and never changes original data', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url)), data = fileURLToPath(new URL('../src/data', import.meta.url)), source = new URL('../src/data/hotel.json', import.meta.url)
  const original = await readFile(source)
  for (const path of [root, data, tmpdir()]) await assert.rejects(() => cleanProductionOutput(path))
  assert.deepEqual(await readFile(source), original)
})
test('actual npm production command clears stale default output before its expected demo validation failure', { timeout: 60000 }, async () => {
  assert.ok(process.env.npm_execpath, 'Run this suite with npm run test to exercise the npm command')
  await mkdir(join(PRODUCTION_OUTPUT, 'assets'), { recursive: true })
  await writeFile(join(PRODUCTION_OUTPUT, 'assets/old-release.js'), 'STALE_PRODUCTION_TEST_SENTINEL')
  try {
    await assert.rejects(() => promisify(execFile)(process.execPath, [process.env.npm_execpath!, 'run', 'build:production'], { cwd: fileURLToPath(new URL('../', import.meta.url)) }), (error: any) => error.code === 1 && error.stdout.includes('Previous dist-production cleared before preflight.') && error.stderr.includes('dataStatus must be production'))
    await assert.rejects(() => readdir(PRODUCTION_OUTPUT), { code: 'ENOENT' })
  } finally { await cleanProductionOutput() }
})
