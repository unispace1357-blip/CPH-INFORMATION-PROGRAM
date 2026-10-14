import { useId } from 'react'
import type { GuideLanguage } from '../../types/guide'

const languageOptions: { value: GuideLanguage; label: string; lang: GuideLanguage }[] = [
  { value: 'en', label: 'English', lang: 'en' },
  { value: 'zh-CN', label: '简体中文', lang: 'zh-CN' },
  { value: 'ja', label: '日本語', lang: 'ja' },
  { value: 'ko', label: '한국어', lang: 'ko' },
]

interface LanguageSelectorProps {
  value: GuideLanguage
  onChange?: (language: GuideLanguage) => void
  disabled?: boolean
  label?: string
  hint?: string
}

export function LanguageSelector({ value, onChange, disabled = true, label = 'Language', hint = 'Language switching is not available in this development preview.' }: LanguageSelectorProps) {
  const hintId = useId()
  return (
    <fieldset className="language-selector" aria-describedby={hintId}>
      <legend>{label}</legend><div className="language-options">{languageOptions.map(option => <button type="button" key={option.value} lang={option.lang} aria-pressed={value === option.value} disabled={disabled || !onChange} onClick={() => onChange?.(option.value)}>{option.label}</button>)}</div>
      <p className="field-hint" id={hintId}>{hint}</p>
    </fieldset>
  )
}
