/** Keep this contract aligned with src/data/facilities.schema.json. */
export type GuideLanguage = 'ko' | 'en' | 'zh-CN' | 'ja'
export type FacilityCategory =
  | 'hotel'
  | 'dining'
  | 'cafe'
  | 'convenience'
  | 'pharmacy'
  | 'shopping'
  | 'attraction'
  | 'transportation'

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
  /** Display control only; bundled JSON remains publicly readable. */
  isPublished: boolean
  /** YYYY-MM-DD; null means the information has not been verified. */
  lastVerifiedAt: string | null
  translations: Record<GuideLanguage, FacilityTranslation>
  keywords: Record<'ko' | 'en', string[]>
  englishPhrases: string[]
}

export interface FacilityDataset {
  schemaVersion: 1
  dataStatus: 'demo' | 'production'
  facilities: Facility[]
}
