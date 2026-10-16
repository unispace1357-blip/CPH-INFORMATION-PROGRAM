/** Independent staff reply copy; do not publish staffChecks in customer views. */
import type { DatasetStatus } from './guide.ts'

export const FRONTDESK_SCRIPT_CATEGORIES = [
  'check-in-out', 'breakfast', 'room-usage', 'hotel-policy', 'hotel-facilities',
] as const

export type FrontdeskScriptCategory = (typeof FRONTDESK_SCRIPT_CATEGORIES)[number]
export type FrontdeskReviewStatus = 'draft' | 'approved'
export type FrontdeskSourceType = 'hotel-data' | 'user-provided'

/** Existing HotelTranslation sections are the authoritative public hotel copy. */
export const FRONTDESK_SOURCE_SECTIONS = [
  'name', 'address', 'checkIn', 'checkOut', 'breakfast', 'parking', 'roomUsage', 'notes',
] as const
export type FrontdeskSourceSection = (typeof FRONTDESK_SOURCE_SECTIONS)[number]

export interface ScriptBilingual {
  en: string
  ko: string
}

export interface FrontdeskScript {
  id: string
  category: FrontdeskScriptCategory
  title: string
  keywords: string[]
  question: ScriptBilingual
  quickAnswer: ScriptBilingual
  /** Omitted when the quick answer is sufficient; never store an incomplete translation pair. */
  details?: ScriptBilingual
  /** Operational reminders only, never copy to a guest response. */
  staffChecks: string[]
  /** Existing hotel.json section, or null for a new user-provided observation. */
  sourceType: FrontdeskSourceType
  sourceSection: FrontdeskSourceSection | null
  reviewStatus: FrontdeskReviewStatus
  lastVerifiedAt: string | null
}

export interface FrontdeskScriptDataset {
  schemaVersion: 1
  dataStatus: DatasetStatus
  scripts: FrontdeskScript[]
}
