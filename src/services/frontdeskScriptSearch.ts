import type { FrontdeskScript, FrontdeskScriptCategory } from '../types/frontdeskScript.ts'
import { HOTEL_SEARCH_ALIASES } from '../data/searchKeywordDictionary.ts'
import { keywordScore, normalizeKeyword } from './keywordRanking.ts'

export type FrontdeskCategoryFilter = FrontdeskScriptCategory | 'all'
/** Search visible question/answer copy and keywords; never index staff-only checks. */
export function searchFrontdeskScripts(scripts: readonly FrontdeskScript[], query = '', category: FrontdeskCategoryFilter = 'all'): FrontdeskScript[] {
  const candidates = scripts.filter(script => category === 'all' || script.category === category)
  if (!normalizeKeyword(query)) return candidates
  return candidates.map(script => ({
    script,
    score: keywordScore(query, [script.title], script.keywords, HOTEL_SEARCH_ALIASES[script.id] ?? [], [
      script.question.ko, script.question.en, script.quickAnswer.ko, script.quickAnswer.en,
      script.details?.ko ?? '', script.details?.en ?? '',
    ]),
  })).filter(item => item.score >= 0).sort((a,b) => b.score - a.score).map(item => item.script)
}
