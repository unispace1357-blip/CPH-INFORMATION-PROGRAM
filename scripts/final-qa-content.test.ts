import assert from 'node:assert/strict'
import test from 'node:test'
import facilityRaw from '../src/data/facilities.json' with { type: 'json' }
import hotelRaw from '../src/data/hotel.json' with { type: 'json' }
import frontdeskRaw from '../src/data/frontdesk-scripts.json' with { type: 'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { parseFrontdeskScriptDataset } from '../src/data/validateFrontdeskScriptDataset.ts'
import { parseHotelDataset } from '../src/data/validateHotelDataset.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { MESSAGES } from '../src/i18n/messages.ts'

const facilities = parseFacilityDataset(facilityRaw).facilities
const hotel = parseHotelDataset(hotelRaw)
const scripts = parseFrontdeskScriptDataset(frontdeskRaw).scripts
const byId = (id: string) => facilities.find(f => f.id === id)!

test('final QA: 27 public places, dining 11/cafe 3 and shared restaurant/pub label in four languages', () => {
  assert.equal(facilities.length, 27)
  assert.equal(facilities.filter(f => f.category === 'dining').length, 11)
  assert.equal(facilities.filter(f => f.category === 'cafe').length, 3)
  for (const language of GUIDE_LANGUAGES) {
    assert.ok(MESSAGES[language].categories.dining.includes(language === 'ko' ? '주점' : language === 'en' ? 'Pubs' : language === 'zh-CN' ? '酒吧' : 'パブ'))
    for (const item of facilities.filter(f => f.category === 'dining' || f.category === 'cafe')) {
      assert.match(item.translations[language].description, /메뉴 예시|Menu examples|菜品示例|メニュー例/)
    }
  }
  for (const id of ['malt-house-incheon-songdo', 'geumbyeol-beer-songdo-lotte-mall', 'playground-brewery-taproom-songdo']) {
    assert.ok(byId(id).keywords.ko.includes('맥주'), id)
    assert.equal(byId(id).category, 'dining')
  }
})

test('final QA: webfoot octopus roe-wrap translation is meaningful and never mislabels octopus eggs', () => {
  const item = byId('songjjujip-main')
  assert.match(item.translations.en.description, /flying-fish roe wraps/)
  assert.match(item.translations['zh-CN'].description, /飞鱼籽/)
  assert.match(item.translations.ja.description, /トビウオの卵/)
  assert.ok(!/octopus roe-wrap|鱼卵包小章鱼|イイダコの卵包み/.test(JSON.stringify(item)))
})

test('final QA: each English venue label is Latin-readable with Korean search/navigation identity preserved', () => {
  for (const item of facilities) {
    assert.match(item.translations.en.name, /[A-Za-z]/, item.id)
    assert.ok(item.translations.en.name.includes(item.translations.ko.name), item.id)
  }
})

test('final QA: guest-confirmed Geumbyeol schedule is consistent across four languages', () => {
  const geumbyeol = byId('geumbyeol-beer-songdo-lotte-mall')
  for (const lang of GUIDE_LANGUAGES) assert.deepEqual(geumbyeol.translations[lang].openingHours.match(/\d{2}:\d{2}/g), ['17:00','01:00','00:00'])
  const burger = byId('burgeroom181-songdo')
  for (const lang of GUIDE_LANGUAGES) {
    assert.match(burger.translations[lang].openingHours, /16:00.*17:00/)
    assert.match(burger.translations[lang].openingHours, /21:00/)
  }
  assert.match(burger.englishPhrases[1], /break from 4 to 5 p\.m\./)
  assert.equal(geumbyeol.lastVerifiedAt, null)
})

test('final QA: front desk shelf delivery and no-smoking fee have consistent guest-facing policy', () => {
  const pickup = scripts.find(s => s.id === 'food-delivery')!
  const smoking = scripts.find(s => s.id === 'indoor-smoking-policy')!
  assert.equal(scripts[0].id, smoking.id)
  assert.match(pickup.quickAnswer.en, /shelf in front of the front desk/)
  assert.match(pickup.quickAnswer.ko, /프론트 앞 선반/)
  const expected = {
    ko: /프론트 앞 선반/,
    en: /shelf in front of the front desk/,
    'zh-CN': /前台前方的置物架/,
    ja: /フロント前の棚/,
  }
  for (const lang of GUIDE_LANGUAGES) {
    assert.match(hotel.translations[lang].roomUsage, expected[lang])
    assert.doesNotMatch(hotel.translations[lang].roomUsage, /collect it outside the hotel|정문 밖에서 직접 수령|正门外自行领取|正面玄関の外でお受け取り/)
  }
  assert.match(hotel.translations.ko.notes, /200,000원/)
})

test('final QA: all new route links retain authorized hotel origin and exact Naver places', () => {
  const pointIds = { 'songdo-central-park-water-taxi': '31104025', 'g-tower-ifez-observatory': '19453537', 'hyundai-premium-outlet-songdo': '35439053' }
  for (const [id, point] of Object.entries(pointIds)) {
    const url = byId(id).naverMapUrl!
    assert.match(url, /map\.naver\.com\/p\/directions/)
    assert.ok(url.includes(point + ',PLACE_POI'), id)
    assert.ok(url.includes('19398065,PLACE_POI'), id)
  }
  assert.ok(byId('songdo-central-park-water-taxi').naverMapUrl?.includes('/walk?'))
  assert.ok(byId('hyundai-premium-outlet-songdo').naverMapUrl?.includes('/transit?'))
})

test('final QA: all source operational data remains DEMO/draft without invented verification dates', () => {
  assert.equal(facilityRaw.dataStatus, 'demo')
  assert.equal(hotel.dataStatus, 'demo')
  assert.equal(frontdeskRaw.dataStatus, 'demo')
  assert.ok(facilities.every(f => f.lastVerifiedAt === null))
  assert.ok(scripts.every(s => s.reviewStatus === 'draft' && s.lastVerifiedAt === null))
})
