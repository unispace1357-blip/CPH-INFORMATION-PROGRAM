import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { StaffQuickAccess } from '../../components/staff/StaffQuickAccess'
import { useStaffShortcuts } from '../../hooks/useStaffShortcuts'
import type { Shortcut } from '../../services/staffShortcuts'
import { TimespaceTenantCandidates } from '../../components/ui/TimespaceTenantCandidates'
import { TIMESPACE_TENANTS } from '../../services/timespaceDirectory'
import type { TimespaceTenant } from '../../services/timespaceDirectory'
import { FrontdeskGuide } from '../../components/staff/FrontdeskGuide'
import { StaffWorkPanel } from '../../components/staff/StaffWorkPanel'
import { StaffSearchHub, StaffQuickPhrases, StaffRequestShortcut, StaffTopicShortcuts } from '../../components/staff/StaffDashboard'
import { AirportBusGuide, SongdoTourismGuide } from '../../components/ui/LocalTravelGuides'
import { UI_CATEGORIES, visibleFacilityCategories } from '../../config/uiCategories'
import { loadStaffDataset } from '../../services/loadStaffDataset'
import { searchFacilities, resolveSelectedFacility } from '../../services/facilitySearch'
import { resolveExactTimespaceTenant } from '../../services/timespaceTenantNavigation'
import type { TenantFocusRequest } from '../../services/timespaceTenantNavigation'
import type { StaffCategoryFilter } from '../../services/facilitySearch'

type DataState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; dataset: FacilityDataset }
const STAFF_TABS = ['hotel', 'facilities'] as const
type StaffTab = (typeof STAFF_TABS)[number]

export function StaffPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const handledHelpNavigation = useRef<string | null>(null)
  const [activeTab, setActiveTab] = useState<StaffTab>('hotel')
  const [showWork, setShowWork] = useState(false)
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<StaffCategoryFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tenantFocus, setTenantFocus] = useState<TenantFocusRequest>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tenantRequestSequence = useRef(0)
  useEffect(() => () => { if (searchTimer.current) clearTimeout(searchTimer.current) }, [])
  const [hotelSearchRequest, setHotelSearchRequest] = useState<{query: string; sequence: number} | null>(null)
  const [hotelOpenRequest, setHotelOpenRequest] = useState<{id:string;sequence:number}|null>(null)
  const hotelOpenSequence = useRef(0)
  const shortcuts = useStaffShortcuts()
  const detailHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    let active = true
    void loadStaffDataset().then(dataset => { if (active) setDataState({ status: 'ready', dataset }) }).catch(() => { if (active) setDataState({ status: 'error' }) })
    return () => { active = false }
  }, [])
  const dataset = dataState.status === 'ready' ? dataState.dataset : null
  // Follow Help Center links to real staff panels; wait for Timespace data when needed.
  useEffect(() => {
    const target = (location.state as { helpTarget?: string } | null)?.helpTarget
    if (!target || handledHelpNavigation.current === location.key) return
    if (target === 'timespace' && !dataset) return
    handledHelpNavigation.current = location.key
    if (target === 'facilities' || target === 'timespace' || target === 'print') setActiveTab('facilities')
    if (target === 'english') setActiveTab('hotel')
    if (target === 'timespace' && dataset) {
      setCategory('all')
      setQuery('타임스페이스')
      const complex = dataset.facilities.find(item => item.id === 'songdo-timespace-complex' && item.isPublished)
      if (complex) setSelectedId(complex.id)
    }
    const destinations: Record<string, string> = {
      search: '#staff-hub-input',
      english: '#staff-hotel-panel',
      facilities: '#staff-facilities-panel',
      timespace: '#staff-facility-detail',
      quick: '.staff-quick-access',
      print: '#staff-facilities-panel',
    }
    if (target === 'request') {
      requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.staff-request-trigger')?.click())
      return
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const element = document.querySelector<HTMLElement>(destinations[target] ?? '#staff-hub-input')
      element?.scrollIntoView({ block: 'start' })
      if (target === 'search') element?.focus({ preventScroll: true })
    }))
  }, [location.key, location.state, dataset])
  const results = useMemo(() => searchFacilities(dataset?.facilities ?? [], query, category), [dataset, query, category])
  const selected = resolveSelectedFacility(results, selectedId)
  const featuredTimespace = dataset?.facilities.find(item => item.id === 'songdo-timespace-complex')
  const showAirportGuide = category === 'transportation' || (category === 'all' && /6777|공항|리무진|airport|limousine/i.test(query))
  const showTourismGuide = category === 'attraction' || (category === 'all' && /관광|송도지도|tourism|sightseeing/i.test(query))
  useEffect(() => {
    if (selectedId && !tenantFocus && window.matchMedia('(max-width: 999px)').matches) {
      detailHeading.current?.focus({ preventScroll: true })
      detailHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
  }, [selectedId, tenantFocus])

  function resetTenantNavigation() {
    if (searchTimer.current !== null) clearTimeout(searchTimer.current)
    searchTimer.current = null
    setTenantFocus(null)
  }

  function openExactTenant(term: string): boolean {
    const tenant = resolveExactTimespaceTenant(term)
    const complex = dataset?.facilities.find(item => item.id === 'songdo-timespace-complex' && item.isPublished)
    if (!tenant || !complex) return false
    setActiveTab('facilities')
    setCategory('all')
    setSelectedId(complex.id)
    setTenantFocus({ tenantId: tenant.id, requestId: ++tenantRequestSequence.current })
    shortcuts.recordRecent({kind:'tenant',id:tenant.id})
    return true
  }

  function onFacilityQueryChange(value: string) {
    updateFilters(value, category)
    searchTimer.current = setTimeout(() => { openExactTenant(value) }, 400)
  }

  function chooseTenantCandidate(tenant: TimespaceTenant) {
    updateFilters(tenant.name, 'all')
    openExactTenant(tenant.name)
  }
  function selectFacility(id: string) {
    resetTenantNavigation()
    setSelectedId(id)
    shortcuts.recordRecent({kind:'facility',id})
  }

  function updateFilters(nextQuery: string, nextCategory: StaffCategoryFilter) {
    resetTenantNavigation()
    setQuery(nextQuery)
    setCategory(nextCategory)
    const nextResults = searchFacilities(dataset?.facilities ?? [], nextQuery, nextCategory)
    setSelectedId(current => resolveSelectedFacility(nextResults, current)?.id ?? null)
  }

  function openFeaturedFacility(id: string) {
    shortcuts.recordRecent({kind:'facility',id})
    setActiveTab('facilities')
    updateFilters('', 'all')
    setSelectedId(id)
    requestAnimationFrame(() => document.getElementById('staff-facility-detail')?.scrollIntoView({ block: 'start' }))
  }

  function openShortcut(item: Shortcut) {
    if (item.kind === 'facility') {
      if (!dataset?.facilities.some(f => f.id === item.id && f.isPublished)) return
      setActiveTab('facilities')
      updateFilters('', 'all')
      setSelectedId(item.id)
      shortcuts.recordRecent(item)
      requestAnimationFrame(() => document.getElementById('staff-facility-detail')?.scrollIntoView({block:'start'}))
    } else if (item.kind === 'script') {
      setActiveTab('hotel')
      setHotelOpenRequest({id:item.id,sequence:++hotelOpenSequence.current})
      shortcuts.recordRecent(item)
      requestAnimationFrame(() => document.getElementById('staff-hotel-panel')?.scrollIntoView({block:'start'}))
    } else {
      const tenant = TIMESPACE_TENANTS.find(x=>x.id===item.id)
      if (!tenant) return
      updateFilters(tenant.name,'all')
      openExactTenant(tenant.name)
    }
  }
  function clearShortcuts() {
    if (window.confirm('이 PC의 즐겨찾기·최근 선택 항목을 모두 지울까요?')) shortcuts.clear()
  }
  function focusSidebarSearch() {
    const focus = () => {
      const input = document.getElementById('staff-hub-input') as HTMLInputElement | null
      input?.scrollIntoView({ block: 'center' })
      input?.focus({ preventScroll: true })
    }
    // On the normal dashboard preserve immediate focus for keyboard users and existing QA.
    // When returning from the work-only panel, wait until the search field is mounted.
    if (showWork) {
      setShowWork(false)
      requestAnimationFrame(focus)
    } else focus()
  }
  function navigateStaffTab(target: StaffTab) {
    setShowWork(false)
    setActiveTab(target)
    requestAnimationFrame(() => document.getElementById(`staff-${target}-panel`)?.scrollIntoView({ block: 'start' }))
  }

  function handleDashboardSearch(term: string, scope: StaffTab) {
    if (scope === 'hotel') {
      setHotelSearchRequest(previous => ({ query: term, sequence: (previous?.sequence ?? 0) + 1 }))
    } else {
      updateFilters(term, 'all')
      if (openExactTenant(term)) return
    }
    navigateStaffTab(scope)
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
        <div className="staff-board-rail-brand">
          <img src={`${import.meta.env.BASE_URL}hotel-logo.webp`} alt="The Central Park Hotel Songdo" width="110" height="86" />
          <span>THE CENTRAL PARK HOTEL</span>
          <small>SONGDO · CONCIERGE</small>
        </div>
        <button type="button" className="staff-rail-search" onClick={focusSidebarSearch}><Icon name="search" size={20} />통합 검색</button>
        <button type="button" className={!showWork && activeTab === 'hotel' ? 'is-active' : ''} onClick={() => navigateStaffTab('hotel')}><Icon name="hotel" size={20} />호텔 안내</button>
        <button type="button" className={!showWork && activeTab === 'facilities' ? 'is-active' : ''} onClick={() => navigateStaffTab('facilities')}><Icon name="attraction" size={20} />주변 시설</button>
        <button type="button" className={showWork ? 'is-active' : ''} aria-pressed={showWork} onClick={() => { setShowWork(true); requestAnimationFrame(() => document.getElementById('staff-work-title')?.focus({ preventScroll: true })) }}><Icon name="grid" size={20} />업무용</button>
        <button type="button" onClick={() => { setShowWork(false); requestAnimationFrame(() => { const phrases = document.getElementById('staff-quick-phrases-title'); phrases?.scrollIntoView({ block: 'start' }); phrases?.focus({ preventScroll: true }) }) }}><Icon name="copy" size={20} />영어 응대 문구</button>
        <button type="button" onClick={() => navigate('/staff/help')}><Icon name="info" size={20} />도움말</button>
        <button type="button" onClick={() => document.querySelector<HTMLButtonElement>('.staff-request-trigger')?.click()}><Icon name="info" size={20} />요청 접수</button>
        <button type="button" onClick={() => document.querySelector<HTMLButtonElement>('.staff-admin-trigger')?.click()}><Icon name="lock" size={20} />관리자 화면</button>
      </nav>
      {showWork ? <StaffWorkPanel /> : <>
      <section className="staff-intro" aria-label="프론트 안내 대시보드">
        <ConciergeHero audience="staff" />
        <div className="staff-intro-stats" aria-label="직원 안내 기능">
          <span className="staff-stat"><Icon name="globe" size={21} /><span>호텔 업무 응대</span></span>
          <span className="staff-stat staff-stat--count"><strong>{dataset ? dataset.facilities.filter(item => item.isPublished).length : '—'}</strong><span>주변 시설</span></span>
          <span className="staff-stat"><Icon name="copy" size={21} /><span>영어만 복사</span></span>
        </div>
      </section>
      <StaffSearchHub onSearch={handleDashboardSearch} />
      {dataset?.dataStatus === 'demo' && <div className="staff-release-notice"><InformationNotice title={import.meta.env.MODE === 'public-test' ? '프론트 통합 안내 시스템' : '프론트 테스트용 미리보기'} tone="warning">
        {import.meta.env.MODE === 'public-test' ? <>
          <p>호텔 이용 정보와 주변 시설, 영어 응대 문구를 한곳에서 확인할 수 있습니다. 안내 전 최신 정보와 문구를 확인해 주세요.</p>
          <details className="staff-release-details">
            <summary>프로그램 안내 및 저작권</summary>
            <p>본 프로그램은 송도센트럴파크호텔 프론트의 신속하고 정확한 고객 안내를 지원하기 위해 제작되었습니다.</p>
            <p>호텔 이용 정보와 주변 시설 안내, 영어 응대 문구를 한 화면에서 확인할 수 있도록 구성하여 직원들의 업무 편의성과 고객 응대의 효율성을 높이고자 합니다.</p>
            <p>시설 운영시간 및 안내 정보는 변경될 수 있으므로, 고객에게 안내하기 전 최신 정보를 확인해 주시기 바랍니다.</p>
            <p>© 2026 Antonio. All rights reserved.</p>
            <p>본 프로그램의 저작권은 Antonio에게 있으며, 사전 허가 없는 복제·재배포 및 무단 사용을 금합니다.</p>
          </details>
        </> : <>호텔 업무 영어 문장은 검수 전 초안입니다. 사용 전 확인해 주세요. 정식 운영 배포는 차단되어 있습니다.</>}
      </InformationNotice></div>}
      {dataset?.dataStatus === 'production' && <InformationNotice title="안내 정보 확인">정보 확인일과 미확인 항목을 확인하고, 방문 전 영업시간 등 변동 사항을 확인해 주세요.</InformationNotice>}
      <div className="staff-overview-grid" id="staff-essentials" tabIndex={-1}>
        <div className="staff-overview-column">
          <section className="staff-essential-panel" aria-label="호텔 주요 정보 카드">
            <div className="staff-overview-section-header"><h2>호텔 주요 정보</h2><button type="button" onClick={() => navigateStaffTab('hotel')}>전체보기 <Icon name="arrow" size={14}/></button></div>
            <ConciergeEssentials hotel={hotelDataset} language="ko" includeCheckout />
            <StaffTopicShortcuts onSearch={handleDashboardSearch} />
          </section>
          <FeaturedTimespace facility={featuredTimespace} language="ko" compact onDetails={openFeaturedFacility} />
        </div>
        <div className="staff-overview-column">
          <StaffQuickPhrases />
          <StaffRequestShortcut />
          <StaffQuickAccess data={shortcuts.data} facilities={dataset?.facilities ?? []}
            storageAvailable={shortcuts.storageAvailable} onOpen={openShortcut} onClear={clearShortcuts} />
        </div>
      </div>
      <div className="staff-guide-tabs" role="tablist" aria-label="직원 안내 업무" onKeyDown={handleTabKey}>
        <Button id="staff-hotel-tab" className="staff-guide-tab" role="tab" aria-selected={activeTab === 'hotel'} aria-controls="staff-hotel-panel" tabIndex={activeTab === 'hotel' ? 0 : -1} variant={activeTab === 'hotel' ? 'primary' : 'quiet'} onClick={() => setActiveTab('hotel')}>호텔 업무 영어 응대</Button>
        <Button id="staff-facilities-tab" className="staff-guide-tab" role="tab" aria-selected={activeTab === 'facilities'} aria-controls="staff-facilities-panel" tabIndex={activeTab === 'facilities' ? 0 : -1} variant={activeTab === 'facilities' ? 'primary' : 'quiet'} onClick={() => setActiveTab('facilities')}>주변 시설 안내</Button>
      </div>
      <section id="staff-hotel-panel" className="staff-tab-panel" role="tabpanel" aria-labelledby="staff-hotel-tab" hidden={activeTab !== 'hotel'} tabIndex={0}><FrontdeskGuide externalSearch={hotelSearchRequest} externalOpen={hotelOpenRequest}
        onScriptOpen={id => shortcuts.recordRecent({kind:'script',id})}
        onToggleFavorite={shortcuts.toggleFavorite} isFavorite={shortcuts.isFavorite} canFavorite={shortcuts.canFavorite} /></section>
      <section id="staff-facilities-panel" className="staff-tab-panel" role="tabpanel" aria-labelledby="staff-facilities-tab" hidden={activeTab !== 'facilities'} tabIndex={0}>
      {dataState.status === 'error' && <div role="alert"><InformationNotice title="시설 데이터를 불러오지 못했습니다" tone="warning"><p>등록 파일과 데이터 검증 결과를 확인한 뒤 새로고침해 주세요. 시설 정보는 표시하지 않습니다.</p><Button variant="secondary" onClick={() => window.location.reload()}>새로고침</Button></InformationNotice></div>}
      <section className="panel search-panel" aria-labelledby="staff-search-title">
        <div className="section-heading staff-section-heading">
          <div className="staff-heading-group"><span className="staff-section-number" aria-hidden="true">01</span><div><p className="staff-section-kicker">SEARCH & FILTER</p><h2 id="staff-search-title">시설 찾기</h2></div></div>
          <Button variant="quiet" disabled={!query} onClick={() => updateFilters('', category)}>검색어 지우기</Button>
        </div>
        <SearchInput label="시설명 또는 키워드" placeholder="예: 맥주, 고기, 커피숍, Burger King" value={query} onChange={event => onFacilityQueryChange(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); resetTenantNavigation(); openExactTenant(query) } }} disabled={!dataset} hint="4개 언어의 시설명·메뉴·주소·키워드 및 동의어를 검색합니다. 띄어쓰기 차이도 일부 지원합니다." />
        {dataset && <TimespaceTenantCandidates query={query} language="ko" onSelect={chooseTenantCandidate} />}
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
          {dataState.status === 'loading' ? <LoadingState label="시설 정보를 확인하고 있습니다…" /> : dataState.status === 'error' ? <p className="field-hint">데이터 오류로 검색 결과를 표시할 수 없습니다.</p> : <StaffSearchResults category={category} results={results} publicFacilityCount={dataState.dataset.facilities.filter(item => item.isPublished).length} selectedId={selected?.id ?? null} onSelect={selectFacility} />}
        </section>
        <section id="staff-facility-detail" className="panel details-panel" aria-labelledby="staff-details-title">
          <div className="section-heading staff-section-heading">
            <div className="staff-heading-group"><span className="staff-section-number" aria-hidden="true">03</span><div><p className="staff-section-kicker">GUEST ASSISTANCE</p><h2 id="staff-details-title">시설 상세 정보</h2></div></div>
            <Icon name="info" size={20} />
          </div>
          <StaffFacilityDetail facility={selected} headingRef={detailHeading} tenantFocus={tenantFocus}
            favorite={selected ? shortcuts.isFavorite({kind:'facility',id:selected.id}) : false}
            canFavorite={shortcuts.canFavorite}
            onToggleFavorite={selected ? () => shortcuts.toggleFavorite({kind:'facility',id:selected.id}) : undefined} />
        </section>
      </div>
      </section>
      </>}
    </div>
  )
}
