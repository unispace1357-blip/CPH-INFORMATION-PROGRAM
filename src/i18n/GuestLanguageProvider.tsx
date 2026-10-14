import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { GuestLanguageContext } from './guestLanguageContext'
import { DEFAULT_GUEST_LANGUAGE } from './types'

export function GuestLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(DEFAULT_GUEST_LANGUAGE)
  const value = useMemo(() => ({ language, setLanguage }), [language])
  return <GuestLanguageContext.Provider value={value}>{children}</GuestLanguageContext.Provider>
}
