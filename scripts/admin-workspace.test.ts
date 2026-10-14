import assert from 'node:assert/strict'
import test from 'node:test'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { parseHotelDataset } from '../src/data/validateHotelDataset.ts'
import { newFacilityDraft, facilityToDraft, draftToFacility, saveFacility, deleteFacility, filterAdminFacilities, moveListItem, importFacilities, importHotel, exportFacilities, exportHotel, exportPublicFacilities, MAX_JSON_BYTES, productionReadiness, changeStatus, hasChanges, explainError } from '../tools/admin/services/workspace.ts'
import { adminFacilities, adminHotel, publicationFixtures } from './admin-test-fixtures.ts'

test('new editor starts private and unknown with blank translations; no synthetic policies', () => {
  const draft = newFacilityDraft()
  assert.equal(draft.isPublished, false); assert.equal(draft.lastVerifiedAt, null); assert.equal(draftToFacility(draft).walkingMinutes, null)
  for (const language of GUIDE_LANGUAGES) { assert.ok(Object.values(draft.translations[language]).every(text => text === '')); assert.equal(draft.closedDays[language], ''); assert.deepEqual(draft.keywords[language], []) }
  assert.deepEqual(draft.englishPhrases, [])
})
test('add a valid facility without overwriting the input, status or existing facilities', () => {
  const dataset = adminFacilities(), before = structuredClone(dataset)
  const draft = facilityToDraft(dataset.facilities[0]!); draft.id = 'new-qa-06'; draft.isPublished = false
  const result = saveFacility(dataset, draft, null)
  assert.equal(result.facilities.length, 3); assert.equal(result.dataStatus, 'demo'); assert.equal(result.facilities.at(-1)!.isPublished, false)
  assert.deepEqual(dataset, before)
})
test('duplicate ID is blocked rather than overwriting an existing record', () => {
  const dataset = adminFacilities(); assert.throws(() => saveFacility(dataset, facilityToDraft(dataset.facilities[0]!), null), /Duplicate/); assert.equal(dataset.facilities.length, 2)
})
test('invalid ID, category, date and missing multilingual names cannot be saved', () => {
  for (const field of ['id', 'category', 'date', 'name'] as const) {
    const dataset = adminFacilities(), draft = facilityToDraft(dataset.facilities[0]!)
    if (field === 'id') draft.id = 'Invalid ID'
    if (field === 'category') draft.category = 'invalid' as typeof draft.category
    if (field === 'date') draft.lastVerifiedAt = '2025-02-29'
    if (field === 'name') draft.translations.ja.name = ' '
    assert.throws(() => saveFacility(dataset, draft, field === 'id' ? null : draft.id))
    assert.equal(dataset.facilities.length, 2)
  }
})
test('existing IDs remain immutable; missing edit target does not create a replacement', () => {
  const dataset = adminFacilities(), draft = facilityToDraft(dataset.facilities[0]!); draft.id = 'other-id'
  assert.throws(() => saveFacility(dataset, draft, 'qa-admin-public'), /ID/)
  assert.throws(() => saveFacility(dataset, draft, 'missing-id'))
})
test('category, visibility, closure, walking and verification edits retain the data contract', () => {
  const dataset = adminFacilities(), draft = facilityToDraft(dataset.facilities[0]!)
  draft.category = 'sauna_spa'; draft.isPublished = false; draft.walkingMinutes = '2.5'; draft.lastVerifiedAt = '2024-02-29'; draft.closedDays.ko = '검증용 휴무 안내'
  const record = saveFacility(dataset, draft, draft.id).facilities[0]!
  assert.equal(record.category, 'sauna_spa'); assert.equal(record.isPublished, false); assert.equal(record.walkingMinutes, 2.5); assert.equal(record.lastVerifiedAt, '2024-02-29'); assert.equal(record.closedDays.ko, '검증용 휴무 안내')
})
test('delete requires confirmation and removes only the selected record without mutating input', () => {
  const dataset = adminFacilities(); assert.equal(deleteFacility(dataset, 'qa-admin-public', false), dataset)
  assert.deepEqual(deleteFacility(dataset, 'qa-admin-public', true).facilities.map(item => item.id), ['qa-admin-private']); assert.equal(dataset.facilities.length, 2)
  assert.throws(() => deleteFacility(dataset, 'unknown', true))
})
test('admin filters include private facilities, name matches across languages and AND constraints', () => {
  const dataset = adminFacilities(); dataset.facilities[1]!.translations.ja.name = '非公開検証専用'
  assert.equal(filterAdminFacilities(dataset, '', 'all', 'all').length, 2)
  assert.equal(filterAdminFacilities(dataset, '検証専用', 'cafe', 'private').length, 1)
  assert.equal(filterAdminFacilities(dataset, '検証専用', 'atm', 'private').length, 0)
  assert.equal(filterAdminFacilities(dataset, '検証専用', 'cafe', 'public').length, 0)
})
for (const language of GUIDE_LANGUAGES) {
  test(`${language} facility edits leave every other language and common fields unchanged`, () => {
    const dataset = adminFacilities(), draft = facilityToDraft(dataset.facilities[0]!), original = structuredClone(dataset.facilities[0]!)
    draft.translations[language].name = `Fictional ${language} name`; draft.translations[language].description = ''; draft.closedDays[language] = `QA closure ${language}`; draft.keywords[language] = [`QA ${language}`]
    const record = saveFacility(dataset, draft, draft.id).facilities[0]!
    for (const other of GUIDE_LANGUAGES.filter(value => value !== language)) { assert.deepEqual(record.translations[other], original.translations[other]); assert.deepEqual(record.keywords[other], original.keywords[other]); assert.equal(record.closedDays[other], original.closedDays[other]) }
    assert.equal(record.category, original.category); assert.equal(record.translations[language].description, '')
  })
}
test('keyword add/edit/delete survives export; blanks and normalized duplicates are explicitly rejected', () => {
  const dataset = adminFacilities(), draft = facilityToDraft(dataset.facilities[0]!)
  draft.keywords.en = ['sauna', 'spa']; assert.deepEqual(saveFacility(dataset, draft, draft.id).facilities[0]!.keywords.en, ['sauna', 'spa'])
  draft.keywords.en = ['SPA']; assert.deepEqual(saveFacility(dataset, draft, draft.id).facilities[0]!.keywords.en, ['SPA'])
  draft.keywords.en = []; assert.deepEqual(saveFacility(dataset, draft, draft.id).facilities[0]!.keywords.en, [])
  for (const invalid of [[''], ['  '], ['SPA', ' spa '], ['é', 'e\u0301']]) { draft.keywords.en = invalid; assert.throws(() => saveFacility(dataset, draft, draft.id)); assert.deepEqual(draft.keywords.en, invalid) }
})
test('English phrase edits, additions, deletion and ordering round-trip for Staff without generated text', () => {
  const dataset = adminFacilities(), draft = facilityToDraft(dataset.facilities[0]!)
  draft.englishPhrases = ['Fictional first.', 'Fictional second.', 'Fictional third.']
  draft.englishPhrases = moveListItem(draft.englishPhrases, 2, -1); draft.englishPhrases[0] = 'Fictional edited.'; draft.englishPhrases.splice(1, 1)
  const result = importFacilities(exportFacilities(saveFacility(dataset, draft, draft.id)))
  assert.deepEqual(result.facilities[0]!.englishPhrases, ['Fictional edited.', 'Fictional second.'])
  assert.deepEqual(moveListItem(['one'], 0, -1), ['one'])
})
test('zero, null and fractional walking inputs survive while malformed/negative/nonfinite inputs retain draft', () => {
  const draft = facilityToDraft(adminFacilities().facilities[0]!)
  for (const [input, value] of [['', null], ['0', 0], ['1.5', 1.5]] as const) { draft.walkingMinutes = input; assert.equal(draftToFacility(draft).walkingMinutes, value) }
  for (const input of ['-1', 'NaN', 'Infinity', 'abc', '9'.repeat(400)]) { draft.walkingMinutes = input; assert.throws(() => draftToFacility(draft)); assert.equal(draft.walkingMinutes, input) }
})
for (const language of GUIDE_LANGUAGES) {
  test(`${language} hotel edits and empty translations preserve other languages and common times`, () => {
    const hotel = adminHotel(), before = structuredClone(hotel); hotel.translations[language].breakfast = `Fictional ${language} note`
    const result = importHotel(exportHotel(hotel))
    assert.equal(result.translations[language].breakfast, `Fictional ${language} note`); assert.equal(result.translations[language].name, ''); assert.equal(result.checkInTime, null)
    for (const other of GUIDE_LANGUAGES.filter(value => value !== language)) assert.deepEqual(result.translations[other], before.translations[other])
  })
}
test('hotel times and real calendar dates use the existing schema and preserve unknown values', () => {
  const hotel = adminHotel(); assert.deepEqual(importHotel(exportHotel(hotel)), hotel)
  hotel.checkInTime = '01:23'; hotel.checkOutTime = '23:59'; hotel.lastVerifiedAt = '2024-02-29'; assert.doesNotThrow(() => parseHotelDataset(hotel))
  for (const value of ['24:00', '1:23', '04:60', 'wrong']) { hotel.checkInTime = value; assert.throws(() => exportHotel(hotel)) }
  hotel.checkInTime = null; hotel.lastVerifiedAt = '2025-02-29'; assert.throws(() => exportHotel(hotel))
})
test('valid facility/hotel JSON round-trips Unicode and every field without UI state', () => {
  const facilities = adminFacilities(), hotel = adminHotel(); facilities.facilities[0]!.translations.ko.notes = '한글 中文 日本語\n<&> "인용"'; hotel.translations.ja.notes = '仮の検証\n二行'
  assert.deepEqual(importFacilities(exportFacilities(facilities)), facilities); assert.deepEqual(importHotel(exportHotel(hotel)), hotel)
  assert.equal(exportFacilities(facilities).includes('originalId'), false)
})
test('malformed, wrong version/language/schema and duplicate JSON fail without overwriting caller data', () => {
  const before = adminFacilities(), text = exportFacilities(before)
  for (const invalid of ['{', 'null', '[]', JSON.stringify({ ...before, schemaVersion: 2 }), JSON.stringify({ ...before, facilities: [before.facilities[0], before.facilities[0]] })]) assert.throws(() => importFacilities(invalid))
  const missing = structuredClone(before) as Record<string, any>; delete missing.facilities[0].translations.ja; assert.throws(() => importFacilities(JSON.stringify(missing)))
  assert.equal(exportFacilities(before), text); assert.throws(() => importHotel(text)); assert.throws(() => importFacilities(exportHotel(adminHotel())))
})
test('large JSON uses UTF-8 byte limits before parsing', () => {
  assert.throws(() => importFacilities('x'.repeat(MAX_JSON_BYTES + 1)), /2MB/)
  assert.throws(() => importHotel('한'.repeat(Math.ceil(MAX_JSON_BYTES / 3))), /2MB/)
})
test('schema-invalid workspace cannot export normal JSON or public JSON', () => {
  const dataset = adminFacilities(); dataset.facilities[0]!.walkingMinutes = -1
  assert.throws(() => exportFacilities(dataset)); assert.throws(() => exportPublicFacilities(dataset))
  assert.throws(() => exportFacilities({ ...adminFacilities(), temporaryUI: true }))
})
test('public JSON removes all private records and retains source/version/status', () => {
  const { facilities, privateTokens } = publicationFixtures(), before = structuredClone(facilities)
  const text = exportPublicFacilities(facilities), result = importFacilities(text)
  assert.deepEqual(result.facilities.map(item => item.id), ['qa-admin-public']); assert.equal(result.schemaVersion, 1); assert.equal(result.dataStatus, 'production')
  for (const token of privateTokens) assert.equal(text.includes(token), false)
  assert.deepEqual(facilities, before)
})
test('production readiness checks missing fields before status change; demo editing does not promote', () => {
  const facilities = adminFacilities(), hotel = adminHotel()
  const result = productionReadiness(facilities, hotel); assert.equal(result.valid, false); assert.ok(result.messages.some(text => text.includes('확인일')))
  assert.throws(() => changeStatus(facilities, hotel, 'facilities', 'production', true)); assert.equal(facilities.dataStatus, 'demo'); assert.equal(hotel.dataStatus, 'demo')
})
test('explicit production transition needs confirmation and valid policies; other dataset stays unchanged', () => {
  const { facilities, hotel } = publicationFixtures(); facilities.dataStatus = 'demo'; hotel.dataStatus = 'demo'
  assert.equal(changeStatus(facilities, hotel, 'facilities', 'production', false).facilities, facilities)
  const result = changeStatus(facilities, hotel, 'facilities', 'production', true)
  assert.equal(result.facilities.dataStatus, 'production'); assert.equal(result.hotel.dataStatus, 'demo'); assert.equal(facilities.dataStatus, 'demo')
  hotel.lastVerifiedAt = '2099-01-01'; assert.equal(productionReadiness(facilities, hotel).valid, false)
})
test('dirty snapshots distinguish editor changes, save, export and later modifications without storage', () => {
  const dataset = adminFacilities(), baseline = JSON.stringify(dataset), draft = facilityToDraft(dataset.facilities[0]!), draftBaseline = JSON.stringify(draft)
  assert.equal(hasChanges(dataset, baseline), false); draft.translations.en.notes = 'Fictional edit'; assert.equal(hasChanges(draft, draftBaseline), true); assert.equal(hasChanges(dataset, baseline), false)
  const saved = saveFacility(dataset, draft, draft.id); assert.equal(hasChanges(saved, baseline), true); assert.equal(hasChanges(saved, JSON.stringify(saved)), false)
})
test('friendly errors preserve technical details and identify duplicate, language and field', () => {
  assert.ok(explainError(new Error('Duplicate facility ID: qa-dup')).messages[0]!.includes('중복'))
  const issue = explainError(new Error('Production validation failed: qa-one.translations.ja.address is required; hotel.checkInTime is required'))
  assert.ok(issue.messages[0]!.includes('日本語')); assert.ok(issue.messages[0]!.includes('주소')); assert.ok(issue.messages[1]!.includes('체크인 시간')); assert.ok(issue.technical.includes('is required'))
})
