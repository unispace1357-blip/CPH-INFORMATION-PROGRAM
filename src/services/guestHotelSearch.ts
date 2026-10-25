import type { HotelDataset } from '../types/hotel.ts'
import type { GuideLanguage } from '../types/guide.ts'
import type { HotelCategory } from '../i18n/types.ts'
import { MESSAGES } from '../i18n/messages.ts'
import { hotelParagraphs } from './guestHotelPresentation.ts'

export const HOTEL_TOPICS = ['checkIn', 'checkOut', 'breakfast', 'parking', 'roomUsage'] as const satisfies readonly HotelCategory[]

/** Order follows the existing, four-language hotel roomUsage paragraphs. Data wording is not rewritten. */
export const ROOM_USAGE_LABELS: Record<GuideLanguage, readonly string[]> = {
  ko: ['Wi-Fi', '전자레인지·공용 식기', '가까운 편의점', '냉방 조절', '일회용 어메니티', '음식 배달 수령', '배달 시 유의사항', '소방시설 점검', '실내 금연', '객실 소음', '슬리퍼·객실 비품', '침대 옆 조명'],
  en: ['Wi-Fi', 'Microwaves & utensils', 'Nearby convenience store', 'Air conditioning', 'Disposable amenities', 'Food delivery pickup', 'Delivery policy', 'Fire safety checks', 'No smoking', 'Room noise', 'Slippers & room items', 'Bedside light switch'],
  'zh-CN': ['Wi-Fi 无线网络', '微波炉及餐具', '附近便利店', '空调控制', '一次性用品', '外卖领取', '外卖注意事项', '消防设施检查', '室内禁烟', '客房噪音', '拖鞋及客房用品', '床边灯光开关'],
  ja: ['Wi-Fi', '電子レンジ・食器類', '近くのコンビニ', 'エアコン操作', '使い捨てアメニティ', 'デリバリー受け取り', '配達時の注意', '消防設備点検', '館内禁煙', '客室の騒音', 'スリッパ・客室備品', 'ベッド横の照明'],
}

export interface HotelSearchHit {
  category: HotelCategory
  source: 'topic' | 'notes'
  index: number
  text: string
  title: string
}

const languages = ['ko', 'en', 'zh-CN', 'ja'] as const
const aliasGroups = [
  ['wifi', '와이파이', '무선인터넷', '无线网络', '無線lan'],
  ['조식', '아침식사', 'breakfast', '早餐', '朝食'],
  ['전자레인지', 'microwave', '微波炉', '電子レンジ'],
  ['금연', '흡연', 'smoking', 'nosmoking', '禁烟', '禁煙'],
  ['수저', '젓가락', '식기', 'spoon', 'chopstick', 'cutlery', '餐具', '食器'],
  ['불', '조명', '전등', 'light', 'lighting', '灯光', '照明'],
  ['체크인', 'checkin', '入住', 'チェックイン'],
  ['체크아웃', 'checkout', '退房', 'チェックアウト'],
  ['주차', 'parking', '停车', '駐車'],
  ['보증금', 'deposit', '押金', 'デポジット'],
]

export const normalizeHotelKeyword = (value: string): string =>
  value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '')

function tokenMatches(index: string, token: string): boolean {
  if (index.includes(token)) return true
  return aliasGroups.some(group => group.some(alias => normalizeHotelKeyword(alias) === token) &&
    group.some(alias => index.includes(normalizeHotelKeyword(alias))))
}

export function searchHotelInformation(hotel: HotelDataset, language: GuideLanguage, query: string): HotelSearchHit[] {
  const tokens = query.trim().split(/\s+/u).map(normalizeHotelKeyword).filter(Boolean)
  if (!tokens.length) return []
  const results: HotelSearchHit[] = []
  for (const category of HOTEL_TOPICS) {
    const categoryNames = normalizeHotelKeyword(languages.map(lang => MESSAGES[lang].hotelCategories[category]).join(' '))
    const categoryMatch = tokens.every(token => tokenMatches(categoryNames, token))
    const sources = category === 'roomUsage' ? (['roomUsage', 'notes'] as const) : ([category] as const)
    for (const field of sources) {
      const paragraphs = hotelParagraphs(hotel.translations[language][field])
      for (let index = 0; index < paragraphs.length; index++) {
        const title = field === 'roomUsage' ? ROOM_USAGE_LABELS[language][index] ?? '' : MESSAGES[language].hotelCategories[category]
        const allLanguages = languages.map(lang =>
          [hotelParagraphs(hotel.translations[lang][field])[index] ?? '',
            field === 'roomUsage' ? ROOM_USAGE_LABELS[lang][index] ?? '' : ''].join(' ')).join(' ')
        const searchable = normalizeHotelKeyword(allLanguages)
        if (tokens.every(token => tokenMatches(searchable, token)) || (categoryMatch && index === 0 && field !== 'notes')) {
          results.push({ category, source: field === 'notes' ? 'notes' : 'topic', index, title, text: paragraphs[index]! })
        }
      }
    }
  }
  return results
}
