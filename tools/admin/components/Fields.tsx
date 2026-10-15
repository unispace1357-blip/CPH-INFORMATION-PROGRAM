import { useId } from 'react'
import type { GuideLanguage } from '../../../src/types/guide'
import { GUIDE_LANGUAGES } from '../../../src/types/guide'
import { Button } from '../../../src/components/ui/Button'
import { LANGUAGE_NAMES, moveListItem } from '../services/workspace'

export function TextField({ label, value, onChange, multiline = false, readOnly = false, hint, language, inputMode }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; readOnly?: boolean; hint?: string; language?: GuideLanguage; inputMode?: 'decimal' }) {
  const id = useId()
  const props = { id, value, readOnly, lang: language, 'aria-describedby': hint ? `${id}-hint` : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) }
  return <div className="admin-field"><label htmlFor={id}>{label}</label>{multiline ? <textarea {...props} rows={3} /> : <input {...props} inputMode={inputMode} />}{hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}</div>
}

export function LanguageTabs({ language, onChange }: { language: GuideLanguage; onChange: (language: GuideLanguage) => void }) {
  return <div className="admin-language-tabs" role="group" aria-label="편집 언어">{GUIDE_LANGUAGES.map(item => <Button key={item} variant={language === item ? 'primary' : 'secondary'} aria-pressed={language === item} onClick={() => onChange(item)}>{LANGUAGE_NAMES[item]}</Button>)}</div>
}

export function StringListEditor({ label, items, onChange, multiline = false, meanings, itemLabels }: { label: string; items: string[]; onChange: (items: string[], meanings?: string[]) => void; multiline?: boolean; meanings?: string[]; itemLabels?: readonly string[] }) {
  return <fieldset className="admin-list-editor"><legend>{label}</legend>
    {items.length === 0 && <p className="field-hint">등록된 항목이 없습니다.</p>}
    {items.map((item, index) => {
      const title = itemLabels?.[index] ?? `${label} ${index + 1}`
      return <div className="admin-list-row" key={index}>
        <TextField label={meanings ? `${title} 영어` : title} language={meanings ? 'en' : undefined} value={item} multiline={multiline} onChange={value => onChange(items.map((old, i) => i === index ? value : old), meanings)} />
        {meanings && <TextField label={`${title} 한국어 뜻`} language="ko" value={meanings[index] ?? ''} multiline={multiline} onChange={value => onChange(items, meanings.map((old, i) => i === index ? value : old))} />}
        <div className="admin-list-actions"><Button variant="secondary" aria-label={`${label} ${index + 1} 위로`} disabled={index === 0} onClick={() => onChange(moveListItem(items, index, -1), meanings && moveListItem(meanings, index, -1))}>위로</Button><Button variant="secondary" aria-label={`${label} ${index + 1} 아래로`} disabled={index === items.length - 1} onClick={() => onChange(moveListItem(items, index, 1), meanings && moveListItem(meanings, index, 1))}>아래로</Button><Button variant="quiet" aria-label={`${label} ${index + 1} 삭제`} onClick={() => onChange(items.filter((_, i) => i !== index), meanings?.filter((_, i) => i !== index))}>삭제</Button></div>
      </div>
    })}
    <Button variant="secondary" onClick={() => onChange([...items, ''], meanings && [...meanings, ''])}>{label} 추가</Button>
    <p className="field-hint">{meanings ? '영어 문구는 공백·중복으로 저장할 수 없습니다. 한국어 뜻은 영어와 함께 이동합니다.' : '공백·중복 항목은 저장할 수 없습니다. 항목은 자동 삭제하지 않습니다.'}</p>
  </fieldset>
}
