import assert from 'node:assert/strict'
import test from 'node:test'
import { AIRPORT_LIMOUSINE_6777, AIRPORT_6777_STAFF_ENGLISH, LOCAL_GUIDE_COPY, SONGDO_TOURISM_SPOTS } from '../src/data/localGuide.ts'
import rawFrontdesk from '../src/data/frontdesk-scripts.json' with { type: 'json' }
import rawFacilities from '../src/data/facilities.json' with { type: 'json' }
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { parseFrontdeskScriptDataset } from '../src/data/validateFrontdeskScriptDataset.ts'
import { searchFrontdeskScripts } from '../src/services/frontdeskScriptSearch.ts'

test('Hotel supplied bus 6777 lists 12 exact stop departures, route and 4-language change notice', () => {
  assert.equal(AIRPORT_LIMOUSINE_6777.routeNumber, '6777')
  assert.equal(AIRPORT_LIMOUSINE_6777.adultFareKrw, 8000)
  assert.deepEqual(AIRPORT_LIMOUSINE_6777.departures, [
    '05:27', '06:07', '06:47', '08:47', '10:27', '11:57',
    '13:27', '14:57', '16:27', '17:57', '19:27', '20:27'
  ])
  assert.equal(new Set(AIRPORT_LIMOUSINE_6777.departures).size, 12)
  for (const lang of GUIDE_LANGUAGES) {
    const copy = LOCAL_GUIDE_COPY[lang]
    assert.ok(copy.airportTitle.includes('6777'))
    assert.ok(copy.boarding.length > 20 && /1/.test(copy.boarding))
    assert.ok(/Terminal|터미널|航站楼|ターミナル/.test(copy.routeDescription))
    assert.ok(copy.disclaimer.length > 30)
    assert.ok(copy.fareLabel.length >= 3)
    assert.match(copy.fareNote, /8,000/)
    assert.ok(copy.tourismCaution.length > 20)
  }
  assert.match(LOCAL_GUIDE_COPY.ko.boarding, /1번 출구/)
  assert.match(LOCAL_GUIDE_COPY.ko.departurePlace, /호텔 출발 시각이 아닙니다/)
  assert.match(AIRPORT_6777_STAFF_ENGLISH, /Exit 1/)
  assert.match(AIRPORT_6777_STAFF_ENGLISH, /may change/)
})

test('Tourism entries omit expired coupons and provide unique bilingual landmarks', () => {
  assert.deepEqual(SONGDO_TOURISM_SPOTS.map(s => s.id), [
    'central-park', 'tri-bowl', 'g-tower', 'hanok-village', 'haedoji-park', 'michuhol-park'
  ])
  assert.equal(new Set(SONGDO_TOURISM_SPOTS.map(s => s.id)).size, SONGDO_TOURISM_SPOTS.length)
  for (const spot of SONGDO_TOURISM_SPOTS) for (const lang of GUIDE_LANGUAGES) {
    assert.ok(spot.name[lang].trim())
    assert.ok(spot.note[lang].trim())
    assert.doesNotMatch(spot.note[lang], /coupon|할인권|2015|50%|10%/i)
  }
})

test('Staff airport script is independent from public hotels/26 facilities and uses same 12 times', () => {
  const scripts = parseFrontdeskScriptDataset(rawFrontdesk).scripts
  assert.equal(scripts.length, 33)
  const bus = scripts.find(script => script.id === 'airport-limousine-6777')!
  assert.equal(bus.category, 'hotel-facilities')
  assert.equal(bus.reviewStatus, 'draft')
  assert.equal(bus.lastVerifiedAt, null)
  assert.equal(bus.sourceType, 'user-provided')
  assert.ok(searchFrontdeskScripts(scripts, '6777').some(script => script.id === bus.id))
  assert.ok(searchFrontdeskScripts(scripts, 'airport').some(script => script.id === bus.id))
  for (const time of AIRPORT_LIMOUSINE_6777.departures) {
    assert.ok(bus.details?.en.includes(time), time)
    assert.ok(bus.details?.ko.includes(time), time)
  }
  assert.match(bus.quickAnswer.en, /Times may change/)
  assert.match(bus.quickAnswer.en, /8,000/)
  assert.match(AIRPORT_6777_STAFF_ENGLISH, /8,000/)
  assert.equal(rawFacilities.facilities.length, 26)
  assert.equal(rawFacilities.dataStatus, 'demo')
  assert.equal(rawFrontdesk.dataStatus, 'demo')
})
