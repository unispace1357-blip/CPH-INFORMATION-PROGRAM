export const GUIDE_LANGUAGES = ['ko', 'en', 'zh-CN', 'ja'] as const

export type GuideLanguage = (typeof GUIDE_LANGUAGES)[number]
export type DatasetStatus = 'demo' | 'production'
export type LocalizedText = Record<GuideLanguage, string>
