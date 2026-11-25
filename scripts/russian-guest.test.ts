import assert from 'node:assert/strict'
import test from 'node:test'
import { hotelDataset } from '../src/data/hotelDataset.ts'
import { facilityDataset } from '../src/data/facilityDataset.ts'
import { withRussianHotel, withRussianFacilities, RUSSIAN_VENUES, russianTranslationIssues } from '../src/data/russianGuestData.ts'
import { GUEST_LANGUAGES } from '../src/types/guide.ts'
import { MESSAGES } from '../src/i18n/messages.ts'
import { UI_MESSAGE_KEYS } from '../src/i18n/types.ts'
import { hotelTopicText, hotelParagraphs } from '../src/services/guestHotelPresentation.ts'
import { searchHotelInformation, roomUsageDisplayLabels } from '../src/services/guestHotelSearch.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { TIMESPACE_TENANTS, timespaceLocation } from '../src/services/timespaceDirectory.ts'
import { HOTEL_OPERATIONAL_NOTICES } from '../src/data/hotelOperationalNotices.ts'
import { guestFacilityPresentation } from '../src/services/guestFacilityPresentation.ts'
test('Russian guest localization covers UI, all 27 venues, hotel notices and 15 tenants', () => {
  assert.ok(GUEST_LANGUAGES.includes('ru'))
  assert.deepEqual(russianTranslationIssues(hotelDataset, facilityDataset), [], 'Update Russian copy whenever the approved English source changes')
  assert.deepEqual(Object.keys(MESSAGES.ru.ui), [...UI_MESSAGE_KEYS])
  for (const key of UI_MESSAGE_KEYS) assert.deepEqual(MESSAGES.ru.ui[key].match(/\{\w+\}/g), MESSAGES.en.ui[key].match(/\{\w+\}/g))
  const h = withRussianHotel(hotelDataset), d = withRussianFacilities(facilityDataset)
  assert.equal(Object.keys(RUSSIAN_VENUES).length, 27)
  assert.equal(d.facilities.length, 27)
  for (const venue of d.facilities) {
    assert.ok(venue.translations.ru.description, venue.id)
    assert.equal(venue.translations.ru.address, venue.translations.en.address)
    assert.deepEqual(venue.translations.ru.openingHours.match(/\d{2}:\d{2}/g), venue.translations.en.openingHours.match(/\d{2}:\d{2}/g))
    assert.ok(venue.keywords.ru?.length, venue.id)
  }
  const room = hotelParagraphs(hotelTopicText(h, 'roomUsage', 'ru'))
  assert.equal(room.length, roomUsageDisplayLabels('ru').length)
  for (const notice of HOTEL_OPERATIONAL_NOTICES) assert.ok(notice.copy.ru.text)
  for (const q of ['полотенце','прачечная','такси','холодильник','микроволновка']) {
    assert.ok(searchHotelInformation(h, 'ru', q).length, q)
  }
  assert.match(hotelTopicText(h, 'checkIn', 'ru'), /11,000/)
  assert.match(room[12]!, /26°C/)
  assert.ok(searchGuestFacilities(d.facilities, 'аптека', 'all', 'ru').some(x => x.category === 'pharmacy'))
  assert.ok(searchGuestFacilities(d.facilities, 'пиво', 'all', 'ru').some(x => x.category === 'dining'))
  assert.ok(guestFacilityPresentation(d.facilities.find(f => f.id === 'malt-house-incheon-songdo')!, 'ru').menuExamples.length)
  for (const tenant of TIMESPACE_TENANTS) { assert.ok(tenant.menu.ru); assert.match(timespaceLocation(tenant,'ru'), /Корпус/) }
  assert.equal(Object.hasOwn(hotelDataset.translations, 'ru'), false)
})

test('Russian complimentary amenities and printing are localized and searchable',()=>{
  const hotel = withRussianHotel(hotelDataset)
  for (const [q,index] of [['фен',27],['распечатать',28]] as const) assert.ok(searchHotelInformation(hotel,'ru',q).some(h=>h.category==='roomUsage'&&h.index===index))
  assert.match(hotelParagraphs(hotelTopicText(hotel,'roomUsage','ru'))[28]!,/100 вон/)
})
