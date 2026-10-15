import assert from 'node:assert/strict'
import test from 'node:test'
import raw from '../src/data/facilities.json' with { type: 'json' }
import { naverMapUrlError, validatedNaverMapUrl } from '../src/services/naverMapUrl.ts'
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { exportFacilities, importFacilities, facilityToDraft, saveFacility } from '../tools/admin/services/workspace.ts'
import { USER_NAVER_PLACE_ROUTE } from './naver-place-fixture.ts'

const accepted: [string, string][] = [
  ['user PLACE_POI transit route with native Korean names', USER_NAVER_PLACE_ROUTE],
  ['percent-encoded names', encodeURI(USER_NAVER_PLACE_ROUTE)],
  ['walking PLACE_POI route', USER_NAVER_PLACE_ROUTE.replace('/transit', '/walk')],
  ['v5 PLACE_POI route', USER_NAVER_PLACE_ROUTE.replace('/p/', '/v5/')],
  ['encoded Korean name containing spaces', encodeURI(USER_NAVER_PLACE_ROUTE.replace('송도센트럴파크호텔', '송도 센트럴파크 호텔'))],
  ['encoded commas', encodeURI(USER_NAVER_PLACE_ROUTE).replaceAll(',', '%2C')],
  ['legacy decimal coordinates', 'https://map.naver.com/p/directions/126.63,37.39,QA-start/126.64,37.40,QA-end/-/walk'],
  ['mixed decimal and PLACE_POI points', USER_NAVER_PLACE_ROUTE.replace('3z3nAD,2AEFuH,송도센트럴파크호텔,19398065,PLACE_POI', '126.63,37.39,QA-start')],
]
for (const [label, url] of accepted) test(`compatibility: ${label} validates and Admin save/export preserves the original string`, () => {
  assert.equal(naverMapUrlError(url), null); assert.equal(validatedNaverMapUrl(url), url)
  const original = parseFacilityDataset(raw), before = structuredClone(original), draft = facilityToDraft(original.facilities[0]!)
  draft.naverMapUrl = url
  const saved = saveFacility(original, draft, draft.id), imported = importFacilities(exportFacilities(saved))
  assert.equal(imported.facilities[0]!.naverMapUrl, url)
  assert.equal(facilityToDraft(imported.facilities[0]!).naverMapUrl, url)
  assert.deepEqual(imported.facilities[0], { ...original.facilities[0], naverMapUrl: url })
  assert.deepEqual(original, before)
})
const start = '3z3nAD,2AEFuH,송도센트럴파크호텔,19398065,PLACE_POI'
const end = '3z1K4q,2AHkeJ,인천항연안여객터미널,1113352648,PLACE_POI'
const rejected: [string, string][] = [
  ['missing origin', USER_NAVER_PLACE_ROUTE.replace(start, '-')],
  ['missing destination', USER_NAVER_PLACE_ROUTE.replace(end, '-')],
  ['empty origin segment', USER_NAVER_PLACE_ROUTE.replace(start, '')],
  ['empty destination segment', USER_NAVER_PLACE_ROUTE.replace(end, '')],
  ['extra empty segment', USER_NAVER_PLACE_ROUTE.replace('/directions/', '/directions//')],
  ['untyped alphanumeric coordinates', USER_NAVER_PLACE_ROUTE.replace(start, '3z3nAD,2AEFuH')],
  ['unsupported point type', USER_NAVER_PLACE_ROUTE.replace('19398065,PLACE_POI', '19398065,UNKNOWN')],
  ['missing POI ID', USER_NAVER_PLACE_ROUTE.replace('19398065,PLACE_POI', ',PLACE_POI')],
  ['invalid POI ID', USER_NAVER_PLACE_ROUTE.replace('19398065,PLACE_POI', 'not-a-number,PLACE_POI')],
  ['missing place label', USER_NAVER_PLACE_ROUTE.replace('송도센트럴파크호텔', '')],
  ['invalid position identifier', USER_NAVER_PLACE_ROUTE.replace('3z3nAD', '3z3nAD!')],
  ['encoded control in label', USER_NAVER_PLACE_ROUTE.replace('송도센트럴파크호텔', '%0A')],
  ['broken name encoding', USER_NAVER_PLACE_ROUTE.replace('송도센트럴파크호텔', '%E0%A4%A')],
  ['general place page', 'https://map.naver.com/p/entry/place/19398065'],
  ['map home', 'https://map.naver.com'],
  ['search page', 'https://map.naver.com/p/search/송도센트럴파크호텔'],
  ['disguised host', USER_NAVER_PLACE_ROUTE.replace('map.naver.com', 'map.naver.com.evil.com')],
  ['HTTP', USER_NAVER_PLACE_ROUTE.replace('https:', 'http:')],
  ['JavaScript scheme', 'javascript:alert(1)'],
  ['sensitive query', USER_NAVER_PLACE_ROUTE + '?access_token=qa-not-real'],
]
for (const [label, url] of rejected) test(`compatibility: rejects ${label} in parser, Admin and rendering boundary`, () => {
  assert.ok(naverMapUrlError(url)); assert.equal(validatedNaverMapUrl(url), null)
  const candidate = parseFacilityDataset(raw); candidate.facilities[0]!.naverMapUrl = url
  assert.throws(() => parseFacilityDataset(candidate), /naverMapUrl/)
  assert.throws(() => importFacilities(JSON.stringify(candidate)), /naverMapUrl/)
})
