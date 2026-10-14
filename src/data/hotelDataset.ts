import rawHotel from './hotel.json' with { type: 'json' }
import { parseHotelDataset } from './validateHotelDataset.ts'

export const hotelDataset = parseHotelDataset(rawHotel)
