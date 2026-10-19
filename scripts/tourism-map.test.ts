import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, statSync } from 'node:fs'
import { SONGDO_TOURISM_SPOTS } from '../src/data/localGuide.ts'
import { HOTEL_MAP_POINT, SONGDO_MAP_POINTS, TOURISM_MAP_UI, approximateMapPosition } from '../src/data/tourismMap.ts'
import { TOURISM_PHOTOS, TOURISM_PHOTO_UI } from '../src/data/tourismPhotos.ts'
import rawFacilities from '../src/data/facilities.json' with { type: 'json' }
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'

test('Original tourist schematic uses six unique real points and a hotel anchor', () => {
  const ids = SONGDO_TOURISM_SPOTS.map(x => x.id)
  assert.equal(ids.length, 6)
  assert.deepEqual(SONGDO_MAP_POINTS.map(x => x.id), ids)
  assert.equal(new Set(ids).size, 6)
  for (const point of [...SONGDO_MAP_POINTS, { ...HOTEL_MAP_POINT, id: 'hotel' }]) {
    assert.ok(point.lat >= 37.37 && point.lat <= 37.40)
    assert.ok(point.lon >= 126.62 && point.lon <= 126.67)
    const position = approximateMapPosition(point.lat, point.lon)
    assert.ok(position.x >= 6 && position.x <= 94)
    assert.ok(position.y >= 6 && position.y <= 94)
  }
  const hotel = approximateMapPosition(HOTEL_MAP_POINT.lat, HOTEL_MAP_POINT.lon)
  const g = SONGDO_MAP_POINTS.find(x => x.id === 'g-tower')!
  const east = SONGDO_MAP_POINTS.find(x => x.id === 'haedoji-park')!
  assert.ok(approximateMapPosition(g.lat, g.lon).y < hotel.y)
  assert.ok(approximateMapPosition(east.lat, east.lon).x > hotel.x)
})

test('Every tourism point has 4-language expanded content and a real map search term', () => {
  for (const p of SONGDO_MAP_POINTS) {
    assert.ok(p.naverSearch.trim().length >= 4)
    for (const lang of GUIDE_LANGUAGES) {
      assert.ok(p.detail[lang].trim().length >= 22, p.id + '/' + lang)
      assert.ok(SONGDO_TOURISM_SPOTS.find(s => s.id === p.id)?.name[lang])
    }
  }
  for (const lang of GUIDE_LANGUAGES) {
    assert.ok(TOURISM_MAP_UI[lang].diagramSubtitle.length > 20)
    assert.ok(TOURISM_MAP_UI[lang].uncertainty.length > 25)
    assert.match(TOURISM_MAP_UI[lang].mapCredit, /OpenStreetMap|ODbL/)
  }
})

test('Only previously verified facility direction URLs can be reused', () => {
  const verified = SONGDO_MAP_POINTS.filter(p => p.linkedFacilityId)
  assert.deepEqual(verified.map(p => p.id).sort(), ['central-park', 'g-tower'])
  for (const p of verified) {
    const facility = rawFacilities.facilities.find(f => f.id === p.linkedFacilityId)
    assert.ok(facility, p.id)
    assert.match(facility!.naverMapUrl!, /^https:\/\/map\.naver\.com\/p\/directions\//)
    assert.match(facility!.naverMapUrl!, /19398065,PLACE_POI/)
  }
  for (const p of SONGDO_MAP_POINTS.filter(p => !p.linkedFacilityId)) {
    assert.ok(!p.naverSearch.includes('https://'))
  }
})

test('Six publicly licensed IFEZ landmark photos include sources and accessible credits', () => {
  const ids = Object.keys(TOURISM_PHOTOS)
  assert.deepEqual(ids, SONGDO_MAP_POINTS.map(point => point.id))
  for (const [id, photo] of Object.entries(TOURISM_PHOTOS)) {
    assert.ok(SONGDO_MAP_POINTS.some(point => point.id === id), id)
    assert.match(photo.imageUrl, /^https:\/\/www\.ifez\.go\.kr\/other\/attach\/process\.file\.do\?TP=(?:img|dn)&key=[A-Z0-9]+&sn=\d+$/)
    assert.match(photo.sourceUrl, /^https:\/\/www\.ifez\.go\.kr\/promote\/pst\/view\.do\?pst_id=scene_photo&pst_sn=\d+$/)
    assert.match(photo.photographedOn, /^\d{4}-\d{2}-\d{2}$/)
    for (const lang of GUIDE_LANGUAGES) assert.ok(photo.alt[lang].length >= 15, id + '/' + lang)
  }
  assert.equal(TOURISM_PHOTOS['central-park']?.photographedOn, '2024-09-23')
  assert.equal(TOURISM_PHOTOS['tri-bowl']?.photographedOn, '2009-08-06')
  assert.equal(TOURISM_PHOTOS['g-tower']?.photographedOn, '2015-04-01')
  assert.match(TOURISM_PHOTOS['g-tower']!.imageUrl, /sn=79213$/, 'New G-Tower photo must show the entire building');
  assert.equal(TOURISM_PHOTOS['hanok-village']?.photographedOn, '2015-01-05')
  assert.equal(TOURISM_PHOTOS['haedoji-park']?.photographedOn, '2022-05-02')
  assert.equal(TOURISM_PHOTOS['michuhol-park']?.photographedOn, '2019-04-19')
  for (const lang of GUIDE_LANGUAGES) {
    const ui = TOURISM_PHOTO_UI[lang]
    assert.ok(ui.sourceLabel.includes('IFEZ') && ui.sourceLabel.length >= 25, lang)
    assert.ok(ui.photoUnavailable.length >= 12)
    assert.ok(ui.historicNotice.length >= 14)
  }
})

test('All six local WebP previews are complete, compact and ready for offline public deployment', () => {
  for (const id of Object.keys(TOURISM_PHOTOS)) {
    const file = new URL(`../public/tourism-photos/${id}.webp`, import.meta.url)
    const stat = statSync(file)
    assert.ok(stat.size >= 5000 && stat.size < 350000, `${id} must be optimized for phone loading`)
    const bytes = readFileSync(file)
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', id + ' RIFF signature')
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', id + ' WebP signature')
  }
})
