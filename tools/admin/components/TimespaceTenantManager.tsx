import { useEffect, useMemo, useState } from 'react'
import { GUIDE_LANGUAGES } from '../../../src/types/guide.ts'
import { TIMESPACE_CATEGORY_ORDER, timespaceCategoryLabel } from '../../../src/services/timespaceDirectory.ts'
import type { TimespaceTenant } from '../../../src/services/timespaceDirectory.ts'
import { downloadJson } from '../services/download.ts'
import {
  INITIAL_TIMESPACE_TENANTS, tenantDraft, saveTimespaceTenant,
  setTimespaceTenantClosed, exportTimespaceTenants, importTimespaceTenants
} from '../services/timespaceTenantWorkspace.ts'
import type { TimespaceTenantDataset } from '../services/timespaceTenantWorkspace.ts'

/** Localhost-only admin workspace, never remotely writes source JSON or GitHub. */
export function TimespaceTenantManager({ active }: { active: boolean }) {
  const [dataset, setDataset] = useState<TimespaceTenantDataset>(INITIAL_TIMESPACE_TENANTS)
  const [savedSnapshot, setSavedSnapshot] = useState(exportTimespaceTenants(INITIAL_TIMESPACE_TENANTS))
  const [requestedExport, setRequestedExport] = useState<string | null>(null)
  const [editor, setEditor] = useState<{ originalId: string | null; draft: TimespaceTenant; baseline: string } | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all')
  const [notice, setNotice] = useState('변경 내용은 이 브라우저에만 보관됩니다. JSON을 다운로드해 검수 후 수동 배포하세요.')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const draftDirty = !!editor && JSON.stringify(editor.draft) !== editor.baseline
  const fileDirty = exportTimespaceTenants(dataset) !== savedSnapshot
  useEffect(() => {
    if (!draftDirty && !fileDirty) return
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [draftDirty, fileDirty])

  const list = useMemo(() => dataset.tenants.filter(t =>
    (status === 'all' || (t.status === 'closed' ? 'closed' : 'open') === status)
    && (t.name + ' ' + t.id + ' ' + t.rooms).toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())
  ), [dataset, query, status])
  const activeCount = dataset.tenants.filter(t => t.status !== 'closed').length

  function open(tenant: TimespaceTenant | null) {
    if (draftDirty && !window.confirm('저장하지 않은 매장 편집 내용을 버릴까요?')) return
    const draft = tenant ? structuredClone(tenant) : tenantDraft()
    setEditor({ originalId: tenant?.id ?? null, draft, baseline: JSON.stringify(draft) })
    setError('')
  }
  function editField(patch: Partial<TimespaceTenant>) {
    setEditor(current => current ? { ...current, draft: { ...current.draft, ...patch } } : null)
  }
  function save() {
    if (!editor) return
    try {
      const next = saveTimespaceTenant(dataset, editor.draft, editor.originalId)
      setDataset(next); setEditor(null); setRequestedExport(null); setError('')
      setNotice('브라우저 작업 데이터에 저장했습니다. 원본 사이트에는 반영되지 않았습니다. JSON을 내려받으세요.')
    } catch (reason) { setError(String(reason)) }
  }
  function closeTenant(tenant: TimespaceTenant) {
    if (draftDirty && !window.confirm('저장하지 않은 편집을 버리고 영업 상태를 수정할까요?')) return
    const closed = tenant.status !== 'closed'
    if (!window.confirm(tenant.name + ' 매장을 ' + (closed ? '영업 종료로 표시' : '다시 안내 목록에 표시') + '할까요?\n수정 내용은 JSON 수동 반영 전까지 공개되지 않습니다.')) return
    try {
      setDataset(setTimespaceTenantClosed(dataset, tenant.id, closed))
      setEditor(null); setRequestedExport(null); setError('')
      setNotice(closed ? '매장을 영업 종료로 기록했습니다. 공개 화면에는 JSON 검수·배포 후 제외됩니다.' : '영업 종료 표시를 해제했습니다. 공개하려면 JSON 검수·배포가 필요합니다.')
    } catch (reason) { setError(String(reason)) }
  }
  function exportFile() {
    if (draftDirty) { setError('매장 편집 내용을 저장하거나 취소한 뒤 내보내세요.'); return }
    try {
      const snapshot = exportTimespaceTenants(dataset)
      downloadJson('timespaceTenants.json', snapshot)
      setRequestedExport(snapshot); setError('')
      setNotice('다운로드를 요청했습니다. 실제 PC에 파일이 저장되었는지 확인하세요.')
    } catch (reason) { setError(String(reason)) }
  }
  function confirmDownload() {
    if (!requestedExport) return
    if (!window.confirm('timespaceTenants.json 파일이 실제로 PC에 저장되었나요? 저장 여부를 확인한 경우에만 확인을 누르세요.')) return
    setSavedSnapshot(requestedExport); setRequestedExport(null)
    setNotice('파일 다운로드 확인을 기록했습니다. GitHub 및 공개 사이트는 변경되지 않았습니다.')
  }
  async function importFile(file: File | undefined) {
    if (!file || loading) return
    setLoading(true)
    try {
      const next = importTimespaceTenants(await file.text())
      if (!window.confirm('현재 입점 업체 작업 데이터를 가져온 JSON으로 교체할까요? 저장하지 않은 변경사항을 잃을 수 있습니다.')) return
      setDataset(next); setSavedSnapshot(exportTimespaceTenants(next))
      setEditor(null); setRequestedExport(null); setError('')
      setNotice('업체 JSON을 검증한 뒤 불러왔습니다. 원본 GitHub 및 배포 데이터는 변경되지 않았습니다.')
    } catch (reason) { setError(String(reason)) }
    finally { setLoading(false) }
  }

  return <section className="admin-timespace-page" hidden={!active} aria-labelledby="admin-timespace-title">
    <div className="section-heading">
      <div><h2 id="admin-timespace-title">타임스페이스 입점 업체 관리</h2>
        <p className="field-hint">전체 {dataset.tenants.length}곳 · 안내 대상 {activeCount}곳 · 영업 종료 {dataset.tenants.length - activeCount}곳</p></div>
      <button className="button button--primary" type="button" onClick={() => open(null)}>새 매장 추가</button>
    </div>
    <p className="field-hint">관리자 PC의 localhost에서만 편집할 수 있습니다. 수정 → JSON 다운로드 → 파일 검수 → GitHub 수동 반영 순서이며 자동 배포는 하지 않습니다.</p>
    <p className="admin-feedback" role="status">{notice} {fileDirty ? '· 저장 확인이 필요한 변경 있음' : ''}</p>
    {error && <p role="alert" className="admin-validation">{error}</p>}
    <fieldset disabled={loading} className="admin-timespace-fieldset">
      <div className="admin-timespace-workspace">
        <div className="panel admin-timespace-list">
          <div className="admin-field-grid">
            <div className="admin-field"><label htmlFor="tenant-query">매장명·ID·호수 검색</label><input id="tenant-query" value={query} onChange={e=>setQuery(e.target.value)} /></div>
            <div className="admin-field"><label htmlFor="tenant-status-filter">영업 상태</label><select id="tenant-status-filter" value={status} onChange={e=>setStatus(e.target.value as typeof status)}><option value="all">전체</option><option value="open">안내 대상</option><option value="closed">영업 종료</option></select></div>
          </div>
          <ul className="admin-records">{list.map(tenant => <li key={tenant.id}>
            <h3>{tenant.name}</h3><p>{timespaceCategoryLabel(tenant.category,'ko')} · {tenant.building}동 {tenant.floor}층 {tenant.rooms}호 · {tenant.status === 'closed' ? '영업 종료' : '안내 대상'}</p>
            <p className="admin-id">ID: {tenant.id}</p>
            <div className="admin-list-actions">
              <button type="button" className="button button--secondary" onClick={()=>open(tenant)} aria-label={'편집 ' + tenant.id}>편집</button>
              <button type="button" className="button button--quiet" onClick={()=>closeTenant(tenant)} aria-label={(tenant.status==='closed'?'영업 재개 ':'영업 종료 ') + tenant.id}>{tenant.status==='closed'?'영업 종료 해제':'영업 종료'}</button>
            </div>
          </li>)}</ul>
          {list.length === 0 && <p>검색 조건에 맞는 매장이 없습니다.</p>}
        </div>
        <div className="panel admin-timespace-editor">
          {editor ? <>
            <h3>{editor.originalId ? '입점 업체 수정' : '신규 입점 업체 등록'}</h3>
            <div className="admin-field-grid">
              <div className="admin-field"><label htmlFor="tenant-id">업체 ID (영문 소문자·숫자·하이픈)</label><input id="tenant-id" value={editor.draft.id} readOnly={editor.originalId !== null} onChange={e=>editField({id:e.target.value})}/></div>
              <div className="admin-field"><label htmlFor="tenant-name">매장명</label><input id="tenant-name" value={editor.draft.name} onChange={e=>editField({name:e.target.value})}/></div>
              <div className="admin-field"><label htmlFor="tenant-category">음식 카테고리</label><select id="tenant-category" value={editor.draft.category} onChange={e=>editField({category:e.target.value as TimespaceTenant['category']})}>{TIMESPACE_CATEGORY_ORDER.filter(k=>k!=='all').map(k=><option key={k} value={k}>{timespaceCategoryLabel(k,'ko')}</option>)}</select></div>
              <div className="admin-field"><label htmlFor="tenant-building">건물 동</label><select id="tenant-building" value={editor.draft.building} onChange={e=>editField({building:e.target.value as TimespaceTenant['building']})}>{['A','B','C','D'].map(k=><option key={k} value={k}>{k}동</option>)}</select></div>
              <div className="admin-field"><label htmlFor="tenant-floor">층</label><input id="tenant-floor" type="number" min="1" max="60" value={editor.draft.floor} onChange={e=>editField({floor:Number(e.target.value)})}/></div>
              <div className="admin-field"><label htmlFor="tenant-rooms">호수 (예: 205~208)</label><input id="tenant-rooms" value={editor.draft.rooms} onChange={e=>editField({rooms:e.target.value})}/></div>
            </div>
            <h4>대표 메뉴 · 4개 국어</h4>
            {GUIDE_LANGUAGES.map(language=><div className="admin-field" key={language}><label htmlFor={'tenant-menu-'+language}>{language} 메뉴</label><textarea id={'tenant-menu-'+language} rows={2} value={editor.draft.menu[language]} onChange={e=>editField({menu:{...editor.draft.menu,[language]:e.target.value}})}/></div>)}
            <div className="admin-editor-actions">
              <button className="button button--primary" type="button" onClick={save}>매장 작업 데이터 저장</button>
              <button className="button button--secondary" type="button" onClick={()=>{if(!draftDirty||window.confirm('저장하지 않은 매장 편집을 취소할까요?'))setEditor(null)}}>편집 취소</button>
            </div>
          </> : <><h3>매장 정보 편집</h3><p>왼쪽에서 매장을 선택하거나 새 매장을 추가하세요.</p></>}
        </div>
      </div>
      <div className="panel admin-timespace-files">
        <h3>입점 업체 JSON 파일 관리</h3>
        <p className="field-hint">현재 파일과 같은 스키마로 검증하고 다운로드합니다. 영업 종료 매장은 관리 파일에 남지만 고객 검색과 화면에서 제외됩니다. 공개 반영에는 개발자 검수가 필요합니다.</p>
        <div className="admin-field"><label htmlFor="tenant-import">타임스페이스 JSON 불러오기</label><input id="tenant-import" type="file" accept=".json,application/json" onChange={e=>{void importFile(e.target.files?.[0]);e.target.value=''}}/></div>
        <div className="admin-editor-actions">
          <button className="button button--primary" type="button" onClick={exportFile}>timespaceTenants.json 다운로드</button>
          <button className="button button--secondary" type="button" disabled={!requestedExport} onClick={confirmDownload}>파일 저장 확인</button>
        </div>
      </div>
    </fieldset>
  </section>
}
