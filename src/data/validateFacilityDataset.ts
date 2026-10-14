import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from './facilities.schema.json' with { type: 'json' }
import type { FacilityDataset } from '../types/facility.ts'
import { naverMapUrlError } from '../services/naverMapUrl.ts'

// Defaults upgrade older STEP 02 files without modifying the caller's data.
const ajv = new Ajv({ allErrors: true, strict: true, useDefaults: true })
addFormats(ajv)
const validate = ajv.compile<FacilityDataset>(schema)

/** Local validation only: no network requests or data persistence. */
export function parseFacilityDataset(value: unknown): FacilityDataset {
  const data = structuredClone(value)
  if (!validate(data)) {
    throw new Error(`Invalid facility dataset: ${ajv.errorsText(validate.errors)}`)
  }

  const ids = new Set<string>()
  for (const facility of data.facilities) {
    if (ids.has(facility.id)) {
      throw new Error(`Duplicate facility ID: ${facility.id}`)
    }
    ids.add(facility.id)
    const urlError = naverMapUrlError(facility.naverMapUrl)
    if (urlError) throw new Error(`Invalid facility dataset: ${facility.id}.naverMapUrl: ${urlError}`)
  }
  return data
}
