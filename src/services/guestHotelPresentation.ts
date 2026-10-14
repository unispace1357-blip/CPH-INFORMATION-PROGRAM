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
