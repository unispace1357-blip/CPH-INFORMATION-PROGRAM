import { realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, relative, isAbsolute, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
export const PRODUCTION_OUTPUT = resolve(root, 'dist-production')

function within(directory: string, path: string): boolean {
  const rel = relative(directory, path)
  return rel !== '' && !rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel)
}

/** Only the fixed release output or a dedicated temporary test child can be cleaned. */
export async function cleanProductionOutput(outDir = PRODUCTION_OUTPUT): Promise<void> {
  const destination = resolve(outDir)
  if (destination !== PRODUCTION_OUTPUT) {
    const temporary = await realpath(tmpdir())
    const parent = await realpath(dirname(destination))
    if (!within(temporary, parent) || within(root, destination)) throw new Error('Refusing to clean an unsafe production output path')
  }
  await rm(destination, { recursive: true, force: true })
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await cleanProductionOutput(); console.log('Previous dist-production cleared before preflight.') }
  catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 }
}
