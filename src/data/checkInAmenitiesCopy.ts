import type { GuideLanguage } from '../types/guide.ts'

/** Operational instructions supplied by the hotel staff on 2026-11-25.
 * The base workbook remains unchanged. Early check-in availability is not guaranteed.
 */
export const EARLY_CHECK_IN_COPY: Record<GuideLanguage, string> = {
  ru: 'Ранний заезд оплачивается дополнительно: 11,000 вон за час. За заезд до 09:00 взимается стоимость одних суток. Возможность раннего заезда уточняйте на стойке регистрации.',
  ko: '얼리 체크인 이용 시 시간당 11,000원의 추가 요금이 부과됩니다. 오전 9시 이전 입실 시에는 1박 요금이 부과됩니다. 얼리 체크인 가능 여부는 프론트에 문의해 주세요.',
  en: 'Early check-in costs KRW 11,000 per hour. Check-in before 9:00 AM is charged at the rate of one night. Please check early check-in availability with the front desk.',
  'zh-CN': '提前入住需额外支付每小时11,000韩元。上午9点前入住需支付一晚房费。能否提前入住请咨询前台。',
  ja: 'アーリーチェックインには1時間につき11,000ウォンの追加料金がかかります。午前9時より前のご入室には1泊分の料金がかかります。アーリーチェックインの可否はフロントにお問い合わせください。',
}

export const AMENITIES_CARD_COPY: Record<GuideLanguage, { label: string; items: string; purchase: string }> = {
  ru: { label: 'Одноразовые принадлежности', items: 'Зубная щётка · паста · бритва', purchase: 'Платно на ресепшене' },
  ko: { label: '일회용 어메니티', items: '칫솔·치약·면도기', purchase: '프론트 유료 구매' },
  en: { label: 'Disposable amenities', items: 'Toothbrush · toothpaste · razor', purchase: 'Purchase at front desk' },
  'zh-CN': { label: '一次性用品', items: '牙刷·牙膏·剃须刀', purchase: '前台付费购买' },
  ja: { label: '使い捨てアメニティ', items: '歯ブラシ・歯磨き粉・カミソリ', purchase: 'フロントで有料販売' },
}
