import { useEffect, useMemo, useState } from 'react'
import type { DatasetStatus, GuideLanguage } from '../../src/types/guide'
import type { Facility, FacilityCategory, FacilityDataset } from '../../src/types/facility'
import type { HotelDataset } from '../../src/types/hotel'
import rawFacilities from '../../src/data/facilities.json' with { type: 'json' }
import rawHotel from '../../src/data/hotel.json' with { type: 'json' }
import { parseHotelDataset } from '../../src/data/validateHotelDataset'
import { validateProductionData } from '../../src/data/validateProductionData'
import { preparePublicDeployment } from '../../src/data/preparePublicDeployment'
import { FACILITY_CATEGORY_OPTIONS } from '../../src/config/uiCategories'
import { Button } from '../../src/components/ui/Button'
import { InformationNotice } from '../../src/components/ui/InformationNotice'
import { FacilityEditor } from './components/FacilityEditor'
import { HotelEditor } from './components/HotelEditor'
import { TextField } from './components/Fields'
import { ValidationPanel } from './components/ValidationPanel'
import { downloadJson } from './services/download'
import { changeStatus, deleteFacility, explainError, exportFacilities, exportHotel, exportPublicFacilities, facilityToDraft, filterAdminFacilities, hasChanges, importFacilities, importHotel, inspect, MAX_JSON_BYTES, newFacilityDraft, parseAdminFacilities, productionReadiness, saveFacility } from './services/workspace'
import type { FacilityDraft, ValidationResult } from './services/workspace'

type Menu = 'facilities' | 'hotel' | 'validation' | 'json'
type Editor = { kind: 'facility'; draft: FacilityDraft; originalId: string | null; baseline: string } | { kind: 'hotel'; draft: HotelDataset; baseline: string }
const menus: { key: Menu; label: string }[] = [{ key: 'facilities', label: '시설 관리' }, { key: 'hotel', label: '호텔 기본 정보' }, { key: 'validation', label: '데이터 검증' }, { key: 'json', label: '가져오기 / 내보내기' }]
const categoryLabel = (category: FacilityCategory) => FACILITY_CATEGORY_OPTIONS.find(item => item.code === category)?.staffLabel ?? category

function initialData() {
  let facilities: FacilityDataset | null = null, hotel: HotelDataset | null = null
  const errors: string[] = []
  try { facilities = parseAdminFacilities(rawFacilities) } catch (error) { errors.push(explainError(error).technical) }
  try { hotel = parseHotelDataset(rawHotel) } catch (error) { errors.push(explainError(error).technical) }
  return { facilities, hotel, errors }
}

export function AdminApp() {
  const [initial] = useState(initialData)
  const [facilities, setFacilities] = useState(initial.facilities)
  const [hotel, setHotel] = useState(initial.hotel)
  const [exportedFacilities, setExportedFacilities] = useState(JSON.stringify(initial.facilities))
  const [exportedHotel, setExportedHotel] = useState(JSON.stringify(initial.hotel))
  const [requestedFacilities, setRequestedFacilities] = useState<string | null>(null)
  const [requestedHotel, setRequestedHotel] = useState<string | null>(null)
  const [menu, setMenu] = useState<Menu>('facilities')
  const [editor, setEditor] = useState<Editor | null>(null)
  const [language, setLanguage] = useState<GuideLanguage>('ko')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FacilityCategory | 'all'>('all')
  const [published, setPublished] = useState<'all' | 'public' | 'private'>('all')
  const [issue, setIssue] = useState<ValidationResult | null>(initial.errors.length ? explainError(new Error(initial.errors.join('; '))) : null)
  const [notice, setNotice] = useState('기존 JSON을 확인한 후 편집하세요. 다운로드 전까지 작업은 이 브라우저에만 남습니다.')
  const [importing, setImporting] = useState(false)
  const editorDirty = !!editor && hasChanges(editor.draft, editor.baseline)
  const workspaceDirty = hasChanges(facilities, exportedFacilities) || hasChanges(hotel, exportedHotel)
  const dirty = editorDirty || workspaceDirty
  const checks = useMemo(() => ({
    facilities: inspect(() => { if (!facilities) throw new Error('시설 JSON을 불러오세요.'); return parseAdminFacilities(facilities) }, facilities),
    hotel: inspect(() => { if (!hotel) throw new Error('호텔 JSON을 불러오세요.'); return parseHotelDataset(hotel) }),
    production: inspect(() => { if (!facilities || !hotel) throw new Error('시설·호텔 JSON을 불러오세요.'); return validateProductionData(facilities, hotel) }, facilities),
    readiness: facilities && hotel ? productionReadiness(facilities, hotel) : explainError(new Error('시설·호텔 JSON을 불러오세요.')),
  }), [facilities, hotel])
  const list = useMemo(() => facilities ? filterAdminFacilities(facilities, query, category, published) : [], [facilities, query, category, published])

  useEffect(() => {
    if (!dirty) return
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])

  function fail(error: unknown) { setIssue(explainError(error, facilities)); setNotice('저장·불러오기를 중단했습니다. 작업 데이터와 편집 내용은 유지합니다.') }
  function success(message: string) { setIssue(null); setNotice(message) }
  function leaveEditor(): boolean { return !editorDirty || window.confirm('저장하지 않은 편집 내용이 있습니다. 이 편집 내용을 버리고 이동할까요?') }
  function openFacility(facility: Facility | null) {
    if (!leaveEditor()) return
    const draft = facility ? facilityToDraft(facility) : newFacilityDraft()
    setMenu('facilities'); setEditor({ kind: 'facility', draft, originalId: facility?.id ?? null, baseline: JSON.stringify(draft) }); setIssue(null)
  }
  function openMenu(next: Menu) {
    if (next === menu) return
    if (!leaveEditor()) return
    setMenu(next); setIssue(null)
    setEditor(next === 'hotel' && hotel ? { kind: 'hotel', draft: structuredClone(hotel), baseline: JSON.stringify(hotel) } : null)
  }
  function saveEditor() {
    try {
      if (editor?.kind === 'facility' && facilities) {
        const next = saveFacility(facilities, editor.draft, editor.originalId)
        setFacilities(next)
        const draft = facilityToDraft(next.facilities.find(item => item.id === editor.draft.id)!)
        setEditor({ kind: 'facility', originalId: draft.id, draft, baseline: JSON.stringify(draft) })
      } else if (editor?.kind === 'hotel') {
        const next = parseHotelDataset(editor.draft)
        setHotel(next); setEditor({ kind: 'hotel', draft: next, baseline: JSON.stringify(next) })
      }
      success('브라우저 작업 데이터에 저장했습니다. 원본 파일은 변경되지 않았습니다. JSON을 다운로드하세요.')
    } catch (error) { fail(error) }
  }
  function cancelEditor() {
    if (!leaveEditor()) return
    if (editor?.kind === 'hotel' && hotel) setEditor({ kind: 'hotel', draft: structuredClone(hotel), baseline: JSON.stringify(hotel) })
    else setEditor(null)
    success('편집을 취소했습니다. 저장된 작업 데이터는 유지합니다.')
  }
  function removeFacility(facility: Facility) {
    if (!facilities) return
    const confirmed = window.confirm(`시설을 삭제할까요?\n이름: ${facility.translations.ko.name}\nID: ${facility.id}\n해당 시설의 저장 전 편집 내용도 삭제됩니다. 취소하면 유지합니다.`)
    if (!confirmed) return
    setFacilities(deleteFacility(facilities, facility.id, true))
    if (editor?.kind === 'facility' && editor.originalId === facility.id) setEditor(null)
    success('시설을 작업 데이터에서 삭제했습니다. 원본 JSON은 변경되지 않았습니다.')
  }
  function updateStatus(target: 'facilities' | 'hotel', status: DatasetStatus) {
    if (!facilities || !hotel) return
    const candidateHotel = target === 'hotel' && editor?.kind === 'hotel' ? editor.draft : hotel
    try {
      if (status === 'production') {
        const result = productionReadiness(facilities, candidateHotel)
        if (!result.valid) { setIssue(result); setNotice('운영 전환을 차단했습니다. 필수 정보와 확인일을 입력하세요.'); return }
      }
      if (!window.confirm(`${target === 'facilities' ? '시설' : '호텔'} 데이터를 ${status.toUpperCase()} 상태로 변경할까요?\n기술적 검증은 실제 정보 정확성을 보증하지 않습니다. 담당자가 정보와 번역을 확인해야 합니다.`)) return
      const next = changeStatus(facilities, candidateHotel, target, status, true)
      if (target === 'hotel' && editor?.kind === 'hotel') setEditor({ ...editor, draft: next.hotel })
      else setFacilities(next.facilities)
      success('데이터 상태를 명시적으로 변경했습니다. 저장·다운로드와 별도 검수가 필요합니다.')
    } catch (error) { fail(error) }
  }
  async function readFile(target: 'facilities' | 'hotel', file: File | undefined) {
    if (!file || importing) return
    setImporting(true)
    try {
      if (file.size > MAX_JSON_BYTES) throw new Error('JSON 파일은 최대 2MB입니다.')
      const text = await file.text()
      const next = target === 'facilities' ? importFacilities(text) : importHotel(text)
      if (!window.confirm(`${file.name} 파일로 ${target === 'facilities' ? '시설' : '호텔'} 작업 데이터를 교체할까요?\n저장 전 편집과 아직 내보내지 않은 해당 데이터를 잃을 수 있습니다. 필요한 파일을 먼저 다운로드하세요.`)) return
      if (target === 'facilities') { const dataset = next as FacilityDataset; setFacilities(dataset); setExportedFacilities(JSON.stringify(dataset)); setRequestedFacilities(null) }
      else { const dataset = next as HotelDataset; setHotel(dataset); setExportedHotel(JSON.stringify(dataset)); setRequestedHotel(null) }
      setEditor(null)
      success(`${file.name} 파일을 검증 후 불러왔습니다. 다른 데이터 파일과 원본 파일은 변경되지 않았습니다.`)
    } catch (error) { fail(error) }
    finally { setImporting(false) }
  }
  function exportFile(target: 'facilities' | 'hotel' | 'public' | 'production') {
    if (editorDirty) { setIssue(explainError(new Error('편집 내용을 먼저 저장하거나 취소하세요. 내보내기는 저장된 작업 데이터만 포함합니다.'))); return }
    try {
      if (target === 'hotel' && hotel) { downloadJson('hotel.json', exportHotel(hotel)); setRequestedHotel(JSON.stringify(hotel)) }
      else if (target === 'facilities' && facilities) { downloadJson('facilities.json', exportFacilities(facilities)); setRequestedFacilities(JSON.stringify(facilities)) }
      else if (target === 'public' && facilities) downloadJson('facilities.public.json', exportPublicFacilities(facilities))
      else if (target === 'production' && facilities && hotel) downloadJson('facilities.public.json', exportFacilities(preparePublicDeployment(facilities, hotel).facilities))
      else throw new Error('먼저 해당 JSON 파일을 불러오세요.')
      success('JSON 다운로드를 요청했습니다. 내려받은 파일을 직접 확인하세요. 원본 JSON·GitHub·공개 사이트는 자동 변경되지 않습니다.')
    } catch (error) { fail(error) }
  }
  function confirmDownloaded(target: 'facilities' | 'hotel') {
    const snapshot = target === 'facilities' ? requestedFacilities : requestedHotel
    if (snapshot === null) return
    if (!window.confirm(`${target === 'facilities' ? 'facilities.json 전체 시설' : 'hotel.json 호텔'} 파일이 PC에 저장된 것을 직접 확인했나요?\n다운로드가 취소됐거나 파일을 찾을 수 없다면 취소를 누르세요.`)) return
    if (target === 'facilities') { setExportedFacilities(snapshot); setRequestedFacilities(null) }
    else { setExportedHotel(snapshot); setRequestedHotel(null) }
    success('담당자가 내려받은 파일을 확인했습니다. 다운로드 후 새로 수정한 내용은 계속 변경사항으로 표시합니다.')
  }

  if (!['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname)) return <main className="panel"><h1>로컬 전용 관리자</h1><p>관리자는 담당자 PC의 localhost에서 실행하세요.</p></main>
  return <div className="admin-shell" data-admin-boundary="CPH_LOCAL_ADMIN_ONLY">
    <a className="skip-link" href="#admin-main">편집 본문으로 이동</a>
    <header className="admin-header"><div><span className="eyebrow">LOCAL DATA WORKSPACE</span><h1>CPH ADMIN MANAGER</h1><p>로컬 전용 · JSON 수동 검수 및 다운로드</p></div><div className="admin-status" role="status"><span>시설: {facilities?.dataStatus.toUpperCase() ?? '미등록'} · 호텔: {hotel?.dataStatus.toUpperCase() ?? '미등록'}</span><span>{editorDirty ? '저장되지 않은 편집 내용' : workspaceDirty ? '파일 저장 확인이 필요한 변경사항' : '작업 데이터 변경 없음'}</span><span>{issue ? '작업 검증 오류 있음' : checks.facilities.valid && checks.hotel.valid ? '개발 데이터 검증 완료' : '데이터 검증 오류 있음'}</span><span>{checks.production.valid ? '운영 배포 기술 조건 충족 · 담당자 검수 필요' : '운영 배포 준비 미완료'}</span></div></header>
    <div className="admin-workspace"><nav className="admin-navigation" aria-label="관리자 메뉴">{menus.map(item => <Button key={item.key} variant={menu === item.key ? 'primary' : 'secondary'} aria-current={menu === item.key ? 'page' : undefined} disabled={importing} onClick={() => openMenu(item.key)}>{item.label}</Button>)}<p>저장 위치: 현재 브라우저 메모리. 새로고침·종료 전에 JSON 파일을 내려받으세요.</p></nav>
      <main id="admin-main" tabIndex={-1} className="admin-main">
        <InformationNotice title="자동 반영되지 않습니다" tone="warning">이 화면의 저장은 원본 JSON·GitHub·공개 사이트를 수정하지 않습니다. DEMO 데이터는 실제 고객 안내에 사용할 수 없습니다. 개인정보·비밀 정보는 입력하지 마세요.</InformationNotice>
        <p className="admin-feedback" role="status" aria-live="polite">{notice}</p>
        {issue && <div role="alert"><ValidationPanel title="작업 오류 · 내용을 확인해 주세요" result={issue} /></div>}
        <fieldset className="admin-workspace-lock" disabled={importing}>
        {menu === 'facilities' && <div className="admin-facility-workspace"><section className="panel admin-facility-list"><div className="section-heading"><h2>전체 시설 목록</h2><Button disabled={!facilities} onClick={() => openFacility(null)}>신규 시설 추가</Button></div>
          <TextField label="시설명 검색" value={query} onChange={setQuery} /><div className="admin-field-grid"><div className="admin-field"><label htmlFor="admin-category-filter">카테고리 필터</label><select id="admin-category-filter" value={category} onChange={event => setCategory(event.target.value as typeof category)}><option value="all">전체</option>{FACILITY_CATEGORY_OPTIONS.map(item => <option value={item.code} key={item.code}>{item.staffLabel}</option>)}</select></div><div className="admin-field"><label htmlFor="admin-published-filter">공개 상태 필터</label><select id="admin-published-filter" value={published} onChange={event => setPublished(event.target.value as typeof published)}><option value="all">전체</option><option value="public">공개</option><option value="private">비공개</option></select></div></div>
          <p className="field-hint" role="status">목록 {list.length}개 / 전체 {facilities?.facilities.length ?? 0}개 · 비공개 포함</p><ul className="admin-records">{list.map(facility => <li key={facility.id} className={editor?.kind === 'facility' && editor.originalId === facility.id ? 'is-selected' : ''}><h3>{facility.translations.ko.name}</h3><p lang="en">{facility.translations.en.name}</p><p className="admin-id">ID: {facility.id}</p><p>{categoryLabel(facility.category)} · {facility.isPublished ? '공개' : '비공개'} · {facility.lastVerifiedAt ?? '확인 전'}</p><p className="field-hint">개발 검증: {inspect(() => parseAdminFacilities({ schemaVersion: 1, dataStatus: facilities!.dataStatus, facilities: [facility] })).valid ? 'PASS' : 'FAIL'}</p><div className="admin-list-actions"><Button variant="secondary" aria-label={`편집 ${facility.id}`} aria-pressed={editor?.kind === 'facility' && editor.originalId === facility.id} onClick={() => openFacility(facility)}>편집</Button><Button variant="quiet" aria-label={`삭제 ${facility.id}`} onClick={() => removeFacility(facility)}>삭제</Button></div></li>)}</ul>{list.length === 0 && <p>표시할 시설이 없습니다. 필터를 확인하거나 JSON을 불러오세요.</p>}</section>
          <section className="panel admin-editor-panel">{editor?.kind === 'facility' ? <FacilityEditor draft={editor.draft} originalId={editor.originalId} language={language} onLanguage={setLanguage} onChange={draft => setEditor({ ...editor, draft })} onSave={saveEditor} onCancel={cancelEditor} /> : <><h2>시설 정보 편집</h2><p>목록에서 시설을 선택하거나 신규 시설을 추가하세요.</p></>}</section>
        </div>}
        {menu === 'hotel' && <section className="panel">{editor?.kind === 'hotel' ? <HotelEditor draft={editor.draft} language={language} onLanguage={setLanguage} onChange={draft => setEditor({ ...editor, draft })} onStatus={status => updateStatus('hotel', status)} onSave={saveEditor} onCancel={cancelEditor} /> : <p>호텔 JSON을 가져오기 메뉴에서 불러오세요.</p>}</section>}
        {menu === 'validation' && <section className="panel admin-validation-page"><h2>데이터 검증</h2><p>저장된 작업 데이터를 검사합니다. 기술 검사 PASS는 실제 시설·호텔 정보의 정확성을 보증하지 않습니다.</p><ValidationPanel title="시설 개발 데이터 검증" result={checks.facilities} /><ValidationPanel title="호텔 개발 데이터 검증" result={checks.hotel} /><ValidationPanel title="현재 운영 배포 검증" result={checks.production} /><ValidationPanel title="운영 전환 전 필수 정보 검사 (상태는 변경하지 않음)" result={checks.readiness} /></section>}
        {menu === 'json' && <section className="panel admin-json-page"><h2>가져오기 / 내보내기</h2><p>파일은 각각 검증 후 확인을 받아 교체합니다. 최대 2MB. 다운로드한 파일은 담당자가 확인한 후 수동으로 반영하세요.</p>
          <div className="admin-field-grid"><div className="admin-field"><label htmlFor="facilities-file">시설 JSON 불러오기</label><input id="facilities-file" type="file" accept=".json,application/json" onChange={event => { void readFile('facilities', event.target.files?.[0]); event.target.value = '' }} /></div><div className="admin-field"><label htmlFor="hotel-file">호텔 JSON 불러오기</label><input id="hotel-file" type="file" accept=".json,application/json" onChange={event => { void readFile('hotel', event.target.files?.[0]); event.target.value = '' }} /></div></div>
          <div className="admin-field"><label htmlFor="facility-data-status">시설 데이터 상태</label><select id="facility-data-status" disabled={!facilities || !hotel} value={facilities?.dataStatus ?? 'demo'} onChange={event => updateStatus('facilities', event.target.value as DatasetStatus)}><option value="demo">DEMO</option><option value="production">PRODUCTION</option></select></div>
          <h3>관리자 편집용 전체 JSON</h3><p>전체 시설에는 비공개 시설도 포함됩니다. 원본을 보존하는 검수·백업용 파일이며 공개 배포용 파일과 구분하세요.</p><div className="admin-editor-actions"><Button disabled={!facilities} onClick={() => exportFile('facilities')}>전체 시설 JSON 다운로드</Button><Button disabled={!hotel} onClick={() => exportFile('hotel')}>호텔 JSON 다운로드</Button></div>
          <p>다운로드 요청만으로 변경사항 경고를 해제하지 않습니다. PC에 파일이 저장된 것을 확인한 뒤 아래 버튼을 누르세요.</p><div className="admin-editor-actions"><Button variant="secondary" disabled={requestedFacilities === null} onClick={() => confirmDownloaded('facilities')}>전체 시설 파일 저장 확인</Button><Button variant="secondary" disabled={requestedHotel === null} onClick={() => confirmDownloaded('hotel')}>호텔 파일 저장 확인</Button></div>
          <h3>공개 시설 선별</h3><p>비공개 시설을 완전히 제외한 같은 스키마의 시설 JSON을 생성합니다. DEMO 미리보기는 배포할 수 없습니다. 공개용 파일 다운로드는 전체 데이터의 백업을 대신하지 않습니다.</p><div className="admin-editor-actions"><Button variant="secondary" disabled={!facilities} onClick={() => exportFile('public')}>공개 시설 선별 미리보기 다운로드</Button><Button disabled={!checks.production.valid} onClick={() => exportFile('production')}>운영 검증 후 공개 시설 다운로드</Button></div>
          <p className="field-hint">운영 빌드는 원본을 덮어쓰지 않고 공개용 스냅샷을 다시 생성·검증하여 사용합니다. 파일 다운로드만으로 GitHub나 사이트에 반영되지 않습니다.</p>
        </section>}
        </fieldset>
      </main>
    </div><footer className="admin-footer">CPH · 로컬 편집 도구. 이탈 경고는 브라우저 제한이 있으므로 내려받은 파일을 직접 확인하세요.</footer>
  </div>
}
