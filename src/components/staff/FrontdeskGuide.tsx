import { useEffect, useMemo, useRef, useState } from 'react'
import type { FrontdeskScriptCategory, FrontdeskScriptDataset } from '../../types/frontdeskScript'
import { FRONTDESK_SCRIPT_CATEGORIES } from '../../types/frontdeskScript'
import { loadFrontdeskScripts } from '../../services/loadFrontdeskScripts'
import { searchFrontdeskScripts } from '../../services/frontdeskScriptSearch'
import type { FrontdeskCategoryFilter } from '../../services/frontdeskScriptSearch'
import { SearchInput } from '../ui/SearchInput'
import { Button } from '../ui/Button'
import { CategoryCard } from '../ui/CategoryCard'
import { EmptyState } from '../ui/EmptyState'
import { InformationNotice } from '../ui/InformationNotice'
import { LoadingState } from '../ui/LoadingState'
import type { IconName } from '../ui/Icon'
import { FrontdeskScriptDetail } from './FrontdeskScriptDetail'

const categories: Record<FrontdeskScriptCategory, { label: string; icon: IconName }> = {
  'check-in-out': { label: '체크인·체크아웃', icon: 'checkIn' },
  breakfast: { label: '조식', icon: 'breakfast' },
  'room-usage': { label: '객실 이용', icon: 'bed' },
  'hotel-policy': { label: '호텔 정책', icon: 'info' },
  'hotel-facilities': { label: '호텔 시설', icon: 'hotel' },
}
type DataState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; dataset: FrontdeskScriptDataset }

export function FrontdeskGuide() {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FrontdeskCategoryFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const detailHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    let active = true
    void loadFrontdeskScripts().then(dataset => { if (active) setDataState({ status: 'ready', dataset }) }).catch(() => { if (active) setDataState({ status: 'error' }) })
    return () => { active = false }
  }, [])
  const dataset = dataState.status === 'ready' ? dataState.dataset : null
  const results = useMemo(() => searchFrontdeskScripts(dataset?.scripts ?? [], query, category), [dataset, query, category])
  const selected = results.find(script => script.id === selectedId) ?? results[0] ?? null

  function selectScript(id: string) {
    setSelectedId(id)
    // Focus after React has rendered the selected reply; do not move focus while typing.
    requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 999px)').matches) {
        detailHeading.current?.focus({ preventScroll: true })
        detailHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
      }
    })
  }

  return <div className="frontdesk-guide">
    {dataset?.scripts.some(script => script.reviewStatus === 'draft') && <InformationNotice title="검수 전 응대 자료" tone="warning">검수 전 · draft 표시가 있는 문장은 초안입니다. 실제 안내 전 현재 호텔 운영 기준과 직원 확인사항을 확인해 주세요.</InformationNotice>}
    {dataState.status === 'error' && <div role="alert"><InformationNotice title="호텔 업무 스크립트를 불러오지 못했습니다" tone="warning"><p>데이터 검증 결과를 확인하고 다시 시도해 주세요. 주변 시설 안내는 별도 탭에서 이용할 수 있습니다.</p><Button variant="secondary" onClick={() => window.location.reload()}>새로고침</Button></InformationNotice></div>}
    <section className="panel search-panel" aria-labelledby="frontdesk-search-title">
      <div className="section-heading staff-section-heading">
        <div className="staff-heading-group"><span className="staff-section-number" aria-hidden="true">01</span><div><p className="staff-section-kicker">HOTEL ENGLISH ASSISTANCE</p><h2 id="frontdesk-search-title">호텔 업무 영어 응대</h2></div></div>
        <Button variant="quiet" disabled={!query} onClick={() => setQuery('')}>검색어 지우기</Button>
      </div>
      <SearchInput label="호텔 업무 제목, 고객 질문 또는 키워드" placeholder="체크인, 조식, Wi-Fi, late check-out" value={query} onChange={event => setQuery(event.target.value)} disabled={!dataset} hint="한국어·영어 키워드, 스크립트 제목과 고객 질문을 검색합니다." />
      <div className="frontdesk-category-grid staff-category-grid" role="group" aria-label="호텔 업무 카테고리">
        <CategoryCard label="전체" icon="grid" compact selected={category === 'all'} disabled={!dataset} onClick={() => setCategory('all')} />
        {FRONTDESK_SCRIPT_CATEGORIES.map(code => <CategoryCard key={code} label={categories[code].label} icon={categories[code].icon} compact selected={category === code} disabled={!dataset} onClick={() => setCategory(code)} />)}
      </div>
    </section>
    <div className="staff-workspace frontdesk-workspace">
      <section className="panel results-panel" aria-labelledby="frontdesk-results-title">
        <div className="section-heading staff-section-heading"><h2 id="frontdesk-results-title">응대 스크립트</h2><p className="status-label" role="status" aria-live="polite">{dataset ? `검색 결과 ${results.length}개 / 전체 ${dataset.scripts.length}개` : dataState.status === 'error' ? '검색 불가' : '데이터 확인 중'}</p></div>
        {dataState.status === 'loading' ? <LoadingState label="호텔 업무 스크립트를 불러오고 있습니다…" /> : dataset && !results.length ? <EmptyState title="검색 결과가 없습니다." description="다른 검색어 또는 카테고리를 선택해 주세요." icon="search" /> : <ul className="frontdesk-script-list">{results.map(script => <li key={script.id}>
          <button type="button" className="frontdesk-script-card" aria-pressed={script.id === selected?.id} aria-controls="frontdesk-script-detail" onClick={() => selectScript(script.id)}>
            <span className="frontdesk-card-meta"><span>{categories[script.category].label}</span><span className={`frontdesk-review-badge frontdesk-review-badge--${script.reviewStatus}`}>{script.reviewStatus === 'draft' ? '검수 전 · draft' : '검수 완료'}</span></span>
            <span className="frontdesk-script-title">{script.title}</span><span className="frontdesk-script-question" lang="ko">{script.question.ko}</span>
          </button>
        </li>)}</ul>}
      </section>
      <section id="frontdesk-script-detail" className="panel details-panel" aria-labelledby="frontdesk-details-title">
        <div className="section-heading staff-section-heading"><div><p className="staff-section-kicker">READY TO RESPOND</p><h2 id="frontdesk-details-title">응대 문장 확인</h2></div></div>
        {selected ? <FrontdeskScriptDetail key={selected.id} script={selected} headingRef={detailHeading} /> : <EmptyState title={dataset ? '표시할 응대 문장이 없습니다.' : '응대 문장을 준비하고 있습니다.'} description="스크립트를 검색하고 선택하면 영어 원문과 한국어 뜻을 확인할 수 있습니다." icon="globe" />}
      </section>
    </div>
  </div>
}
