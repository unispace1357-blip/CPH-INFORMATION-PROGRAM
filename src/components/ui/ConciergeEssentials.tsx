import type { HotelDataset } from '../../types/hotel'
import type { GuideLanguage } from '../../types/guide'
import { Icon } from './Icon'

const labels: Record<GuideLanguage, { title: string; checkIn: string; checkOut: string; breakfast: string; frontDesk: string; currency: string }> = {
  ko: { title: '주요 이용정보', checkIn: '체크인', checkOut: '체크아웃', breakfast: '성인 조식', frontDesk: '프론트', currency: '원' },
  en: { title: 'At a glance', checkIn: 'Check-in', checkOut: 'Check-out', breakfast: 'Adult breakfast', frontDesk: 'Front desk', currency: 'KRW' },
  'zh-CN': { title: '主要入住信息', checkIn: '入住', checkOut: '退房', breakfast: '成人早餐', frontDesk: '前台', currency: '韩元' },
  ja: { title: 'ご利用案内', checkIn: 'チェックイン', checkOut: 'チェックアウト', breakfast: '大人の朝食', frontDesk: 'フロント', currency: 'ウォン' },
}

export function ConciergeEssentials({ hotel, language, includeCheckout = false, onHotelTopic }: {
  hotel: HotelDataset
  language: GuideLanguage
  includeCheckout?: boolean
  onHotelTopic?: (topic: 'checkIn' | 'checkOut' | 'breakfast') => void
}) {
  const t = labels[language]
  // Only reflect verified source copy; changing hotel.json updates these quick facts automatically.
  const breakfast = hotel.translations.ko.breakfast.match(/35,000|\d{1,3},\d{3}(?=원)/)?.[0]
  const phone = hotel.translations.ko.notes.match(/0\d{1,2}-\d{3,4}-\d{4}/)?.[0]
  const rows = [
    { key: 'checkIn' as const, icon: 'checkIn' as const, label: t.checkIn, value: hotel.checkInTime || '—' },
    ...(includeCheckout ? [{ key: 'checkOut' as const, icon: 'checkOut' as const, label: t.checkOut, value: hotel.checkOutTime || '—' }] : []),
    { key: 'breakfast' as const, icon: 'breakfast' as const, label: t.breakfast, value: breakfast ? (language === 'en' ? `KRW ${breakfast}` : `${breakfast}${t.currency}`) : '—' },
  ]
  return <section className="concierge-essentials" aria-label={t.title}>
    <div className="concierge-section-heading"><h2>{t.title}</h2></div>
    <div className="concierge-essentials-grid">
      {rows.map(row => <div className="concierge-fact" key={row.key}>
        {onHotelTopic ? <button type="button" className="concierge-fact-button" onClick={() => onHotelTopic(row.key)}>
          <Icon name={row.icon} size={25} /><span className="concierge-fact-label">{row.label}</span><strong>{row.value}</strong>
        </button> : <div className="concierge-fact-button"><Icon name={row.icon} size={25} /><span className="concierge-fact-label">{row.label}</span><strong>{row.value}</strong></div>}
      </div>)}
      {phone && <div className="concierge-fact"><a className="concierge-fact-button" href={`tel:${phone}`}>
        <Icon name="info" size={25} /><span className="concierge-fact-label">{t.frontDesk}</span><strong>{phone}</strong>
      </a></div>}
    </div>
  </section>
}
