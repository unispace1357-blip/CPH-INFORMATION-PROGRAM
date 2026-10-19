import type { FrontdeskScript, FrontdeskScriptCategory } from '../types/frontdeskScript.ts'
import { normalizeSearchTerm } from './facilitySearch.ts'

export type FrontdeskCategoryFilter = FrontdeskScriptCategory | 'all'
/** Search visible question/answer copy and keywords; never index staff-only checks. */
export function searchFrontdeskScripts(scripts: readonly FrontdeskScript[], query = '', category: FrontdeskCategoryFilter = 'all'): FrontdeskScript[] {
  const terms = normalizeSearchTerm(query).split(' ').filter(Boolean)
  return scripts.filter(script => {
    if (category !== 'all' && script.category !== category) return false
    if (!terms.length) return true
    const haystack = normalizeSearchTerm([
      script.title, script.question.ko, script.question.en, script.quickAnswer.ko, script.quickAnswer.en,
      script.details?.ko ?? '', script.details?.en ?? '', ...script.keywords,
    ].join(' '))
    return terms.every(term => haystack.includes(term))
  })
}
