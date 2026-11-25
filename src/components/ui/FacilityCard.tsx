import { useId } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface FacilityCardProps {
  name: string
  categoryLabel: string
  categoryIcon?: IconName
  guestVisual?: { photoUrl: string; alt: string; sourceUrl: string; sourceLabel: string }
  featuredLabel?: string
  englishName?: string
  menuSummary?: string
  selected?: boolean
  walkingText?: string
  detailControls?: string
  detailButtonId?: string
  openingHours?: string
  walkingMinutes?: number | null
  hoursLabel?: string
  walkingLabel?: string
  minuteUnit?: string
  unknownLabel?: string
  detailLabel?: string
  disabled?: boolean
  onDetails?: () => void
}

export function FacilityCard({ name, categoryLabel, categoryIcon, guestVisual, featuredLabel, englishName, menuSummary, selected = false, walkingText, detailControls, detailButtonId, openingHours, walkingMinutes, hoursLabel = 'Opening hours', walkingLabel = 'Walking time', minuteUnit = 'min', unknownLabel = 'Not connected', detailLabel = 'View details', disabled = true, onDetails }: FacilityCardProps) {
  const titleId = useId()
  return (
    <article className={`facility-card ${selected ? 'is-selected' : ''} ${categoryIcon ? 'facility-card--editorial' : ''}`} aria-labelledby={titleId}>
      {categoryIcon && <div className="facility-editorial-visual">{guestVisual ? <><img src={guestVisual.photoUrl} alt={guestVisual.alt} loading="lazy" decoding="async" /><a className="facility-photo-credit" href={guestVisual.sourceUrl} target="_blank" rel="noopener noreferrer">{guestVisual.sourceLabel}</a></> : <div className="facility-editorial-symbol" aria-hidden="true"><Icon name={categoryIcon} size={52} /></div>}</div>}
      <div className={categoryIcon ? "facility-editorial-content" : "facility-standard-content"}>
      <p className="eyebrow">{categoryIcon && <Icon name={categoryIcon} size={16} />}{categoryLabel}</p><h3 id={titleId}>{name}{featuredLabel && <span className="facility-featured-label">★ {featuredLabel}</span>}</h3>{englishName && <p className="facility-english-name" lang="en">{englishName}</p>}{menuSummary && <p className="facility-menu-summary">{menuSummary}</p>}
      <dl className="facility-meta">
        <div><dt>{categoryIcon && <Icon name="clock" size={18} />}{hoursLabel}</dt><dd>{openingHours || unknownLabel}</dd></div>
        <div><dt>{categoryIcon && <Icon name="walking" size={18} />}{walkingLabel}</dt><dd>{walkingText ?? (walkingMinutes == null ? unknownLabel : `${walkingMinutes} ${minuteUnit}`)}</dd></div>
      </dl>
      <Button id={detailButtonId} variant={categoryIcon ? "primary" : "secondary"} aria-pressed={selected} aria-controls={detailControls} disabled={disabled || !onDetails} onClick={onDetails} icon={<Icon name="arrow" size={18} />}>{detailLabel}</Button>
      </div>
    </article>
  )
}
