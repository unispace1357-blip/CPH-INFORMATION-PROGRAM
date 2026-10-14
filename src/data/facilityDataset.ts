import rawData from './facilities.json' with { type: 'json' }
import { parseFacilityDataset } from './validateFacilityDataset.ts'

export const facilityDataset = parseFacilityDataset(rawData)
