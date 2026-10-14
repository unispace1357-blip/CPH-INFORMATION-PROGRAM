import { parseFacilityDataset } from './validateFacilityDataset.ts'
import type { FacilityDataset } from '../types/facility.ts'

/** Validated snapshot only. Source/caller data stays intact; private entries never reach the bundle. */
export function createPublicDataset(input: unknown): FacilityDataset {
  const dataset = parseFacilityDataset(input)
  return { ...dataset, facilities: dataset.facilities.filter(facility => facility.isPublished) }
}
