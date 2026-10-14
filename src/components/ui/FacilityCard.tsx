import { useId } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

interface FacilityCardProps {
  name: string
  categoryLabel: string
  englishName?: string
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

export function FacilityCard({ name, categoryLabel, englishName, selected = false, walkingText, detailControls, detailButtonId, openingHours, walkingMinutes, hoursLabel = 'Opening hours', walkingLabel = 'Walking time', minuteUnit = 'min', unknownLabel = 'Not connected', detailLabel = 'View details', disabled = true, onDetails }: FacilityCardProps) {
  const titleId = useId()
  return (
    <article className={`facility-card ${selected ? 'is-selected' : ''}`} aria-labelledby={titleId}>
      <p className="eyebrow">{categoryLabel}</p><h3 id={titleId}>{name}</h3>{englishName && <p className="facility-english-name" lang="en">{englishName}</p>}
      <dl className="facility-meta">
        <div><dt>{hoursLabel}</dt><dd>{openingHours || unknownLabel}</dd></div>
        <div><dt>{walkingLabel}</dt><dd>{walkingText ?? (walkingMinutes == null ? unknownLabel : `${walkingMinutes} ${minuteUnit}`)}</dd></div>
      </dl>
      <Button id={detailButtonId} variant="secondary" aria-pressed={selected} aria-controls={detailControls} disabled={disabled || !onDetails} onClick={onDetails} icon={<Icon name="arrow" size={18} />}>{detailLabel}</Button>
    </article>
  )
}
