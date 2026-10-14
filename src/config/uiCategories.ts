import type { FacilityCategory } from '../types/facility'
import type { IconName } from '../components/ui/Icon'

/** Display labels only. No facility JSON or search/filter logic is imported here. */
export const FACILITY_CATEGORY_OPTIONS = [
  { code: 'hotel', staffLabel: '호텔 관련', guestLabel: 'Hotel facilities', icon: 'hotel' },
  { code: 'dining', staffLabel: '음식점', guestLabel: 'Restaurants', icon: 'dining' },
  { code: 'cafe', staffLabel: '카페', guestLabel: 'Cafes', icon: 'cafe' },
  { code: 'convenience', staffLabel: '편의점', guestLabel: 'Convenience stores', icon: 'convenience' },
  { code: 'pharmacy', staffLabel: '약국', guestLabel: 'Pharmacies', icon: 'pharmacy' },
  { code: 'shopping', staffLabel: '쇼핑', guestLabel: 'Shopping', icon: 'shopping' },
  { code: 'attraction', staffLabel: '관광', guestLabel: 'Attractions', icon: 'attraction' },
  { code: 'transportation', staffLabel: '교통', guestLabel: 'Transportation', icon: 'transportation' },
  { code: 'sauna_spa', staffLabel: '사우나·스파', guestLabel: 'Sauna & Spa', icon: 'sauna_spa' },
  { code: 'atm', staffLabel: 'ATM', guestLabel: 'ATMs', icon: 'atm' },
] as const satisfies readonly { code: FacilityCategory; staffLabel: string; guestLabel: string; icon: IconName }[]

/** Public category buttons omit ATM; legacy records and local admin options stay intact. */
export const UI_CATEGORIES = FACILITY_CATEGORY_OPTIONS.filter(item => item.code !== 'atm')
