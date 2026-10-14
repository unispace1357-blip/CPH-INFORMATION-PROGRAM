import { useId } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

interface FacilityCardProps {
  name: string
  categoryLabel: string
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

export function FacilityCard({ name, categoryLabel, openingHours, walkingMinutes, hoursLabel = 'Opening hours', walkingLabel = 'Walking time', minuteUnit = 'min', unknownLabel = 'Not connected', detailLabel = 'View details', disabled = true, onDetails }: FacilityCardProps) {
  const titleId = useId()
  return (
    <article className="facility-card" aria-labelledby={titleId}>
      <p className="eyebrow">{categoryLabel}</p><h3 id={titleId}>{name}</h3>
      <dl className="facility-meta">
        <div><dt>{hoursLabel}</dt><dd>{openingHours || unknownLabel}</dd></div>
        <div><dt>{walkingLabel}</dt><dd>{walkingMinutes == null ? unknownLabel : `${walkingMinutes} ${minuteUnit}`}</dd></div>
      </dl>
      <Button variant="secondary" disabled={disabled || !onDetails} onClick={onDetails} icon={<Icon name="arrow" size={18} />}>{detailLabel}</Button>
    </article>
  )
}
