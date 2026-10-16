import assert from 'node:assert/strict'
import test from 'node:test'
import raw from '../src/data/frontdesk-scripts.json' with { type: 'json' }
import schema from '../src/data/frontdesk-scripts.schema.json' with { type: 'json' }
import originalHotel from '../src/data/hotel.json' with { type: 'json' }
import originalFacilities from '../src/data/facilities.json' with { type: 'json' }
import { parseFrontdeskScriptDataset } from '../src/data/validateFrontdeskScriptDataset.ts'
import { frontdeskScriptDataset } from '../src/data/frontdeskScriptDataset.ts'
import { FRONTDESK_SCRIPT_CATEGORIES, FRONTDESK_SOURCE_SECTIONS } from '../src/types/frontdeskScript.ts'

const fresh = () => structuredClone(raw)
const expectedCounts = [5, 5, 7, 8, 5]

test('front desk V1.1 contains 30 ordered bilingual scripts and no unreviewed approvals', () => {
  const data = parseFrontdeskScriptDataset(fresh())
  assert.equal(data.schemaVersion, 1)
  assert.equal(data.dataStatus, 'demo')
  assert.equal(data.scripts.length, 30)
  assert.deepEqual(data, frontdeskScriptDataset)
  assert.deepEqual(
    FRONTDESK_SCRIPT_CATEGORIES.map(category => data.scripts.filter(script => script.category === category).length),
    expectedCounts,
  )
  assert.deepEqual(schema.definitions.script.properties.category.enum, FRONTDESK_SCRIPT_CATEGORIES)
  assert.deepEqual(
    schema.definitions.script.properties.sourceSection.enum.filter((value): value is string => value !== null),
    FRONTDESK_SOURCE_SECTIONS,
  )
  assert.equal(new Set(data.scripts.map(script => script.id)).size, 30)
  for (const script of data.scripts) {
    assert.equal(script.reviewStatus, 'draft', script.id)
    assert.equal(script.lastVerifiedAt, null, script.id)
    assert.ok(script.title.trim())
    assert.ok(script.keywords.length)
    for (const text of [script.question, script.quickAnswer, ...(script.details ? [script.details] : [])]) {
      assert.deepEqual(Object.keys(text), ['en', 'ko'])
      assert.ok(text.en.trim(), script.id)
      assert.ok(text.ko.trim(), script.id)
    }
    assert.ok(script.staffChecks.every(item => item.trim()), script.id)
  }
  assert.deepEqual(
    data.scripts.filter(script => !script.details).map(script => script.id),
    ['breakfast-adult-price', 'microwave-location', 'vehicle-registration', 'hotel-phone'],
  )
})

test('user-provided smoking area is distinctly sourced; existing hotel and facilities copy is unchanged', () => {
  const data = parseFrontdeskScriptDataset(raw)
  const smoking = data.scripts.find(script => script.id === 'smoking-area')!
  assert.equal(smoking.category, 'hotel-policy')
  assert.equal(smoking.sourceType, 'user-provided')
  assert.equal(smoking.sourceSection, null)
  assert.match(smoking.quickAnswer.en, /outside.*left of the main entrance/i)
  assert.match(smoking.details!.en, /silver ashtray bin/)
  assert.match(smoking.details!.ko, /은색 재떨이 통/)
  assert.deepEqual(data.scripts.filter(script => script.sourceType === 'user-provided').map(script => script.id), ['smoking-area'])
  for (const script of data.scripts.filter(item => item.sourceType === 'hotel-data')) {
    assert.ok(script.sourceSection)
    assert.ok(Object.hasOwn(originalHotel.translations.ko, script.sourceSection), script.id)
    assert.ok(originalHotel.translations.ko[script.sourceSection!].trim(), script.id)
  }
  assert.equal(originalHotel.dataStatus, 'demo')
  assert.equal(originalHotel.checkInTime, '15:00')
  assert.equal(originalHotel.checkOutTime, '12:00')
  assert.equal(originalFacilities.facilities.length, 23)
})

test('critical operational responses keep safety and verification qualifiers', () => {
  const data = parseFrontdeskScriptDataset(raw)
  const find = (id: string) => data.scripts.find(script => script.id === id)!
  assert.match(find('late-check-out').quickAnswer.en, /check if.*available/i)
  assert.match(find('late-check-out').details!.en, /11,000 won per hour.*5 PM/)
  assert.ok(find('late-check-out').staffChecks.some(text => /가능 여부/.test(text)))
  assert.match(find('fire-alarm-safety').quickAnswer.en, /follow the safety instructions/i)
  assert.doesNotMatch(find('fire-alarm-safety').quickAnswer.en, /inspection|drill/i)
  assert.ok(find('fire-alarm-safety').staffChecks.some(text => /대피/.test(text)))
  assert.match(find('food-delivery').quickAnswer.en, /generally restricted/i)
  assert.match(find('check-in-deposit-id').details!.en, /confirm the check-in procedure/i)
  assert.match(find('pet-friendly-rooms').details!.en, /check.*available/i)
  assert.match(find('indoor-smoking-policy').details!.en, /200,000 won/)
  assert.match(find('breakfast-child-price').quickAnswer.en, /19,000 won.*five to eight/i)
  assert.match(find('room-wifi').quickAnswer.en, /No password is needed/i)
})

test('parsing never mutates caller content and a future expanded dataset can be empty', () => {
  const input = fresh(), before = structuredClone(input)
  const output = parseFrontdeskScriptDataset(input)
  assert.notStrictEqual(input, output)
  assert.deepEqual(input, before)
  assert.equal(parseFrontdeskScriptDataset({ ...input, scripts: [] }).scripts.length, 0)
})

const invalidCases: [string, (data: Record<string, any>) => void][] = [
  ['unsupported schema version', data => { data.schemaVersion = 2 }],
  ['unknown dataset field', data => { data.secret = 'should fail' }],
  ['invalid data status', data => { data.dataStatus = 'unchecked' }],
  ['invalid category', data => { data.scripts[0].category = 'tourism' }],
  ['unknown script field', data => { data.scripts[0].privateNotes = 'not in contract' }],
  ['invalid script id', data => { data.scripts[0].id = '../bad' }],
  ['missing Korean question', data => { delete data.scripts[0].question.ko }],
  ['blank English response', data => { data.scripts[0].quickAnswer.en = '  ' }],
  ['numeric Korean response', data => { data.scripts[0].quickAnswer.ko = 123 }],
  ['missing Korean details', data => { delete data.scripts[0].details.ko }],
  ['blank English details', data => { data.scripts[0].details.en = '  ' }],
  ['empty keywords', data => { data.scripts[0].keywords = [] }],
  ['blank keyword', data => { data.scripts[0].keywords[0] = '' }],
  ['duplicate literal keywords', data => { data.scripts[0].keywords = ['check-in', 'check-in'] }],
  ['duplicate normalized keywords', data => { data.scripts[0].keywords = ['CHECK-IN', 'check-in'] }],
  ['empty staff check', data => { data.scripts[0].staffChecks = [''] }],
  ['invalid review status', data => { data.scripts[0].reviewStatus = 'live' }],
  ['missing review field', data => { delete data.scripts[0].reviewStatus }],
  ['invalid verification date', data => { data.scripts[0].lastVerifiedAt = '2026-02-30' }],
  ['new observation incorrectly linked to hotel source', data => { data.scripts[18].sourceSection = 'notes' }],
  ['hotel data missing source section', data => { data.scripts[0].sourceSection = null }],
  ['invalid source type', data => { data.scripts[0].sourceType = 'internet' }],
]
for (const [name, mutate] of invalidCases) {
  test(`invalid scripts reject ${name}`, () => {
    const d: Record<string, any> = fresh()
    mutate(d)
    assert.throws(() => parseFrontdeskScriptDataset(d), /Invalid frontdesk scripts/)
  })
}

test('duplicate script IDs reject rather than silently overriding copy', () => {
  const data = fresh()
  data.scripts[1]!.id = data.scripts[0]!.id
  assert.throws(() => parseFrontdeskScriptDataset(data), /Duplicate frontdesk script ID/)
})

test('review dates are mandatory for approved replies and impossible for draft replies', () => {
  const data = parseFrontdeskScriptDataset(fresh())
  const script = data.scripts[0]!
  script.reviewStatus = 'approved'
  assert.throws(() => parseFrontdeskScriptDataset(data), /approved without lastVerifiedAt/)
  script.lastVerifiedAt = '2026-10-16'
  assert.doesNotThrow(() => parseFrontdeskScriptDataset(data))
  script.reviewStatus = 'draft'
  assert.throws(() => parseFrontdeskScriptDataset(data), /draft but has lastVerifiedAt/)
})

test('production cannot accidentally publish a script still marked draft', () => {
  const data = parseFrontdeskScriptDataset(fresh())
  data.dataStatus = 'production'
  assert.throws(() => parseFrontdeskScriptDataset(data), /requires review before production/)
  for (const script of data.scripts) {
    script.reviewStatus = 'approved'
    script.lastVerifiedAt = '2026-10-16'
  }
  assert.doesNotThrow(() => parseFrontdeskScriptDataset(data))
})
