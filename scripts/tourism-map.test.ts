import assert from 'node:assert/strict'
import test from 'node:test'
import { SONGDO_TOURISM_SPOTS } from '../src/data/localGuide.ts'
import { HOTEL_MAP_POINT, SONGDO_MAP_POINTS, TOURISM_MAP_UI, approximateMapPosition } from '../src/data/tourismMap.ts'
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
