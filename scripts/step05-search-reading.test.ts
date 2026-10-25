import assert from 'node:assert/strict'
import test from 'node:test'
import rawFacilities from '../src/data/facilities.json' with { type: 'json' }
import rawScripts from '../src/data/frontdesk-scripts.json' with { type: 'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { parseFrontdeskScriptDataset } from '../src/data/validateFrontdeskScriptDataset.ts'
import { searchFacilities, normalizeSearchTerm } from '../src/services/facilitySearch.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { searchFrontdeskScripts } from '../src/services/frontdeskScriptSearch.ts'
import { englishReadingSegments } from '../src/services/englishReading.ts'
import { joinEnglishPhrases } from '../src/services/clipboard.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'

const facilities = parseFacilityDataset(rawFacilities).facilities
const findIds = (query: string) => searchFacilities(facilities, query).map(facility => facility.id)

test('STEP 5 indexes all 27 venues with English aliases and four-language descriptions', () => {
  assert.equal(facilities.length, 27)
  const before = structuredClone(facilities)
  for (const facility of facilities) {
    assert.ok(facility.keywords.en.length > 0, facility.id)
    for (const language of GUIDE_LANGUAGES) {
      const name = facility.translations[language].name
      assert.ok(searchGuestFacilities(facilities, name, facility.category, language).some(result => result.id === facility.id), facility.id + '/' + language)
    }
  }
  assert.deepEqual(facilities, before)
})

test('STEP 5 accepts spacing, punctuation, case and Unicode compatibility variants', () => {
  const expectations: [string, string][] = [
    ['MaltHouse', 'malt-house-incheon-songdo'],
    ['malt-house', 'malt-house-incheon-songdo'],
    ['burgerking', 'burger-king-incheon-songdo-central-park'],
    ['Burger King', 'burger-king-incheon-songdo-central-park'],
    ['Burger-Room181', 'burgeroom181-songdo'],
    ['ＭＯＭＳ　ＴＯＵＣＨ', 'moms-touch-songdo-central-park'],
    ['STARBUCKS', 'starbucks-songdo-central-park'],
    ['g-tower', 'g-tower-ifez-observatory'],
    ['현대 프리미엄 아울렛', 'hyundai-premium-outlet-songdo'],
    ['현프아', 'hyundai-premium-outlet-songdo'],
    ['센트럴 파크 역', 'central-park-station-exit-3'],
  ]
  for (const [query, id] of expectations) {
    assert.ok(findIds(query).includes(id), query)
    for (const language of GUIDE_LANGUAGES) assert.ok(searchGuestFacilities(facilities, query, 'all', language).some(f => f.id === id), query + '/' + language)
  }
  assert.equal(normalizeSearchTerm('  ＳＴＡＲＢＵＣＫＳ  '), 'starbucks')
})

test('STEP 5 expands only curated synonyms; returns all matches in stable order', () => {
  for (const query of ['호프집', '맥줏집', '술집', '펍']) {
    const result = findIds(query)
    for (const id of ['malt-house-incheon-songdo', 'playground-brewery-taproom-songdo', 'geumbyeol-beer-songdo-lotte-mall']) {
      assert.ok(result.includes(id), query + ': ' + id)
    }
    assert.deepEqual(result, searchGuestFacilities(facilities, query).map(f => f.id), query)
  }
  for (const query of ['커피숍', '커피샵', 'coffeeshop', 'coffee-shop']) {
    const results = findIds(query)
    for (const id of ['compose-coffee-incheon-songdo-central-park', 'hollys-incheon-hanok-village', 'starbucks-songdo-central-park']) assert.ok(results.includes(id), query + ': ' + id)
  }
  assert.ok(findIds('고깃집').includes('gyeongbokgung-hanok-village'))
  assert.ok(findIds('중국음식').includes('paljinhyang-hanok-village'))
  assert.ok(findIds('와사비').includes('otto-gimbap-songdo'))
  assert.ok(findIds('쭈꾸미').includes('songjjujip-main'))
  assert.ok(findIds('김밥 포장').includes('otto-gimbap-songdo'))
  assert.ok(findIds('맥주 식당').includes('geumbyeol-beer-songdo-lotte-mall'))
})

test('STEP 5 preserves exclusions, category AND, literal queries and avoids unsafe fuzzy guesses', () => {
  assert.deepEqual(findIds('맥주 약국'), [])
  assert.deepEqual(findIds('낙지'), [])
  assert.deepEqual(findIds('.*[not-a-regex]'), [])
  assert.deepEqual(searchFacilities(facilities, '맥주', 'pharmacy'), [])
  assert.ok(searchFacilities(facilities, '맥주', 'dining').length >= 3)
  const withHidden = structuredClone(facilities)
  withHidden[0]!.isPublished = false
  withHidden[0]!.keywords.ko.push('ONLY_HIDDEN_SENTINEL')
  assert.deepEqual(searchFacilities(withHidden, 'ONLY_HIDDEN_SENTINEL'), [])
  assert.deepEqual(searchGuestFacilities(withHidden, 'ONLY_HIDDEN_SENTINEL'), [])
})

test('STEP 5 English reading hints preserve original English exactly and have bounded count', () => {
  const examples: [string, string][] = [
    ['The coastal observatory is near Convensia.', 'coastal'],
    ['Please collect your delivery from the shelf at reception.', 'delivery'],
    ['A complimentary microwave is available.', 'complimentary'],
    ['There is a brewery nearby.', 'brewery'],
  ]
  for (const [phrase, term] of examples) {
    const parts = englishReadingSegments(phrase)
    assert.equal(parts.map(part => part.text).join(''), phrase)
    assert.ok(parts.some(part => part.text.toLowerCase() === term && part.reading), phrase)
    assert.ok(parts.filter(part => part.reading).length <= 3)
    assert.equal(joinEnglishPhrases([phrase]), phrase)
  }
  assert.deepEqual(englishReadingSegments(''), [])
  assert.deepEqual(englishReadingSegments('No unknown token in this sentence.'), [{ text: 'No unknown token in this sentence.' }])
  assert.equal(englishReadingSegments('Our deliveries are ready.').some(segment => segment.reading), false)
  assert.ok(englishReadingSegments('Delivery delivery delivery delivery').filter(segment => segment.reading).length === 3)
})

test('STEP 5 front-desk script search includes replies but never internal staff checks', () => {
  const scripts = parseFrontdeskScriptDataset(structuredClone(rawScripts)).scripts
  const smoking = scripts.find(s => s.id === 'indoor-smoking-policy')!
  const delivery = scripts.find(s => s.id === 'food-delivery')!
  assert.ok(searchFrontdeskScripts(scripts, 'cleaning fee').some(s => s.id === smoking.id))
  assert.ok(searchFrontdeskScripts(scripts, 'shelf').some(s => s.id === delivery.id))
  smoking.staffChecks = ['HIDDEN_INTERNAL_SENTINEL']
  assert.deepEqual(searchFrontdeskScripts([smoking], 'HIDDEN_INTERNAL_SENTINEL'), [])
})
