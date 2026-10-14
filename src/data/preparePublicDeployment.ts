import { parseFacilityDataset } from './validateFacilityDataset.ts'
import { parseHotelDataset } from './validateHotelDataset.ts'
import { validateProductionData } from './validateProductionData.ts'
import { createPublicDataset } from './createPublicDataset.ts'

export function preparePublicDeployment(facilityInput: unknown, hotelInput: unknown, today?: string) {
  const facilities = createPublicDataset(parseFacilityDataset(facilityInput))
  const hotel = parseHotelDataset(hotelInput)
  // Full input validates structurally before filtering; production rules inspect the published snapshot.
  return validateProductionData(facilities, hotel, today)
}
