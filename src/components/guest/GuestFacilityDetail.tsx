import { useEffect, useRef } from 'react'
import type { Facility } from '../../types/facility'
import type { GuideLanguage } from '../../types/guide'
import { MESSAGES } from '../../i18n/messages'
import { guestVerificationDate, guestWalkingTime, localizedValue } from '../../i18n/formatters'
import { Button } from '../ui/Button'
import { NaverDirectionsLink } from '../ui/NaverDirectionsLink'

export function GuestFacilityDetail({ facility, language, onClose }: { facility: Facility | null; language: GuideLanguage; onClose: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const id = facility?.id
  useEffect(() => { if (id) { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }) } }, [id])
  if (!facility || !facility.isPublished) return null
  const m = MESSAGES[language]
  const text = facility.translations[language]
  const facts = [
    [m.ui.address, localizedValue(text.address, language)],
    [m.ui.openingHours, localizedValue(text.openingHours, language)],
    [m.ui.closedDays, localizedValue(facility.closedDays[language], language)],
    [m.ui.walkingTime, guestWalkingTime(facility.walkingMinutes, language)],
    [m.ui.directions, localizedValue(text.directions, language)],
    [m.ui.notes, localizedValue(text.notes, language)],
  ]
  return (
    <section className="panel guest-detail-panel" aria-labelledby="guest-detail-title">
      <div className="section-heading"><h2 id="guest-detail-title" ref={heading} tabIndex={-1}>{text.name}</h2><Button variant="secondary" onClick={onClose}>{m.ui.closeDetails}</Button></div>
      <p className="eyebrow">{m.categories[facility.category]}</p><p className="detail-description">{localizedValue(text.description, language)}</p>
      <dl className="detail-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <NaverDirectionsLink url={facility.naverMapUrl} label={m.ui.naverMapDirections} unavailable={m.ui.naverMapUnavailable} newTabNotice={m.ui.naverMapNewTab} />
      <p className="verification-date">{guestVerificationDate(facility.lastVerifiedAt, language)}</p>
      <p className="field-hint">{m.ui.verificationNotice}</p>
    </section>
  )
}
