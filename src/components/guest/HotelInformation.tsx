import { useEffect, useMemo, useRef, useState } from 'react'
import type { HotelDataset } from '../../types/hotel'
import type { GuideLanguage } from '../../types/guide'
import type { HotelCategory } from '../../i18n/types'
import type { GuestDataState } from '../../services/loadGuestData'
import { MESSAGES } from '../../i18n/messages'
import { guestVerificationDate, localizedValue } from '../../i18n/formatters'
import { hotelHasInformation, hotelTopicText } from '../../services/guestHotelPresentation'
import { searchHotelInformation, ROOM_USAGE_LABELS } from '../../services/guestHotelSearch'
import type { HotelSearchHit } from '../../services/guestHotelSearch'
import { CategoryCard } from '../ui/CategoryCard'
import { InformationNotice } from '../ui/InformationNotice'
import { SmokingPolicyNotice } from '../ui/SmokingPolicyNotice'
import { LoadingState } from '../ui/LoadingState'
import { Button } from '../ui/Button'
import { SearchInput } from '../ui/SearchInput'
import type { IconName } from '../ui/Icon'
import { HotelParagraphs } from './HotelParagraphs'
import { ConciergeEssentials } from '../ui/ConciergeEssentials'

const topics: { code: HotelCategory; icon: IconName }[] = [
  { code: 'checkIn', icon: 'checkIn' }, { code: 'checkOut', icon: 'checkOut' },
  { code: 'breakfast', icon: 'breakfast' }, { code: 'parking', icon: 'parking' }, { code: 'roomUsage', icon: 'bed' },
]

export function HotelInformation({ state, language, selected, onSelect, onClose }: { state: GuestDataState<HotelDataset>; language: GuideLanguage; selected: HotelCategory | null; onSelect: (topic: HotelCategory) => void; onClose: () => void }) {
  const m = MESSAGES[language]
  const heading = useRef<HTMLHeadingElement>(null)
  const [query, setQuery] = useState('')
  const [activeHit, setActiveHit] = useState<Pick<HotelSearchHit, 'category' | 'source' | 'index'> | null>(null)
  const hotel = state.status === 'ready' ? state.dataset : null
  const hits = useMemo(() => hotel ? searchHotelInformation(hotel, language, query) : [], [hotel, language, query])

  useEffect(() => {
    if (!selected) return
    const targetId = activeHit?.category === selected
      ? `guest-hotel-${activeHit.source === 'notes' ? 'notes' : 'topic'}-item-${activeHit.index}`
      : null
    const element = targetId ? document.getElementById(targetId) : heading.current
    element?.focus({ preventScroll: true })
    element?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [selected, activeHit, language])

  function selectTopic(topic: HotelCategory) {
    setActiveHit(null)
    onSelect(topic)
  }
  function selectHit(hit: HotelSearchHit) {
    setActiveHit({ category: hit.category, source: hit.source, index: hit.index })
    onSelect(hit.category)
  }

  return (
    <section className="guest-section hotel-information" id="hotel-information" aria-labelledby="hotel-information-title">
      <div className="concierge-hotel-search"><SearchInput className="hotel-search-field" label={m.ui.hotelSearchLabel} placeholder={m.ui.hotelSearchPlaceholder}
        value={query} onChange={event => { setQuery(event.target.value); setActiveHit(null) }}
        disabled={!hotel} maxLength={90} /></div>
      {state.status === 'loading' && <LoadingState label={m.ui.loadingHotel} />}
      {state.status === 'error' && <div role="alert"><InformationNotice title={m.ui.hotelDataErrorTitle} tone="warning"><p>{m.ui.dataErrorDescription}</p><Button variant="secondary" onClick={() => window.location.reload()}>{m.ui.refresh}</Button></InformationNotice></div>}
      {hotel && <SmokingPolicyNotice hotel={hotel} language={language} />}
      {hotel && <ConciergeEssentials hotel={hotel} language={language} onHotelTopic={selectTopic} />}
      {hotel && !hotelHasInformation(hotel, language) && <InformationNotice title={m.ui.hotelEmptyTitle}>{m.ui.hotelEmptyDescription}</InformationNotice>}
      <div className="hotel-information-heading">
        <div className="hotel-information-heading-copy">
          <p className="hotel-section-eyebrow">HOTEL ESSENTIALS</p>
          <h2 id="hotel-information-title">{m.ui.hotelTitle}</h2>
        </div>
      </div>
      {hotel && query.trim() && <div className="hotel-search-results" aria-label={m.ui.hotelSearchResults}>
        <div className="hotel-search-results-heading">
          <p role="status" aria-live="polite">{m.ui.hotelSearchResults} · {hits.length}</p>
          <Button variant="quiet" onClick={() => { setQuery(''); setActiveHit(null) }}>{m.ui.clearSearch}</Button>
        </div>
        {hits.length ? <ul className="hotel-search-list">{hits.map(hit =>
          <li key={`${hit.category}-${hit.source}-${hit.index}`}>
            <button type="button" onClick={() => selectHit(hit)}>
              <strong>{m.hotelCategories[hit.category]}{hit.source === 'notes' ? ` · ${m.ui.notes}` : ''}</strong>
              {hit.category === 'roomUsage' && hit.source === 'topic' && <span className="hotel-search-topic">{hit.title}</span>}
              <span className="hotel-search-preview">{hit.text}</span>
            </button>
          </li>
        )}</ul> : <p className="hotel-search-empty">{m.ui.hotelSearchNone}</p>}
      </div>}
      <div className="guest-category-grid hotel-category-grid" role="group" aria-label={m.ui.hotelTopicsLabel}>{topics.map(topic =>
        <CategoryCard key={topic.code} id={`guest-hotel-${topic.code}`} label={m.hotelCategories[topic.code]} icon={topic.icon}
          selected={selected === topic.code} disabled={!hotel} onClick={() => selectTopic(topic.code)} aria-controls="guest-hotel-detail" />)}</div>
      <div id="guest-hotel-detail">{hotel && selected ? <div className="panel guest-topic-detail">
        <div className="section-heading"><h3 ref={heading} tabIndex={-1}>{m.hotelCategories[selected]}</h3><Button variant="secondary" onClick={() => { setActiveHit(null); onClose() }}>{m.ui.closeDetails}</Button></div>
        <div className="hotel-topic-text"><HotelParagraphs text={hotelTopicText(hotel, selected, language)}
          labels={selected === 'roomUsage' ? ROOM_USAGE_LABELS[language] : undefined} idPrefix="guest-hotel-topic-item" /></div>
        <dl className="detail-facts">
          {(selected === 'checkIn' || selected === 'checkOut') && <div><dt>{selected === 'checkIn' ? m.ui.checkInTimeLabel : m.ui.checkOutTimeLabel}</dt><dd>{localizedValue(selected === 'checkIn' ? hotel.checkInTime : hotel.checkOutTime, language, 'timeUnavailable')}</dd></div>}
          <div><dt>{m.ui.hotelName}</dt><dd>{localizedValue(hotel.translations[language].name, language)}</dd></div>
          {hotel.translations[language].description.trim() && <div><dt>{m.ui.description}</dt><dd>{localizedValue(hotel.translations[language].description, language)}</dd></div>}
          <div><dt>{m.ui.address}</dt><dd>{localizedValue(hotel.translations[language].address, language)}</dd></div>
          {selected === 'roomUsage' && <div><dt>{m.ui.notes}</dt><dd><HotelParagraphs text={localizedValue(hotel.translations[language].notes, language)} idPrefix="guest-hotel-notes-item" /></dd></div>}
        </dl>
        <p className="verification-date">{guestVerificationDate(hotel.lastVerifiedAt, language)}</p>
        <p className="field-hint">{m.ui.verificationNotice}</p>
      </div> : hotel && !query.trim() && <p className="field-hint">{m.ui.selectHotelPrompt}</p>}</div>
    </section>
  )
}
