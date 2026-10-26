import { downloadArtifact } from '@electron/get'
import extract from 'extract-zip'
import { cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { buildPublicTest } from './build-public-test.ts'
import { createPublicDataset } from '../src/data/createPublicDataset.ts'
import { validatedNaverMapUrl } from '../src/services/naverMapUrl.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
const platform = process.argv.includes('--linux') ? 'linux' : 'win32'
const version = '44.7.2'
const output = join(root, 'release', platform === 'win32' ? 'CPH-Front-Desk-Public-Test-win-x64' : 'cph-linux-qa')
const temporary = await mkdtemp(join(tmpdir(), 'cph-desktop-build-'))
try {
  await buildPublicTest({ base: './', outDir: join(temporary, 'web') })
  // Independent local admin build. It is NOT copied to public GitHub Pages.
  // The admin bundle is packaged only inside the desktop runtime and is
  // accessible solely after main-process password verification.
  execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'admin:build', '--', '--base=./'], { cwd: root, stdio: 'inherit' })
  // @electron/get verifies the official release checksum; no custom mirrors or unsigned downloads.
  const archive = await downloadArtifact({ version, artifactName: 'electron', platform, arch: 'x64', cacheRoot: join(tmpdir(), 'cph-electron-cache') })
  await rm(output, { recursive: true, force: true })
  await mkdir(output, { recursive: true })
  await extract(archive, { dir: resolve(output) })
  const appRoot = join(output, 'resources', 'app')
  await mkdir(appRoot, { recursive: true })
  await cp(join(temporary, 'web'), join(appRoot, 'web'), { recursive: true })
  await cp(join(root, 'dist-admin'), join(appRoot, 'admin'), { recursive: true })
  await cp(join(root, 'desktop', 'main.cjs'), join(appRoot, 'main.cjs'))
  await cp(join(root, 'desktop', 'admin-auth.cjs'), join(appRoot, 'admin-auth.cjs'))
  await cp(join(root, 'desktop', 'staff-preload.cjs'), join(appRoot, 'staff-preload.cjs'))
  await writeFile(join(appRoot, 'package.json'), JSON.stringify({ name: 'cph-front-desk-public-test', version: '0.0.0', main: 'main.cjs' }))
  const facilities = createPublicDataset(JSON.parse(await readFile(join(root, 'src/data/facilities.json'), 'utf8')))
  await writeFile(join(appRoot, 'map-links.json'), JSON.stringify(facilities.facilities.map(item => validatedNaverMapUrl(item.naverMapUrl)).filter(Boolean)))
  await rm(join(output, 'resources', 'default_app.asar'), { force: true })
  if (platform === 'win32') {
    await rename(join(output, 'electron.exe'), join(output, 'CPH-Front-Desk.exe'))
    if (process.argv.includes('--directory-only')) {
      // upload-artifact creates the single downloadable ZIP directly from this folder.
      console.log(`PASS: Windows portable EXE/runtime prepared for artifact ZIP: ${output}`)
    } else {
      const zip = output + '.zip'
      await rm(zip, { force: true })
      if (process.platform === 'win32') {
        execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "Compress-Archive -Path (Join-Path $env:CPH_DESKTOP_OUTPUT '*') -DestinationPath $env:CPH_DESKTOP_ZIP -CompressionLevel Optimal"], { stdio: 'inherit', env: { ...process.env, CPH_DESKTOP_OUTPUT: output, CPH_DESKTOP_ZIP: zip } })
      } else {
        execFileSync('zip', ['-q', '-r', zip, '.'], { cwd: output, stdio: 'inherit' })
      }
      console.log(`PASS: Windows 10/11 x64 portable ZIP (Electron ${version}) created: ${zip}`)
    }
  } else console.log(`Linux-only runtime QA package: ${output}`)
} finally { await rm(temporary, { recursive: true, force: true }) }
