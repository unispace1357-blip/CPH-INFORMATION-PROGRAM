import rawData from './facilities.json' with { type: 'json' }
import rawHotel from './hotel.json' with { type: 'json' }
import { parseFacilityDataset } from './validateFacilityDataset.ts'
import { parseHotelDataset } from './validateHotelDataset.ts'

/** Shared entry point for future Staff/Guest features. */
export const facilityDataset = parseFacilityDataset(rawData)
export const hotelDataset = parseHotelDataset(rawHotel)
