import type { FacilityDataset } from '../types/facility.ts'

/** Defer module validation so Staff can show an error without crashing Guest. */
export async function loadStaffDataset(
  load: () => Promise<{ facilityDataset: FacilityDataset }> = () => import('../data/index.ts'),
): Promise<FacilityDataset> {
  const { facilityDataset } = await load()
  return facilityDataset
}
