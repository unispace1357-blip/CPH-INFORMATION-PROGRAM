import { useEffect, useRef } from 'react'
import type { Facility } from '../../types/facility'
import type { GuideLanguage } from '../../types/guide'
import { MESSAGES } from '../../i18n/messages'
import { guestWalkingTime } from '../../i18n/formatters'
import { GUEST_FACILITY_COPY, TIMESPACE_FACILITY_ID, guestFacilityPresentation } from '../../services/guestFacilityPresentation'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { CONCIERGE_IMAGES } from '../ui/ConciergeHero'
import { NaverDirectionsLink } from '../ui/NaverDirectionsLink'
import { OperatingHoursGuide } from '../ui/OperatingHoursGuide'
import { TimespaceDiningDirectory } from '../ui/TimespaceDiningDirectory'
import type { TenantFocusRequest } from '../../services/timespaceTenantNavigation'

/** Customer summary, not the operational staff record. Staff details stay unchanged. */
export function GuestFacilityDetail({ facility, language, onClose, tenantFocus = null }: { facility: Facility | null; language: GuideLanguage; onClose: () => void; tenantFocus?: TenantFocusRequest }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const id = facility?.id
  useEffect(() => {
    if (id) {
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
  }, [id])
  if (!facility || !facility.isPublished) return null
  const m = MESSAGES[language]
  const copy = GUEST_FACILITY_COPY[language]
  const venue = facility.translations[language]
  const { summary, menuExamples, routeNotice } = guestFacilityPresentation(facility, language)
  const isTimespace = facility.id === TIMESPACE_FACILITY_ID
  const hasWalking = typeof facility.walkingMinutes === 'number' && Number.isFinite(facility.walkingMinutes) && facility.walkingMinutes >= 0
  const showTransitDetails = facility.category === 'transportation' && Boolean(venue.directions.trim())
  return (
    <section className="panel guest-detail-panel guest-place-guide" aria-labelledby="guest-detail-title">
      <div className="section-heading guest-place-heading">
        <div>
          <p className="eyebrow">{[facility.category, ...(facility.additionalCategories ?? [])].map(code => m.categories[code]).join(' · ')}</p>
          <h2 id="guest-detail-title" ref={heading} tabIndex={-1}>{venue.name}</h2>
        </div>
        <Button variant="secondary" onClick={onClose}>{m.ui.closeDetails}</Button>
      </div>
      {isTimespace && <img className="guest-place-photo" src={CONCIERGE_IMAGES.timespace} alt="" width="690" height="192" loading="lazy" decoding="async" />}
      <p className="guest-place-summary">{summary}</p>
      {isTimespace && <TimespaceDiningDirectory language={language} focusRequest={tenantFocus} />}
      {!isTimespace && menuExamples.length > 0 && <section className="guest-place-menu" aria-label={copy.menuTitle}>
        <h3>{copy.menuTitle}</h3>
        <ul className="guest-place-menu-list">{menuExamples.map(example => <li key={example}>{example}</li>)}</ul>
      </section>}
      <div className="guest-place-essentials">
        {hasWalking && <div className="guest-place-fact guest-place-fact--walk">
          <Icon name="clock" size={21} />
          <div><span>{isTimespace ? copy.nearbyLandmark : m.ui.walkingTime}</span><strong>{guestWalkingTime(facility.walkingMinutes, language, facility.walkingDistanceMeters)}</strong></div>
        </div>}
        {venue.openingHours.trim() && <div className="guest-place-fact">
          <Icon name="info" size={21} />
          <div><span>{m.ui.openingHours}</span><OperatingHoursGuide value={venue.openingHours} language={language} closedDays={facility.closedDays[language]} /></div>
        </div>}
        {venue.address.trim() && <div className="guest-place-fact">
          <Icon name="hotel" size={21} />
          <div><span>{m.ui.address}</span><strong>{venue.address}</strong></div>
        </div>}
      </div>
      {routeNotice && <div className="guest-place-route-note" role="note">
        <Icon name="info" size={20} /><p>{routeNotice}</p>
      </div>}
      {showTransitDetails && <details className="guest-place-transit-details">
        <summary>{copy.travelDetails}</summary><p>{venue.directions}</p>
      </details>}
      <div className="guest-place-map-action">
        <NaverDirectionsLink url={facility.naverMapUrl} label={m.ui.naverMapDirections}
          unavailable={copy.mapUnavailable} newTabNotice={m.ui.naverMapNewTab} />
      </div>
    </section>
  )
}
