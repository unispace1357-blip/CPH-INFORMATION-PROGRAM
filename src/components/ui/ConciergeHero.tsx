import type { GuideLanguage } from '../../types/guide'
import { MESSAGES } from '../../i18n/messages'

/** Photo slots are intentionally independent from all hotel copy and theme CSS. */
export const CONCIERGE_IMAGES = {
  frontdesk: `${import.meta.env.BASE_URL}concierge/frontdesk-concept.webp`,
  timespace: `${import.meta.env.BASE_URL}concierge/timespace-concept.webp`,
} as const

export function ConciergeHero({ audience, language = 'ko' }: { audience: 'guest' | 'staff'; language?: GuideLanguage }) {
  const isStaff = audience === 'staff'
  const m = MESSAGES[language]
  return <section className={`concierge-hero concierge-hero--${audience}`} aria-label={isStaff ? '프론트 안내 대시보드' : m.ui.welcomeTitle}>
    <img src={CONCIERGE_IMAGES.frontdesk} className="concierge-hero-image" alt="" width="690" height="214" decoding="async" />
    <div className="concierge-hero-copy">
      <p className="concierge-hero-kicker">{isStaff ? 'FRONT DESK CONCIERGE' : m.ui.eyebrow}</p>
      <h1>{isStaff ? '직원용 안내' : m.ui.welcomeTitle}</h1>
      <p>{isStaff ? '호텔 업무 영어 문장과 주변 시설 정보를 빠르게 확인하세요.' : m.ui.welcomeDescription}</p>
      {!isStaff && <button type="button" className="concierge-hero-search-link" onClick={() => { const input = document.querySelector<HTMLInputElement>('#hotel-information input[type="search"]'); input?.scrollIntoView({ block: 'center' }); input?.focus({ preventScroll: true }) }}>{m.ui.hotelSearchLabel} <span aria-hidden="true">⌕</span></button>}
    </div>
  </section>
}
