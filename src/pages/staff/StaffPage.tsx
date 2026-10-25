import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { FacilityDataset } from '../../types/facility'
import { ConciergeHero } from '../../components/ui/ConciergeHero'
import { ConciergeEssentials } from '../../components/ui/ConciergeEssentials'
import { FeaturedTimespace } from '../../components/ui/FeaturedTimespace'
import { hotelDataset } from '../../data/hotelDataset'
import { SearchInput } from '../../components/ui/SearchInput'
import { CategoryCard } from '../../components/ui/CategoryCard'
import { InformationNotice } from '../../components/ui/InformationNotice'
import { LoadingState } from '../../components/ui/LoadingState'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { StaffSearchResults } from '../../components/staff/StaffSearchResults'
import { StaffFacilityDetail } from '../../components/staff/StaffFacilityDetail'
import { FrontdeskGuide } from '../../components/staff/FrontdeskGuide'
import { AirportBusGuide, SongdoTourismGuide } from '../../components/ui/LocalTravelGuides'
import { UI_CATEGORIES, visibleFacilityCategories } from '../../config/uiCategories'
import { loadStaffDataset } from '../../services/loadStaffDataset'
import { searchFacilities, resolveSelectedFacility } from '../../services/facilitySearch'
import type { StaffCategoryFilter } from '../../services/facilitySearch'

type DataState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; dataset: FacilityDataset }
const STAFF_TABS = ['hotel', 'facilities'] as const
type StaffTab = (typeof STAFF_TABS)[number]

export function StaffPage() {
  const [activeTab, setActiveTab] = useState<StaffTab>('hotel')
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
  const featuredTimespace = dataset?.facilities.find(item => item.id === 'songdo-timespace-complex')
  const showAirportGuide = category === 'transportation' || (category === 'all' && /6777|공항|리무진|airport|limousine/i.test(query))
  const showTourismGuide = category === 'attraction' || (category === 'all' && /관광|송도지도|tourism|sightseeing/i.test(query))
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

  function openFeaturedFacility(id: string) {
    setActiveTab('facilities')
    updateFilters('', 'all')
    setSelectedId(id)
    requestAnimationFrame(() => document.getElementById('staff-facility-detail')?.scrollIntoView({ block: 'start' }))
  }

  function handleTabKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const index = STAFF_TABS.indexOf(activeTab)
    const next = event.key === 'Home' ? 'hotel' : event.key === 'End' ? 'facilities' : STAFF_TABS[(index + 1) % STAFF_TABS.length]!
    setActiveTab(next)
    document.getElementById(`staff-${next}-tab`)?.focus()
  }

  return (
    <div className="staff-page">
      <nav className="staff-board-rail" aria-label="직원 주요 업무 바로가기">
        <div className="staff-board-rail-brand">CPH <span>CONCIERGE</span></div>
        <button type="button" className={activeTab === 'hotel' ? 'is-active' : ''} onClick={() => setActiveTab('hotel')}><Icon name="hotel" size={20} />호텔 영어 응대</button>
        <button type="button" className={activeTab === 'facilities' ? 'is-active' : ''} onClick={() => setActiveTab('facilities')}><Icon name="attraction" size={20} />주변 시설</button>
        <a href="#staff-essentials"><Icon name="info" size={20} />호텔 주요 정보</a>
      </nav>
      <section className="staff-intro" aria-label="프론트 안내 대시보드">
        <ConciergeHero audience="staff" />
        <div className="staff-intro-stats" aria-label="직원 안내 기능">
          <span className="staff-stat"><Icon name="globe" size={21} /><span>호텔 업무 응대</span></span>
          <span className="staff-stat staff-stat--count"><strong>{dataset ? dataset.facilities.filter(item => item.isPublished).length : '—'}</strong><span>주변 시설</span></span>
          <span className="staff-stat"><Icon name="copy" size={21} /><span>영어만 복사</span></span>
        </div>
      </section>
      {dataset?.dataStatus === 'demo' && <div className="staff-release-notice"><InformationNotice title={import.meta.env.MODE === 'public-test' ? '호텔 업무 영어 응대 안내' : '프론트 테스트용 미리보기'} tone="warning">
        {import.meta.env.MODE === 'public-test' ? <>
          <p>필요한 영어 문장을 검색·복사하세요. 검수 전 문구는 사용 전 확인해 주세요.</p>
          <details className="staff-release-details">
            <summary>업데이트 계획 및 저작권 안내</summary>
            <p>현재 주변 시설 정보와 영어 안내 문구를 수집·검증하며 프로그램을 개선하고 있습니다. 아직 초기 단계이지만, 지속적인 업데이트를 통해 실제 프론트 업무에 도움이 되는 완성도 높은 프로그램으로 발전시키겠습니다.</p>
            <p>수록된 안내 정보는 변경될 수 있으므로 이용 전 확인해 주세요.</p>
            <p>© 2026 Antonio. All rights reserved. 본 프로그램의 저작권은 Antonio에게 있으며, 사전 허가 없는 복제·재배포 및 도용을 금합니다.</p>
          </details>
        </> : <>호텔 업무 영어 문장은 검수 전 초안입니다. 사용 전 확인해 주세요. 정식 운영 배포는 차단되어 있습니다.</>}
      </InformationNotice></div>}
      {dataset?.dataStatus === 'production' && <InformationNotice title="안내 정보 확인">정보 확인일과 미확인 항목을 확인하고, 방문 전 영업시간 등 변동 사항을 확인해 주세요.</InformationNotice>}
      <div className="staff-overview-grid" id="staff-essentials">
        <ConciergeEssentials hotel={hotelDataset} language="ko" includeCheckout />
        <FeaturedTimespace facility={featuredTimespace} language="ko" compact onDetails={openFeaturedFacility} />
      </div>
      <div className="staff-guide-tabs" role="tablist" aria-label="직원 안내 업무" onKeyDown={handleTabKey}>
        <Button id="staff-hotel-tab" className="staff-guide-tab" role="tab" aria-selected={activeTab === 'hotel'} aria-controls="staff-hotel-panel" tabIndex={activeTab === 'hotel' ? 0 : -1} variant={activeTab === 'hotel' ? 'primary' : 'quiet'} onClick={() => setActiveTab('hotel')}>호텔 업무 영어 응대</Button>
        <Button id="staff-facilities-tab" className="staff-guide-tab" role="tab" aria-selected={activeTab === 'facilities'} aria-controls="staff-facilities-panel" tabIndex={activeTab === 'facilities' ? 0 : -1} variant={activeTab === 'facilities' ? 'primary' : 'quiet'} onClick={() => setActiveTab('facilities')}>주변 시설 안내</Button>
      </div>
      <section id="staff-hotel-panel" className="staff-tab-panel" role="tabpanel" aria-labelledby="staff-hotel-tab" hidden={activeTab !== 'hotel'} tabIndex={0}><FrontdeskGuide /></section>
      <section id="staff-facilities-panel" className="staff-tab-panel" role="tabpanel" aria-labelledby="staff-facilities-tab" hidden={activeTab !== 'facilities'} tabIndex={0}>
      {dataState.status === 'error' && <div role="alert"><InformationNotice title="시설 데이터를 불러오지 못했습니다" tone="warning"><p>등록 파일과 데이터 검증 결과를 확인한 뒤 새로고침해 주세요. 시설 정보는 표시하지 않습니다.</p><Button variant="secondary" onClick={() => window.location.reload()}>새로고침</Button></InformationNotice></div>}
      <section className="panel search-panel" aria-labelledby="staff-search-title">
        <div className="section-heading staff-section-heading">
          <div className="staff-heading-group"><span className="staff-section-number" aria-hidden="true">01</span><div><p className="staff-section-kicker">SEARCH & FILTER</p><h2 id="staff-search-title">시설 찾기</h2></div></div>
          <Button variant="quiet" disabled={!query} onClick={() => updateFilters('', category)}>검색어 지우기</Button>
        </div>
        <SearchInput label="시설명 또는 키워드" placeholder="예: 맥주, 고기, 커피숍, Burger King" value={query} onChange={event => updateFilters(event.target.value, category)} disabled={!dataset} hint="4개 언어의 시설명·메뉴·주소·키워드 및 동의어를 검색합니다. 띄어쓰기 차이도 일부 지원합니다." />
        <div className="section-heading"><h3>카테고리</h3><span className="status-label">검색어와 함께 적용</span></div>
        <div className="staff-category-grid" role="group" aria-label="시설 카테고리">
          <CategoryCard label="전체" icon="grid" selected={category === 'all'} compact disabled={!dataset} onClick={() => updateFilters(query, 'all')} />
          {(dataset ? visibleFacilityCategories(dataset.facilities) : UI_CATEGORIES).map(item => <CategoryCard key={item.code} label={item.staffLabel} icon={item.icon} selected={category === item.code} compact disabled={!dataset} onClick={() => updateFilters(query, item.code)} />)}
        </div>
      </section>
      <div className="staff-workspace">
        <section className="panel results-panel" aria-labelledby="staff-results-title">
          <div className="section-heading staff-section-heading">
            <div className="staff-heading-group"><span className="staff-section-number" aria-hidden="true">02</span><div><p className="staff-section-kicker">FIND YOUR PLACE</p><h2 id="staff-results-title">시설 검색 결과</h2></div></div>
            <p className="status-label" role="status" aria-live="polite" aria-atomic="true">{dataset ? `검색 결과 ${results.length}개` : dataState.status === 'error' ? '검색 불가' : '데이터 확인 중'}</p>
          </div>
          {showAirportGuide && <AirportBusGuide language="ko" staff />}
          {showTourismGuide && <SongdoTourismGuide language="ko" />}
          {dataState.status === 'loading' ? <LoadingState label="시설 정보를 확인하고 있습니다…" /> : dataState.status === 'error' ? <p className="field-hint">데이터 오류로 검색 결과를 표시할 수 없습니다.</p> : <StaffSearchResults category={category} results={results} publicFacilityCount={dataState.dataset.facilities.filter(item => item.isPublished).length} selectedId={selected?.id ?? null} onSelect={setSelectedId} />}
        </section>
        <section id="staff-facility-detail" className="panel details-panel" aria-labelledby="staff-details-title">
          <div className="section-heading staff-section-heading">
            <div className="staff-heading-group"><span className="staff-section-number" aria-hidden="true">03</span><div><p className="staff-section-kicker">GUEST ASSISTANCE</p><h2 id="staff-details-title">시설 상세 정보</h2></div></div>
            <Icon name="info" size={20} />
          </div>
          <StaffFacilityDetail facility={selected} headingRef={detailHeading} />
        </section>
      </div>
      </section>
    </div>
  )
}
