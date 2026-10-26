import type { GuideLanguage } from '../../types/guide'
import { MESSAGES } from '../../i18n/messages'

/** Photo slots are intentionally independent from all hotel copy and theme CSS. */
const BOUTIQUE_SUBTITLES: Record<GuideLanguage,string> = {
  ko:'특별한 순간이 머무는 곳, 송도센트럴파크호텔',
  en:'Thoughtful details for your stay in Songdo.',
  'zh-CN':'于松岛中央公园酒店，开启一段特别的旅程。',
  ja:'松島セントラルパークホテルで、特別なひとときを。',
}
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
      <p className="concierge-hero-kicker">{isStaff ? 'THE CENTRAL PARK HOTEL · SONGDO' : 'THE CENTRAL PARK HOTEL · SONGDO'}</p>
      <h1>{isStaff ? 'Staff Concierge' : <>A Special Stay <span className="boutique-hero-line">in Songdo</span></>}</h1>
      <p>{isStaff ? '빠르고 정확한 안내로, 더 나은 경험을' : BOUTIQUE_SUBTITLES[language]}</p>
      <span className="boutique-hero-caption">{isStaff ? 'FRONT DESK INFORMATION' : m.ui.eyebrow}</span>
    </div>
  </section>
}
