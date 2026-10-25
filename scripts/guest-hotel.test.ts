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
