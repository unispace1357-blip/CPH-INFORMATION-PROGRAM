import { GUIDE_LANGUAGES } from '../types/guide.ts'
import type { GuideLanguage } from '../types/guide.ts'
import type { Facility } from '../types/facility.ts'
import { normalizeSearchTerm } from './facilitySearch.ts'
import type { StaffCategoryFilter } from './facilitySearch.ts'

/** Selected-language fields are checked first; all four languages keep source order. */
export function searchGuestFacilities(facilities: readonly Facility[], query = '', category: StaffCategoryFilter = 'all', language: GuideLanguage = 'en'): Facility[] {
  const term = normalizeSearchTerm(query)
  const languages = [language, ...GUIDE_LANGUAGES.filter(candidate => candidate !== language)]
  return facilities.filter(facility => {
    if (!facility.isPublished || (category !== 'all' && facility.category !== category)) return false
    if (!term) return true
    return languages.some(candidate => [facility.translations[candidate].name, ...facility.keywords[candidate]].some(field => normalizeSearchTerm(field).includes(term)))
  })
}
