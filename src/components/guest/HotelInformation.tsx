import { useEffect, useRef } from 'react'
import type { HotelDataset } from '../../types/hotel'
import type { GuideLanguage } from '../../types/guide'
import type { HotelCategory } from '../../i18n/types'
import type { GuestDataState } from '../../services/loadGuestData'
import { MESSAGES } from '../../i18n/messages'
import { guestVerificationDate, localizedValue } from '../../i18n/formatters'
import { guestSmokingNotice, hotelHasInformation, hotelTopicText } from '../../services/guestHotelPresentation'
import { CategoryCard } from '../ui/CategoryCard'
import { InformationNotice } from '../ui/InformationNotice'
import { LoadingState } from '../ui/LoadingState'
import { Button } from '../ui/Button'
import type { IconName } from '../ui/Icon'
import { HotelParagraphs } from './HotelParagraphs'

const noSmokingTitles: Record<GuideLanguage, string> = {
  ko: '객실·실내 금연 안내',
  en: 'No smoking in rooms or indoor areas',
  'zh-CN': '客房及室内禁止吸烟',
  ja: '客室・館内禁煙のお知らせ',
}

const topics: { code: HotelCategory; icon: IconName }[] = [
  { code: 'checkIn', icon: 'checkIn' }, { code: 'checkOut', icon: 'checkOut' },
  { code: 'breakfast', icon: 'breakfast' }, { code: 'parking', icon: 'parking' }, { code: 'roomUsage', icon: 'bed' },
]

export function HotelInformation({ state, language, selected, onSelect, onClose }: { state: GuestDataState<HotelDataset>; language: GuideLanguage; selected: HotelCategory | null; onSelect: (topic: HotelCategory) => void; onClose: () => void }) {
  const m = MESSAGES[language]
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (selected) { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }) } }, [selected])
  const hotel = state.status === 'ready' ? state.dataset : null
  return (
    <section className="guest-section" id="hotel-information" aria-labelledby="hotel-information-title">
      <div className="section-heading"><h2 id="hotel-information-title">{m.ui.hotelTitle}</h2></div>
      {state.status === 'loading' && <LoadingState label={m.ui.loadingHotel} />}
      {state.status === 'error' && <div role="alert"><InformationNotice title={m.ui.hotelDataErrorTitle} tone="warning"><p>{m.ui.dataErrorDescription}</p><Button variant="secondary" onClick={() => window.location.reload()}>{m.ui.refresh}</Button></InformationNotice></div>}
      {hotel && guestSmokingNotice(hotel, language) && <InformationNotice title={noSmokingTitles[language]} tone="warning"><HotelParagraphs text={guestSmokingNotice(hotel, language)} /></InformationNotice>}
      {hotel && !hotelHasInformation(hotel, language) && <InformationNotice title={m.ui.hotelEmptyTitle}>{m.ui.hotelEmptyDescription}</InformationNotice>}
      <div className="guest-category-grid hotel-category-grid" role="group" aria-label={m.ui.hotelTopicsLabel}>{topics.map(topic => <CategoryCard key={topic.code} id={`guest-hotel-${topic.code}`} label={m.hotelCategories[topic.code]} icon={topic.icon} selected={selected === topic.code} disabled={!hotel} onClick={() => onSelect(topic.code)} aria-controls="guest-hotel-detail" />)}</div>
      <div id="guest-hotel-detail">{hotel && selected ? <div className="panel guest-topic-detail">
        <div className="section-heading"><h3 ref={heading} tabIndex={-1}>{m.hotelCategories[selected]}</h3><Button variant="secondary" onClick={onClose}>{m.ui.closeDetails}</Button></div>
        <div className="hotel-topic-text"><HotelParagraphs text={hotelTopicText(hotel, selected, language)} /></div>
        <dl className="detail-facts">
          {(selected === 'checkIn' || selected === 'checkOut') && <div><dt>{selected === 'checkIn' ? m.ui.checkInTimeLabel : m.ui.checkOutTimeLabel}</dt><dd>{localizedValue(selected === 'checkIn' ? hotel.checkInTime : hotel.checkOutTime, language, 'timeUnavailable')}</dd></div>}
          <div><dt>{m.ui.hotelName}</dt><dd>{localizedValue(hotel.translations[language].name, language)}</dd></div>
          <div><dt>{m.ui.description}</dt><dd>{localizedValue(hotel.translations[language].description, language)}</dd></div>
          <div><dt>{m.ui.address}</dt><dd>{localizedValue(hotel.translations[language].address, language)}</dd></div>
          <div><dt>{m.ui.notes}</dt><dd><HotelParagraphs text={localizedValue(hotel.translations[language].notes, language)} /></dd></div>
        </dl>
        <p className="verification-date">{guestVerificationDate(hotel.lastVerifiedAt, language)}</p>
        <p className="field-hint">{m.ui.verificationNotice}</p>
      </div> : hotel && <p className="field-hint">{m.ui.selectHotelPrompt}</p>}</div>
    </section>
  )
}
