import type { FacilityDataset } from '../types/facility.ts'

/** Defer module validation so Staff can show an error without crashing Guest. */
export async function loadStaffDataset(
  load: () => Promise<{ facilityDataset: FacilityDataset }> = () => import('../data/facilityDataset.ts'),
): Promise<FacilityDataset> {
  const { facilityDataset } = await load()
  return facilityDataset
}
