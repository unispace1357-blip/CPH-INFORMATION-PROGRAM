import type { GuideLanguage } from '../types/guide.ts'
import type { FrontdeskScriptCategory } from '../types/frontdeskScript.ts'

type LocalizedNotice = { title: string; text: string }
export interface OperationalNotice {
  id: string
  guestCategory: 'roomUsage' | 'parking'
  staffCategory: FrontdeskScriptCategory
  copy: Record<GuideLanguage, LocalizedNotice>
  keywords: readonly string[]
  question: { en: string; ko: string }
}

/** User-provided operational updates, 2026-11-25.
 * Historical approved workbook and existing search synonyms remain unchanged.
 */
export const HOTEL_OPERATIONAL_NOTICES: readonly OperationalNotice[] = [
  {
    id: 'hotel-gym',
    guestCategory: 'roomUsage', staffCategory: 'hotel-facilities',
    keywords: ['헬스장', '헬스', '운동', '피트니스', 'gym', 'fitness', '健身房', '健身', 'ジム', 'フィットネス'],
    question: { en: 'Where is the gym, and what are its opening hours?', ko: '헬스장은 어디에 있고 몇 시까지 운영하나요?' },
    copy: {
      ko: { title: '헬스장 이용 안내', text: '헬스장은 호텔 4층에 있으며, 운영시간은 06:00~23:00입니다.' },
      en: { title: 'Gym', text: 'The gym is on the 4th floor and is open from 6:00 AM to 11:00 PM.' },
      'zh-CN': { title: '健身房', text: '健身房位于酒店4楼，开放时间为06:00至23:00。' },
      ja: { title: 'フィットネスジム', text: 'ジムはホテル4階にあり、営業時間は6:00～23:00です。' },
    },
  },
  {
    id: 'ev-charging-stations',
    guestCategory: 'parking', staffCategory: 'parking',
    keywords: ['전기충전소', '전기차', '전기차 충전소', '전기차충전', '충전소', '완속충전', 'ev charging', 'electric vehicle', '7kw', 'b-23', '充电桩', '電気自動車', '充電器'],
    question: { en: 'Where can I charge my electric vehicle?', ko: '전기차 충전소는 어디에 있나요?' },
    copy: {
      ko: { title: '전기차 충전소', text: '지하 1층 B-23 구역에 7kW 완속 충전기 3기가 설치되어 있습니다.' },
      en: { title: 'EV charging stations', text: 'Three 7 kW slow EV chargers are located in zone B-23 on basement level B1.' },
      'zh-CN': { title: '电动汽车充电站', text: '地下1层B-23区域设有3台7 kW慢速充电桩。' },
      ja: { title: '電気自動車充電設備', text: '地下1階のB-23区画に7 kWの普通充電器が3基設置されています。' },
    },
  },
  {
    id: 'room-blanket-rental',
    guestCategory: 'roomUsage', staffCategory: 'room-usage',
    keywords: ['담요', '담요 대여', '담요대여', '세탁비', 'blanket', '毛毯', '毛布'],
    question: { en: 'Can I borrow a blanket?', ko: '담요를 대여할 수 있나요?' },
    copy: {
      ko: { title: '담요 대여', text: '담요 대여 시 객실당 5,000원의 세탁비가 부과됩니다.' },
      en: { title: 'Blanket rental', text: 'Blankets are available for rental with a KRW 5,000 laundry fee per room.' },
      'zh-CN': { title: '毛毯租借', text: '租借毛毯时，每间客房收取5,000韩元的洗涤费。' },
      ja: { title: '毛布の貸し出し', text: '毛布の貸し出しには、1室につき5,000ウォンのクリーニング代がかかります。' },
    },
  },
  {
    id: 'bathtub-drain-controls',
    guestCategory: 'roomUsage', staffCategory: 'room-usage',
    keywords: ['욕조', '배수구', '욕조 배수구', '욕조배수구', '다이얼', 'bathtub', 'drain', '浴缸', '排水口', '浴槽', '排水栓'],
    question: { en: 'How do I close the bathtub drain?', ko: '욕조 배수구를 어떻게 닫나요?' },
    copy: {
      ko: { title: '욕조 배수구 닫는 방법', text: '욕조 안쪽에 있는 은색 다이얼을 돌리면 배수구가 닫힙니다.' },
      en: { title: 'Closing the bathtub drain', text: 'Turn the silver dial inside the bathtub to close the drain.' },
      'zh-CN': { title: '关闭浴缸排水口', text: '转动浴缸内侧的银色旋钮即可关闭排水口。' },
      ja: { title: '浴槽の排水栓の閉め方', text: '浴槽内側にある銀色のダイヤルを回すと、排水栓が閉まります。' },
    },
  },
  {
    id: 'phone-charger-rental',
    guestCategory: 'roomUsage', staffCategory: 'room-usage',
    keywords: ['충전기', '휴대폰충전기', '충전기대여', 'c타입', '8핀', 'usb-c', 'type-c', 'lightning', 'charger', '手机充电器', '充電器'],
    question: { en: 'Can I borrow a phone charger?', ko: '휴대폰 충전기를 대여할 수 있나요?' },
    copy: {
      ko: { title: '휴대폰 충전기 대여', text: 'C타입 및 8핀 충전기는 프론트에서 현금 보증금 10,000원을 맡기고 대여하실 수 있습니다.' },
      en: { title: 'Phone charger rental', text: 'USB-C and 8-pin (Lightning) chargers are available to borrow at the front desk with a KRW 10,000 cash deposit.' },
      'zh-CN': { title: '手机充电器租借', text: '可在前台支付10,000韩元现金押金，租借USB-C或8针（Lightning）充电器。' },
      ja: { title: '携帯電話充電器の貸し出し', text: 'USB-Cおよび8ピン（Lightning）の充電器は、現金10,000ウォンを保証金としてフロントにお預けいただくことで貸し出し可能です。' },
    },
  },
]

export function operationalNoticesFor(category: 'roomUsage' | 'parking'): readonly OperationalNotice[] {
  return HOTEL_OPERATIONAL_NOTICES.filter(item => item.guestCategory === category)
}
