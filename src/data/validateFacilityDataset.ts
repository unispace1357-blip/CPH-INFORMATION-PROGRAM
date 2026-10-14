import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from './facilities.schema.json' with { type: 'json' }
import type { FacilityDataset } from '../types/facility.ts'

const ajv = new Ajv({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile<FacilityDataset>(schema)

/** Local validation only: no network requests or data persistence. */
export function parseFacilityDataset(value: unknown): FacilityDataset {
  if (!validate(value)) {
    throw new Error(`Invalid facility dataset: ${ajv.errorsText(validate.errors)}`)
  }

  const ids = new Set<string>()
  for (const facility of value.facilities) {
    if (ids.has(facility.id)) {
      throw new Error(`Duplicate facility ID: ${facility.id}`)
    }
    ids.add(facility.id)
  }
  return value
}
