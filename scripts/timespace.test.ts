import assert from 'node:assert/strict'
import test from 'node:test'
import raw from '../src/data/facilities.json' with { type: 'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { searchFacilities } from '../src/services/facilitySearch.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'

const parsed = parseFacilityDataset(raw)
const timespace = parsed.facilities.find(item => item.id === 'songdo-timespace-complex')!
const waypoint = parsed.facilities.find(item => item.id === 'byeol-onnuri-pharmacy-songdo')!

test('Timespace is one representative commercial-complex entry, not a misleading list of unverified venue records', () => {
  assert.equal(parsed.facilities.length, 27)
  assert.ok(timespace && waypoint)
  assert.equal(timespace.category, 'shopping')
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

test('existing real Naver walking route leads from hotel to pharmacy in Timespace A; caveat is visible and accurate', () => {
  assert.equal(timespace.naverMapUrl, waypoint.naverMapUrl)
  assert.ok(timespace.naverMapUrl?.includes('19398065,PLACE_POI'), 'hotel origin must be preserved')
  assert.ok(timespace.naverMapUrl?.includes('1841858743,PLACE_POI'), 'destination is pharmacy, not a fabricated Timespace POI')
  assert.ok(timespace.naverMapUrl?.includes('/walk?'))
  assert.equal(timespace.walkingMinutes, waypoint.walkingMinutes)
  assert.match(timespace.translations.ko.directions, /목적지.*별온누리약국/)
  assert.match(timespace.translations.en.directions, /destination is Byeol Onnuri Pharmacy/)
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
