import type { DatasetStatus, GuideLanguage } from './guide.ts'

export interface HotelTranslation {
  name: string
  description: string
  address: string
  checkIn: string
  checkOut: string
  breakfast: string
  parking: string
  roomUsage: string
  notes: string
}

/** Basic hotel information, maintained separately from nearby facilities. */
export interface HotelDataset {
  schemaVersion: 1
  dataStatus: DatasetStatus
  lastVerifiedAt: string | null
  /** Local hotel time in HH:mm; null until confirmed. */
  checkInTime: string | null
  checkOutTime: string | null
  translations: Record<GuideLanguage, HotelTranslation>
}
