import raw from '../data/timespaceTenants.json' with { type: 'json' }
import type { GuideLanguage } from '../types/guide.ts'

export const TIMESPACE_CATEGORY_ORDER = [
  'all', 'grill', 'western', 'pizza', 'curry', 'korean', 'japanese', 'snack', 'healthy',
] as const
export type TimespaceCategory = Exclude<(typeof TIMESPACE_CATEGORY_ORDER)[number], 'all'>
export type TimespaceCategoryFilter = TimespaceCategory | 'all'
export interface TimespaceTenant {
  id: string
  name: string
  category: TimespaceCategory
  building: 'A' | 'B' | 'C' | 'D'
  floor: number
  rooms: string
  /** Archived shops stay in the admin file but are not public. */
  status?: 'closed'
  menu: Record<GuideLanguage, string>
}
export const TIMESPACE_TENANTS = (raw.tenants as TimespaceTenant[]).filter(tenant => tenant.status !== 'closed')

const CATEGORY_LABELS: Record<TimespaceCategoryFilter, Record<GuideLanguage, string>> = {
  all: { ko: '전체', en: 'All', 'zh-CN': '全部', ja: 'すべて' },
  grill: { ko: '고기구이', en: 'Grilled meat', 'zh-CN': '烤肉', ja: '焼肉' },
  western: { ko: '파스타·양식', en: 'Pasta & Western', 'zh-CN': '意面·西餐', ja: 'パスタ・洋食' },
  pizza: { ko: '피자', en: 'Pizza', 'zh-CN': '披萨', ja: 'ピザ' },
  curry: { ko: '카레', en: 'Curry', 'zh-CN': '咖喱', ja: 'カレー' },
  korean: { ko: '한식·찌개', en: 'Korean stews', 'zh-CN': '韩餐·汤锅', ja: '韓国料理・チゲ' },
  japanese: { ko: '일식·철판', en: 'Japanese griddle', 'zh-CN': '日式铁板', ja: '和食・鉄板' },
  snack: { ko: '떡볶이·분식', en: 'Tteokbokki', 'zh-CN': '炒年糕·小吃', ja: 'トッポッキ・軽食' },
  healthy: { ko: '포케·샐러드', en: 'Poké & salads', 'zh-CN': '波奇饭·沙拉', ja: 'ポキ・サラダ' },
}

export const TIMESPACE_DIRECTORY_UI: Record<GuideLanguage, {
  heading: string
  intro: string
  menuLabel: string
  locationLabel: string
  note: string
}> = {
  ko: {
    heading: '음식점 둘러보기',
    intro: '먹고 싶은 음식 종류를 선택해 보세요.',
    menuLabel: '대표 메뉴',
    locationLabel: '매장 위치',
    note: '매장 입점·영업시간·메뉴는 변경될 수 있습니다. 방문 전 각 매장에서 확인해 주세요.',
  },
  en: {
    heading: 'Explore restaurants',
    intro: 'Choose the type of food you would like.',
    menuLabel: 'Popular dishes',
    locationLabel: 'Shop location',
    note: 'Tenants, hours and menus may change. Please check with the restaurant before visiting.',
  },
  'zh-CN': {
    heading: '探索美食餐厅',
    intro: '请选择您想吃的餐饮类别。',
    menuLabel: '主要菜品',
    locationLabel: '店铺位置',
    note: '商户、营业时间和菜单可能会调整，请在到访前向店家确认。',
  },
  ja: {
    heading: '飲食店を探す',
    intro: '食べたい料理の種類をお選びください。',
    menuLabel: '主な料理',
    locationLabel: '店舗の場所',
    note: '店舗、営業時間、メニューは変更される場合があります。訪問前にご確認ください。',
  },
}

export function timespaceCategoryLabel(category: TimespaceCategoryFilter, language: GuideLanguage): string {
  return CATEGORY_LABELS[category][language]
}

export function timespaceLocation(tenant: TimespaceTenant, language: GuideLanguage): string {
  switch (language) {
    case 'ko': return `${tenant.building}동 ${tenant.floor}층 ${tenant.rooms}호`
    case 'en': return `Block ${tenant.building} · Floor ${tenant.floor} · Unit ${tenant.rooms}`
    case 'zh-CN': return `${tenant.building}栋 ${tenant.floor}层 ${tenant.rooms}号`
    case 'ja': return `${tenant.building}棟 ${tenant.floor}階 ${tenant.rooms}号`
  }
}

export function timespaceTenantsByCategory(category: TimespaceCategoryFilter): TimespaceTenant[] {
  return category === 'all' ? [...TIMESPACE_TENANTS] : TIMESPACE_TENANTS.filter(t => t.category === category)
}

export function timespaceSearchTerms(): string[] {
  return [
    ...TIMESPACE_TENANTS.flatMap(t => [t.name, ...Object.values(t.menu), ...Object.values(t.menu).flatMap(x=>x.split(/[·,，、]/))]),
    ...TIMESPACE_CATEGORY_ORDER.flatMap(category => Object.values(CATEGORY_LABELS[category])),
  ]
}
