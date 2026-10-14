import type { GuideLanguage } from '../types/guide.ts'
import { MESSAGES } from './messages.ts'
import type { UiMessageKey } from './types.ts'

export function message(language: GuideLanguage, key: UiMessageKey, values: Record<string, string | number> = {}): string {
  return MESSAGES[language].ui[key].replace(/\{(\w+)\}/g, (token, name: string) => String(values[name] ?? token))
}

export function localizedValue(value: unknown, language: GuideLanguage, key: UiMessageKey = 'informationUnavailable'): string {
  return typeof value === 'string' && value.trim() ? value.trim() : message(language, key)
}

export function guestWalkingTime(value: unknown, language: GuideLanguage): string {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? message(language, 'aboutWalk', { minutes: value }) : message(language, 'walkingUnavailable')
}

export function guestVerificationDate(value: unknown, language: GuideLanguage): string {
  return typeof value === 'string' && value.trim() ? message(language, 'verifiedOn', { date: value }) : message(language, 'verificationUnavailable')
}
