import assert from 'node:assert/strict'
import test from 'node:test'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { MESSAGES } from '../src/i18n/messages.ts'
import type { HotelCategory } from '../src/i18n/types.ts'
import { localizedValue } from '../src/i18n/formatters.ts'
import { guestSmokingNotice, hotelHasInformation, hotelParagraphs, hotelTopicText } from '../src/services/guestHotelPresentation.ts'
import { loadGuestFacilities, loadGuestHotel } from '../src/services/loadGuestData.ts'
import { ROOM_USAGE_LABELS, searchHotelInformation } from '../src/services/guestHotelSearch.ts'
import { visibleFacilityCategories } from '../src/config/uiCategories.ts'
import { loadStaffDataset } from '../src/services/loadStaffDataset.ts'
import { guestFacilityDataset, emptyGuestHotel } from './guest-test-fixtures.ts'

for (const category of ['checkIn', 'checkOut', 'breakfast', 'parking', 'roomUsage'] as const satisfies readonly HotelCategory[]) {
  test(`hotel ${category} uses the selected language only`, () => {
    const hotel = emptyGuestHotel()
    for (const language of GUIDE_LANGUAGES) hotel.translations[language][category] = `Fictional QA ${category}: ${language}`
    for (const language of GUIDE_LANGUAGES) assert.equal(hotelTopicText(hotel, category, language), `Fictional QA ${category}: ${language}`)
  })
}

test('prominent smoking notice retains exact hotel policy and 200,000 fee in all four languages', async () => {
  const hotel = await loadGuestHotel()
  for (const language of GUIDE_LANGUAGES) {
    const paragraphs = hotelParagraphs(guestSmokingNotice(hotel, language))
    assert.equal(paragraphs.length, 2)
    assert.equal(paragraphs[0], hotelParagraphs(hotel.translations[language].roomUsage)[8])
    assert.equal(paragraphs[1], hotelParagraphs(hotel.translations[language].notes)[1])
    assert.match(paragraphs[1]!, /200,000/)
  }
})

test('empty hotel and unconfirmed common times stay unavailable in every language', () => {
  const hotel = emptyGuestHotel()
  for (const language of GUIDE_LANGUAGES) {
    assert.equal(hotelHasInformation(hotel, language), false)
    assert.equal(hotelTopicText(hotel, 'checkIn', language), MESSAGES[language].ui.informationUnavailable)
    assert.equal(localizedValue(hotel.checkInTime, language, 'timeUnavailable'), MESSAGES[language].ui.timeUnavailable)
    assert.equal(localizedValue(hotel.checkOutTime, language, 'timeUnavailable'), MESSAGES[language].ui.timeUnavailable)
  }
})

test('registered hotel text never substitutes for a missing translation', () => {
  const hotel = emptyGuestHotel(); hotel.translations.ko.checkIn = 'Fictional QA Korean instructions'
  assert.equal(hotelHasInformation(hotel, 'ko'), true)
  assert.equal(hotelHasInformation(hotel, 'en'), false)
  assert.equal(hotelTopicText(hotel, 'checkIn', 'en'), MESSAGES.en.ui.informationUnavailable)
})

test('Guest hotel/facility loader failures are independent and have no fake defaults', async () => {
  const dataset = guestFacilityDataset(); const hotel = emptyGuestHotel()
  const results = await Promise.allSettled([loadGuestFacilities(async () => ({ facilityDataset: dataset })), loadGuestHotel(async () => { throw new Error('Bad hotel') })])
  assert.equal(results[0]!.status, 'fulfilled'); assert.equal(results[1]!.status, 'rejected')
  await assert.rejects(() => loadGuestFacilities(async () => { throw new Error('Missing facility module') }), /Missing facility module/)
  assert.equal(await loadGuestHotel(async () => ({ hotelDataset: hotel })), hotel)
})

test('shared index, Guest and Staff use the same canonical dataset objects', async () => {
  const index = await import('../src/data/index.ts')
  assert.equal(await loadGuestFacilities(), index.facilityDataset)
  assert.equal(await loadStaffDataset(), index.facilityDataset)
  assert.equal(await loadGuestHotel(), index.hotelDataset)
})

test('room usage labels preserve approved paragraph ordering for all four languages', async () => {
  const hotel = await loadGuestHotel()
  for (const language of GUIDE_LANGUAGES) {
    const roomParagraphs = hotelParagraphs(hotel.translations[language].roomUsage)
    assert.equal(ROOM_USAGE_LABELS[language].length, roomParagraphs.length)
    assert.equal(roomParagraphs.length, 12)
    assert.ok(ROOM_USAGE_LABELS[language].every(label => label.trim()))
  }
})

test('guest hotel keyword search finds localized breakfast, Wi-Fi, microwave and smoking without mutating data', async () => {
  const hotel = await loadGuestHotel()
  const before = structuredClone(hotel)
  for (const language of GUIDE_LANGUAGES) {
    assert.deepEqual(searchHotelInformation(hotel, language, '   '), [])
    const breakfast = searchHotelInformation(hotel, language, '조식')
    assert.ok(breakfast.some(hit => hit.category === 'breakfast'), language)
    const wifi = searchHotelInformation(hotel, language, '와이파이')
    assert.ok(wifi.some(hit => hit.category === 'roomUsage' && hit.index === 0), language)
    const microwave = searchHotelInformation(hotel, language, '전자레인지')
    assert.ok(microwave.some(hit => hit.category === 'roomUsage' && hit.index === 1), language)
    const noSmoking = searchHotelInformation(hotel, language, '금연')
    assert.ok(noSmoking.some(hit => hit.category === 'roomUsage' && hit.index === 8), language)
    const breakfastPrice = searchHotelInformation(hotel, language, '35,000')
    assert.ok(breakfastPrice.some(hit => hit.category === 'breakfast'), language)
    assert.deepEqual(searchHotelInformation(hotel, language, 'zz-unknown-guest-phrase'), [])
    assert.ok(wifi.every(hit => hit.text === hotelParagraphs(hotel.translations[language][hit.source === 'notes' ? 'notes' : hit.category])[hit.index]), language)
  }
  assert.deepEqual(hotel, before)
})

test('empty hotel facility categories are suppressed without hiding separate tourist and 6777 guides', async () => {
  const publicFacilities = await loadGuestFacilities()
  const shown = visibleFacilityCategories(publicFacilities.facilities)
  assert.ok(!shown.some(item => item.code === 'hotel'), 'Do not offer unpopulated hotel facilities')
  assert.ok(shown.some(item => item.code === 'attraction'))
  assert.ok(shown.some(item => item.code === 'transportation'))
  const synthetic = [...publicFacilities.facilities, {category: 'hotel' as const, isPublished: true}]
  assert.ok(visibleFacilityCategories(synthetic).some(item => item.code === 'hotel'))
  const unpublished = [{category: 'hotel' as const, isPublished: false}]
  assert.ok(!visibleFacilityCategories(unpublished).some(item => item.code === 'hotel'))
})

test('2026-11-25 room notices are localized and searchable without altering historical copy', async () => {
  const hotel = await loadGuestHotel()
  const before = structuredClone(hotel)
  for (const language of GUIDE_LANGUAGES) {
    const heating = searchHotelInformation(hotel, language, '난방')
    assert.ok(heating.some(hit => hit.category === 'roomUsage' && hit.index === 12), language)
    assert.ok(searchHotelInformation(hotel, language, '히터').some(hit => hit.index === 12), language)
    assert.ok(searchHotelInformation(hotel, language, '냉방').some(hit => hit.index === 3), language)
    assert.ok(searchHotelInformation(hotel, language, '흡연센서').some(hit => hit.index === 8), language)
    assert.equal(hotelParagraphs(hotelTopicText(hotel, 'roomUsage', language)).length, 29)
  }
  assert.deepEqual(hotel, before)
})

test('five operational notices appear under room usage or parking and search in all languages', async () => {
  const hotel = await loadGuestHotel()
  const before = structuredClone(hotel)
  for (const language of GUIDE_LANGUAGES) {
    const room = hotelParagraphs(hotelTopicText(hotel, 'roomUsage', language))
    const parking = hotelParagraphs(hotelTopicText(hotel, 'parking', language))
    assert.equal(room.length, 29)
    assert.equal(parking.length, 2)
    for (const query of ['헬스장','헬스','운동','피트니스','gym']) assert.ok(searchHotelInformation(hotel, language, query).some(hit => hit.category === 'roomUsage' && hit.index === 13), language + query)
    for (const [query, index] of [['blanket',14],['배수구',15],['8핀',16]] as const) assert.ok(searchHotelInformation(hotel, language, query).some(hit => hit.category === 'roomUsage' && hit.index === index), language + query)
    assert.ok(searchHotelInformation(hotel, language, '전기충전소').some(hit => hit.category === 'parking' && hit.index === 1), language)
  }
  assert.deepEqual(hotel, before)
})

test('heating notice preserves the panel location, 26°C setting limit and gradual floor heating in every language', async () => {
  const hotel = await loadGuestHotel()
  for (const language of GUIDE_LANGUAGES) {
    const heating = hotelParagraphs(hotelTopicText(hotel, 'roomUsage', language))[12]!
    assert.match(heating, /26°C/, language)
    assert.match(heating, /온돌|underfloor heating|地暖|床暖房/, language)
    assert.match(heating, /시간이 소요|time to warm up|需要一些时间|時間がかかります/, language)
    for (const query of ['26도','온돌','바닥난방','floor heating']) assert.ok(searchHotelInformation(hotel, language, query).some(hit => hit.category === 'roomUsage' && hit.index === 12 && hit.text === heating), language + ': ' + query)
  }
})

test('early check-in prices are localized and searchable without changing the approved base check-in time', async () => {
  const hotel = await loadGuestHotel()
  const before = structuredClone(hotel)
  for (const language of GUIDE_LANGUAGES) {
    const copy = hotelTopicText(hotel, 'checkIn', language)
    assert.ok(copy.startsWith(hotel.translations[language].checkIn))
    assert.match(copy, /11,000/)
    assert.match(copy, /9시|9:00 AM|9点|9時/)
    assert.match(copy, /1박|one night|一晚|1泊/)
    for (const query of ['얼리체크인','조기입실','일찍입실','early check-in']) assert.ok(searchHotelInformation(hotel, language, query).some(h => h.category === 'checkIn' && h.text === hotelParagraphs(copy)[0]), language + ': ' + query)
  }
  assert.equal(hotel.checkInTime, '15:00')
  assert.deepEqual(hotel, before)
})

test('eleven services appear in all four guest languages with stable prior indexes', async () => {
  const hotel = await loadGuestHotel()
  for (const language of GUIDE_LANGUAGES) {
    const room = hotelParagraphs(hotelTopicText(hotel, 'roomUsage', language))
    assert.equal(room.length, 29)
    const cases = [["생수",17],["수건",18],["연박",19],["프론트",20],["카드키",21],["택시",22],["베개",23],["우산",24],["세탁",25],["라운지",26]] as const
    for (const [query,index] of cases) assert.ok(searchHotelInformation(hotel, language, query).some(h => h.category === 'roomUsage' && h.index === index && h.text === room[index]), language + query)
    for (const category of ['checkIn','checkOut'] as const) assert.ok(searchHotelInformation(hotel, language, '짐보관').some(h => h.category === category), language + category)
  }
})

test('complimentary amenities and printing are indexed once in every source language without duplicating water or towel notices', async () => {
  const hotel = await loadGuestHotel()
  for (const language of GUIDE_LANGUAGES) {
    const room = hotelParagraphs(hotelTopicText(hotel,'roomUsage',language))
    assert.equal(room.length,29)
    assert.match(room[28]!,/100/)
    for (const [query,index] of [['드라이기',27],['샴푸',27],['프린트',28],['출력',28],['생수',17],['수건',18]] as const) {
      assert.ok(searchHotelInformation(hotel,language,query).some(h=>h.category==='roomUsage'&&h.index===index),language+query)
    }
  }
})

test('pet stay has its own searchable category and moves the five original pet notes without modifying the source', async () => {
  const { generalHotelNotes, petStayParagraphs } = await import('../src/services/guestHotelPresentation.ts')
  const { petStayDisplayLabels } = await import('../src/services/guestHotelSearch.ts')
  const hotel = await loadGuestHotel()
  const before = structuredClone(hotel)
  for (const language of GUIDE_LANGUAGES) {
    const pet = petStayParagraphs(hotel, language)
    assert.equal(pet.length,9)
    assert.equal(petStayDisplayLabels(language).length,9)
    assert.equal(generalHotelNotes(hotel,language).length,3)
    assert.match(pet[1]!, /33,000/)
    assert.match(pet[1]!, /55,000/)
    assert.equal(pet[4],hotelParagraphs(hotel.translations[language].notes)[6])
    for (const [q,index] of [['펫캉스',0],['10kg',0],['성수기',1],['매너벨트',2],['배변패드',3],['미신고',6]] as const) assert.ok(searchHotelInformation(hotel,language,q).some(h=>h.category==='petStay'&&h.source==='topic'&&h.index===index),language+q)
    assert.ok(!searchHotelInformation(hotel,language,'반려동물청소').some(h=>h.category==='roomUsage'&&h.source==='notes'))
    assert.equal(hotelParagraphs(hotelTopicText(hotel,'roomUsage',language)).length,29)
  }
  assert.deepEqual(hotel,before)
  assert.equal(petStayParagraphs(emptyGuestHotel(),'ko').length,0)
})
