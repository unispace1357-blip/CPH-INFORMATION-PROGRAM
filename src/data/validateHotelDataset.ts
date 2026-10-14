import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from './hotel.schema.json' with { type: 'json' }
import type { HotelDataset } from '../types/hotel.ts'

const ajv = new Ajv({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile<HotelDataset>(schema)

export function parseHotelDataset(value: unknown): HotelDataset {
  const data = structuredClone(value)
  if (!validate(data)) {
    throw new Error(`Invalid hotel dataset: ${ajv.errorsText(validate.errors)}`)
  }
  return data
}
