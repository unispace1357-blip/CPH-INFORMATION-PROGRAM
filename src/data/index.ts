import rawData from './facilities.json' with { type: 'json' }
import { parseFacilityDataset } from './validateFacilityDataset.ts'

/** Shared entry point for future Staff/Guest features. */
export const facilityDataset = parseFacilityDataset(rawData)
