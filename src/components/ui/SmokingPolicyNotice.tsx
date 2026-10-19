import type { HotelDataset } from '../../types/hotel'
import type { GuideLanguage } from '../../types/guide'
import { guestSmokingNotice, hotelParagraphs } from '../../services/guestHotelPresentation'
import { InformationNotice } from './InformationNotice'

const titles: Record<GuideLanguage, string> = {
  ko: '객실·실내 금연 안내',
  en: 'No smoking in rooms or indoor areas',
  'zh-CN': '客房及室内禁止吸烟',
  ja: '客室・館内禁煙のお知らせ',
}

/** Shared, prominently styled hotel-policy copy; source wording is never modified. */
export function SmokingPolicyNotice({ hotel, language }: { hotel: HotelDataset; language: GuideLanguage }) {
  const notice = guestSmokingNotice(hotel, language)
  if (!notice) return null
  const [rule, fee] = hotelParagraphs(notice)

  return <div className="smoking-policy-notice">
    <InformationNotice title={titles[language]} tone="warning">
      <div className="smoking-policy-copy">
        <p className="smoking-policy-rule">{rule}</p>
        <p className="smoking-policy-fee"><strong>{fee}</strong></p>
      </div>
    </InformationNotice>
  </div>
}
