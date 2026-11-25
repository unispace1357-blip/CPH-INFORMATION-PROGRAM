import type { GuideLanguage } from '../../types/guide'
import { coolingNotice, ROOM_CLIMATE_COPY } from '../../data/roomClimateNotices'
import { Icon } from './Icon'
import type { IconName } from './Icon'

export function RoomClimateCards({ language, onHeating, onCooling }: {
  language: GuideLanguage
  onHeating: () => void
  onCooling: () => void
}) {
  const copy = ROOM_CLIMATE_COPY[language]
  const cooling = coolingNotice(language)
  const cards: { key: string; title: string; primary: string; secondary?: string; icon: IconName; action: () => void }[] = [
    { key: 'heating', title: copy.heatingTitle, primary: copy.heating, icon: 'heating', action: onHeating },
    { key: 'cooling', title: copy.coolingTitle, ...cooling, icon: 'cooling', action: onCooling },
  ]
  return <section className="room-climate-cards" aria-label={copy.title}>
    {cards.map(card => <button type="button" key={card.key} className={`room-climate-card room-climate-card--${card.key}`} onClick={card.action}>
      <span className="room-climate-icon"><Icon name={card.icon} size={26} /></span>
      <span className="room-climate-copy">
        <strong className="room-climate-title">{card.title}</strong>
        <span className="room-climate-primary">{card.primary}</span>
        {card.secondary && <span className="room-climate-secondary">{card.secondary}</span>}
      </span>
      <Icon name="arrow" size={18} className="room-climate-arrow" />
    </button>)}
  </section>
}
