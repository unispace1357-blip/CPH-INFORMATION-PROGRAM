import { createContext, useContext } from 'react'
import type { GuideLanguage } from '../types/guide'

export const GuestLanguageContext = createContext<{ language: GuideLanguage; setLanguage: (language: GuideLanguage) => void } | null>(null)

export function useGuestLanguage() {
  const context = useContext(GuestLanguageContext)
  if (!context) throw new Error('Guest language provider is missing')
  return context
}
