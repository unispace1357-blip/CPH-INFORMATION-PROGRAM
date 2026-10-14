import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import type { Facility } from '../src/types/facility.ts'

/** Independent fictional unit-test inputs, never stored in the application JSON. */
export function testFacility(overrides: Partial<Facility> = {}): Facility {
  return {
    id: 'qa-facility', category: 'cafe', isPublished: true, lastVerifiedAt: null, walkingMinutes: null,
    translations: Object.fromEntries(GUIDE_LANGUAGES.map(language => [language, {
      name: language === 'ko' ? '검증용 시설' : language === 'en' ? 'Fictional QA Facility' : language === 'zh-CN' ? '中文验证设施' : '検証用施設',
      description: '', address: '', openingHours: '', directions: '', notes: '',
    }])) as Facility['translations'],
    closedDays: { ko: '', en: '', 'zh-CN': '', ja: '' },
    keywords: { ko: [], en: [], 'zh-CN': ['汉语限定'], ja: ['日本語限定'] }, englishPhrases: [],
    ...overrides,
  }
}

export function searchFixtures(): Facility[] {
  const first = testFacility({ id: 'qa-alpha', category: 'sauna_spa' })
  first.translations.ko.name = '청록 쉼터'
  first.translations.en.name = 'Emerald Rest Place'
  first.translations.ko.address = '검증대로 1'
  first.translations.en.address = 'Fictional Test Avenue 1'
  first.keywords.ko = ['휴식', '웰니스']
  first.keywords.en = ['wellness', 'recovery']
  const second = testFacility({ id: 'qa-beta', category: 'cafe' })
  second.translations.ko.name = '검증 찻집'
  second.translations.en.name = 'Amber Coffee'
  second.keywords.ko = ['커피', '카페']
  second.keywords.en = ['cafe', 'espresso', 'offer[qa]*']
  const third = testFacility({ id: 'qa-gamma', category: 'atm' })
  third.translations.ko.name = '검증 현금기'
  third.translations.en.name = 'Test CashPoint'
  third.keywords.ko = ['인출']
  third.keywords.en = ['ATM', 'cash']
  const hidden = testFacility({ id: 'qa-hidden', category: 'pharmacy', isPublished: false })
  hidden.translations.ko.name = '숨겨진 검증 시설'
  hidden.translations.en.name = 'Hidden Drugstore'
  hidden.keywords.ko = ['비공개']
  hidden.keywords.en = ['private', 'test']
  return [first, second, third, hidden]
}
