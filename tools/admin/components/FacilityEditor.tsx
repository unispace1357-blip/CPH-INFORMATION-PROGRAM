import type { GuideLanguage } from '../../../src/types/guide'
import type { FacilityCategory, FacilityTranslation } from '../../../src/types/facility'
import { FACILITY_CATEGORY_OPTIONS } from '../../../src/config/uiCategories'
import { NaverDirectionsLink } from '../../../src/components/ui/NaverDirectionsLink'
import { naverMapUrlError } from '../../../src/services/naverMapUrl'
import { Button } from '../../../src/components/ui/Button'
import type { FacilityDraft } from '../services/workspace'
import { LANGUAGE_NAMES } from '../services/workspace'
import { TextField, LanguageTabs, StringListEditor } from './Fields'

const translatedFields: { code: keyof FacilityTranslation; label: string }[] = [
  { code: 'name', label: '시설명' }, { code: 'description', label: '시설 설명' }, { code: 'address', label: '주소' },
  { code: 'openingHours', label: '영업시간' }, { code: 'directions', label: '이동 안내' }, { code: 'notes', label: '참고 사항' },
]

export function FacilityEditor({ draft, originalId, language, onLanguage, onChange, onSave, onCancel }: { draft: FacilityDraft; originalId: string | null; language: GuideLanguage; onLanguage: (language: GuideLanguage) => void; onChange: (draft: FacilityDraft) => void; onSave: () => void; onCancel: () => void }) {
  return <form className="admin-editor" noValidate onSubmit={event => { event.preventDefault(); onSave() }}>
    <div className="section-heading"><h2>{originalId === null ? '신규 시설 등록' : '시설 정보 편집'}</h2><span className="status-label">{originalId ?? '비공개 기본값'}</span></div>
    <fieldset><legend>공통 정보</legend><div className="admin-field-grid">
      <TextField label="시설 ID" value={draft.id} readOnly={originalId !== null} onChange={id => onChange({ ...draft, id })} hint={originalId === null ? '영문 소문자·숫자·하이픈, 최대 80자. 기존 ID와 중복 불가.' : '기존 ID는 내부 참조 기준이므로 변경할 수 없습니다.'} />
      <div className="admin-field"><label htmlFor="facility-category">카테고리</label><select id="facility-category" value={draft.category} onChange={event => onChange({ ...draft, category: event.target.value as FacilityCategory })}>{FACILITY_CATEGORY_OPTIONS.map(item => <option key={item.code} value={item.code}>{item.staffLabel}</option>)}</select></div>
      <TextField label="마지막 확인일" value={draft.lastVerifiedAt ?? ''} onChange={value => onChange({ ...draft, lastVerifiedAt: value === '' ? null : value })} hint="확인한 실제 날짜 YYYY-MM-DD. 미확인이면 비워 주세요." />
      <TextField label="예상 도보시간 (분)" value={draft.walkingMinutes} inputMode="decimal" onChange={walkingMinutes => onChange({ ...draft, walkingMinutes })} hint="0 이상의 숫자. 미확인이면 비워 주세요. 자동 계산하지 않습니다." />
    </div><label className="admin-checkbox"><input type="checkbox" checked={draft.isPublished} onChange={event => onChange({ ...draft, isPublished: event.target.checked })} />공개 시설로 표시</label><p className="field-hint">저장과 다운로드만으로 공개 사이트에 반영되지 않습니다.</p></fieldset>
    <fieldset><legend>네이버 지도 길찾기</legend>
      <TextField label="네이버 지도 길찾기 URL" value={draft.naverMapUrl} onChange={naverMapUrl => onChange({ ...draft, naverMapUrl })} hint="호텔에서 해당 시설까지 길찾기를 설정한 네이버 지도 URL을 입력하세요. 아직 확인하지 않았다면 비워 두세요. 단축 URL은 최종 주소를 확인한 후 입력하세요." />
      {draft.naverMapUrl && naverMapUrlError(draft.naverMapUrl) && <p className="field-hint" role="status">{naverMapUrlError(draft.naverMapUrl)}</p>}
      <NaverDirectionsLink url={draft.naverMapUrl} label="등록 링크 확인" unavailable={draft.naverMapUrl ? '유효하지 않은 링크 · 저장 및 열기 불가' : '미등록'} newTabNotice="네이버 지도가 새 탭에서 열립니다. 실제 경로를 확인한 후 저장하세요." />
      <p className="field-hint">등록 전 확인: 출발지 송도센트럴파크호텔 · 도착지 실제 시설 · 도보 또는 승인된 이동수단 · 정상 경로 열림 · 다른 장소/지점이 아님. 개인정보·인증 정보를 넣지 마세요. 실제 URL은 STEP 07-B-2에서 입력합니다.</p>
    </fieldset>
    <fieldset><legend>4개 국어 정보</legend><LanguageTabs language={language} onChange={onLanguage} /><h3 className="admin-language-heading">현재 편집 언어: {LANGUAGE_NAMES[language]}</h3>
      <p className="field-hint">자동 번역하지 않습니다. 기존 스키마상 시설명은 4개 언어 모두 필요하며, 다른 안내는 미확인이면 비워 둘 수 있습니다.</p>
      {translatedFields.map(field => <TextField key={`${language}-${field.code}`} language={language} label={field.label} value={draft.translations[language][field.code]} multiline={field.code !== 'name'} onChange={value => onChange({ ...draft, translations: { ...draft.translations, [language]: { ...draft.translations[language], [field.code]: value } } })} />)}
      <TextField label="휴무일" language={language} value={draft.closedDays[language]} multiline onChange={value => onChange({ ...draft, closedDays: { ...draft.closedDays, [language]: value } })} />
      <StringListEditor key={language} label="검색 키워드" items={draft.keywords[language]} onChange={items => onChange({ ...draft, keywords: { ...draft.keywords, [language]: items } })} />
    </fieldset>
    <StringListEditor label="영어 응대 문구" items={draft.englishPhrases} multiline onChange={englishPhrases => onChange({ ...draft, englishPhrases })} />
    <div className="admin-editor-actions"><Button type="submit">편집 내용 저장</Button><Button variant="secondary" onClick={onCancel}>편집 취소</Button></div><p className="field-hint">저장은 현재 브라우저 작업 데이터에만 반영됩니다. JSON 다운로드 후 파일을 직접 확인하세요.</p>
  </form>
}
