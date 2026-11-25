/** Shared literal search ranking: exact title > exact registered keyword >
 * curated synonym > partial title/keyword/body. Keep source order for ties.
 */
export const normalizeKeyword = (value: string): string => value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ')
const compact = (value: string): string => normalizeKeyword(value).replace(/[\s·・.,()'’&/\-_]+/g, '')
export function keywordEqual(field: string, query: string): boolean {
  const a = normalizeKeyword(field), b = normalizeKeyword(query)
  return a === b || (compact(b).length >= 2 && compact(a) === compact(b))
}
export function keywordIncludes(field: string, query: string): boolean {
  const a = normalizeKeyword(field), b = normalizeKeyword(query)
  if (!b) return false
  return a.includes(b) || (compact(b).length >= 2 && compact(a).includes(compact(b)))
}
export function keywordScore(query: string, titles: readonly string[], keywords: readonly string[], aliases: readonly string[], body: readonly string[]): number {
  const terms = normalizeKeyword(query).split(' ').filter(Boolean)
  if (!terms.length) return 0
  const score = (token: string): number => {
    if (titles.some(v => keywordEqual(v, token))) return 40
    if (keywords.some(v => keywordEqual(v, token))) return 30
    if (aliases.some(v => keywordEqual(v, token))) return 20
    if ([...titles, ...keywords, ...aliases, ...body].some(v => keywordIncludes(v, token))) return 10
    return 0
  }
  const scores = terms.map(score)
  if (scores.some(v => !v)) return -1
  const whole = score(query)
  return whole * 100 + scores.reduce((sum, n) => sum + n, 0) / scores.length
}
