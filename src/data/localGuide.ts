import type { GuideLanguage } from '../types/guide.ts'

/** Hotel handout provided on 2026-10-19; timetable is NOT an operator live feed. */
export const AIRPORT_LIMOUSINE_6777 = {
  routeNumber: '6777',
  destinations: ['Incheon Airport Terminal 1', 'Incheon Airport Terminal 2'],
  departures: [
    '05:27', '06:07', '06:47', '08:47', '10:27', '11:57',
    '13:27', '14:57', '16:27', '17:57', '19:27', '20:27',
  ],
} as const

export interface LocalGuideCopy {
  airportTitle: string
  routeLabel: string
  routeDescription: string
  boardingLabel: string
  boarding: string
  departuresLabel: string
  departurePlaceLabel: string
  departurePlace: string
  disclaimerTitle: string
  disclaimer: string
  fareUnknown: string
  tourismTitle: string
  tourismIntro: string
  tourismCaution: string
  staffEnglishLabel: string
  copyLabel: string
  copiedLabel: string
  copyFailedLabel: string
  guideOnlyResult: string
}

export const LOCAL_GUIDE_COPY: Record<GuideLanguage, LocalGuideCopy> = {
  ko: {
    airportTitle: '인천공항 리무진버스 6777번',
    routeLabel: '노선',
    routeDescription: '센트럴파크 → 인천공항 제1터미널 → 인천공항 제2터미널',
    boardingLabel: '승차 위치',
    boarding: '센트럴파크역 1번 출구 방향, 포스코·부영타워 인근 정류장 (호텔 안내문 기준)',
    departuresLabel: '6777번 센트럴파크 출발 예정 시각',
    departurePlaceLabel: '시간 기준',
    departurePlace: '센트럴파크 정류장 출발 시각입니다. 호텔에서 출발하는 시간이 아닙니다.',
    disclaimerTitle: '운행정보 변경 가능',
    disclaimer: '버스 시간표·노선·정류장과 운행 여부는 교통 사정, 휴일 또는 운영사 사정에 따라 변경될 수 있습니다. 탑승 전 최신 정보를 확인해 주세요.',
    fareUnknown: '요금·예약·실시간 도착 정보는 이 안내에 포함되지 않습니다.',
    tourismTitle: '송도 관광 가이드',
    tourismIntro: '호텔에서 제공한 송도컨벤시아 관광 지도를 참고한 주요 방문 장소입니다. 지도에 실린 오래된 행사와 할인권은 안내하지 않습니다.',
    tourismCaution: '관광시설의 운영시간, 입장 가능 여부와 이동 경로는 변경될 수 있습니다. 방문 전 확인해 주세요.',
    staffEnglishLabel: '직원용 영어 안내 문구',
    copyLabel: '영어 문구 복사',
    copiedLabel: '복사 완료',
    copyFailedLabel: '복사하지 못했습니다. 문구를 직접 선택해 주세요.',
    guideOnlyResult: '아래 별도 안내 자료를 확인해 주세요.',
  },
  en: {
    airportTitle: 'Incheon Airport Limousine Bus 6777',
    routeLabel: 'Route',
    routeDescription: 'Central Park → Incheon Airport Terminal 1 → Incheon Airport Terminal 2',
    boardingLabel: 'Where to board',
    boarding: 'Near POSCO Booyoung Tower, by Central Park Station Exit 1 (according to the hotel handout)',
    departuresLabel: 'Scheduled departures from Central Park',
    departurePlaceLabel: 'Important',
    departurePlace: 'These times are for the bus stop at Central Park Station, not departures from the hotel.',
    disclaimerTitle: 'Schedule subject to change',
    disclaimer: 'Bus times, routes, stops and services may change due to traffic, holidays or operator updates. Please confirm the latest information before boarding.',
    fareUnknown: 'Fares, bookings and real-time arrivals are not included in this guide.',
    tourismTitle: 'Songdo sightseeing guide',
    tourismIntro: 'A selection of places from the Songdo Convensia visitor map provided by the hotel. Old coupons and promotions are not included.',
    tourismCaution: 'Opening hours, admission and routes may change. Please check before visiting.',
    staffEnglishLabel: 'English text for front desk staff',
    copyLabel: 'Copy English',
    copiedLabel: 'Copied',
    copyFailedLabel: 'Could not copy. Please select and copy the text manually.',
    guideOnlyResult: 'See the separate guide below.',
  },
  'zh-CN': {
    airportTitle: '仁川机场豪华巴士 6777 路',
    routeLabel: '线路',
    routeDescription: '中央公园站 → 仁川机场 1 号航站楼 → 仁川机场 2 号航站楼',
    boardingLabel: '乘车地点',
    boarding: '中央公园站 1 号出口方向，POSCO·富荣大厦附近的站点（根据酒店提供的资料）',
    departuresLabel: '从中央公园站发车的计划时刻',
    departurePlaceLabel: '注意',
    departurePlace: '以下为中央公园站巴士站的发车时间，并非酒店出发时间。',
    disclaimerTitle: '时刻表可能变更',
    disclaimer: '交通状况、节假日或运营方调整可能导致班次、线路、站点和运营情况变化。乘车前请确认最新信息。',
    fareUnknown: '本指南不提供票价、预约或实时到站信息。',
    tourismTitle: '松岛旅游指南',
    tourismIntro: '根据酒店提供的松岛会展中心游客地图整理的主要景点，不包含旧优惠券或促销活动。',
    tourismCaution: '景点开放时间、入场规定及交通路线可能变更，请在出行前确认。',
    staffEnglishLabel: '前台英语短语',
    copyLabel: '复制英文',
    copiedLabel: '已复制',
    copyFailedLabel: '无法复制，请手动选择文本。',
    guideOnlyResult: '请查看下方的专项指南。',
  },
  ja: {
    airportTitle: '仁川空港リムジンバス 6777番',
    routeLabel: '運行ルート',
    routeDescription: 'セントラルパーク → 仁川空港第1ターミナル → 仁川空港第2ターミナル',
    boardingLabel: '乗り場',
    boarding: 'セントラルパーク駅1番出口方面、POSCO・ブヨンタワー付近の停留所（ホテル案内資料による）',
    departuresLabel: 'セントラルパーク停留所の発車予定時刻',
    departurePlaceLabel: 'ご注意',
    departurePlace: '以下はセントラルパーク停留所の発車時刻で、ホテル発の時刻ではありません。',
    disclaimerTitle: '運行情報は変更される場合があります',
    disclaimer: '交通状況、祝日、運行会社の都合により、時刻・ルート・停留所・運行状況が変更になる場合があります。乗車前に最新情報をご確認ください。',
    fareUnknown: '運賃・予約・リアルタイム到着情報はこの案内に含まれません。',
    tourismTitle: '松島観光ガイド',
    tourismIntro: 'ホテルで配布している松島コンベンシアの観光マップから主な見どころを紹介します。古いクーポンやキャンペーンは掲載しません。',
    tourismCaution: '施設の営業時間、入場条件や移動経路は変更される場合があります。訪問前にご確認ください。',
    staffEnglishLabel: 'フロント用英語案内',
    copyLabel: '英語をコピー',
    copiedLabel: 'コピーしました',
    copyFailedLabel: 'コピーできませんでした。文章を選択してコピーしてください。',
    guideOnlyResult: '下記の専用案内をご確認ください。',
  },
}

export const SONGDO_TOURISM_SPOTS: ReadonlyArray<{
  id: string
  name: Record<GuideLanguage, string>
  note: Record<GuideLanguage, string>
}> = [
  { id: 'central-park', name: { ko: '송도 센트럴파크', en: 'Songdo Central Park', 'zh-CN': '松岛中央公园', ja: '松島セントラルパーク' },
    note: { ko: '산책과 수변 풍경', en: 'Waterfront walks and park scenery', 'zh-CN': '滨水步道与公园风景', ja: '水辺の散歩と公園の景色' } },
  { id: 'tri-bowl', name: { ko: '트라이볼', en: 'Tri-Bowl', 'zh-CN': 'Tri-Bowl 艺术空间', ja: 'トライボウル' },
    note: { ko: '독특한 건축물과 문화공간', en: 'Distinctive architecture and cultural space', 'zh-CN': '独特建筑与文化空间', ja: '特徴的な建築と文化施設' } },
  { id: 'g-tower', name: { ko: 'G타워', en: 'G-Tower', 'zh-CN': 'G塔', ja: 'Gタワー' },
    note: { ko: '송도 전망과 IFEZ 홍보관', en: 'City views and the IFEZ exhibition', 'zh-CN': '城市景观与 IFEZ 展览', ja: '松島の眺望とIFEZ展示' } },
  { id: 'hanok-village', name: { ko: '송도 한옥마을', en: 'Songdo Hanok Village', 'zh-CN': '松岛韩屋村', ja: '松島韓屋村' },
    note: { ko: '한옥 양식 건물과 식당가', en: 'Korean-style buildings and restaurants', 'zh-CN': '韩屋建筑与餐饮场所', ja: '韓屋風の建物とレストラン' } },
  { id: 'haedoji-park', name: { ko: '해돋이공원', en: 'Haedoji Park', 'zh-CN': '日出公园', ja: '日の出公園' },
    note: { ko: '공원 산책과 녹지', en: 'Green space and walking paths', 'zh-CN': '绿地与散步路线', ja: '緑地と散歩道' } },
  { id: 'michuhol-park', name: { ko: '미추홀공원', en: 'Michuhol Park', 'zh-CN': '弥邹忽公园', ja: 'ミチュホル公園' },
    note: { ko: '전통 경관을 참고한 휴식 공간', en: 'A park with traditional landscaping', 'zh-CN': '具有传统景观的休憩公园', ja: '伝統的な景観を取り入れた公園' } },
]

export const AIRPORT_6777_STAFF_ENGLISH =
  'Bus 6777 departs from the stop near Central Park Station Exit 1, by POSCO Booyoung Tower. It goes to Incheon Airport Terminal 1 and then Terminal 2. Times and services may change, so please check the latest schedule before boarding.'
