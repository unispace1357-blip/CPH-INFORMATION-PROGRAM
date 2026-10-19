import type { HotelDataset } from '../types/hotel.ts'
import type { GuideLanguage } from '../types/guide.ts'
import type { HotelCategory } from '../i18n/types.ts'
import { localizedValue } from '../i18n/formatters.ts'

export function hotelHasInformation(hotel: HotelDataset, language: GuideLanguage): boolean {
  return hotel.checkInTime !== null || hotel.checkOutTime !== null || Object.values(hotel.translations[language]).some(value => value.trim())
}

export function hotelTopicText(hotel: HotelDataset, category: HotelCategory, language: GuideLanguage): string {
  return localizedValue(hotel.translations[language][category], language)
}

/** Blank lines separate approved items; a single newline inside an item stays intact. */
export function hotelParagraphs(text: string): string[] {
  return text.split(/\r?\n[\t ]*\r?\n(?:\r?\n)*/).filter(paragraph => paragraph.length > 0)
}

/** Show the existing no-smoking policy and fee first, without duplicating a separate policy source.
 * The approved workbook mapping fixes H22 at roomUsage paragraph 9 and H23 at notes paragraph 2.
 */
export function guestSmokingNotice(hotel: HotelDataset, language: GuideLanguage): string {
  const roomPolicy = hotelParagraphs(hotel.translations[language].roomUsage)[8]
  const feePolicy = hotelParagraphs(hotel.translations[language].notes)[1]
  return roomPolicy && feePolicy ? [roomPolicy, feePolicy].join('\n\n') : ''
}
