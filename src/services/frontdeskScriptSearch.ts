import type { FrontdeskScript, FrontdeskScriptCategory } from '../types/frontdeskScript.ts'
import { normalizeSearchTerm } from './facilitySearch.ts'

export type FrontdeskCategoryFilter = FrontdeskScriptCategory | 'all'

/** Literal bilingual search, category AND query; retain the registered order and review status. */
export function searchFrontdeskScripts(scripts: readonly FrontdeskScript[], query = '', category: FrontdeskCategoryFilter = 'all'): FrontdeskScript[] {
  const term = normalizeSearchTerm(query)
  return scripts.filter(script => (category === 'all' || script.category === category) && (
    !term || [script.title, script.question.ko, script.question.en, ...script.keywords]
      .some(field => normalizeSearchTerm(field).includes(term))
  ))
}
