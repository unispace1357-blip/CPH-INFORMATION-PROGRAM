import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from './frontdesk-scripts.schema.json' with { type: 'json' }
import type { FrontdeskScriptDataset } from '../types/frontdeskScript.ts'

const ajv = new Ajv({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile<FrontdeskScriptDataset>(schema)

/** Validates a clone: never mutate caller data or silently mark a script approved. */
export function parseFrontdeskScriptDataset(value: unknown): FrontdeskScriptDataset {
  const data = structuredClone(value)
  if (!validate(data)) throw new Error(`Invalid frontdesk scripts: ${ajv.errorsText(validate.errors)}`)

  const ids = new Set<string>()
  for (const script of data.scripts) {
    if (ids.has(script.id)) throw new Error(`Duplicate frontdesk script ID: ${script.id}`)
    ids.add(script.id)

    if (script.reviewStatus === 'approved' && script.lastVerifiedAt === null) {
      throw new Error(`Invalid frontdesk scripts: ${script.id} is approved without lastVerifiedAt`)
    }
    if (script.reviewStatus === 'draft' && script.lastVerifiedAt !== null) {
      throw new Error(`Invalid frontdesk scripts: ${script.id} is draft but has lastVerifiedAt`)
    }
    if (data.dataStatus === 'production' && script.reviewStatus !== 'approved') {
      throw new Error(`Invalid frontdesk scripts: ${script.id} requires review before production`)
    }
    const terms = new Set<string>()
    for (const keyword of script.keywords) {
      const normalized = keyword.normalize('NFC').trim().toLowerCase()
      if (terms.has(normalized)) {
        throw new Error(`Invalid frontdesk scripts: ${script.id} contains a duplicate keyword: ${keyword}`)
      }
      terms.add(normalized)
    }
  }
  return data
}
