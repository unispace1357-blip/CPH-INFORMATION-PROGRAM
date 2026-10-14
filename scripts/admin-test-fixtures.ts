import { testFacility } from './staff-test-fixtures.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import type { FacilityDataset } from '../src/types/facility.ts'
import type { HotelDataset } from '../src/types/hotel.ts'

/** Independent fictional inputs, never persisted to src/data. */
export function adminFacilities(): FacilityDataset {
  return { schemaVersion: 1, dataStatus: 'demo', facilities: [testFacility({ id: 'qa-admin-public' }), testFacility({ id: 'qa-admin-private', isPublished: false })] }
}
export function adminHotel(): HotelDataset {
  return { schemaVersion: 1, dataStatus: 'demo', lastVerifiedAt: null, checkInTime: null, checkOutTime: null, translations: Object.fromEntries(GUIDE_LANGUAGES.map(language => [language, { name: '', description: '', address: '', checkIn: '', checkOut: '', breakfast: '', parking: '', roomUsage: '', notes: '' }])) as HotelDataset['translations'] }
}
export function publicationFixtures() {
  const facilities = adminFacilities(), hotel = adminHotel()
  facilities.dataStatus = 'production'; hotel.dataStatus = 'production'
  const publicItem = facilities.facilities[0]!
  publicItem.lastVerifiedAt = '2024-02-29'
  for (const language of GUIDE_LANGUAGES) {
    for (const key of Object.keys(publicItem.translations[language]) as (keyof typeof publicItem.translations.ko)[]) publicItem.translations[language][key] = `CPH_PUBLIC_QA_${language}_${key} Fictional only`
    publicItem.closedDays[language] = `CPH_PUBLIC_QA_${language}_closure Fictional only`
  }
  const privateItem = facilities.facilities[1]!
  privateItem.id = 'cph-private-probe-7fe06'
  const privateTokens = [privateItem.id]
  for (const language of GUIDE_LANGUAGES) {
    for (const key of Object.keys(privateItem.translations[language]) as (keyof typeof privateItem.translations.ko)[]) {
      const token = `CPH_PRIVATE_PROBE_${language}_${key}_7FE06`
      privateItem.translations[language][key] = token; privateTokens.push(token)
    }
    privateItem.closedDays[language] = `CPH_PRIVATE_PROBE_${language}_closed_7FE06`
    privateItem.keywords[language] = [`CPH_PRIVATE_PROBE_${language}_keyword_7FE06`]
    privateTokens.push(privateItem.closedDays[language], ...privateItem.keywords[language])
  }
  privateItem.englishPhrases = ['CPH_PRIVATE_PROBE_phrase_7FE06']; privateTokens.push(...privateItem.englishPhrases)
  hotel.lastVerifiedAt = '2024-02-29'; hotel.checkInTime = '01:23'; hotel.checkOutTime = '04:56'
  for (const language of GUIDE_LANGUAGES) for (const key of Object.keys(hotel.translations[language]) as (keyof typeof hotel.translations.ko)[]) hotel.translations[language][key] = `CPH_HOTEL_QA_${language}_${key} Fictional only`
  return { facilities, hotel, privateTokens }
}
