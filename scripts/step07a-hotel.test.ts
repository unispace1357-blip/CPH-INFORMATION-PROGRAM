import assert from 'node:assert/strict'
import test from 'node:test'
import hotel from '../src/data/hotel.json' with { type: 'json' }
import facilities from '../src/data/facilities.json' with { type: 'json' }
import reference from '../docs/reference/step07a-approved-copy.json' with { type: 'json' }
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { parseHotelDataset } from '../src/data/validateHotelDataset.ts'
import { validateProductionData } from '../src/data/validateProductionData.ts'
import { hotelParagraphs } from '../src/services/guestHotelPresentation.ts'
import { importHotel, exportHotel } from '../tools/admin/services/workspace.ts'
import { APPROVED_MAPPING, verifyApprovedHotel } from './validate-hotel-copy.ts'
import { publicationFixtures } from './admin-test-fixtures.ts'

test('approved reference records all 35 IDs, 34 unique applied IDs, source hash and no translator results', () => {
  assert.equal(reference.records.length, 35)
  assert.deepEqual(reference.recognizedIds, Array.from({ length: 35 }, (_, i) => `H${String(i + 1).padStart(2, '0')}`))
  assert.equal(new Set(reference.records.map(item => item.id)).size, 35)
  const ids = Object.values(APPROVED_MAPPING).flat()
  assert.equal(ids.length, 34); assert.equal(new Set(ids).size, 34); assert.ok(!ids.includes('H33' as typeof ids[number]))
  assert.match(reference.sourceSha256, /^[a-f0-9]{64}$/)
  assert.equal(reference.sourceFile, 'CPH_STEP07A_4languages_translation_review_POLICY_CONFIRMED_DRAFT.xlsx')
  assert.equal(reference.translatorComparisonRows, 105); assert.equal(reference.translatorResultsRecorded, 0)
})

test('all 35 approved IDs appear once in their assigned field in every language, except held H33', () => {
  for (const record of reference.records) {
    for (const language of GUIDE_LANGUAGES) {
      const text = record.translations[language]
      assert.ok(text.length > 0)
      const containing = Object.entries(hotel.translations[language]).filter(([, value]) => value.split('\n\n').includes(text)).map(([field]) => field)
      if (record.id === 'H33') assert.deepEqual(containing, [])
      else {
        const field = Object.entries(APPROVED_MAPPING).find(([, ids]) => (ids as readonly string[]).includes(record.id))![0]
        assert.deepEqual(containing, [field])
        assert.equal(hotel.translations[language][field as keyof typeof APPROVED_MAPPING].split('\n\n').filter(item => item === text).length, 1)
      }
    }
  }
})
for (const language of GUIDE_LANGUAGES) {
  test(`${language} complete hotel fields match approved cells exactly, retaining empty description`, () => {
    for (const [field, ids] of Object.entries(APPROVED_MAPPING)) assert.equal(hotel.translations[language][field as keyof typeof APPROVED_MAPPING], ids.map(id => reference.records.find(record => record.id === id)!.translations[language]).join('\n\n'))
    assert.equal(hotel.translations[language].description, '')
  })
}

test('approved common fields and unchanged JSON schema remain valid; both source datasets stay demo', () => {
  assert.equal(hotel.schemaVersion, 1); assert.equal(hotel.dataStatus, 'demo'); assert.equal(facilities.dataStatus, 'demo')
  assert.equal(hotel.lastVerifiedAt, '2026-10-15'); assert.equal(hotel.checkInTime, '15:00'); assert.equal(hotel.checkOutTime, '12:00')
  assert.deepEqual(parseHotelDataset(hotel), hotel); assert.deepEqual(verifyApprovedHotel(hotel), [])
})
test('all fees stay in won without inventing amounts or applying currency conversions', () => {
  for (const language of GUIDE_LANGUAGES) {
    assert.ok(hotel.translations[language].breakfast.includes('32,000')); assert.ok(hotel.translations[language].breakfast.includes('19,000'))
    assert.ok(hotel.translations[language].checkOut.includes('11,000'))
    for (const amount of ['200,000', '50,000', '22,000']) assert.ok(hotel.translations[language].notes.includes(amount))
    assert.ok(!/[$€¥]/.test(hotel.translations[language].breakfast))
  }
})
test('confirmed breakfast and late-checkout times retain each approved language notation', () => {
  const patterns = {
    ko: [/오전 6시 30분부터 오전 10시/, /오전 9시 30분/, /오후 5시 이후/],
    en: [/6:30 AM to 10:00 AM/, /9:30 AM/, /after 5:00 PM/],
    'zh-CN': [/上午6:30至10:00/, /上午9:30/, /下午5:00之后/],
    ja: [/午前6時30分から10時/, /午前9時30分/, /午後5時以降/],
  }
  for (const language of GUIDE_LANGUAGES) { assert.match(hotel.translations[language].breakfast, patterns[language][0]!); assert.match(hotel.translations[language].breakfast, patterns[language][1]!); assert.match(hotel.translations[language].checkOut, patterns[language][2]!) }
})
test('public telephone retains domestic/international approved formats and is not used as an SMS instruction', () => {
  assert.ok(hotel.translations.ko.notes.includes('032-310-5000'))
  for (const language of ['en', 'zh-CN', 'ja'] as const) assert.ok(hotel.translations[language].notes.includes('+82-32-310-5000'))
  for (const language of GUIDE_LANGUAGES) assert.ok(!hotel.translations[language].checkOut.includes('310-5000'))
})
test('pet-only rooms, standard-room prohibition, front-desk notification and separate conditional fees all remain', () => {
  for (const language of GUIDE_LANGUAGES) {
    for (const id of ['H27', 'H28', 'H29', 'H34', 'H35']) assert.ok(hotel.translations[language].notes.includes(reference.records.find(record => record.id === id)!.translations[language]))
  }
  assert.match(hotel.translations.ko.notes, /전용 객실에서만/); assert.match(hotel.translations.en.notes, /not permitted in standard guest rooms/)
  assert.match(hotel.translations['zh-CN'].notes, /普通客房不允许/); assert.match(hotel.translations.ja.notes, /一般客室へのペットの同伴はできません/)
})
test('unapproved description still blocks readiness even with complete production facility fixtures', () => {
  const fixture = publicationFixtures()
  assert.throws(() => validateProductionData(fixture.facilities, { ...hotel, dataStatus: 'production' }, '2026-10-15'), /description is required/)
  assert.throws(() => validateProductionData(facilities, hotel, '2026-10-15'), /dataStatus must be production/)
})
test('copy mismatch reports ID, language, approved value and actual value without repairing the input', () => {
  const candidate = structuredClone(hotel); candidate.translations.en.breakfast = candidate.translations.en.breakfast.replace('32,000', '30,000')
  const before = structuredClone(candidate), errors = verifyApprovedHotel(candidate)
  const issue = errors.find(item => item.id === 'H10' && item.language === 'en')!
  assert.equal(issue.field, 'breakfast'); assert.ok(String(issue.expected).includes('32,000')); assert.ok(String(issue.actual).includes('30,000'))
  assert.deepEqual(candidate, before)
})
test('duplicate, swapped field and held paragraph are rejected rather than quietly removed', () => {
  for (const kind of ['duplicate', 'swapped', 'held']) {
    const candidate = structuredClone(hotel)
    if (kind === 'duplicate') candidate.translations.ko.breakfast += '\n\n' + reference.records.find(record => record.id === 'H10')!.translations.ko
    if (kind === 'swapped') [candidate.translations.ja.parking, candidate.translations.ja.checkIn] = [candidate.translations.ja.checkIn, candidate.translations.ja.parking]
    if (kind === 'held') candidate.translations.en.checkOut += '\n\n' + reference.records.find(record => record.id === 'H33')!.translations.en
    assert.ok(verifyApprovedHotel(candidate).length > 0)
  }
})
test('paragraph presentation preserves approved wording and internal newlines; markup stays plain text', () => {
  assert.deepEqual(hotelParagraphs('line one\nline two\n\n中文 日本語\n\n<b>plain</b>'), ['line one\nline two', '中文 日本語', '<b>plain</b>'])
  for (const language of GUIDE_LANGUAGES) assert.equal(hotelParagraphs(hotel.translations[language].roomUsage).join('\n\n'), hotel.translations[language].roomUsage)
})
test('Admin import, editing one language and export/reimport preserve all approved remaining values', () => {
  const parsed = importHotel(JSON.stringify(hotel)); assert.deepEqual(parsed, hotel)
  parsed.translations.ko.description = '관리자 동작 확인용 가상 초안'; const roundtrip = importHotel(exportHotel(parsed))
  assert.equal(roundtrip.translations.ko.description, '관리자 동작 확인용 가상 초안')
  for (const language of GUIDE_LANGUAGES) for (const [field, text] of Object.entries(hotel.translations[language])) if (language !== 'ko' || field !== 'description') assert.equal(roundtrip.translations[language][field as keyof typeof roundtrip.translations.ko], text)
  assert.equal(hotel.translations.ko.description, '')
})
