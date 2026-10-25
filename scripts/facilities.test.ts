import assert from 'node:assert/strict'
import test from 'node:test'
import rawData from '../src/data/facilities.json' with { type: 'json' }
import schema from '../src/data/facilities.schema.json' with { type: 'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { FACILITY_CATEGORIES } from '../src/types/facility.ts'
import type { GuideLanguage } from '../src/types/facility.ts'
import { searchFacilities } from '../src/services/facilitySearch.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { importFacilities, exportFacilities, facilityToDraft, saveFacility } from '../tools/admin/services/workspace.ts'

const expectedWalkingMinutesById = new Map<string, number | null>([
  ['cu-songdo-senseuri', 2],
  ['hyundai-premium-outlet-songdo', null],
  ['g-tower-ifez-observatory', null],
  ['songdo-central-park-water-taxi', null],
  ['blue-ocean-sauna-songdo', 25],
  ['malt-house-incheon-songdo', 3],
  ['compose-coffee-incheon-songdo-central-park', 2],
  ['chaeum-pharmacy-songdo', 4],
  ['hanyang-songdo-hanok-village', 3],
  ['gyeongbokgung-hanok-village', 3],
  ['paljinhyang-hanok-village', 3],
  ['hollys-incheon-hanok-village', 3],
  ['songhaeon-songdo', 4],
  ['songjjujip-main', 14],
  ['otto-gimbap-songdo', 15],
  ['burgeroom181-songdo', 14],
  ['moms-touch-songdo-central-park', 14],
  ['burger-king-incheon-songdo-central-park', 14],
  ['incheon-port-hangdong-7ga', null],
  ['starbucks-songdo-central-park', 14],
  ['playground-brewery-taproom-songdo', 26],
  ['geumbyeol-beer-songdo-lotte-mall', 19],
  ['central-park-station-exit-3', 7],
  ['lotte-mart-songdo', 11],
  ['songdo-central-park', 6],
  ['byeol-onnuri-pharmacy-songdo', 17],
  ['songdo-timespace-complex', null],
])

const fresh = () => structuredClone(rawData)

test('local preview contains all 27 real facilities, four languages and no fictional records', () => {
  const data = parseFacilityDataset(fresh())
  assert.equal(data.schemaVersion, 1)
  assert.equal(data.dataStatus, 'demo')
  assert.equal(data.facilities.length, 27)
  assert.equal(new Set(data.facilities.map(f => f.id)).size, 27)
  assert.deepEqual(data.facilities.slice(0, 5).map(f => [f.id, f.category, f.translations.ko.name]), [
    ['cu-songdo-senseuri', 'convenience', 'CU 송도센쓰리점'],
    ['blue-ocean-sauna-songdo', 'sauna_spa', '블루오션'],
    ['malt-house-incheon-songdo', 'dining', '더몰트하우스 인천송도점'],
    ['compose-coffee-incheon-songdo-central-park', 'cafe', '컴포즈커피 인천송도센트럴파크점'],
    ['chaeum-pharmacy-songdo', 'pharmacy', '채움약국'],
  ])
  assert.deepEqual(data.facilities.slice(5).map(f => f.id), ['hanyang-songdo-hanok-village', 'gyeongbokgung-hanok-village', 'paljinhyang-hanok-village', 'hollys-incheon-hanok-village', 'songhaeon-songdo', 'songjjujip-main', 'otto-gimbap-songdo', 'burgeroom181-songdo', 'moms-touch-songdo-central-park', 'burger-king-incheon-songdo-central-park', 'incheon-port-hangdong-7ga', 'starbucks-songdo-central-park', 'playground-brewery-taproom-songdo', 'geumbyeol-beer-songdo-lotte-mall', 'central-park-station-exit-3', 'lotte-mart-songdo', 'songdo-central-park', 'byeol-onnuri-pharmacy-songdo', 'hyundai-premium-outlet-songdo', 'g-tower-ifez-observatory', 'songdo-central-park-water-taxi', 'songdo-timespace-complex'])
  const numbers = (text: string) => text.match(/\d+/g) ?? []
  const addressNumbers = [['180', '11', '1', '109'], ['81', '6', '601'], ['180', '11', '3', '305'], ['180', '11', '1', '112'], ['197', '16', '2', '240']]
  data.facilities.forEach((facility, index) => {
    assert.equal(facility.isPublished, true)
    assert.equal(facility.lastVerifiedAt, null)
    assert.equal(facility.walkingMinutes, expectedWalkingMinutesById.get(facility.id), facility.id)
    assert.ok(facility.naverMapUrl === null || typeof facility.naverMapUrl === 'string')
    assert.deepEqual(Object.keys(facility.translations), ['ko', 'en', 'zh-CN', 'ja'])
    for (const text of Object.values(facility.translations)) {
      assert.ok(text.name.includes(facility.translations.ko.name))
      assert.deepEqual(numbers(text.address), numbers(facility.translations.ko.address))
      if (index < 5) assert.deepEqual(numbers(text.address), addressNumbers[index])
      assert.ok(text.description.trim())
      assert.equal(Boolean(text.openingHours.trim()), facility.id !== 'incheon-port-hangdong-7ga')
      assert.equal(Boolean(text.notes), facility.id === 'songdo-timespace-complex') // Complex has public tenant/route caveats only.
      assert.equal(Boolean(text.directions), ['incheon-port-hangdong-7ga', 'central-park-station-exit-3', 'songdo-timespace-complex'].includes(facility.id))
      assert.deepEqual(numbers(text.directions).sort(), numbers(facility.translations.ko.directions).sort())
    }
    assert.equal(facility.englishPhrases.length, facility.id === 'songdo-timespace-complex' ? 3 : 2)
    assert.ok(facility.englishPhrases.every(text => text.trim()))
    assert.equal(facility.englishPhraseMeanings?.length, facility.id === 'songdo-timespace-complex' ? 3 : 2)
    assert.ok(facility.englishPhraseMeanings!.every(text => text.trim()))
    for (const language of Object.keys(facility.closedDays) as GuideLanguage[]) {
      assert.equal(Boolean(facility.closedDays[language]), ['blue-ocean-sauna-songdo', 'g-tower-ifez-observatory', 'songdo-timespace-complex'].includes(facility.id))
    }
  })
  assert.doesNotMatch(JSON.stringify(data), /demo-|가상|fictional|제3자|third-party|第三方|第三者|휴계시간|Further checks|待确认|要確認|다시 조사할 것|공항버스|센트럴원약국|하늘약국/)
})

test('confirmed hours retain breaks, last order and day-specific closing in every language', () => {
  const data = parseFacilityDataset(fresh())
  const normalizedHours = (text: string) => text.replace(/(?<!\d)9:00/g, '09:00').replace('15~17시', '15:00~17:00')
  for (const facility of data.facilities) {
    const original = normalizedHours(facility.translations.ko.openingHours)
    for (const [language, text] of Object.entries(facility.translations)) {
      const hours = normalizedHours(text.openingHours)
      assert.deepEqual(hours.match(/\d{2}:\d{2}/g) ?? [], original.match(/\d{2}:\d{2}/g) ?? [], `${facility.id}/${language}`)
      assert.deepEqual(hours.match(/\d+/g) ?? [], original.match(/\d+/g) ?? [], `${facility.id}/${language} numbers`)
    }
  }
  const port = data.facilities.find(f => f.id === 'incheon-port-hangdong-7ga')!
  assert.equal(port.translations.ko.name, '인천항')
  assert.equal(port.translations.ko.address, '인천광역시 중구 항동7가 88')
  const routeChecks = {
    ko: [/인천항 연안여객터미널 기준 참고 경로/, /약 1시간/, /출발 시각/, /교통 상황/],
    en: [/reference route to the Incheon Port Coastal Passenger Terminal/, /about 1 hour/, /departure time/, /traffic conditions/],
    'zh-CN': [/仁川港沿岸客运码头的参考路线/, /约1小时/, /出发时刻/, /交通状况/],
    ja: [/仁川港沿岸旅客ターミナルまでの参考経路/, /約1時間/, /出発時刻/, /交通状況/],
  }
  for (const language of ['ko', 'en', 'zh-CN', 'ja'] as const) {
    const text = port.translations[language]
    // Terminal scope belongs only to the reference route; keep the facility identity unchanged.
    assert.doesNotMatch([text.name, text.description, text.address, text.notes].join(' '), /터미널|terminal|ターミナル|客运码头|여객/i)
    for (const pattern of routeChecks[language]) assert.match(text.directions, pattern)
    assert.deepEqual(text.directions.match(/\d+/g), ['16', '1', '36', '14', '1'])
    let cursor = 0
    for (const stop of ['인천스타트업파크', '16-1', '연안아파트', '36', '14', '연안여객터미널']) {
      const position = text.directions.indexOf(stop, cursor)
      assert.ok(position >= cursor, `${language}: missing or misplaced route step ${stop}`)
      cursor = position + stop.length
    }
    assert.doesNotMatch(text.directions, /7|도보|walking|on foot|步行|徒歩/)
  }
  assert.match(port.englishPhrases[0]!, /Incheon Port Coastal Passenger Terminal/)
  assert.match(port.englishPhrases[1]!, /Incheon Startup Park.*16-1.*Yeonan Apartments.*36.*14.*Yeonan Passenger Terminal.*about an hour.*traffic and schedules/)
  assert.equal(port.walkingMinutes, null)
  const station = data.facilities.find(f => f.id === 'central-park-station-exit-3')!
  assert.equal(station.walkingMinutes, 7)
  for (const text of Object.values(station.translations)) {
    assert.match(text.directions, /5/)
    assert.match(text.directions, /7/)
  }
  assert.match(station.englishPhrases[0]!, /seven-minute walk/)
  assert.match(station.englishPhraseMeanings![0]!, /7분/)
  const park = data.facilities.find(f => f.id === 'songdo-central-park')!
  assert.equal(park.translations.ko.name, '송도 센트럴파크')
  assert.equal(park.translations.ko.address, '인천 연수구 컨벤시아대로 160 일원')
  assert.equal(park.walkingMinutes, 6)
  assert.equal(park.translations.ko.directions, '')
  assert.equal(data.facilities.find(f => f.id === 'playground-brewery-taproom-songdo')!.translations.ko.openingHours, '월~금 15:00~24:00 (라스트 오더 23:00) / 토 12:00~24:00 (라스트 오더 23:00) / 일 12:00~22:00 (라스트 오더 21:00)')
  assert.equal(data.facilities.find(f => f.id === 'byeol-onnuri-pharmacy-songdo')!.translations.ko.openingHours, '08:30~다음날 01:00; 24시간 자판기 보유')
  const [cu, blue, malt, cafe, pharmacy] = data.facilities
  assert.equal(cu!.translations.ko.openingHours, '24시간')
  assert.equal(blue!.translations.ko.openingHours, '24시간 연중 무휴')
  assert.equal(malt!.translations.ko.openingHours, '10:00~23:00(브레이크 타임 15~17시) 라스트 오더 22:00')
  assert.equal(cafe!.translations.ko.openingHours, '08:00~22:00 (일요일 21:00 월,화 20:00 마감)')
  assert.equal(pharmacy!.translations.ko.openingHours, '9:00~19:30(13:00~14:00 휴게시간) 토요일은 9:00~14:00')
})

test('real preview records are searchable, retain admin edits on export/import and still respect hiding', () => {
  const data = parseFacilityDataset(fresh()), before = structuredClone(data)
  const sourceIds = data.facilities.map(f => f.id)
  assert.ok(sourceIds.indexOf('cu-songdo-senseuri') < sourceIds.indexOf('central-park-station-exit-3'))
  for (const search of [searchFacilities, searchGuestFacilities]) {
    assert.deepEqual(search(data.facilities).map(f => f.id), sourceIds)
    assert.deepEqual(search(data.facilities, '', 'transportation').map(f => f.id), ['incheon-port-hangdong-7ga', 'central-park-station-exit-3'])
  }
  for (const language of ['ko', 'en', 'zh-CN', 'ja'] as const) {
    assert.deepEqual(searchGuestFacilities(data.facilities, '', 'all', language).map(f => f.id), sourceIds)
  }
  assert.deepEqual(importFacilities(exportFacilities(data)), data)
  for (const facility of data.facilities) {
    assert.ok(searchFacilities(data.facilities, facility.translations.ko.name).some(f => f.id === facility.id))
    for (const language of ['ko', 'en', 'zh-CN', 'ja'] as const) {
      assert.ok(searchGuestFacilities(data.facilities, facility.translations[language].name, facility.category, language).some(f => f.id === facility.id))
    }
    const draft = facilityToDraft(facility)
    draft.translations.ko.openingHours += '\n[QA edit]'
    draft.isPublished = false
    const edited = importFacilities(exportFacilities(saveFacility(data, draft, facility.id)))
    assert.equal(edited.facilities.find(f => f.id === facility.id)!.translations.ko.openingHours, draft.translations.ko.openingHours)
    assert.ok(!searchFacilities(edited.facilities).some(f => f.id === facility.id))
    for (const language of ['ko', 'en', 'zh-CN', 'ja'] as const) assert.ok(!searchGuestFacilities(edited.facilities, '', 'all', language).some(f => f.id === facility.id))
  }
  assert.deepEqual(data, before)
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
    delete facility.englishPhraseMeanings
    delete facility.closedDays
    delete facility.keywords['zh-CN']
    delete facility.keywords.ja
  }
  const before = structuredClone(legacy)
  const data = parseFacilityDataset(legacy)
  assert.deepEqual(legacy, before)
  for (const facility of data.facilities) {
    assert.equal(facility.walkingMinutes, null)
    assert.equal(facility.englishPhraseMeanings, undefined)
    assert.deepEqual(facility.closedDays, { ko: '', en: '', 'zh-CN': '', ja: '' })
    assert.deepEqual(facility.keywords['zh-CN'], [])
    assert.deepEqual(facility.keywords.ja, [])
  }
  for (const invalid of [null, 'not an array', [123, '뜻'], ['unpaired meaning']]) {
    const malformed: Record<string, any> = fresh()
    malformed.facilities[0].englishPhraseMeanings = invalid
    assert.throws(() => parseFacilityDataset(malformed), /Invalid facility dataset.*englishPhraseMeanings/)
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
    const invalid = parseFacilityDataset(fresh())
    invalid.facilities[0]!.keywords[language] = ['  ']
    assert.throws(() => parseFacilityDataset(invalid), /Invalid facility dataset/)
  }
})

test('STEP 3 official location fixes retain correct water taxi boarding point and avoid speculative map links', () => {
  const facilities = parseFacilityDataset(fresh()).facilities
  const cu = facilities.find(facility => facility.id === 'cu-songdo-senseuri')!
  const outlet = facilities.find(facility => facility.id === 'hyundai-premium-outlet-songdo')!
  const gTower = facilities.find(facility => facility.id === 'g-tower-ifez-observatory')!
  const taxi = facilities.find(facility => facility.id === 'songdo-central-park-water-taxi')!
  assert.equal(cu.translations.ko.name, 'CU 송도센쓰리점')
  assert.ok(cu.naverMapUrl?.startsWith('https://map.naver.com/p/directions/'))
  for (const lang of ['ko', 'en', 'zh-CN', 'ja'] as const) {
    assert.match(outlet.translations[lang].openingHours, /10:30.*20:00.*10:30.*21:00/)
    assert.match(gTower.translations[lang].openingHours, /20:30/)
    assert.ok(gTower.closedDays[lang])
    assert.match(taxi.translations[lang].address, lang === 'ko' ? /인천타워대로 253-34/ : /Incheon Tower-daero 253-34/)
    assert.match(taxi.translations[lang].description, /보트하우스|Boathouse|船屋|ボートハウス/)
    assert.ok(!taxi.translations[lang].address.includes('컨벤시아대로 160'))
  }
  const routeExpectations = [
    [outlet, '35439053', 'transit', '현대프리미엄아울렛 송도점'],
    [gTower, '19453537', 'walk', 'G타워'],
    [taxi, '31104025', 'walk', '송도코마린웨스트보트하우스'],
  ] as const
  for (const [facility, destinationId, mode, placeName] of routeExpectations) {
    const url = facility.naverMapUrl
    assert.ok(url?.startsWith('https://map.naver.com/p/directions/'), facility.id)
    const path = decodeURIComponent(new URL(url!).pathname)
    assert.ok(path.includes('송도센트럴파크호텔,19398065,PLACE_POI/'), facility.id)
    assert.ok(path.includes(placeName + ',' + destinationId + ',PLACE_POI'), facility.id)
    assert.ok(path.endsWith('/-/' + mode), facility.id)
    // A route link does not establish measured travel time or an on-site verification date.
    assert.equal(facility.walkingMinutes, null)
    assert.equal(facility.lastVerifiedAt, null)
  }
  assert.deepEqual(searchFacilities(facilities, '웨스트보트하우스').map(f => f.id), [taxi.id])
})
