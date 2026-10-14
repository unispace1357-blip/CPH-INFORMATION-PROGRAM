import assert from 'node:assert/strict'
import test from 'node:test'
import rawData from '../src/data/facilities.json' with { type: 'json' }
import schema from '../src/data/facilities.schema.json' with { type: 'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { FACILITY_CATEGORIES } from '../src/types/facility.ts'
import type { GuideLanguage } from '../src/types/facility.ts'

const fresh = () => structuredClone(rawData)

test('demo fixtures validate and include four languages and both visibility states', () => {
  const data = parseFacilityDataset(fresh())
  assert.equal(data.dataStatus, 'demo')
  assert.equal(data.facilities.length, 6)
  assert.ok(data.facilities.some(f => f.isPublished))
  assert.ok(data.facilities.some(f => !f.isPublished))
  for (const facility of data.facilities) {
    assert.deepEqual(Object.keys(facility.translations), ['ko', 'en', 'zh-CN', 'ja'])
    assert.equal(facility.lastVerifiedAt, null)
  }
})

test('an empty dataset remains valid', () => {
  assert.equal(parseFacilityDataset({ ...fresh(), facilities: [] }).facilities.length, 0)
})

test('valid calendar dates are accepted and impossible or incorrectly formatted dates rejected', () => {
  const data = parseFacilityDataset(fresh())
  const facility = data.facilities[0]!
  for (const date of ['2024-02-29', '2026-10-14']) {
    facility.lastVerifiedAt = date
    assert.doesNotThrow(() => parseFacilityDataset(data))
  }
  for (const date of ['2026-02-29', '2026-02-30', '2026-13-01', '14/10/2026']) {
    facility.lastVerifiedAt = date
    assert.throws(() => parseFacilityDataset(data), /Invalid facility dataset/)
  }
})

test('duplicate IDs are rejected', () => {
  const data = fresh()
  data.facilities[1]!.id = data.facilities[0]!.id
  assert.throws(() => parseFacilityDataset(data), /Duplicate facility ID/)
})

test('schema language and category lists agree with the TypeScript contract', () => {
  const languages = ['ko', 'en', 'zh-CN', 'ja'] as const satisfies readonly GuideLanguage[]
  const categories = FACILITY_CATEGORIES
  assert.deepEqual(schema.definitions.facility.properties.translations.required, languages)
  assert.deepEqual(schema.definitions.facility.properties.category.enum, categories)
})

const invalidCases: [string, (data: Record<string, any>) => void][] = [
  ['missing language', data => { delete data.facilities[0].translations.ja }],
  ['unknown category', data => { data.facilities[0].category = 'invalid' }],
  ['non-boolean visibility', data => { data.facilities[0].isPublished = 'true' }],
  ['missing verification date', data => { delete data.facilities[0].lastVerifiedAt }],
  ['missing keywords', data => { delete data.facilities[0].keywords.en }],
  ['blank name', data => { data.facilities[0].translations.ko.name = '  ' }],
  ['invalid ID', data => { data.facilities[0].id = '../invalid' }],
  ['unknown field', data => { data.facilities[0].unexpectedField = 'invalid' }],
  ['unsupported schema version', data => { data.schemaVersion = 2 }],
  ['unsupported dataset status', data => { data.dataStatus = 'unknown' }],
]
for (const [name, mutate] of invalidCases) {
  test(`rejects ${name}`, () => {
    const data = fresh()
    mutate(data)
    assert.throws(() => parseFacilityDataset(data), /Invalid facility dataset/)
  })
}


test('sauna_spa and atm categories are accepted', () => {
  const data = parseFacilityDataset(fresh())
  for (const category of ['sauna_spa', 'atm'] as const) {
    data.facilities[0]!.category = category
    assert.doesNotThrow(() => parseFacilityDataset(data))
  }
})

test('legacy fields are normalized without modifying the input', () => {
  const legacy = JSON.parse(JSON.stringify(rawData)) as Record<string, any>
  for (const facility of legacy.facilities) {
    delete facility.walkingMinutes
    delete facility.closedDays
    delete facility.keywords['zh-CN']
    delete facility.keywords.ja
  }
  const before = structuredClone(legacy)
  const data = parseFacilityDataset(legacy)
  assert.deepEqual(legacy, before)
  for (const facility of data.facilities) {
    assert.equal(facility.walkingMinutes, null)
    assert.deepEqual(facility.closedDays, { ko: '', en: '', 'zh-CN': '', ja: '' })
    assert.deepEqual(facility.keywords['zh-CN'], [])
    assert.deepEqual(facility.keywords.ja, [])
  }
})

test('walking minutes allow null, zero and positive fractional numbers', () => {
  const data = parseFacilityDataset(fresh())
  for (const minutes of [null, 0, 7, 7.5]) {
    data.facilities[0]!.walkingMinutes = minutes
    assert.doesNotThrow(() => parseFacilityDataset(data))
  }
})

test('walking minutes reject negative, nonnumeric and nonfinite values', () => {
  for (const minutes of [-1, '7', NaN, Infinity]) {
    const data = JSON.parse(JSON.stringify(rawData)) as Record<string, any>
    data.facilities[0].walkingMinutes = minutes
    assert.throws(() => parseFacilityDataset(data), /Invalid facility dataset/)
  }
})

test('closed days require all four languages when explicitly supplied', () => {
  const data = JSON.parse(JSON.stringify(rawData)) as Record<string, any>
  delete data.facilities[0].closedDays.ja
  assert.throws(() => parseFacilityDataset(data), /Invalid facility dataset/)
  data.facilities[0].closedDays.ja = 123
  assert.throws(() => parseFacilityDataset(data), /Invalid facility dataset/)
})

test('all four keyword arrays are preserved and validated', () => {
  const data = parseFacilityDataset(fresh())
  assert.deepEqual(Object.keys(data.facilities[0]!.keywords), ['ko', 'en', 'zh-CN', 'ja'])
  for (const language of ['zh-CN', 'ja'] as const) {
    const invalid = fresh()
    invalid.facilities[0]!.keywords[language] = ['  ']
    assert.throws(() => parseFacilityDataset(invalid), /Invalid facility dataset/)
  }
})
