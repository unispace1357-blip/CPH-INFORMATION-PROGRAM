import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPublicDataset } from '../src/data/createPublicDataset.ts'
import { preparePublicDeployment } from '../src/data/preparePublicDeployment.ts'
import { buildProduction, assertNoAdminAssets } from './build-production.ts'
import { buildPublicTest } from './build-public-test.ts'
import { adminFacilities, adminHotel, publicationFixtures } from './admin-test-fixtures.ts'

test('public snapshots exclude private fields without changing full data', () => {
  const { facilities, hotel, privateTokens } = publicationFixtures(), before = structuredClone(facilities)
  const prepared = preparePublicDeployment(facilities, hotel)
  assert.equal(prepared.facilities.facilities.length, 1)
  for (const token of privateTokens) assert.equal(JSON.stringify(prepared).includes(token), false)
  assert.deepEqual(facilities, before)
})
test('invalid hidden data is structurally rejected before filtering', () => {
  const { facilities } = publicationFixtures(); facilities.facilities[1]!.category = 'invalid' as typeof facilities.facilities[1]['category']
  assert.throws(() => createPublicDataset(facilities))
})
test('demo, missing required fields and future dates still block public deployment snapshots', () => {
  assert.throws(() => preparePublicDeployment(adminFacilities(), adminHotel()), /dataStatus/)
  const { facilities, hotel } = publicationFixtures(); facilities.facilities[0]!.translations.en.address = ''
  assert.throws(() => preparePublicDeployment(facilities, hotel), /address/)
  facilities.facilities[0]!.translations.en.address = 'Fictional QA'; hotel.lastVerifiedAt = '2099-01-01'
  assert.throws(() => preparePublicDeployment(facilities, hotel), /future/)
})
test('actual Vite customer build contains public fixture and no private tokens/admin HTML/code/assets; source files untouched', { timeout: 60000 }, async () => {
  const { facilities, hotel, privateTokens } = publicationFixtures()
  const directory = await mkdtemp(join(tmpdir(), 'cph-public-build-test-'))
  const originalFacilities = await readFile(new URL('../src/data/facilities.json', import.meta.url)), originalHotel = await readFile(new URL('../src/data/hotel.json', import.meta.url))
  async function texts(path: string): Promise<string[]> {
    const result: string[] = []
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (entry.isDirectory()) result.push(...await texts(join(path, entry.name)))
      else if (/\.(js|json|html|css|map)$/.test(entry.name)) result.push(await readFile(join(path, entry.name), 'utf8'))
    }
    return result
  }
  try {
    const facilitiesFile = join(directory, 'facilities.json'), hotelFile = join(directory, 'hotel.json'), outDir = join(directory, 'output')
    await writeFile(facilitiesFile, JSON.stringify(facilities)); await writeFile(hotelFile, JSON.stringify(hotel))
    await buildProduction({ facilitiesFile, hotelFile, outDir })
    const output = (await texts(outDir)).join('\n')
    assert.ok(output.includes('CPH_PUBLIC_QA_')); assert.ok(output.includes('CPH_HOTEL_QA_'))
    for (const token of privateTokens) assert.equal(output.includes(token), false, `Leaked private fixture: ${token}`)
    assert.equal(output.includes('CPH_LOCAL_ADMIN_ONLY'), false); assert.equal(output.includes('CPH ADMIN MANAGER'), false)
    assert.ok(!(await readdir(outDir)).includes('admin')); await assertNoAdminAssets(outDir)
    assert.deepEqual(await readFile(new URL('../src/data/facilities.json', import.meta.url)), originalFacilities); assert.deepEqual(await readFile(new URL('../src/data/hotel.json', import.meta.url)), originalHotel)
  } finally { await rm(directory, { recursive: true, force: true }) }
})
test('failed customer preparation produces no bundle', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cph-failed-build-test-'))
  try {
    const facilitiesFile = join(directory, 'facilities.json'), hotelFile = join(directory, 'hotel.json'), outDir = join(directory, 'output')
    await writeFile(facilitiesFile, JSON.stringify(adminFacilities())); await writeFile(hotelFile, JSON.stringify(adminHotel()))
    await assert.rejects(() => buildProduction({ facilitiesFile, hotelFile, outDir }), /dataStatus/)
    await assert.rejects(() => readdir(outDir), { code: 'ENOENT' })
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test('resolved admin config has a separate root/cache and loopback binding for concurrent public/admin development', async () => {
  const { resolveConfig } = await import('vite')
  const publicConfig = await resolveConfig({ configFile: fileURLToPath(new URL('../vite.config.ts', import.meta.url)) }, 'serve')
  const adminConfig = await resolveConfig({ configFile: fileURLToPath(new URL('../vite.admin.config.ts', import.meta.url)) }, 'serve')
  assert.notEqual(adminConfig.root, publicConfig.root)
  assert.notEqual(adminConfig.cacheDir, publicConfig.cacheDir)
  assert.equal(adminConfig.server.host, '127.0.0.1')
  // Vite resolves publicDir:false to an empty path; it must not copy the public site's assets.
  assert.equal(adminConfig.publicDir, '')
})

test('explicit DEMO test build supports subpaths, excludes private/admin data, preserves source and never replaces production gating', { timeout: 60000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cph-demo-build-test-'))
  const fixture = publicationFixtures()
  fixture.facilities.dataStatus = 'demo'; fixture.hotel.dataStatus = 'demo'
  const facilitiesFile = join(directory, 'facilities.json'), hotelFile = join(directory, 'hotel.json'), outDir = join(directory, 'output')
  const originalFacilities = await readFile(new URL('../src/data/facilities.json', import.meta.url)), originalHotel = await readFile(new URL('../src/data/hotel.json', import.meta.url))
  async function outputText(path: string): Promise<string> {
    const entries = await readdir(path, { withFileTypes: true })
    return (await Promise.all(entries.map(async entry => entry.isDirectory() ? outputText(join(path, entry.name)) : /\.(js|html|css|json)$/.test(entry.name) ? readFile(join(path, entry.name), 'utf8') : ''))).join('\n')
  }
  try {
    await writeFile(facilitiesFile, JSON.stringify(fixture.facilities)); await writeFile(hotelFile, JSON.stringify(fixture.hotel))
    await buildPublicTest({ facilitiesFile, hotelFile, outDir, base: '/CPH-INFORMATION-PROGRAM/' })
    const text = await outputText(outDir)
    for (const token of fixture.privateTokens) assert.equal(text.includes(token), false, token)
    assert.ok(text.includes('CPH_PUBLIC_QA_')); assert.ok(text.includes('프론트 통합 안내 시스템')); assert.ok(text.includes('© 2026 Antonio.'))
    assert.match(await readFile(join(outDir, 'index.html'), 'utf8'), /\/CPH-INFORMATION-PROGRAM\/assets\//)
    assert.ok((await readdir(outDir)).includes('hotel-logo.webp'), 'hotel logo must be bundled for public test')
    assert.match(await readFile(join(outDir, 'staff/index.html'), 'utf8'), /#\/staff/)
    assert.match(await readFile(join(outDir, 'guest/index.html'), 'utf8'), /#\/guest/)
    assert.match(await readFile(join(outDir, '404.html'), 'utf8'), /location.replace/)
    await assertNoAdminAssets(outDir)
    assert.throws(() => preparePublicDeployment(fixture.facilities, fixture.hotel), /dataStatus/)
    assert.deepEqual(await readFile(new URL('../src/data/facilities.json', import.meta.url)), originalFacilities)
    assert.deepEqual(await readFile(new URL('../src/data/hotel.json', import.meta.url)), originalHotel)
    fixture.facilities.dataStatus = 'production'
    await writeFile(facilitiesFile, JSON.stringify(fixture.facilities))
    await assert.rejects(() => buildPublicTest({ facilitiesFile, hotelFile, outDir }), /remain demo/)
    await assert.rejects(() => readdir(outDir), { code: 'ENOENT' })
  } finally { await rm(directory, { recursive: true, force: true }) }
})
