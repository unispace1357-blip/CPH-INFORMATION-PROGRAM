import assert from 'node:assert/strict'
import test from 'node:test'
import raw from '../src/data/facilities.json' with { type: 'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { searchFacilities } from '../src/services/facilitySearch.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'

const venues = parseFacilityDataset(raw).facilities
function venue(id: string) {
  const item = venues.find(f => f.id === id)
  assert.ok(item, id)
  return item
}
function clocks(text: string) { return text.match(/\d{2}:\d{2}/g) ?? [] }

test('field-confirmed Hanyang: weekdays/weekends differ, weekday break only and LO 21:30 in 4 languages', () => {
  const item = venue('hanyang-songdo-hanok-village')
  const times = ['11:30','22:00','15:00','17:00','11:00','22:00','21:30']
  for (const lang of GUIDE_LANGUAGES) {
    assert.deepEqual(clocks(item.translations[lang].openingHours), times, lang)
    assert.equal(item.translations[lang].description.includes('갈비탕'), false)
    assert.ok(item.translations[lang].description.includes(lang === 'ko' ? '한우양념불고기' : lang === 'en' ? 'marinated Korean beef bulgogi' : lang === 'zh-CN' ? '调味韩牛烤肉' : '味付け韓牛プルコギ'))
  }
  assert.match(item.englishPhrases[1]!, /11:30 a\.m\..*11 a\.m\..*3 to 5 p\.m\..*9:30 p\.m\./)
  assert.ok(searchFacilities(venues, '생불고기').some(f => f.id === item.id))
  assert.ok(searchFacilities(venues, '양념불고기').some(f => f.id === item.id))
  assert.ok(!searchFacilities(venues, '갈비탕').some(f => f.id === item.id), 'unverified galbitang must not be a Hanyang search match')
})

test('field-confirmed Playground Brewery: weekday, Saturday and Sunday closing/last-order and menu all 4 languages', () => {
  const item = venue('playground-brewery-taproom-songdo')
  const expected = ['15:00','24:00','23:00','12:00','24:00','23:00','12:00','22:00','21:00']
  for (const lang of GUIDE_LANGUAGES) assert.deepEqual(clocks(item.translations[lang].openingHours), expected, lang)
  assert.match(item.translations.ko.description, /베트남 스타일 치킨.*통새우 수제버거.*등파육/)
  assert.match(item.translations.en.description, /Vietnamese-style chicken.*shrimp burger.*slow-cooked pork/)
  assert.match(item.translations['zh-CN'].description, /越南风味炸鸡.*鲜虾汉堡.*炖猪肉/)
  assert.match(item.translations.ja.description, /ベトナム風チキン.*エビバーガー.*豚肉の煮込み/)
  assert.match(item.englishPhrases[1]!, /weekdays.*weekends.*Sunday.*11 p\.m\..*9 p\.m\./)
  assert.ok(searchFacilities(venues, '등파육').some(f => f.id === item.id))
  assert.ok(searchFacilities(venues, '어향 가지 튀김').some(f => f.id === item.id))
})

test('field-confirmed Geumbyeol: daily 17:00 to 01:00, midnight LO and holiday caveat', () => {
  const item = venue('geumbyeol-beer-songdo-lotte-mall')
  for (const lang of GUIDE_LANGUAGES) assert.deepEqual(clocks(item.translations[lang].openingHours), ['17:00','01:00','00:00'])
  assert.match(item.translations.ko.openingHours, /명절/)
  assert.match(item.translations.en.openingHours, /holiday/)
  assert.match(item.translations['zh-CN'].openingHours, /节假日/)
  assert.match(item.translations.ja.openingHours, /臨時休業/)
  assert.match(item.translations.ko.description, /핫크리스피치킨.*불고기 피자.*토마토 해장 파스탕/)
  assert.match(item.translations.en.description, /crispy chicken.*bulgogi pizza.*tomato/)
  assert.ok(searchFacilities(venues, '토마토 해장 파스탕').some(f => f.id === item.id))
  assert.ok(searchFacilities(venues, '쫀득 분모자 볼스지').some(f => f.id === item.id))
  assert.doesNotMatch(JSON.stringify(item.keywords), /트러플 감자채전|truffle potato pancake/)
  assert.match(item.englishPhrases[1]!, /5 p\.m\..*1 a\.m\..*midnight.*holidays/)
})

test('field evidence does not turn route or unverified venue records into production', () => {
  assert.equal(raw.dataStatus, 'demo')
  assert.equal(venues.length, 27)
  for (const id of ['hanyang-songdo-hanok-village', 'playground-brewery-taproom-songdo', 'geumbyeol-beer-songdo-lotte-mall']) {
    const item = venue(id)
    assert.equal(item.isPublished, true)
    assert.equal(item.lastVerifiedAt, null)
    assert.ok(item.naverMapUrl?.startsWith('https://map.naver.com/p/directions/'))
  }
})
