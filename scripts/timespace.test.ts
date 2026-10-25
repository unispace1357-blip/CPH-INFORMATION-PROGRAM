import assert from 'node:assert/strict'
import test from 'node:test'
import raw from '../src/data/facilities.json' with { type: 'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { searchFacilities } from '../src/services/facilitySearch.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { TIMESPACE_TENANTS, timespaceTenantsByCategory } from '../src/services/timespaceDirectory.ts'

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
  assert.equal(TIMESPACE_TENANTS.length, 15)
  assert.equal(new Set(TIMESPACE_TENANTS.map(t => t.id)).size, 15)
  assert.ok(!JSON.stringify(timespace).includes('오바케'))
  assert.ok(!JSON.stringify(timespace).includes('Obake'))
})

test('Timespace presents real representative menu categories in each language without invented shop-wide hours', () => {
  const expected = {
    ko: /카레.*파스타.*피자.*고기구이.*한식.*일식.*떡볶이.*포케/,
    en: /curry.*pasta.*pizza.*grilled meat.*Korean.*Japanese.*tteokbokki.*poke/i,
    'zh-CN': /咖喱.*意面.*披萨.*烤肉.*韩式.*日式.*炒年糕.*波奇/,
    ja: /カレー.*パスタ.*ピザ.*焼肉.*韓国.*鉄板.*トッポッキ.*ポキ/,
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
  // 15 minutes / 835m refers to the supplied Naver route ending at Starbucks, not a measured Timespace entrance route.
  assert.equal(timespace.walkingMinutes, 15, 'map-reported walking time to the nearby landmark')
  assert.equal(timespace.walkingDistanceMeters, 835, 'map-reported distance to the nearby landmark')
  const caveats = { ko: /스타벅스 송도캐슬파크점.*타임스페이스 내부가 아닌/, en: /Starbucks Songdo Castle Park.*not inside Songdo Timespace/, 'zh-CN': /星巴克.*并非松岛 Timespace 内部/, ja: /スターバックス.*建物内ではありません/ }
  for (const lang of GUIDE_LANGUAGES) assert.match(timespace.translations[lang].directions, caveats[lang])
  assert.match(timespace.englishPhrases[2]!, /Starbucks Songdo Castle Park.*not the Timespace entrance/)
  assert.match(timespace.englishPhraseMeanings![2]!, /스타벅스 송도캐슬파크점/)
})

test('Timespace can be found by complex name or food keywords in both guest and staff searches', () => {
  const before = structuredClone(parsed.facilities)
  for (const term of ['타임 스페이스', '송도타임스페이스', '스프카레', '파스타', '대판1985', '슬로우캘리', '한마음정육식당', '포케', 'Sutmeong', 'soup curry', '炒年糕', 'お好み焼き']) {
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

test('Timespace is pinned to top of dining only, with all other relative positions preserved', () => {
  const source = structuredClone(parsed.facilities)
  const featured = 'songdo-timespace-complex'
  for (const search of [searchFacilities, searchGuestFacilities]) {
    const dining = search(parsed.facilities, '', 'dining')
    assert.equal(dining[0]?.id, featured)
    assert.equal(dining.filter(item => item.id === featured).length, 1)
    const unpinned = parsed.facilities.filter(item =>
      item.isPublished && (item.category === 'dining' || (item.additionalCategories ?? []).includes('dining')))
    assert.deepEqual(dining.slice(1).map(item => item.id), unpinned.filter(item => item.id !== featured).map(item => item.id))
    assert.deepEqual(search(parsed.facilities, '', 'all').map(item => item.id), parsed.facilities.map(item => item.id))
    assert.deepEqual(search(parsed.facilities, '', 'shopping').map(item => item.id),
      parsed.facilities.filter(item => item.category === 'shopping').map(item => item.id))
    const keyword = search(parsed.facilities, '고기', 'dining')
    assert.equal(keyword[0]?.id, featured, 'matching dining search should prioritize Timespace')
    assert.equal(search(parsed.facilities, '없는특수문구', 'dining').length, 0)
  }
  for (const language of GUIDE_LANGUAGES) {
    assert.equal(searchGuestFacilities(parsed.facilities, '', 'dining', language)[0]?.id, featured, language)
  }
  assert.deepEqual(parsed.facilities, source)
})


test('approved Timespace tenant directory contains fifteen distinct current candidates, no closed Obake, and supplied Hanmaeum suite', () => {
  assert.equal(timespaceTenantsByCategory('all').length, 15)
  assert.equal(timespaceTenantsByCategory('grill').length, 5)
  assert.equal(timespaceTenantsByCategory('western').length, 2)
  assert.equal(timespaceTenantsByCategory('korean').length, 3)
  assert.ok(!TIMESPACE_TENANTS.some(t => /오바케|Obake/i.test(t.name)))
  const hanmaeum = TIMESPACE_TENANTS.find(t => t.id === 'hanmaeum')!
  assert.equal(hanmaeum.building, 'B')
  assert.equal(hanmaeum.floor, 2)
  assert.equal(hanmaeum.rooms, '205~208')
  for (const lang of GUIDE_LANGUAGES) {
    for (const tenant of TIMESPACE_TENANTS) assert.ok(tenant.menu[lang].trim(), tenant.id + '/' + lang)
  }
})
