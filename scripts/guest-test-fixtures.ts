import type { Facility, FacilityDataset } from '../src/types/facility.ts'
import type { HotelDataset } from '../src/types/hotel.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { testFacility } from './staff-test-fixtures.ts'

/** Independent fictional fixtures, never written to application JSON. */
export function guestFixtures(): Facility[] {
  const a = testFacility({ id: 'guest-qa-a', category: 'cafe' })
  const b = testFacility({ id: 'guest-qa-b', category: 'sauna_spa' })
  const namesA = { ko: '검증 가든', en: 'Garden QA', 'zh-CN': '验证花园', ja: '検証ガーデン' }
  const namesB = { ko: '검증 온실', en: 'Glass QA', 'zh-CN': '验证温室', ja: '検証温室' }
  const words = { ko: '한글키워드', en: 'CoffeeToken', 'zh-CN': '中文关键词', ja: '日本語キーワード' }
  for (const language of GUIDE_LANGUAGES) {
    a.translations[language].name = namesA[language]
    b.translations[language].name = namesB[language]
    a.translations[language].address = `QA address only ${language}`
    a.keywords[language] = [words[language], 'literal[QA]*']
    b.keywords[language] = []
  }
  const hidden = testFacility({ id: 'guest-qa-hidden', category: 'atm', isPublished: false })
  for (const language of GUIDE_LANGUAGES) hidden.keywords[language] = ['hidden-only-token']
  return [a, b, hidden]
}

export function guestFacilityDataset(): FacilityDataset {
  return { schemaVersion: 1, dataStatus: 'demo', facilities: guestFixtures() }
}

export function emptyGuestHotel(): HotelDataset {
  return {
    schemaVersion: 1, dataStatus: 'demo', lastVerifiedAt: null, checkInTime: null, checkOutTime: null,
    translations: Object.fromEntries(GUIDE_LANGUAGES.map(language => [language, {
      name: '', description: '', address: '', checkIn: '', checkOut: '', breakfast: '', parking: '', roomUsage: '', notes: '',
    }])) as HotelDataset['translations'],
  }
}
