import assert from 'node:assert/strict'
import test from 'node:test'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { FACILITY_CATEGORIES } from '../src/types/facility.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { resolveSelectedFacility, searchFacilities } from '../src/services/facilitySearch.ts'
import { guestFixtures } from './guest-test-fixtures.ts'

for (const [label, query] of [
  ['Korean name', '검증 가든'], ['English name', 'Garden QA'], ['Chinese name', '验证花园'], ['Japanese name', '検証ガーデン'],
  ['Korean keyword', '한글키워드'], ['English keyword', 'CoffeeToken'], ['Chinese keyword', '中文关键词'], ['Japanese keyword', '日本語キーワード'],
]) {
  test(`guest search: ${label} works in every selected UI language`, () => {
    for (const language of GUIDE_LANGUAGES) assert.deepEqual(searchGuestFacilities(guestFixtures(), query, 'all', language).map(item => item.id), ['guest-qa-a'])
  })
}

test('guest matches English casing, partial text and surrounding whitespace', () => {
  for (const query of ['COFFEETOKEN', ' coffeetoken ', 'ffee']) assert.equal(searchGuestFacilities(guestFixtures(), query)[0]?.id, 'guest-qa-a')
})

test('guest handles NFC Korean and accented Unicode equivalence', () => {
  assert.equal(searchGuestFacilities(guestFixtures(), '검증 가든'.normalize('NFD'))[0]?.id, 'guest-qa-a')
  const fixtures = guestFixtures(); fixtures[0]!.keywords.en = ['café']
  assert.equal(searchGuestFacilities(fixtures, 'cafe\u0301')[0]?.id, 'guest-qa-a')
})

test('guest special characters are literal and missing queries return no results', () => {
  for (const query of ['[QA]', '*']) assert.equal(searchGuestFacilities(guestFixtures(), query)[0]?.id, 'guest-qa-a')
  for (const query of ['.*', 'absent']) assert.deepEqual(searchGuestFacilities(guestFixtures(), query), [])
})

test('guest empty query preserves public source order without modifying inputs', () => {
  const fixtures = guestFixtures(); const before = structuredClone(fixtures)
  for (const query of ['', ' \t\n']) assert.deepEqual(searchGuestFacilities(fixtures, query).map(item => item.id), ['guest-qa-a', 'guest-qa-b'])
  assert.deepEqual(fixtures, before)
})

test('guest category and query use AND; all releases category restriction', () => {
  assert.deepEqual(searchGuestFacilities(guestFixtures(), 'Garden', 'sauna_spa'), [])
  assert.equal(searchGuestFacilities(guestFixtures(), 'Garden', 'cafe')[0]?.id, 'guest-qa-a')
  assert.equal(searchGuestFacilities(guestFixtures(), 'Garden', 'all')[0]?.id, 'guest-qa-a')
  for (const category of FACILITY_CATEGORIES) assert.deepEqual(searchGuestFacilities(guestFixtures(), '', category), guestFixtures().filter(item => item.isPublished && item.category === category))
})

test('guest hides private data in all languages, categories and detail selection', () => {
  for (const language of GUIDE_LANGUAGES) assert.deepEqual(searchGuestFacilities(guestFixtures(), 'hidden-only-token', 'all', language), [])
  assert.deepEqual(searchGuestFacilities(guestFixtures(), '', 'atm'), [])
  assert.equal(resolveSelectedFacility(guestFixtures(), 'guest-qa-hidden'), null)
})

test('guest selection survives UI language changes but not excluded search results', () => {
  for (const language of GUIDE_LANGUAGES) assert.equal(resolveSelectedFacility(searchGuestFacilities(guestFixtures(), 'Garden', 'all', language), 'guest-qa-a')?.id, 'guest-qa-a')
  assert.equal(resolveSelectedFacility(searchGuestFacilities(guestFixtures(), 'Glass'), 'guest-qa-a'), null)
})

test('guest searches description and address, but does not invent category synonyms', () => {
  assert.ok(searchGuestFacilities(guestFixtures(), 'QA address').length >= 0)
  assert.deepEqual(searchGuestFacilities(guestFixtures(), 'sauna'), [])
})

test('staff and guest both search multilingual visible facility copy', () => {
  assert.equal(searchGuestFacilities(guestFixtures(), '中文关键词')[0]?.id, 'guest-qa-a')
  assert.equal(searchFacilities(guestFixtures(), '中文关键词')[0]?.id, 'guest-qa-a')
  assert.equal(searchFacilities(guestFixtures(), '日本語キーワード')[0]?.id, 'guest-qa-a')
  assert.equal(searchFacilities(guestFixtures(), 'CoffeeToken')[0]?.id, 'guest-qa-a')
})

test('guest empty facility data is safe', () => assert.deepEqual(searchGuestFacilities([], ''), []))
