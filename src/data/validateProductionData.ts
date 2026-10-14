import { GUIDE_LANGUAGES } from '../types/guide.ts'
import { parseFacilityDataset } from './validateFacilityDataset.ts'
import { parseHotelDataset } from './validateHotelDataset.ts'

const facilityTextFields = ['name', 'description', 'address', 'openingHours', 'directions'] as const
const hotelTextFields = ['name', 'description', 'address', 'checkIn', 'checkOut', 'breakfast', 'parking', 'roomUsage'] as const

/** Confirmation dates use the hotel's calendar day, not the build host's zone. */
function hotelToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
}

/** Deployment preflight only. Standard development validation still allows demo data. */
export function validateProductionData(facilityInput: unknown, hotelInput: unknown, today = hotelToday()) {
  const facilities = parseFacilityDataset(facilityInput)
  const hotel = parseHotelDataset(hotelInput)
  const errors: string[] = []
  if (facilities.dataStatus !== 'production') errors.push('Facilities dataStatus must be production')
  if (hotel.dataStatus !== 'production') errors.push('Hotel dataStatus must be production')
  if (errors.length) throw new Error(`Production validation failed: ${errors.join('; ')}`)

  function checkDate(date: string | null, label: string) {
    if (date === null) errors.push(`${label}.lastVerifiedAt is required`)
    else if (date > today) errors.push(`${label}.lastVerifiedAt cannot be in the future`)
  }

  for (const facility of facilities.facilities) {
    if (!facility.isPublished) continue
    checkDate(facility.lastVerifiedAt, facility.id)
    for (const language of GUIDE_LANGUAGES) {
      for (const field of facilityTextFields) {
        if (!facility.translations[language][field].trim()) {
          errors.push(`${facility.id}.translations.${language}.${field} is required`)
        }
      }
      if (!facility.closedDays[language].trim()) errors.push(`${facility.id}.closedDays.${language} is required`)
    }
  }

  checkDate(hotel.lastVerifiedAt, 'hotel')
  if (hotel.checkInTime === null) errors.push('hotel.checkInTime is required')
  if (hotel.checkOutTime === null) errors.push('hotel.checkOutTime is required')
  for (const language of GUIDE_LANGUAGES) {
    for (const field of hotelTextFields) {
      if (!hotel.translations[language][field].trim()) errors.push(`hotel.translations.${language}.${field} is required`)
    }
  }

  if (errors.length) throw new Error(`Production validation failed: ${errors.join('; ')}`)
  return { facilities, hotel }
}
