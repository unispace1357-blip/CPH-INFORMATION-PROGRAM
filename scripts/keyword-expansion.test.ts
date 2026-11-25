import assert from 'node:assert/strict'
import test from 'node:test'
import { frontdeskScriptDataset } from '../src/data/frontdeskScriptDataset.ts'
import { hotelDataset } from '../src/data/hotelDataset.ts'
import { facilityDataset } from '../src/data/facilityDataset.ts'
import { searchHotelInformation } from '../src/services/guestHotelSearch.ts'
import { searchFrontdeskScripts } from '../src/services/frontdeskScriptSearch.ts'
import { searchFacilities } from '../src/services/facilitySearch.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { HOTEL_SEARCH_ALIASES, FACILITY_SEARCH_ALIASES, GUEST_PARAGRAPH_ALIAS_IDS } from '../src/data/searchKeywordDictionary.ts'

test('all curated hotel and facility alias IDs refer to registered records', () => {
  for (const id of Object.keys(HOTEL_SEARCH_ALIASES)) assert.ok(frontdeskScriptDataset.scripts.some(s => s.id === id), id)
  for (const id of Object.keys(FACILITY_SEARCH_ALIASES)) assert.ok(facilityDataset.facilities.some(f => f.id === id), id)
  for (const ids of Object.values(GUEST_PARAGRAPH_ALIAS_IDS)) for (const group of ids) for (const id of group) assert.ok(HOTEL_SEARCH_ALIASES[id], id)
})
test('curated staff aliases find their intended script', () => {
  for (const [id, aliases] of Object.entries(HOTEL_SEARCH_ALIASES)) {
    for (const alias of aliases) assert.ok(searchFrontdeskScripts(frontdeskScriptDataset.scripts, alias).some(s => s.id === id), id + ': ' + alias)
  }
  const search = (q: string) => searchFrontdeskScripts(frontdeskScriptDataset.scripts, q)
  assert.equal(search('렌지')[0]?.id, 'microwave-location')
  assert.ok(search('충전').some(s => s.id === 'ev-charging-stations'))
  assert.ok(search('충전').some(s => s.id === 'phone-charger-rental'))
  assert.equal(search('아이폰 충전')[0]?.id, 'phone-charger-rental')
  assert.equal(search('전기차 충전')[0]?.id, 'ev-charging-stations')
  assert.deepEqual(search('.*[not-a-regex]'), [])
})
test('guest hotel aliases use the same intent across all display languages', () => {
  for (const lang of GUIDE_LANGUAGES) {
    for (const [q, category, index] of [
      ['렌지','roomUsage',1],['와파','roomUsage',0],['추워요','roomUsage',12],
      ['더워요','roomUsage',3],['모포','roomUsage',14],['마개','roomUsage',15],
      ['아이폰 충전','roomUsage',16],['전기차 충전','parking',1],
      ['체력단련실','roomUsage',13],['아침밥','breakfast',0],['주차료','parking',0],
    ] as const) assert.ok(searchHotelInformation(hotelDataset, lang, q).some(h => h.category === category && h.index === index), lang + ': ' + q)
    assert.equal(searchHotelInformation(hotelDataset, lang, '렌지')[0]?.index, 1)
    assert.deepEqual(searchHotelInformation(hotelDataset, lang, 'zz-unregistered-keyword'), [])
  }
})
test('nearby aliases respect registered venue IDs, public visibility and matching across guest and staff', () => {
  for (const [id, aliases] of Object.entries(FACILITY_SEARCH_ALIASES)) for (const alias of aliases) {
    assert.ok(searchFacilities(facilityDataset.facilities, alias).some(f => f.id === id), id + ': ' + alias)
    assert.ok(searchGuestFacilities(facilityDataset.facilities, alias).some(f => f.id === id), id + ': ' + alias)
  }
  const ids = (q: string) => searchFacilities(facilityDataset.facilities, q).map(f => f.id)
  assert.deepEqual(ids('약').sort(), ['chaeum-pharmacy-songdo','byeol-onnuri-pharmacy-songdo'].sort())
  assert.deepEqual(ids('배'), ['songdo-central-park-water-taxi'])
  assert.deepEqual(ids('타스'), ['songdo-timespace-complex'])
  assert.deepEqual(ids('맥주 약국'), [])
  assert.ok(!ids('짜장면').includes('cu-songdo-senseuri'))
  assert.deepEqual(ids(''), facilityDataset.facilities.filter(f => f.isPublished).map(f => f.id))
})
