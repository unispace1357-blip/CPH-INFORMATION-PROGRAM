export const GUIDE_LANGUAGES = ['ko', 'en', 'zh-CN', 'ja'] as const

/** Original four-language workbook/schema contract. Guest presentation also supports Russian. */
export const GUEST_LANGUAGES = [...GUIDE_LANGUAGES, 'ru'] as const
export type GuideLanguage = (typeof GUEST_LANGUAGES)[number]
export type DatasetStatus = 'demo' | 'production'
export type LocalizedText = Record<(typeof GUIDE_LANGUAGES)[number], string> & Partial<Record<'ru', string>>
