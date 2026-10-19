/** Phonetic reading aids for staff only. These are approximate Korean renderings,
 * never part of the original English text copied to a guest. */
const READINGS: Readonly<Record<string, string>> = {
  'coastal': '코스털',
  'observatory': '업저버토리',
  'convensia': '컨벤시아',
  'brewery': '브루어리',
  'premium outlet': '프리미엄 아울렛',
  'platter': '플래터',
  'marinated': '매러네이티드',
  'frappuccino': '프라푸치노',
  'reception': '리셉션',
  'microwave': '마이크로웨이브',
  'amenities': '어메니티즈',
  'complimentary': '컴플리멘터리',
  'deposit': '디파짓',
  'availability': '어베일러빌리티',
  'reservation': '레저베이션',
  'emergency': '이머전시',
  'terminal': '터미널',
  'delivery': '딜리버리',
  'entrance': '엔트런스',
  'security': '시큐리티',
  'shelf': '셸프',
  'directions': '디렉션즈',
  'laundry': '론드리',
  'shuttle': '셔틀',
}

export interface ReadingSegment { text: string; reading?: string }

const escapedTerms = Object.keys(READINGS)
  .sort((a, b) => b.length - a.length)
  .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
const readingPattern = new RegExp('\\b(?:' + escapedTerms.join('|') + ')\\b', 'gi')

/** Reversible segmentation of the original English. Limits visual clutter per sentence. */
export function englishReadingSegments(text: string, maxHints = 3): ReadingSegment[] {
  if (!text) return []
  const segments: ReadingSegment[] = []
  let offset = 0
  let used = 0
  for (const match of text.matchAll(readingPattern)) {
    if (used >= maxHints) break
    const position = match.index
    if (position > offset) segments.push({ text: text.slice(offset, position) })
    const word = match[0]
    segments.push({ text: word, reading: READINGS[word.toLowerCase()] })
    offset = position + word.length
    used++
  }
  if (offset < text.length) segments.push({ text: text.slice(offset) })
  return segments
}
