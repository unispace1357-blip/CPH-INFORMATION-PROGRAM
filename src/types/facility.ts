import type { DatasetStatus, GuideLanguage, LocalizedText } from './guide.ts'

export type { GuideLanguage } from './guide.ts'

/** Keep this contract aligned with src/data/facilities.schema.json. */
export const FACILITY_CATEGORIES = [
  'hotel', 'dining', 'cafe', 'convenience', 'pharmacy',
  'shopping', 'attraction', 'transportation', 'sauna_spa', 'atm',
] as const
export type FacilityCategory = (typeof FACILITY_CATEGORIES)[number]

export interface FacilityTranslation {
  name: string
  description: string
  address: string
  openingHours: string
  directions: string
  notes: string
}

export interface Facility {
  id: string
  category: FacilityCategory
  /** Additional filter categories without duplicating this facility in the dataset. */
  additionalCategories?: FacilityCategory[]
  /** Display control only; bundled JSON remains publicly readable. */
  isPublished: boolean
  /** YYYY-MM-DD; null means the information has not been verified. */
  lastVerifiedAt: string | null
  translations: Record<GuideLanguage, FacilityTranslation>
  /** Shared across languages; null means unknown, never an invented estimate. */
  walkingMinutes: number | null
  closedDays: LocalizedText
  keywords: Record<GuideLanguage, string[]>
  englishPhrases: string[]
  /** Staff-only Korean meanings aligned by index; omitted for legacy English-only records. */
  englishPhraseMeanings?: string[]
  /** Staff-verified public Naver directions URL; omitted/null means unregistered. */
  naverMapUrl?: string | null
}

export interface FacilityDataset {
  schemaVersion: 1
  dataStatus: DatasetStatus
  facilities: Facility[]
}
