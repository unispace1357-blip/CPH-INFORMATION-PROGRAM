import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import raw from '../src/data/facilities.json' with { type: 'json' }
import hotel from '../src/data/hotel.json' with { type: 'json' }
import source from '../docs/reference/step07b-batch01-source.json' with { type: 'json' }
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { searchFacilities } from '../src/services/facilitySearch.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { importFacilities, exportFacilities, exportPublicFacilities, filterAdminFacilities, facilityToDraft, saveFacility } from '../tools/admin/services/workspace.ts'
import { verifyApprovedHotel } from './validate-hotel-copy.ts'

const dataset = () => parseFacilityDataset(raw)
const numbers = (text: string) => text.match(/\d+/g) ?? []
// Syntax-only URL for transient Admin tests, never an actual facility recommendation.
const qaRoute = 'https://map.naver.com/p/directions/126.63,37.39,QA-start/126.64,37.40,QA-end/-/walk'

test('Batch 01 appends exactly five private records after six byte-equivalent demo objects', () => {
  assert.equal(raw.schemaVersion, 1); assert.equal(raw.dataStatus, 'demo'); assert.equal(raw.facilities.length, 11)
  assert.deepEqual(raw.facilities.slice(0, 6).map(item => item.id), source.baselineDemoIds)
  assert.equal(createHash('sha256').update(JSON.stringify(raw.facilities.slice(0, 6))).digest('hex'), source.baselineDemoArraySha256)
  assert.deepEqual(raw.facilities.slice(6).map(item => item.id), source.records.map(item => item.jsonId))
  assert.equal(new Set(raw.facilities.map(item => item.id)).size, 11)
})
test('Batch 01 retains source trace and draft status without treating survey date as facility verification', () => {
  assert.equal(source.sourceFile, '1212.xlsx')
  assert.equal(source.sourceSha256, '90c817d2d2dba4c0384105c0730aeef144b664c9e794f45c3d58e5d71a043731')
  assert.equal(source.sourceSurveyDate, '2026-10-15'); assert.equal(source.facilityVerificationDate, null)
  assert.equal(source.translationStatus, 'draft-awaiting-user-review')
  assert.equal(source.officialForeignNamesConfirmed, false); assert.equal(source.externalTranslatorChecksPerformed, false)
})

for (const entry of source.records) {
  test(`${entry.sourceId}: Korean fields match original Excel cells and all unconfirmed operational fields stay empty`, () => {
    const item = dataset().facilities.find(candidate => candidate.id === entry.jsonId)!
    assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/); assert.equal(item.category, entry.category)
    for (const [field, cell] of Object.entries(entry.koreanFieldCells)) assert.equal(item.translations.ko[field as keyof typeof item.translations.ko], entry.cells[cell as keyof typeof entry.cells])
    assert.equal(item.isPublished, false); assert.equal(item.lastVerifiedAt, null)
    assert.equal(item.walkingMinutes, null); assert.equal(item.naverMapUrl, null)
    for (const language of GUIDE_LANGUAGES) {
      assert.equal(item.translations[language].directions, '')
      assert.equal(!!item.closedDays[language], entry.sourceId === 'C04')
    }
    assert.deepEqual(item.englishPhrases, [])
    assert.deepEqual(Object.keys(item).sort(), ['id','category','isPublished','lastVerifiedAt','translations','keywords','englishPhrases','walkingMinutes','closedDays','naverMapUrl'].sort())
  })
  test(`${entry.sourceId}: four-language draft retains original shop name, street, floor/unit numbers and hours`, () => {
    const item = dataset().facilities.find(candidate => candidate.id === entry.jsonId)!
    assert.deepEqual(Object.keys(item.translations), [...GUIDE_LANGUAGES])
    const road = item.translations.ko.address.match(/(인천타워대로\d+번길|컨벤시아대로)/)![0]
    for (const language of GUIDE_LANGUAGES) {
      assert.ok(item.translations[language].name.includes(item.translations.ko.name))
      assert.ok(item.translations[language].address.includes(road))
      assert.deepEqual(numbers(item.translations[language].address), numbers(item.translations.ko.address))
      assert.ok(item.translations[language].description.trim()); assert.ok(item.translations[language].notes.trim())
      if (language === 'ko') continue
      assert.deepEqual(item.translations[language].openingHours.match(/\d{2}:\d{2}/g) ?? [], entry.foreignTimeTokens)
      if (entry.sourceId === 'C01' || entry.sourceId === 'C04') assert.match(item.translations[language].openingHours, /24/)
    }
    if (entry.sourceId === 'C01') for (const language of GUIDE_LANGUAGES) assert.equal(item.closedDays[language], '')
    if (entry.sourceId === 'C16') for (const language of GUIDE_LANGUAGES) assert.equal(item.closedDays[language], '')
  })
  test(`${entry.sourceId}: Admin search/select sees private draft in all languages, Staff/Guest never return it`, () => {
    const data = dataset(), item = data.facilities.find(candidate => candidate.id === entry.jsonId)!
    for (const language of GUIDE_LANGUAGES) {
      const found = filterAdminFacilities(data, item.translations[language].name, item.category, 'private')
      assert.deepEqual(found.map(candidate => candidate.id), [item.id])
      assert.deepEqual(searchFacilities(data.facilities, item.translations.ko.name), [])
      for (const uiLanguage of GUIDE_LANGUAGES) assert.deepEqual(searchGuestFacilities(data.facilities, item.translations[language].name, 'all', uiLanguage), [])
    }
    assert.ok(!searchFacilities(data.facilities).some(candidate => candidate.id === item.id))
    assert.ok(!searchGuestFacilities(data.facilities).some(candidate => candidate.id === item.id))
  })
  test(`${entry.sourceId}: Admin hours edit, transient URL add/delete, export and reimport keep private status and source intact`, () => {
    const original = dataset(), before = structuredClone(original), item = original.facilities.find(candidate => candidate.id === entry.jsonId)!
    const draft = facilityToDraft(item); draft.translations.ko.openingHours += '\n[메모리 QA 편집]'; draft.naverMapUrl = qaRoute
    const saved = importFacilities(exportFacilities(saveFacility(original, draft, item.id)))
    const edited = saved.facilities.find(candidate => candidate.id === item.id)!
    assert.equal(edited.translations.ko.openingHours, draft.translations.ko.openingHours)
    assert.equal(edited.naverMapUrl, qaRoute); assert.equal(edited.isPublished, false)
    const restored = facilityToDraft(edited); restored.translations.ko.openingHours = item.translations.ko.openingHours; restored.naverMapUrl = ''
    assert.deepEqual(importFacilities(exportFacilities(saveFacility(saved, restored, item.id))), original)
    assert.deepEqual(original, before)
  })
}
test('Batch 01 public export contains only the five original public demo records', () => {
  const publicData = importFacilities(exportPublicFacilities(raw))
  assert.deepEqual(publicData.facilities.map(item => item.id), raw.facilities.slice(0,6).filter(item => item.isPublished).map(item => item.id))
  assert.equal(publicData.facilities.length, 5)
  for (const entry of source.records) assert.ok(!publicData.facilities.some(item => item.id === entry.jsonId))
})
test('Batch 01 keeps Blue Ocean original identity and pharmacy identity despite stale source link', () => {
  const blue = raw.facilities.find(item => item.id === 'blue-ocean-sauna-songdo')!
  assert.equal(blue.translations.ko.name, '블루오션'); assert.equal(blue.translations.ko.address, '인천 연수구 컨벤시아대로 81 드림시티 6층 601호')
  const pharmacy = raw.facilities.find(item => item.id === 'chaeum-pharmacy-songdo')!
  assert.equal(pharmacy.translations.ko.name, '채움약국')
  assert.ok(decodeURIComponent(source.records.find(item => item.sourceId === 'C16')!.cells.J22!).includes('센트럴원약국'))
  assert.ok(!JSON.stringify(pharmacy).includes('센트럴원약국'))
})
test('Batch 01 leaves all STEP 07-A approved hotel copy and H33 hold unchanged', () => assert.deepEqual(verifyApprovedHotel(hotel), []))
