import type { GuideLanguage } from '../types/guide'
import type { FacilityCategory } from '../types/facility'

interface NearbyEditorialCopy {
  kicker: string
  intro: string
  descriptions: Record<FacilityCategory, string>
}

/** Presentation-only copy. Facility names, times and search data stay in their existing datasets. */
export const NEARBY_EDITORIAL: Record<GuideLanguage, NearbyEditorialCopy> = {
  ko: {
    kicker: 'HOTEL CONCIERGE · EXPLORE SONGDO',
    intro: '호텔 근처의 편의시설, 음식점, 관광지 등 주요 시설 정보를 확인해 보세요.',
    descriptions: {
      hotel: '호텔 이용 시설', dining: '식사, 고기, 맥주 등', cafe: '커피·디저트', convenience: '간단한 식음료·생필품',
      pharmacy: '의약품·건강용품', shopping: '아울렛·쇼핑몰', attraction: '주변 관광지·명소',
      transportation: '버스·지하철·공항 이동', sauna_spa: '사우나·스파', atm: '현금자동입출금기',
    },
  },
  en: {
    kicker: 'HOTEL CONCIERGE · EXPLORE SONGDO',
    intro: 'Discover restaurants, shops, local services and attractions near the hotel.',
    descriptions: {
      hotel: 'Hotel facilities', dining: 'Meals, barbecue & beer', cafe: 'Coffee & desserts', convenience: 'Snacks & essentials',
      pharmacy: 'Medicines & health', shopping: 'Outlets & malls', attraction: 'Local sights',
      transportation: 'Bus, subway & airport', sauna_spa: 'Saunas & spas', atm: 'Cash machines',
    },
  },
  'zh-CN': {
    kicker: 'HOTEL CONCIERGE · EXPLORE SONGDO',
    intro: '查看酒店周边的餐厅、便利设施、购物场所及旅游景点。',
    descriptions: {
      hotel: '酒店设施', dining: '餐饮、烤肉、啤酒等', cafe: '咖啡·甜点', convenience: '食品饮料·日用品',
      pharmacy: '药品·健康用品', shopping: '奥特莱斯·商场', attraction: '周边景点',
      transportation: '公交·地铁·机场交通', sauna_spa: '桑拿·水疗', atm: '自动取款机',
    },
  },
  ru: {"kicker":"HOTEL CONCIERGE · EXPLORE SONGDO","intro":"Рестораны, магазины, услуги и достопримечательности рядом с отелем.","descriptions":{"hotel":"Услуги отеля","dining":"Блюда, мясо и пиво","cafe":"Кофе и десерты","convenience":"Продукты и необходимые товары","pharmacy":"Лекарства и здоровье","shopping":"Аутлеты и торговые центры","attraction":"Местные достопримечательности","transportation":"Автобусы, метро, аэропорт","sauna_spa":"Сауны и спа","atm":"Банкоматы"}},
  ja: {
    kicker: 'HOTEL CONCIERGE · EXPLORE SONGDO',
    intro: 'ホテル周辺の飲食店、便利な施設、ショッピング、観光スポットをご案内します。',
    descriptions: {
      hotel: 'ホテル施設', dining: '食事・焼肉・ビールなど', cafe: 'コーヒー・デザート', convenience: '飲食料品・日用品',
      pharmacy: '医薬品・健康用品', shopping: 'アウトレット・商業施設', attraction: '周辺の観光名所',
      transportation: 'バス・地下鉄・空港アクセス', sauna_spa: 'サウナ・スパ', atm: '現金自動預払機',
    },
  },
}
