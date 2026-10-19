import assert from 'node:assert/strict'
import test from 'node:test'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { MESSAGES } from '../src/i18n/messages.ts'
import type { HotelCategory } from '../src/i18n/types.ts'
import { localizedValue } from '../src/i18n/formatters.ts'
import { guestSmokingNotice, hotelHasInformation, hotelParagraphs, hotelTopicText } from '../src/services/guestHotelPresentation.ts'
import { loadGuestFacilities, loadGuestHotel } from '../src/services/loadGuestData.ts'
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
