import type { GuideLanguage, DatasetStatus } from '../../../src/types/guide'
import type { HotelDataset, HotelTranslation } from '../../../src/types/hotel'
import { Button } from '../../../src/components/ui/Button'
import { LANGUAGE_NAMES } from '../services/workspace'
import { TextField, LanguageTabs } from './Fields'

const fields: { code: keyof HotelTranslation; label: string }[] = [
  { code: 'name', label: '호텔명' }, { code: 'description', label: '호텔 설명' }, { code: 'address', label: '호텔 주소' },
  { code: 'checkIn', label: '체크인 안내' }, { code: 'checkOut', label: '체크아웃 안내' }, { code: 'breakfast', label: '조식 안내' },
  { code: 'parking', label: '주차 안내' }, { code: 'roomUsage', label: '객실 이용 안내' }, { code: 'notes', label: '호텔 참고 사항' },
]

export function HotelEditor({ draft, language, onLanguage, onChange, onStatus, onSave, onCancel }: { draft: HotelDataset; language: GuideLanguage; onLanguage: (language: GuideLanguage) => void; onChange: (draft: HotelDataset) => void; onStatus: (status: DatasetStatus) => void; onSave: () => void; onCancel: () => void }) {
  return <form className="admin-editor" noValidate onSubmit={event => { event.preventDefault(); onSave() }}>
    <h2>호텔 기본 정보 편집</h2><fieldset><legend>공통 호텔 정보</legend><div className="admin-field-grid">
      <div className="admin-field"><label htmlFor="hotel-status">호텔 데이터 상태</label><select id="hotel-status" value={draft.dataStatus} onChange={event => onStatus(event.target.value as DatasetStatus)}><option value="demo">DEMO</option><option value="production">PRODUCTION</option></select></div>
      <TextField label="호텔 마지막 확인일" value={draft.lastVerifiedAt ?? ''} onChange={value => onChange({ ...draft, lastVerifiedAt: value === '' ? null : value })} hint="직접 확인한 날짜 YYYY-MM-DD. 미확인이면 비워 주세요." />
      <TextField label="체크인 시간" value={draft.checkInTime ?? ''} onChange={value => onChange({ ...draft, checkInTime: value === '' ? null : value })} hint="HH:mm. 미확인이면 비워 주세요. 기본 시간은 제공하지 않습니다." />
      <TextField label="체크아웃 시간" value={draft.checkOutTime ?? ''} onChange={value => onChange({ ...draft, checkOutTime: value === '' ? null : value })} hint="HH:mm. 미확인이면 비워 주세요." />
    </div></fieldset>
    <fieldset><legend>4개 국어 호텔 안내</legend><LanguageTabs language={language} onChange={onLanguage} /><h3 className="admin-language-heading">현재 편집 언어: {LANGUAGE_NAMES[language]}</h3>{fields.map(field => <TextField key={`${language}-${field.code}`} language={language} label={field.label} value={draft.translations[language][field.code]} multiline={field.code !== 'name'} onChange={value => onChange({ ...draft, translations: { ...draft.translations, [language]: { ...draft.translations[language], [field.code]: value } } })} />)}</fieldset>
    <div className="admin-editor-actions"><Button type="submit">호텔 편집 저장</Button><Button variant="secondary" onClick={onCancel}>편집 취소</Button></div><p className="field-hint">실제 호텔 정책은 직접 확인해 입력하세요. 원본 JSON과 공개 사이트는 자동 변경되지 않습니다.</p>
  </form>
}
