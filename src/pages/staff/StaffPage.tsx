import { useEffect, useMemo, useRef, useState } from 'react'
import type { FacilityDataset } from '../../types/facility'
import { PageHeader } from '../../components/ui/PageHeader'
import { SearchInput } from '../../components/ui/SearchInput'
import { CategoryCard } from '../../components/ui/CategoryCard'
import { InformationNotice } from '../../components/ui/InformationNotice'
import { LoadingState } from '../../components/ui/LoadingState'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { StaffSearchResults } from '../../components/staff/StaffSearchResults'
import { StaffFacilityDetail } from '../../components/staff/StaffFacilityDetail'
import { PendingTransitNotice } from '../../components/ui/PendingTransitNotice'
import { UI_CATEGORIES } from '../../config/uiCategories'
import { loadStaffDataset } from '../../services/loadStaffDataset'
import { searchFacilities, resolveSelectedFacility } from '../../services/facilitySearch'
import type { StaffCategoryFilter } from '../../services/facilitySearch'

type DataState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; dataset: FacilityDataset }

export function StaffPage() {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<StaffCategoryFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const detailHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    let active = true
    void loadStaffDataset().then(dataset => { if (active) setDataState({ status: 'ready', dataset }) }).catch(() => { if (active) setDataState({ status: 'error' }) })
    return () => { active = false }
  }, [])
  const dataset = dataState.status === 'ready' ? dataState.dataset : null
  const results = useMemo(() => searchFacilities(dataset?.facilities ?? [], query, category), [dataset, query, category])
  const selected = resolveSelectedFacility(results, selectedId)
  useEffect(() => {
    if (selectedId && window.matchMedia('(max-width: 999px)').matches) {
      detailHeading.current?.focus({ preventScroll: true })
      detailHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
  }, [selectedId])

  function updateFilters(nextQuery: string, nextCategory: StaffCategoryFilter) {
    setQuery(nextQuery)
    setCategory(nextCategory)
    const nextResults = searchFacilities(dataset?.facilities ?? [], nextQuery, nextCategory)
    setSelectedId(current => resolveSelectedFacility(nextResults, current)?.id ?? null)
  }

  return (
    <div className="staff-page">
      <section className="staff-intro" aria-label="프론트 안내 대시보드">
        <PageHeader eyebrow="THE CENTRAL PARK HOTEL · FRONT DESK CONCIERGE" title="직원용 안내" description="시설을 찾고 영어 문장을 확인한 뒤, 고객에게 바로 안내하세요."
          actions={<div className="staff-intro-stats" aria-label="직원 안내 기능">
            <span className="staff-stat staff-stat--count"><strong>{dataset ? dataset.facilities.filter(item => item.isPublished).length : '—'}</strong><span>주변 시설</span></span>
            <span className="staff-stat"><Icon name="globe" size={21} /><span>영어 응대</span></span>
            <span className="staff-stat"><Icon name="search" size={21} /><span>지도 길찾기</span></span>
          </div>} />
      </section>
      {dataset?.dataStatus === 'demo' && <div className="staff-release-notice"><InformationNotice title={import.meta.env.MODE === 'public-test' ? 'Information is being collected and verified.' : '프론트 테스트용 미리보기'} tone="warning">
        {import.meta.env.MODE === 'public-test' ? <>
          <p>주변 시설과 영어 안내 정보를 수집·검증 중입니다. 방문 전 최신 정보를 확인해 주세요.</p>
          <details className="staff-release-details">
            <summary>업데이트 계획 및 저작권 안내</summary>
            <p>현재 주변 시설 정보와 영어 안내 문구를 수집·검증하며 프로그램을 개선하고 있습니다. 아직 초기 단계이지만, 지속적인 업데이트를 통해 실제 프론트 업무에 도움이 되는 완성도 높은 프로그램으로 발전시키겠습니다.</p>
            <p>수록된 안내 정보는 변경될 수 있으므로 이용 전 확인해 주세요.</p>
            <p>© 2026 Antonio. All rights reserved. 본 프로그램의 저작권은 Antonio에게 있으며, 사전 허가 없는 복제·재배포 및 도용을 금합니다.</p>
          </details>
        </> : <>실제 주변 시설 {dataset.facilities.length}개를 검색하고 고객과 함께 확인할 수 있습니다. 외국어 안내는 검수 전 초안이며, 미확인 항목은 담당자에게 확인해 주세요. 정식 운영 배포는 차단되어 있습니다.</>}
      </InformationNotice></div>
      {dataset?.dataStatus === 'production' && <InformationNotice title="안내 정보 확인">정보 확인일과 미확인 항목을 확인하고, 방문 전 영업시간 등 변동 사항을 확인해 주세요.</InformationNotice>}
      {dataState.status === 'error' && <div role="alert"><InformationNotice title="시설 데이터를 불러오지 못했습니다" tone="warning"><p>등록 파일과 데이터 검증 결과를 확인한 뒤 새로고침해 주세요. 시설 정보는 표시하지 않습니다.</p><Button variant="secondary" onClick={() => window.location.reload()}>새로고침</Button></InformationNotice></div>}
      <section className="panel search-panel" aria-labelledby="staff-search-title">
        <div className="section-heading staff-section-heading">
          <div className="staff-heading-group"><span className="staff-section-number" aria-hidden="true">01</span><div><p className="staff-section-kicker">SEARCH & FILTER</p><h2 id="staff-search-title">시설 찾기</h2></div></div>
          <Button variant="quiet" disabled={!query} onClick={() => updateFilters('', category)}>검색어 지우기</Button>
        </div>
        <SearchInput label="시설명 또는 키워드" placeholder="시설명 또는 키워드" value={query} onChange={event => updateFilters(event.target.value, category)} disabled={!dataset} hint="한국어·영어 시설명, 검색 키워드와 주소를 검색합니다." />
        <div className="section-heading"><h3>카테고리</h3><span className="status-label">검색어와 함께 적용</span></div>
        <div className="staff-category-grid" role="group" aria-label="시설 카테고리">
          <CategoryCard label="전체" icon="grid" selected={category === 'all'} compact disabled={!dataset} onClick={() => updateFilters(query, 'all')} />
          {UI_CATEGORIES.map(item => <CategoryCard key={item.code} label={item.staffLabel} icon={item.icon} selected={category === item.code} compact disabled={!dataset} onClick={() => updateFilters(query, item.code)} />)}
        </div>
      </section>
      <div className="staff-workspace">
        <section className="panel results-panel" aria-labelledby="staff-results-title">
          <div className="section-heading staff-section-heading">
            <div className="staff-heading-group"><span className="staff-section-number" aria-hidden="true">02</span><div><p className="staff-section-kicker">FIND YOUR PLACE</p><h2 id="staff-results-title">시설 검색 결과</h2></div></div>
            <p className="status-label" role="status" aria-live="polite" aria-atomic="true">{dataset ? `검색 결과 ${results.length}개` : dataState.status === 'error' ? '검색 불가' : '데이터 확인 중'}</p>
          </div>
          {category === 'transportation' && <PendingTransitNotice title="인천공항 리무진버스 — 안내 준비 중" description="호텔 공식 안내 자료를 준비 중입니다. 노선·시간표·승차 위치·요금은 아직 제공하지 않습니다." directionsLabel="네이버 지도 길찾기" detailsLabel="상세 안내 준비 중" />}
          {dataState.status === 'loading' ? <LoadingState label="시설 정보를 확인하고 있습니다…" /> : dataState.status === 'error' ? <p className="field-hint">데이터 오류로 검색 결과를 표시할 수 없습니다.</p> : <StaffSearchResults results={results} publicFacilityCount={dataState.dataset.facilities.filter(item => item.isPublished).length} selectedId={selected?.id ?? null} onSelect={setSelectedId} />}
        </section>
        <section id="staff-facility-detail" className="panel details-panel" aria-labelledby="staff-details-title">
          <div className="section-heading staff-section-heading">
            <div className="staff-heading-group"><span className="staff-section-number" aria-hidden="true">03</span><div><p className="staff-section-kicker">GUEST ASSISTANCE</p><h2 id="staff-details-title">시설 상세 정보</h2></div></div>
            <Icon name="info" size={20} />
          </div>
          <StaffFacilityDetail facility={selected} headingRef={detailHeading} />
        </section>
      </div>
    </div>
  )
}
