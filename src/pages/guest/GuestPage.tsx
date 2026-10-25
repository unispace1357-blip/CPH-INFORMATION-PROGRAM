import { useEffect, useMemo, useState } from 'react'
import type { FacilityDataset } from '../../types/facility'
import type { HotelDataset } from '../../types/hotel'
import type { HotelCategory } from '../../i18n/types'
import { MESSAGES } from '../../i18n/messages'
import { message } from '../../i18n/formatters'
import { useGuestLanguage } from '../../i18n/guestLanguageContext'
import { loadGuestFacilities, loadGuestHotel } from '../../services/loadGuestData'
import type { GuestDataState } from '../../services/loadGuestData'
import { searchGuestFacilities } from '../../services/guestFacilitySearch'
import { resolveSelectedFacility } from '../../services/facilitySearch'
import type { StaffCategoryFilter } from '../../services/facilitySearch'
import { PageHeader } from '../../components/ui/PageHeader'
import { SearchInput } from '../../components/ui/SearchInput'
import { CategoryCard } from '../../components/ui/CategoryCard'
import { LanguageSelector } from '../../components/ui/LanguageSelector'
import { InformationNotice } from '../../components/ui/InformationNotice'
import { LoadingState } from '../../components/ui/LoadingState'
import { Button } from '../../components/ui/Button'
import { HotelInformation } from '../../components/guest/HotelInformation'
import { GuestFacilityResults } from '../../components/guest/GuestFacilityResults'
import { GuestFacilityDetail } from '../../components/guest/GuestFacilityDetail'
import { AirportBusGuide, SongdoTourismGuide } from '../../components/ui/LocalTravelGuides'
import { LOCAL_GUIDE_COPY } from '../../data/localGuide'
import { UI_CATEGORIES, visibleFacilityCategories } from '../../config/uiCategories'

export function GuestPage() {
  const { language, setLanguage } = useGuestLanguage()
  const m = MESSAGES[language]
  const [facilities, setFacilities] = useState<GuestDataState<FacilityDataset>>({ status: 'loading' })
  const [hotel, setHotel] = useState<GuestDataState<HotelDataset>>({ status: 'loading' })
  const [hotelTopic, setHotelTopic] = useState<HotelCategory | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<StaffCategoryFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    void loadGuestFacilities().then(dataset => { if (active) setFacilities({ status: 'ready', dataset }) }).catch(() => { if (active) setFacilities({ status: 'error' }) })
    void loadGuestHotel().then(dataset => { if (active) setHotel({ status: 'ready', dataset }) }).catch(() => { if (active) setHotel({ status: 'error' }) })
    return () => { active = false }
  }, [])
  const dataset = facilities.status === 'ready' ? facilities.dataset : null
  const results = useMemo(() => searchGuestFacilities(dataset?.facilities ?? [], query, category, language), [dataset, query, category, language])
  const selected = resolveSelectedFacility(results, selectedId)
  const isDemo = dataset?.dataStatus === 'demo' || (hotel.status === 'ready' && hotel.dataset.dataStatus === 'demo')
  const showAirportGuide = category === 'transportation' || (category === 'all' && /6777|공항|리무진|airport|limousine|机场|空港/i.test(query))
  const showTourismGuide = category === 'attraction' || (category === 'all' && /관광|송도지도|tourism|sightseeing|旅游|観光/i.test(query))

  function updateFilters(nextQuery: string, nextCategory: StaffCategoryFilter) {
    setQuery(nextQuery); setCategory(nextCategory)
    const next = searchGuestFacilities(dataset?.facilities ?? [], nextQuery, nextCategory, language)
    setSelectedId(current => resolveSelectedFacility(next, current)?.id ?? null)
  }
  function closeFacility() {
    const id = selectedId
    setSelectedId(null)
    if (id) document.getElementById(`guest-result-${id}`)?.focus()
  }
  function closeHotel() {
    const topic = hotelTopic
    setHotelTopic(null)
    if (topic) document.getElementById(`guest-hotel-${topic}`)?.focus()
  }

  return (
    <div className="guest-page">
      <div className="guest-language-toolbar"><LanguageSelector value={language} onChange={setLanguage} disabled={false} label={m.ui.languageLabel} hint={m.ui.languageHint} /></div>
      <PageHeader eyebrow={m.ui.eyebrow} title={m.ui.welcomeTitle} description={m.ui.welcomeDescription} />
      {isDemo && <InformationNotice title={m.ui.demoTitle} tone="warning">{m.ui.demoWarning}</InformationNotice>}
      {!isDemo && dataset && hotel.status === 'ready' && <InformationNotice title={m.ui.productionNoticeTitle}>{m.ui.productionNotice}</InformationNotice>}
      <HotelInformation state={hotel} language={language} selected={hotelTopic} onSelect={setHotelTopic} onClose={closeHotel} />
      <section className="guest-section" id="nearby-facilities" aria-labelledby="nearby-facilities-title">
        <div className="section-heading"><h2 id="nearby-facilities-title">{m.ui.nearbyTitle}</h2><Button variant={category === 'all' ? 'primary' : 'secondary'} aria-pressed={category === 'all'} disabled={!dataset} onClick={() => updateFilters(query, 'all')}>{m.ui.allFacilities}</Button></div>
        <div className="guest-category-grid" role="group" aria-label={m.ui.facilityCategoriesLabel}>{(dataset ? visibleFacilityCategories(dataset.facilities) : UI_CATEGORIES).map(item => <CategoryCard key={item.code} label={m.categories[item.code]} icon={item.icon} selected={category === item.code} disabled={!dataset} onClick={() => updateFilters(query, category === item.code ? 'all' : item.code)} aria-controls="guest-facility-results" />)}</div>
      </section>
      <section className="panel guest-search-panel" id="guest-search" aria-labelledby="guest-search-title">
        <div className="section-heading"><h2 id="guest-search-title">{m.ui.searchTitle}</h2><Button variant="quiet" disabled={!query} onClick={() => updateFilters('', category)}>{m.ui.clearSearch}</Button></div>
        <SearchInput label={m.ui.searchLabel} placeholder={m.ui.searchPlaceholder} value={query} onChange={event => updateFilters(event.target.value, category)} disabled={!dataset} hint={m.ui.searchHint} />
      </section>
      <section className="guest-section" id="guest-facility-results" aria-labelledby="guest-results-title">
        <div className="section-heading"><h2 id="guest-results-title">{m.ui.resultsTitle}</h2><p className="status-label" role="status" aria-live="polite">{dataset ? message(language, 'resultCount', { count: results.length }) : facilities.status === 'error' ? m.ui.informationUnavailable : m.ui.loadingFacilities}</p></div>
        {showAirportGuide && <AirportBusGuide language={language} />}
        {showTourismGuide && <SongdoTourismGuide language={language} />}
        {facilities.status === 'loading' ? <LoadingState label={m.ui.loadingFacilities} /> : facilities.status === 'error' ? <div role="alert"><InformationNotice title={m.ui.facilityDataErrorTitle} tone="warning"><p>{m.ui.dataErrorDescription}</p><Button variant="secondary" onClick={() => window.location.reload()}>{m.ui.refresh}</Button></InformationNotice></div> : (results.length === 0 && (showAirportGuide || showTourismGuide)) ? <p className="field-hint">{LOCAL_GUIDE_COPY[language].guideOnlyResult}</p> : <GuestFacilityResults results={results} publicCount={facilities.dataset.facilities.filter(item => item.isPublished).length} language={language} selectedId={selected?.id ?? null} onSelect={setSelectedId} />}
      </section>
      <div id="guest-facility-detail"><GuestFacilityDetail facility={selected} language={language} onClose={closeFacility} /></div>
    </div>
  )
}
