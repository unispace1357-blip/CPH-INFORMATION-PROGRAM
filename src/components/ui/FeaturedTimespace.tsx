import type { Facility } from '../../types/facility'
import type { GuideLanguage } from '../../types/guide'
import { MESSAGES } from '../../i18n/messages'
import { validatedNaverMapUrl } from '../../services/naverMapUrl'
import { CONCIERGE_IMAGES } from './ConciergeHero'

const labels: Record<GuideLanguage, { heading: string; featured: string; notice: string }> = {
  ko: { heading: '추천 장소', featured: '★ 추천', notice: '길찾기 도착지 안내' },
  en: { heading: 'Featured nearby', featured: '★ Featured', notice: 'Directions destination notice' },
  'zh-CN': { heading: '周边推荐', featured: '★ 推荐', notice: '路线终点提示' },
  ja: { heading: 'おすすめスポット', featured: '★ おすすめ', notice: '経路の到着地について' },
}

/** A single source record drives both the guest spotlight and the staff overview. */
export function FeaturedTimespace({ facility, language, onDetails, compact = false }: {
  facility: Facility | null | undefined
  language: GuideLanguage
  onDetails: (id: string) => void
  compact?: boolean
}) {
  if (!facility?.isPublished) return null
  const m = MESSAGES[language]
  const t = labels[language]
  const translated = facility.translations[language]
  const route = validatedNaverMapUrl(facility.naverMapUrl)
  return <section className={`concierge-featured ${compact ? 'concierge-featured--compact' : ''}`} aria-label={t.heading}>
    <div className="concierge-section-heading"><h2>{t.heading}</h2><span className="concierge-featured-badge">{t.featured}</span></div>
    <article className="concierge-featured-card">
      <img className="concierge-featured-image" src={CONCIERGE_IMAGES.timespace} alt="" width="690" height="192" loading="lazy" decoding="async" />
      <div className="concierge-featured-body">
        <h3>{translated.name}</h3>
        <p className="concierge-featured-description">{translated.description}</p>
        <div className="concierge-featured-actions">
          <button type="button" className="button button--secondary" onClick={() => onDetails(facility.id)}>{m.ui.viewDetails}</button>
          {route ? <a className="button button--primary" href={route} target="_blank" rel="noopener noreferrer">{m.ui.directions}</a>
            : <span className="concierge-route-unavailable">{m.ui.naverMapUnavailable}</span>}
        </div>
        {route && <details className="concierge-route-notice"><summary>{t.notice}</summary><p>{translated.directions}</p></details>}
      </div>
    </article>
  </section>
}
