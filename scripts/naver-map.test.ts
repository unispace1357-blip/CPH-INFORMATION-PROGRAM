import assert from 'node:assert/strict'
import test from 'node:test'
import rawFacilities from '../src/data/facilities.json' with { type: 'json' }
import rawHotel from '../src/data/hotel.json' with { type: 'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { naverMapUrlError, validatedNaverMapUrl } from '../src/services/naverMapUrl.ts'
import { importFacilities, exportFacilities, exportPublicFacilities, facilityToDraft, saveFacility, newFacilityDraft } from '../tools/admin/services/workspace.ts'
import { UI_CATEGORIES, FACILITY_CATEGORY_OPTIONS } from '../src/config/uiCategories.ts'
import { searchFacilities } from '../src/services/facilitySearch.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { verifyApprovedHotel } from './validate-hotel-copy.ts'
import { MESSAGES } from '../src/i18n/messages.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'

// Synthetic route syntax only: not a verified hotel/facility route; never saved to app JSON.
export const QA_NAVER_ROUTE = 'https://map.naver.com/p/directions/126.63,37.39,QA-start/126.64,37.40,QA-end/-/walk?c=15.00,0,0,0,dh'
const validUrls = [
  QA_NAVER_ROUTE,
  QA_NAVER_ROUTE.replace('/p/', '/v5/'),
  QA_NAVER_ROUTE.replace('map.naver.com', 'map.naver.com:443'),
  QA_NAVER_ROUTE.replaceAll(',', '%2C'),
  'https://m.map.naver.com/route.nhn?menu=route&sX=126.63&sY=37.39&eX=126.64&eY=37.40',
]
for (const [index, url] of validUrls.entries()) test(`official directions syntax ${index + 1} validates and roundtrips without changing the URL`, () => {
  const data = parseFacilityDataset(rawFacilities); data.facilities[0]!.naverMapUrl = url
  assert.equal(naverMapUrlError(url), null); assert.equal(validatedNaverMapUrl(url), url)
  assert.equal(importFacilities(exportFacilities(data)).facilities[0]!.naverMapUrl, url)
})

const invalidUrls: [string, unknown][] = [
  ['HTTP', QA_NAVER_ROUTE.replace('https:', 'http:')],
  ['foreign domain', QA_NAVER_ROUTE.replace('map.naver.com', 'example.com')],
  ['disguised domain', QA_NAVER_ROUTE.replace('map.naver.com', 'map.naver.com.evil.com')],
  ['suffix lookalike', QA_NAVER_ROUTE.replace('map.naver.com', 'evilmap.naver.com')],
  ['short URL', 'https://naver.me/fictional-qa-only'],
  ['script', 'javascript:alert(1)'], ['data', 'data:text/html,hello'], ['file', 'file:///tmp/example'],
  ['malformed', 'not a URL'], ['empty', ''], ['number', 123], ['object', { href: QA_NAVER_ROUTE }],
  ['homepage', 'https://map.naver.com'], ['place page', 'https://map.naver.com/p/entry/place/123'],
  ['search page', 'https://map.naver.com/p/search/hotel'],
  ['missing origin', QA_NAVER_ROUTE.replace('126.63,37.39,QA-start', '-')],
  ['missing destination', QA_NAVER_ROUTE.replace('126.64,37.40,QA-end', '-')],
  ['empty route', 'https://map.naver.com/p/directions/-/-/-/walk'],
  ['mobile missing destination', 'https://m.map.naver.com/route.nhn?sX=126.63&sY=37.39'],
  ['unsupported port', QA_NAVER_ROUTE.replace('map.naver.com', 'map.naver.com:8080')],
  ['username', QA_NAVER_ROUTE.replace('https://', 'https://person@')],
  ['password', QA_NAVER_ROUTE.replace('https://', 'https://person:password@')],
  ['token', QA_NAVER_ROUTE + '&access_token=qa-not-a-real-secret'],
  ['encoded token key', QA_NAVER_ROUTE + '&%74oken=qa-only'],
  ['API key', QA_NAVER_ROUTE + '&api_key=qa-only'],
  ['email', QA_NAVER_ROUTE + '&email=qa@example.invalid'],
  ['redirect', QA_NAVER_ROUTE + '&redirect=https://example.invalid'],
  ['fragment', QA_NAVER_ROUTE + '#token=qa-only'],
  ['leading whitespace', ' ' + QA_NAVER_ROUTE], ['control character', QA_NAVER_ROUTE + '\n'],
  ['backslash', QA_NAVER_ROUTE.replace('/p/', '\\p/')],
  ['malformed route encoding', QA_NAVER_ROUTE.replace('QA-start', '%E0%A4%A')],
]
for (const [name, url] of invalidUrls) test(`rejects ${name} at import and at the link rendering boundary`, () => {
  assert.ok(naverMapUrlError(url)); assert.equal(validatedNaverMapUrl(url), null)
  const candidate: any = structuredClone(rawFacilities); candidate.facilities[0].naverMapUrl = url
  assert.throws(() => parseFacilityDataset(candidate), /naverMapUrl|Invalid facility dataset/)
})

test('existing schemaVersion 1 JSON without map field validates and exports with the field still omitted', () => {
  const legacy = parseFacilityDataset(rawFacilities)
  for (const facility of legacy.facilities) delete facility.naverMapUrl
  const before = structuredClone(legacy), data = importFacilities(JSON.stringify(legacy))
  assert.deepEqual(data, before); assert.deepEqual(JSON.parse(exportFacilities(data)), before)
  assert.ok(data.facilities.every(item => !Object.hasOwn(item, 'naverMapUrl')))
  assert.deepEqual(legacy, before)
})
test('null is valid and unregistered while editor new/legacy defaults are blank', () => {
  const data = parseFacilityDataset(rawFacilities); data.facilities[0]!.naverMapUrl = null
  assert.equal(importFacilities(exportFacilities(data)).facilities[0]!.naverMapUrl, null)
  assert.equal(validatedNaverMapUrl(null), null); assert.equal(validatedNaverMapUrl(undefined), null)
  assert.equal(newFacilityDraft().naverMapUrl, ''); assert.equal(facilityToDraft(parseFacilityDataset(rawFacilities).facilities[0]!).naverMapUrl, '')
})
test('Admin register, edit, delete, import/export preserves other fields and visibility', () => {
  const initial = parseFacilityDataset(rawFacilities), draft = facilityToDraft(initial.facilities[0]!)
  draft.naverMapUrl = QA_NAVER_ROUTE
  const registered = saveFacility(initial, draft, draft.id)
  assert.equal(registered.facilities[0]!.naverMapUrl, QA_NAVER_ROUTE)
  assert.equal(facilityToDraft(importFacilities(exportFacilities(registered)).facilities[0]!).naverMapUrl, QA_NAVER_ROUTE)
  const edited = facilityToDraft(registered.facilities[0]!); edited.naverMapUrl = validUrls[3]!
  const changed = saveFacility(registered, edited, edited.id)
  assert.equal(changed.facilities[0]!.naverMapUrl, validUrls[3])
  edited.naverMapUrl = ''; const removed = saveFacility(changed, edited, edited.id)
  assert.equal(removed.facilities[0]!.naverMapUrl, null)
  assert.deepEqual(removed.facilities[0], { ...initial.facilities[0], naverMapUrl: null })
  assert.deepEqual(initial, rawFacilities)
})
test('Admin rejects invalid draft without changing saved workspace', () => {
  const data = parseFacilityDataset(rawFacilities), before = structuredClone(data), draft = facilityToDraft(data.facilities[0]!)
  draft.naverMapUrl = 'https://naver.me/qa-only'
  assert.throws(() => saveFacility(data, draft, draft.id), /naverMapUrl/); assert.deepEqual(data, before)
})
test('private map URLs stay out of Staff/Guest results and public JSON', () => {
  const data = parseFacilityDataset(rawFacilities), hidden = data.facilities[0]!
  hidden.isPublished = false // Independent hidden test case; preview data need not contain a private record.
  hidden.naverMapUrl = QA_NAVER_ROUTE
  assert.ok(!searchFacilities(data.facilities).some(item => item.id === hidden.id))
  for (const language of GUIDE_LANGUAGES) assert.ok(!searchGuestFacilities(data.facilities, '', 'all', language).some(item => item.id === hidden.id))
  assert.ok(!exportPublicFacilities(data).includes(QA_NAVER_ROUTE))
})
test('ATM category remains editable/importable but is absent from public filter options', () => {
  assert.equal(UI_CATEGORIES.length, 9); assert.ok(!UI_CATEGORIES.some(item => (item.code as string) === 'atm'))
  assert.equal(FACILITY_CATEGORY_OPTIONS.length, 10); assert.ok(FACILITY_CATEGORY_OPTIONS.some(item => item.code === 'atm'))
  const data = parseFacilityDataset(rawFacilities); data.facilities[0]!.category = 'atm'
  assert.equal(importFacilities(exportFacilities(data)).facilities[0]!.category, 'atm')
})
const labels = { ko: '네이버 지도 길찾기', en: 'Directions on Naver Map', 'zh-CN': '使用 Naver 地图查看路线', ja: 'NAVERマップで経路を見る' }
const pending = { ko: '인천공항 리무진버스 — 안내 준비 중', en: 'Incheon Airport Limousine Bus — Information Coming Soon', 'zh-CN': '仁川机场豪华巴士 — 信息准备中', ja: '仁川空港リムジンバス — ご案内準備中' }
for (const language of GUIDE_LANGUAGES) test(`${language} approved map label and pending transit label match instructions`, () => {
  assert.equal(MESSAGES[language].ui.naverMapDirections, labels[language]); assert.equal(MESSAGES[language].ui.airportBusPending, pending[language])
  assert.ok(MESSAGES[language].ui.naverMapNewTab); assert.ok(MESSAGES[language].ui.naverMapUnavailable)
})
test('STEP 07-A hotel approved text/metadata/H33 hold still matches the source', () => assert.deepEqual(verifyApprovedHotel(rawHotel), []))
