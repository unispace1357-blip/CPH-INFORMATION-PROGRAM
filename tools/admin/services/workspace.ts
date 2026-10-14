import { GUIDE_LANGUAGES } from '../../../src/types/guide.ts'
import type { DatasetStatus, GuideLanguage } from '../../../src/types/guide.ts'
import type { Facility, FacilityDataset, FacilityCategory } from '../../../src/types/facility.ts'
import type { HotelDataset } from '../../../src/types/hotel.ts'
import { parseFacilityDataset } from '../../../src/data/validateFacilityDataset.ts'
import { parseHotelDataset } from '../../../src/data/validateHotelDataset.ts'
import { validateProductionData } from '../../../src/data/validateProductionData.ts'
import { createPublicDataset } from '../../../src/data/createPublicDataset.ts'
import { normalizeSearchTerm } from '../../../src/services/facilitySearch.ts'

export const MAX_JSON_BYTES = 2 * 1024 * 1024
export const LANGUAGE_NAMES: Record<GuideLanguage, string> = { ko: '한국어', en: 'English', 'zh-CN': '简体中文', ja: '日本語' }
export type FacilityDraft = Omit<Facility, 'walkingMinutes'> & { walkingMinutes: string }

/** Blank local editor only. It cannot be exported as a valid facility until the schema passes. */
export function newFacilityDraft(): FacilityDraft {
  return {
    id: '', category: 'hotel', isPublished: false, lastVerifiedAt: null, walkingMinutes: '',
    closedDays: { ko: '', en: '', 'zh-CN': '', ja: '' },
    translations: Object.fromEntries(GUIDE_LANGUAGES.map(language => [language, { name: '', description: '', address: '', openingHours: '', directions: '', notes: '' }])) as Facility['translations'],
    keywords: { ko: [], en: [], 'zh-CN': [], ja: [] }, englishPhrases: [],
  }
}

export function facilityToDraft(facility: Facility): FacilityDraft {
  return { ...structuredClone(facility), walkingMinutes: facility.walkingMinutes === null ? '' : String(facility.walkingMinutes) }
}

export function draftToFacility(draft: FacilityDraft): Facility {
  const minutes = draft.walkingMinutes.trim()
  if (minutes && (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(minutes) || !Number.isFinite(Number(minutes)))) {
    throw new Error('도보시간은 0 이상의 유한한 숫자여야 합니다. 미확인이면 비워 주세요.')
  }
  return { ...structuredClone(draft), walkingMinutes: minutes === '' ? null : Number(minutes) }
}

/** Additional editor policy; structural validation stays in the existing shared parser. */
export function parseAdminFacilities(input: unknown): FacilityDataset {
  const dataset = parseFacilityDataset(input)
  for (const facility of dataset.facilities) {
    for (const language of GUIDE_LANGUAGES) {
      const seen = new Set<string>()
      facility.keywords[language].forEach((keyword, index) => {
        const key = normalizeSearchTerm(keyword)
        if (!key || seen.has(key)) throw new Error(`${facility.id} / ${LANGUAGE_NAMES[language]} / 검색 키워드 ${index + 1}: 공백 또는 중복 키워드를 수정해 주세요. 원본 항목은 자동으로 제거하지 않습니다.`)
        seen.add(key)
      })
    }
  }
  return dataset
}

export function saveFacility(dataset: FacilityDataset, draft: FacilityDraft, originalId: string | null): FacilityDataset {
  const facility = draftToFacility(draft)
  if (originalId !== null && facility.id !== originalId) throw new Error('기존 시설 ID는 변경할 수 없습니다.')
  if (originalId !== null && !dataset.facilities.some(item => item.id === originalId)) throw new Error('수정할 시설을 찾을 수 없습니다.')
  if (dataset.facilities.some(item => item.id === facility.id && item.id !== originalId)) throw new Error(`Duplicate facility ID: ${facility.id}`)
  const facilities = originalId === null ? [...dataset.facilities, facility] : dataset.facilities.map(item => item.id === originalId ? facility : item)
  return parseAdminFacilities({ ...dataset, facilities })
}

export function deleteFacility(dataset: FacilityDataset, id: string, confirmed: boolean): FacilityDataset {
  if (!confirmed) return dataset
  if (!dataset.facilities.some(item => item.id === id)) throw new Error('삭제할 시설을 찾을 수 없습니다.')
  return { ...structuredClone(dataset), facilities: dataset.facilities.filter(item => item.id !== id).map(item => structuredClone(item)) }
}

export function filterAdminFacilities(dataset: FacilityDataset, query: string, category: FacilityCategory | 'all', published: 'all' | 'public' | 'private'): Facility[] {
  const term = normalizeSearchTerm(query)
  return dataset.facilities.filter(item => (category === 'all' || item.category === category)
    && (published === 'all' || item.isPublished === (published === 'public'))
    && (!term || GUIDE_LANGUAGES.some(language => normalizeSearchTerm(item.translations[language].name).includes(term))))
}

export function moveListItem(items: readonly string[], index: number, delta: -1 | 1): string[] {
  const result = [...items]
  const next = index + delta
  if (index < 0 || index >= result.length || next < 0 || next >= result.length) return result
  ;[result[index], result[next]] = [result[next]!, result[index]!]
  return result
}

function readJson(text: string): unknown {
  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BYTES) throw new Error('JSON 파일은 최대 2MB입니다.')
  try { return JSON.parse(text) }
  catch { throw new Error('JSON 문법이 올바르지 않습니다. 파일 내용을 확인해 주세요.') }
}

export function importFacilities(text: string): FacilityDataset { return parseAdminFacilities(readJson(text)) }
export function importHotel(text: string): HotelDataset { return parseHotelDataset(readJson(text)) }
export function exportFacilities(input: unknown): string { return JSON.stringify(parseAdminFacilities(input), null, 2) + '\n' }
export function exportHotel(input: unknown): string { return JSON.stringify(parseHotelDataset(input), null, 2) + '\n' }
export function exportPublicFacilities(input: unknown): string { return exportFacilities(createPublicDataset(parseAdminFacilities(input))) }

export interface ValidationResult { valid: boolean; messages: string[]; technical: string }

const fieldNames: Record<string, string> = {
  name: '시설/호텔명', description: '설명', address: '주소', openingHours: '영업시간', directions: '이동 안내', notes: '참고 사항',
  closedDays: '휴무일', keywords: '검색 키워드', englishPhrases: '영어 응대 문구', id: '시설 ID', category: '카테고리',
  lastVerifiedAt: '마지막 확인일', walkingMinutes: '도보시간', checkInTime: '체크인 시간', checkOutTime: '체크아웃 시간',
  checkIn: '체크인 안내', checkOut: '체크아웃 안내', breakfast: '조식 안내', parking: '주차 안내', roomUsage: '객실 이용 안내',
  dataStatus: '데이터 상태', schemaVersion: '데이터 버전', isPublished: '공개 상태', translations: '언어별 안내',
}

export function explainError(error: unknown, facilities?: FacilityDataset | null): ValidationResult {
  const technical = error instanceof Error ? error.message : '데이터를 확인해 주세요.'
  const parts = technical.replace(/^Production validation failed: /, '').split(/;\s*|,\s*(?=data(?:\/|\s))/)
  const messages = parts.map(part => {
    if (part.includes('Duplicate facility ID:')) return `시설 ID가 중복되었습니다: ${part.split('Duplicate facility ID:')[1]?.trim()}`
    if (part.includes('dataStatus must be production')) return `${part.startsWith('Facilities') ? '시설' : '호텔'} 데이터가 DEMO입니다. 운영 전환은 별도로 선택해야 합니다.`
    const index = part.match(/data\/facilities\/(\d+)/)?.[1]
    const target = index ? `시설 ${facilities?.facilities[Number(index)]?.id ?? `목록 ${Number(index) + 1}`}` : part.startsWith('hotel.') ? '호텔' : part.match(/^([a-z0-9-]+)\.(?:translations|closedDays|lastVerifiedAt)/)?.[1] ?? ''
    const language = part.match(/(?:translations[/.]|closedDays[/.]|keywords[/.])(ko|en|zh-CN|ja)/)?.[1] as GuideLanguage | undefined
    const fields = part.split(/[/.\s]/).filter(token => token in fieldNames)
    const field = fieldNames[fields.at(-1) ?? ''] ?? ''
    let reason = part.includes('cannot be in the future') ? '미래 날짜를 입력할 수 없습니다.'
      : part.includes('is required') || part.includes('required property') || part.includes('minLength') || part.includes('fewer than') ? '필수 값을 입력해 주세요.'
      : fields.includes('lastVerifiedAt') ? '실제 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.'
      : fields.includes('checkInTime') || fields.includes('checkOutTime') ? '시간을 00:00~23:59 범위의 HH:mm 형식으로 입력해 주세요.'
      : fields.includes('walkingMinutes') ? '0 이상의 숫자 또는 미확인 값을 입력해 주세요.'
      : fields.includes('id') ? '영문 소문자·숫자·하이픈으로 ID를 입력해 주세요(최대 80자).'
      : part.includes('unique items') || part.includes('duplicate items') ? '중복 항목을 수정해 주세요.'
      : fields.length ? '값이 비어 있거나 형식이 맞지 않습니다. 아래 상세 오류도 확인해 주세요.' : part
    if (part.includes('schemaVersion')) reason = '지원하는 데이터 버전은 schemaVersion 1입니다.'
    return [target, language ? LANGUAGE_NAMES[language] : '', field, reason].filter(Boolean).join(' / ')
  })
  return { valid: false, messages, technical }
}

export function inspect(action: () => unknown, facilities?: FacilityDataset | null): ValidationResult {
  try { action(); return { valid: true, messages: [], technical: '' } }
  catch (error) { return explainError(error, facilities) }
}

export function productionReadiness(facilities: FacilityDataset, hotel: HotelDataset, today?: string): ValidationResult {
  return inspect(() => validateProductionData({ ...facilities, dataStatus: 'production' }, { ...hotel, dataStatus: 'production' }, today), facilities)
}

export function changeStatus(facilities: FacilityDataset, hotel: HotelDataset, target: 'facilities' | 'hotel', status: DatasetStatus, confirmed: boolean): { facilities: FacilityDataset; hotel: HotelDataset } {
  if (!confirmed) return { facilities, hotel }
  if (status === 'production') {
    parseAdminFacilities(facilities)
    const result = productionReadiness(facilities, hotel)
    if (!result.valid) throw new Error(result.technical)
  }
  return { facilities: { ...facilities, dataStatus: target === 'facilities' ? status : facilities.dataStatus }, hotel: { ...hotel, dataStatus: target === 'hotel' ? status : hotel.dataStatus } }
}

export function hasChanges(current: unknown, saved: string): boolean { return JSON.stringify(current) !== saved }
