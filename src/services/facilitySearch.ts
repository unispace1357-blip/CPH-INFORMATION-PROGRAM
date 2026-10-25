import { GUIDE_LANGUAGES } from '../types/guide.ts'
import type { Facility, FacilityCategory } from '../types/facility.ts'
import { timespaceSearchTerms } from './timespaceDirectory.ts'

export type StaffCategoryFilter = FacilityCategory | 'all'

/** Hotel-selected restaurant-area highlight, scoped to the dining filter only. */
export const FEATURED_DINING_FACILITY_ID = 'songdo-timespace-complex'

/** Stable order for other categories and other results; never mutate source JSON. */
export function orderFacilitiesForCategory(results: readonly Facility[], category: StaffCategoryFilter): Facility[] {
  if (category !== 'dining') return [...results]
  const index = results.findIndex(item => item.id === FEATURED_DINING_FACILITY_ID)
  if (index <= 0) return [...results]
  return [results[index]!, ...results.slice(0, index), ...results.slice(index + 1)]
}

/** A small deliberate synonym table, not fuzzy matching that could send a guest to the wrong venue. */
const QUERY_SYNONYMS: Readonly<Record<string, readonly string[]>> = {
  '호프집': ['맥주'], '맥줏집': ['맥주'], '술집': ['맥주'], '펍': ['맥주'],
  '커피숍': ['커피'], '커피샵': ['커피'], 'café': ['cafe'],
  '고깃집': ['고기'], '고기집': ['고기'], '바베큐': ['고기', '바비큐'],
  '중국음식': ['중식'], '중국요리': ['중식'], '중국집': ['중식'],
  '한식집': ['한식'], '한식당': ['한식'],
  '쭈꾸미': ['주꾸미'], '와사비': ['고추냉이'],
  '햄버거집': ['햄버거'], '버거집': ['햄버거'],
  '아울렛몰': ['아울렛'], '아울렛매장': ['아울렛'],
  'water-taxi': ['water taxi'], 'coffeeshop': ['coffee'], 'coffee-shop': ['coffee'],
  'bbq': ['barbecue', '갈비'], 'pub': ['beer', '맥주'],
}

export function normalizeSearchTerm(value: string): string {
  // Unicode compatibility forms (full-width English/numbers), casing and repeated whitespace.
  return value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Compare without optional punctuation/spaces *within one indexed field*, never across fields. */
function compactSearchTerm(value: string): string {
  return normalizeSearchTerm(value).replace(/[\s·・.,()'’&/\-_]+/g, '')
}

export function facilitySearchFields(facility: Facility): string[] {
  const additional = facility.id === FEATURED_DINING_FACILITY_ID ? timespaceSearchTerms() : []
  return [...GUIDE_LANGUAGES.flatMap(lang => {
    const t = facility.translations[lang]
    return [t.name, t.description, t.address, t.openingHours, t.directions, t.notes, facility.closedDays[lang], ...facility.keywords[lang]]
  }), ...additional]
}

export function facilitySearchText(facility: Facility): string {
  return facilitySearchFields(facility).join(' ')
}

export function matchesFacility(facility: Facility, query = '', category: StaffCategoryFilter = 'all'): boolean {
  if (!facility.isPublished || (category !== 'all' && facility.category !== category && !(facility.additionalCategories ?? []).includes(category))) return false
  const tokens = normalizeSearchTerm(query).split(' ').filter(Boolean)
  if (!tokens.length) return true

  const fields = facilitySearchFields(facility)
  const haystack = normalizeSearchTerm(fields.join(' '))
  const compactFields = fields.map(compactSearchTerm)
  // Each query word must match; synonyms are OR alternatives only for that word.
  return tokens.every(token => {
    const variants = [token, ...(QUERY_SYNONYMS[token] ?? [])]
    return variants.some(variant => {
      if (haystack.includes(variant)) return true
      const compact = compactSearchTerm(variant)
      return compact.length >= 2 && compactFields.some(field => field.includes(compact))
    })
  })
}

/** Stable source order, all matching venues (not just the first), independent of UI language. */
export function searchFacilities(facilities: readonly Facility[], query = '', category: StaffCategoryFilter = 'all'): Facility[] {
  return orderFacilitiesForCategory(facilities.filter(facility => matchesFacility(facility, query, category)), category)
}

export function resolveSelectedFacility(results: readonly Facility[], selectedId: string | null): Facility | null {
  return results.find(facility => facility.isPublished && facility.id === selectedId) ?? null
}
