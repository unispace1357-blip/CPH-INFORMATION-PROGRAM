import type { GuideLanguage } from '../types/guide.ts'
import type { Facility } from '../types/facility.ts'
import { matchesFacility } from './facilitySearch.ts'
import type { StaffCategoryFilter } from './facilitySearch.ts'

/** Search every translated field and keyword in all four languages, regardless of selected UI language. */
export function searchGuestFacilities(facilities: readonly Facility[], query = '', category: StaffCategoryFilter = 'all', _language: GuideLanguage = 'en'): Facility[] {
  return facilities.filter(facility => matchesFacility(facility, query, category))
}
