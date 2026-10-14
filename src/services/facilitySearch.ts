import type { Facility, FacilityCategory } from '../types/facility.ts'

export type StaffCategoryFilter = FacilityCategory | 'all'

export function normalizeSearchTerm(value: string): string {
  return value.normalize('NFC').trim().toLowerCase()
}

/** Local literal substring matching; source order is retained and input is untouched. */
export function searchFacilities(facilities: readonly Facility[], query = '', category: StaffCategoryFilter = 'all'): Facility[] {
  const term = normalizeSearchTerm(query)
  return facilities.filter(facility => {
    if (!facility.isPublished || (category !== 'all' && facility.category !== category)) return false
    if (!term) return true
    const fields = [
      facility.translations.ko.name, facility.translations.en.name,
      ...facility.keywords.ko, ...facility.keywords.en,
      facility.translations.ko.address, facility.translations.en.address,
    ]
    return fields.some(field => normalizeSearchTerm(field).includes(term))
  })
}

export function resolveSelectedFacility(results: readonly Facility[], selectedId: string | null): Facility | null {
  return results.find(facility => facility.isPublished && facility.id === selectedId) ?? null
}
