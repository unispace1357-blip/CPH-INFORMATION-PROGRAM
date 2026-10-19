import { GUIDE_LANGUAGES } from '../types/guide.ts'
import type { Facility, FacilityCategory } from '../types/facility.ts'

export type StaffCategoryFilter = FacilityCategory | 'all'
export function normalizeSearchTerm(value: string): string {
  return value.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ')
}
export function facilitySearchText(facility: Facility): string {
  return GUIDE_LANGUAGES.flatMap(lang => {
    const t = facility.translations[lang]
    return [t.name, t.description, t.address, t.openingHours, t.directions, t.notes, facility.closedDays[lang], ...facility.keywords[lang]]
  }).join(' ')
}
export function matchesFacility(facility: Facility, query = '', category: StaffCategoryFilter = 'all'): boolean {
  if (!facility.isPublished || (category !== 'all' && facility.category !== category)) return false
  const words = normalizeSearchTerm(query).split(' ').filter(Boolean)
  if (!words.length) return true
  const haystack = normalizeSearchTerm(facilitySearchText(facility))
  return words.every(word => haystack.includes(word))
}
/** Keep original order and return all matches, including shared menu keywords. */
export function searchFacilities(facilities: readonly Facility[], query = '', category: StaffCategoryFilter = 'all'): Facility[] {
  return facilities.filter(facility => matchesFacility(facility, query, category))
}
export function resolveSelectedFacility(results: readonly Facility[], selectedId: string | null): Facility | null {
  return results.find(facility => facility.isPublished && facility.id === selectedId) ?? null
}
