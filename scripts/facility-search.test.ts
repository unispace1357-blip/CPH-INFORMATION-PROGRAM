import assert from 'node:assert/strict'
import test from 'node:test'
import facilityData from '../src/data/facilities.json' with { type: 'json' }
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { FACILITY_CATEGORIES } from '../src/types/facility.ts'
import { searchFacilities, resolveSelectedFacility } from '../src/services/facilitySearch.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { loadStaffDataset } from '../src/services/loadStaffDataset.ts'
import { searchFixtures } from './staff-test-fixtures.ts'

const ids = (query: string) => searchFacilities(searchFixtures(), query).map(facility => facility.id)
const cases: [string, string, string[]][] = [
  ['Korean name', '청록', ['qa-alpha']],
  ['Korean keyword', '커피', ['qa-beta']],
  ['English name', 'Amber', ['qa-beta']],
  ['English keyword', 'wellness', ['qa-alpha']],
  ['case-insensitive English', 'eSpReSsO', ['qa-beta']],
  ['partial substring', 'elln', ['qa-alpha']],
  ['leading/trailing whitespace', ' \tcoffee \n', ['qa-beta']],
  ['Korean address', '검증대로', ['qa-alpha']],
  ['English address', 'TEST AVENUE', ['qa-alpha']],
  ['literal bracket', '[', ['qa-beta']],
  ['literal asterisk', '*', ['qa-beta']],
  ['regex-looking query is literal', '.*', []],
  ['no results', '존재하지않는시설', []],
  ['Chinese keyword included', '汉语限定', ['qa-alpha', 'qa-beta', 'qa-gamma']],
  ['Japanese keyword included', '日本語限定', ['qa-alpha', 'qa-beta', 'qa-gamma']],
  ['category name is not an implicit keyword', '사우나', []],
]
for (const [label, query, expected] of cases) {
  test(`staff search: ${label}`, () => assert.deepEqual(ids(query), expected))
}

test('Staff/Guest retain source order with mixed walking times, queries and category filters', () => {
  const fixtures = searchFixtures()
  const before = structuredClone(fixtures)
  for (const query of ['', ' \t\n']) assert.deepEqual(searchFacilities(fixtures, query).map(item => item.id), ['qa-alpha', 'qa-beta', 'qa-gamma'])
  assert.deepEqual(fixtures, before)
  const known = [
    ...fixtures,
    { ...structuredClone(fixtures[0]!), id: 'equal-a', walkingMinutes: 5 },
    { ...structuredClone(fixtures[0]!), id: 'zero', walkingMinutes: 0 },
    { ...structuredClone(fixtures[0]!), id: 'equal-b', walkingMinutes: 5 },
  ]
  const snapshot = structuredClone(known)
  for (const search of [searchFacilities, searchGuestFacilities]) {
    assert.deepEqual(search(known).map(f => f.id), ['qa-alpha', 'qa-beta', 'qa-gamma', 'equal-a', 'zero', 'equal-b'])
    for (const [query, category] of [['청록', 'all'], ['', 'sauna_spa'], ['청록', 'sauna_spa']] as const) {
      assert.deepEqual(search(known, query, category).map(f => f.id), ['qa-alpha', 'equal-a', 'zero', 'equal-b'])
    }
  }
  assert.deepEqual(known, snapshot)
})

test('equivalent decomposed Korean Unicode matches after NFC normalization', () => {
  assert.deepEqual(ids('청록'.normalize('NFD')), ['qa-alpha'])
})

test('every original category applies only to published facilities', () => {
  for (const category of FACILITY_CATEGORIES) {
    const fixtures = searchFixtures()
    assert.deepEqual(searchFacilities(fixtures, '', category), fixtures.filter(item => item.isPublished && item.category === category))
  }
})

test('query and category use AND; all releases the category constraint', () => {
  const fixtures = searchFixtures()
  assert.deepEqual(searchFacilities(fixtures, 'coffee', 'pharmacy'), [])
  assert.deepEqual(searchFacilities(fixtures, 'coffee', 'all').map(item => item.id), ['qa-beta'])
  assert.deepEqual(searchFacilities(fixtures, 'atm', 'atm').map(item => item.id), ['qa-gamma'])
})

test('hidden facilities cannot be found by name, keyword or category', () => {
  for (const query of ['숨겨진', 'Hidden Drugstore', '비공개', 'private']) assert.deepEqual(ids(query), [])
  assert.deepEqual(searchFacilities(searchFixtures(), '', 'pharmacy'), [])
})

test('empty data and categories with no facilities return empty arrays', () => {
  assert.deepEqual(searchFacilities([], ''), [])
  assert.deepEqual(searchFacilities(searchFixtures(), '', 'dining'), [])
})

test('selection follows the matching result and is cleared if excluded or hidden', () => {
  const fixtures = searchFixtures()
  assert.equal(resolveSelectedFacility(searchFacilities(fixtures), 'qa-alpha')?.id, 'qa-alpha')
  assert.equal(resolveSelectedFacility(searchFacilities(fixtures), 'qa-beta')?.id, 'qa-beta')
  assert.equal(resolveSelectedFacility(searchFacilities(fixtures, 'coffee'), 'qa-alpha'), null)
  assert.equal(resolveSelectedFacility(fixtures, 'qa-hidden'), null)
  assert.equal(resolveSelectedFacility(fixtures, 'missing'), null)
  assert.equal(resolveSelectedFacility(fixtures, null), null)
})

test('staff loader uses the shared facilityDataset and propagates errors without substitutes', async () => {
  const dataset = { schemaVersion: 1 as const, dataStatus: 'demo' as const, facilities: searchFixtures() }
  assert.equal(await loadStaffDataset(async () => ({ facilityDataset: dataset })), dataset)
  await assert.rejects(() => loadStaffDataset(async () => { throw new Error('Validation failed') }), /Validation failed/)
})

test('every beer-serving venue is searchable by shared beer keyword in Staff and Guest', () => {
  const expected = ['malt-house-incheon-songdo', 'playground-brewery-taproom-songdo', 'geumbyeol-beer-songdo-lotte-mall']
  for (const search of [searchFacilities, searchGuestFacilities]) {
    const matched = search(facilityData.facilities as any, '맥주')
    for (const id of expected) assert.ok(matched.some(item => item.id === id), id)
    assert.ok(search(facilityData.facilities as any, '경복궁 갈비').some(item => item.id === 'gyeongbokgung-hanok-village'))
    assert.ok(search(facilityData.facilities as any, '현프아').some(item => item.id === 'hyundai-premium-outlet-songdo'))
    assert.ok(search(facilityData.facilities as any, '수상택시').some(item => item.id === 'songdo-central-park-water-taxi'))
  }
})

test('STEP 4: all dining and cafe venues include a localized food type, menu examples and searchable keywords', () => {
  const facilities = parseFacilityDataset(facilityData).facilities
  const foodVenues = facilities.filter(facility => facility.category === 'dining' || facility.category === 'cafe')
  assert.equal(foodVenues.length, 14)
  assert.equal(foodVenues.filter(facility => facility.category === 'dining').length, 11)
  assert.equal(foodVenues.filter(facility => facility.category === 'cafe').length, 3)
  for (const facility of foodVenues) {
    for (const language of GUIDE_LANGUAGES) {
      const description = facility.translations[language].description
      assert.ok(description.trim().length > 20, facility.id + '/' + language)
      assert.match(description, /메뉴 예시:|Menu examples:|菜品示例：|メニュー例：/, facility.id + '/' + language)
      assert.ok(facility.keywords[language].length >= 5, facility.id + '/' + language)
      const type = description.split(' · ')[0]!
      assert.ok(facility.keywords[language].includes(type), facility.id + '/' + language)
      for (const item of facility.keywords[language]) assert.ok(searchGuestFacilities(facilities, item, facility.category, language).some(found => found.id === facility.id), facility.id + '/' + language + '/' + item)
    }
    assert.match(facility.englishPhrases[0]!, /bulgogi|Menu items may vary|menu examples|Popular menu examples|Typical menu items include|serves craft beer|webfoot octopus/i)
    assert.ok(facility.englishPhraseMeanings?.[0]?.length, facility.id)
    assert.equal(facility.lastVerifiedAt, null, facility.id) // Individual menu stock was not checked on site.
  }
})

test('STEP 4: Korean menu and cuisine queries match all relevant venues across Staff and Guest', () => {
  const facilities = parseFacilityDataset(facilityData).facilities
  const expected: { query: string; ids: string[] }[] = [
    { query: '맥주', ids: ['malt-house-incheon-songdo', 'burgeroom181-songdo', 'playground-brewery-taproom-songdo', 'geumbyeol-beer-songdo-lotte-mall'] },
    { query: '고기', ids: ['hanyang-songdo-hanok-village', 'gyeongbokgung-hanok-village'] },
    { query: '갈비', ids: ['gyeongbokgung-hanok-village'] },
    { query: '중식', ids: ['paljinhyang-hanok-village'] },
    { query: '짜장면', ids: ['paljinhyang-hanok-village'] },
    { query: '김밥', ids: ['otto-gimbap-songdo'] },
    { query: '쭈꾸미', ids: ['songjjujip-main'] },
    { query: '수제버거', ids: ['burgeroom181-songdo', 'playground-brewery-taproom-songdo'] },
    { query: '커피', ids: ['compose-coffee-incheon-songdo-central-park', 'hollys-incheon-hanok-village', 'starbucks-songdo-central-park'] },
    { query: '햄버거', ids: ['burgeroom181-songdo', 'moms-touch-songdo-central-park', 'burger-king-incheon-songdo-central-park'] },
  ]
  for (const { query, ids } of expected) {
    for (const search of [searchFacilities, searchGuestFacilities]) {
      const result = search(facilities, query).map(facility => facility.id)
      for (const id of ids) assert.ok(result.includes(id), query + ': ' + id)
    }
  }
  assert.ok(searchFacilities(facilities, '경복궁 갈비').some(item => item.id === 'gyeongbokgung-hanok-village'))
  assert.ok(searchGuestFacilities(facilities, '베트남 치킨').some(item => item.id === 'playground-brewery-taproom-songdo'))
  assert.ok(searchGuestFacilities(facilities, 'waSAbi', 'dining').some(item => item.id === 'otto-gimbap-songdo'))
})
