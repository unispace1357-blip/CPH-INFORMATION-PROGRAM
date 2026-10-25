import assert from 'node:assert/strict'
import test from 'node:test'
import raw from '../src/data/facilities.json' with { type: 'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { searchFacilities } from '../src/services/facilitySearch.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'

const parsed = parseFacilityDataset(raw)
const timespace = parsed.facilities.find(item => item.id === 'songdo-timespace-complex')!

test('Timespace is one representative commercial-complex entry, not a misleading list of unverified venue records', () => {
  assert.equal(parsed.facilities.length, 27)
  assert.ok(timespace)
  assert.equal(timespace.category, 'shopping')
  assert.deepEqual(timespace.additionalCategories, ['dining'])
  assert.equal(timespace.isPublished, true)
  assert.equal(timespace.lastVerifiedAt, null)
  assert.equal(raw.dataStatus, 'demo')
  assert.match(timespace.translations.ko.address, /하모니로 158/)
  assert.deepEqual(timespace.englishPhrases.length, 3)
  assert.equal(timespace.englishPhraseMeanings!.length, 3)
  assert.equal(parsed.facilities.filter(item => ['dora-bowl-timespace', 'obake-timespace', 'sutmeong-timespace', 'boni-boni-timespace'].includes(item.id)).length, 0)
})

test('Timespace presents real representative menu categories in each language without invented shop-wide hours', () => {
  const expected = {
    ko: /카레.*라멘.*돼지고기구이.*즉석떡볶이/,
    en: /curry.*ramen.*grilled pork.*tteokbokki/i,
    'zh-CN': /咖喱.*拉面.*烤猪肉.*炒年糕/,
    ja: /カレー.*ラーメン.*豚焼肉.*トッポッキ/,
  }
  for (const language of GUIDE_LANGUAGES) {
    const text = timespace.translations[language]
    assert.match(text.description, expected[language], language)
    assert.match(text.address, /158/)
    assert.ok(text.notes.trim() && text.directions.trim(), language)
    assert.ok(!/\d\d:\d\d/.test(text.openingHours), language)
  }
})

test('user supplied Naver walking route leads to nearby Starbucks Castle Park, never falsely labels it Timespace', () => {
  assert.ok(timespace.naverMapUrl?.includes('19398065,PLACE_POI'), 'hotel origin must be preserved')
  assert.ok(timespace.naverMapUrl?.includes('1617698245,PLACE_POI'), 'destination must be supplied Starbucks Songdo Castle Park')
  assert.ok(timespace.naverMapUrl?.includes('/walk?'))
  assert.equal(timespace.walkingMinutes, null, 'old pharmacy walking time must not carry to Starbucks route')
  const caveats = { ko: /스타벅스 송도캐슬파크점.*타임스페이스 내부가 아닌/, en: /Starbucks Songdo Castle Park.*not inside Songdo Timespace/, 'zh-CN': /星巴克.*并非松岛 Timespace 内部/, ja: /スターバックス.*建物内ではありません/ }
  for (const lang of GUIDE_LANGUAGES) assert.match(timespace.translations[lang].directions, caveats[lang])
  assert.match(timespace.englishPhrases[2]!, /Starbucks Songdo Castle Park.*not the Timespace entrance/)
  assert.match(timespace.englishPhraseMeanings![2]!, /스타벅스 송도캐슬파크점/)
})

test('Timespace can be found by complex name or food keywords in both guest and staff searches', () => {
  const before = structuredClone(parsed.facilities)
  for (const term of ['타임 스페이스', '송도타임스페이스', '스프카레', '라멘', '떡볶이', 'Sutmeong', 'soup curry', '炒年糕', 'トッポッキ']) {
    assert.ok(searchFacilities(parsed.facilities, term).some(x => x.id === timespace.id), term)
    for (const language of GUIDE_LANGUAGES) {
      assert.ok(searchGuestFacilities(parsed.facilities, term, 'all', language).some(x => x.id === timespace.id), term + '/' + language)
    }
  }
  assert.deepEqual(parsed.facilities, before)
})

test('one Timespace record appears under both dining and shopping with matching keyword filters', () => {
  const snapshot = structuredClone(parsed.facilities)
  for (const category of ['shopping', 'dining'] as const) {
    assert.equal(searchFacilities(parsed.facilities, '타임스페이스', category).filter(f => f.id === timespace.id).length, 1)
    for (const lang of GUIDE_LANGUAGES) {
      assert.equal(searchGuestFacilities(parsed.facilities, '카레', category, lang).filter(f => f.id === timespace.id).length, 1)
    }
  }
  assert.deepEqual(searchFacilities(parsed.facilities, '타임스페이스', 'cafe'), [])
  assert.deepEqual(parsed.facilities, snapshot)
  const wrongCategory = structuredClone(raw)
  const timespaceDraft = wrongCategory.facilities.find(f => f.id === timespace.id)!
  timespaceDraft.additionalCategories = ['shopping']
  assert.throws(() => parseFacilityDataset(wrongCategory), /additionalCategories must not duplicate/)
})
