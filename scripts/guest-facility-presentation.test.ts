import assert from 'node:assert/strict'
import test from 'node:test'
import raw from '../src/data/facilities.json' with { type: 'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { GUEST_FACILITY_COPY, TIMESPACE_FACILITY_ID, guestFacilityPresentation, guestFacilityCardTeaser } from '../src/services/guestFacilityPresentation.ts'

const dataset = parseFacilityDataset(raw)
const timespace = dataset.facilities.find(f => f.id === TIMESPACE_FACILITY_ID)!

test('guest summaries remove internal inventory and verification wording in all four languages', () => {
  assert.ok(timespace)
  const forbidden = /개별 등록|full tenant directory|并非完整商户目录|全店舗ではなく|정보 확인 전/i
  for (const language of GUIDE_LANGUAGES) {
    const before = structuredClone(timespace)
    const { summary, menuExamples, routeNotice } = guestFacilityPresentation(timespace, language)
    assert.equal(menuExamples.length, 4, language)
    assert.ok(summary.length > 12 && !forbidden.test(summary), language)
    assert.ok(routeNotice && routeNotice.length > 20, language)
    assert.ok(!forbidden.test(guestFacilityCardTeaser(timespace, language)), language)
    assert.deepEqual(timespace, before, 'visitor projection must not mutate source')
  }
  assert.match(timespace.translations.ko.description, /모든 음식점을 개별 등록/)
  assert.match(timespace.translations.en.description, /full tenant directory/)
})

test('existing dining and cafe menu examples become readable source-backed chips', () => {
  for (const language of GUIDE_LANGUAGES) {
    const food = dataset.facilities.filter(f => f.category === 'dining' || f.category === 'cafe')
    assert.equal(food.length, 14)
    for (const f of food) {
      const view = guestFacilityPresentation(f, language)
      assert.ok(view.summary.trim(), f.id + '/' + language)
      assert.ok(view.menuExamples.length >= 2, f.id + '/' + language)
      assert.equal(view.routeNotice, null)
      assert.ok(!guestFacilityCardTeaser(f, language).includes('Menu examples'), language)
    }
  }
})

test('other facility descriptions are preserved rather than replaced with invented copy', () => {
  const waterTaxi = dataset.facilities.find(f => f.id === 'songdo-central-park-water-taxi')!
  const gTower = dataset.facilities.find(f => f.id === 'g-tower-ifez-observatory')!
  for (const language of GUIDE_LANGUAGES) {
    assert.equal(guestFacilityPresentation(waterTaxi, language).summary, waterTaxi.translations[language].description)
    assert.equal(guestFacilityPresentation(gTower, language).summary, gTower.translations[language].description)
    assert.equal(guestFacilityPresentation(gTower, language).menuExamples.length, 0)
    assert.match(GUEST_FACILITY_COPY[language].timespaceRouteNotice, language === 'ko' ? /스타벅스/ : /Starbucks|星巴克|スターバックス/)
  }
})
