import type { HotelDataset } from '../types/hotel.ts'
import type { GuideLanguage } from '../types/guide.ts'
import type { HotelCategory } from '../i18n/types.ts'
import { localizedValue } from '../i18n/formatters.ts'
import { ROOM_CLIMATE_COPY, coolingNotice } from '../data/roomClimateNotices.ts'
import { operationalNoticesFor } from '../data/hotelOperationalNotices.ts'
import { EARLY_CHECK_IN_COPY } from '../data/checkInAmenitiesCopy.ts'

export function hotelHasInformation(hotel: HotelDataset, language: GuideLanguage): boolean {
  return hotel.checkInTime !== null || hotel.checkOutTime !== null || Object.values(hotel.translations[language]).some(value => value.trim())
}

export function hotelTopicText(hotel: HotelDataset, category: HotelCategory, language: GuideLanguage): string {
  if (category === 'roomUsage' || category === 'parking' || category === 'checkIn') return localizedValue(hotelDisplayParagraphs(hotel, category, language).join('\n\n'), language)
  return localizedValue(hotel.translations[language][category], language)
}

/** Blank lines separate approved items; a single newline inside an item stays intact. */
export function hotelParagraphs(text: string): string[] {
  return text.split(/\r?\n[\t ]*\r?\n(?:\r?\n)*/).filter(paragraph => paragraph.length > 0)
}

/** Add the dated operational copy at presentation time, preserving the approved workbook
 * paragraphs and their stable indices. Do not fabricate copy for incomplete datasets.
 */
export function roomUsageDisplayParagraphs(hotel: HotelDataset, language: GuideLanguage): string[] {
  const paragraphs = hotelParagraphs(hotel.translations[language].roomUsage)
  if (paragraphs.length < 12) return paragraphs
  const copy = ROOM_CLIMATE_COPY[language]
  const cooling = coolingNotice(language)
  paragraphs[3] = [cooling.primary, cooling.secondary].filter(Boolean).join('\n')
  paragraphs[8] += '\n' + copy.smokingSensor
  paragraphs.push(copy.heating)
  return paragraphs
}

/** The current hotel data is the approved workbook snapshot. Keep synthetic/empty
 * datasets free of operational additions, as with the existing climate overlay.
 */
export function hotelDisplayParagraphs(hotel: HotelDataset, category: 'roomUsage' | 'parking' | 'checkIn', language: GuideLanguage): string[] {
  if (category === 'checkIn') {
    const paragraphs = hotelParagraphs(hotel.translations[language].checkIn)
    if (hotel.checkInTime === '15:00' && paragraphs.length && hotelParagraphs(hotel.translations[language].roomUsage).length >= 12) {
      paragraphs[0] += ' ' + EARLY_CHECK_IN_COPY[language]
    }
    return paragraphs
  }
  const paragraphs = category === 'roomUsage' ? roomUsageDisplayParagraphs(hotel, language) : hotelParagraphs(hotel.translations[language].parking)
  if (hotelParagraphs(hotel.translations[language].roomUsage).length < 12 || !paragraphs.length) return paragraphs
  return [...paragraphs, ...operationalNoticesFor(category).map(item => item.copy[language].text)]
}

/** Show the existing no-smoking policy and fee first, without duplicating a separate policy source.
 * The approved workbook mapping fixes H22 at roomUsage paragraph 9 and H23 at notes paragraph 2.
 */
export function guestSmokingNotice(hotel: HotelDataset, language: GuideLanguage): string {
  const roomPolicy = hotelParagraphs(hotel.translations[language].roomUsage)[8]
  const feePolicy = hotelParagraphs(hotel.translations[language].notes)[1]
  return roomPolicy && feePolicy ? [roomPolicy, feePolicy].join('\n\n') : ''
}
