import type { GuideLanguage } from '../types/guide.ts'

/**
 * Coordinates are approximate reference points from open place records (OpenStreetMap contributors).
 * This is a tiny original collection of facts, NOT an extract of a map image or road network.
 * Do not infer travel time, walking routes, access gates, or distances from them.
 */
export interface TourismMapPoint {
  id: string
  lat: number
  lon: number
  category: 'park' | 'culture' | 'view' | 'heritage'
  // Naver URLs with previously user-confirmed origin/destination are taken from existing facility data.
  linkedFacilityId?: string
  naverSearch: string
  detail: Record<GuideLanguage, string>
}

export const SONGDO_MAP_POINTS: readonly TourismMapPoint[] = [
  {
    id: 'central-park', lat: 37.39409, lon: 126.63101, category: 'park',
    linkedFacilityId: 'songdo-central-park', naverSearch: '송도 센트럴파크',
    detail: {
      ko: '도심 수로를 따라 산책하며 송도의 녹지와 건축 풍경을 볼 수 있는 공원입니다. 수상택시는 별도 웨스트보트하우스 승선장을 이용합니다.',
      en: 'Walk beside the canal and enjoy the parkland and architecture of Songdo. The water taxi uses a separate boarding point at the West Boathouse.',
      'zh-CN': '可沿着城市水道散步，欣赏松岛的绿地和建筑景观。水上出租车需在西船屋的专用登船点乘坐。',
      ja: '運河沿いを散歩しながら、松島の緑地と街並みを楽しめる公園です。水上タクシーは別のウェストボートハウスから乗船します。',
    },
  },
  {
    id: 'tri-bowl', lat: 37.39425, lon: 126.63486, category: 'culture', naverSearch: '송도 트라이볼',
    detail: {
      ko: '세 개의 그릇을 떠올리게 하는 곡면 건축이 특징인 문화공간입니다. 건물 외관 감상과 사진 촬영에 적합하며 내부 행사 일정은 별도 확인이 필요합니다.',
      en: 'A cultural venue known for its three bowl-shaped architectural forms. The exterior is popular for photographs; check the current schedule for indoor events.',
      'zh-CN': '以三个碗形曲面建筑闻名的文化空间，适合欣赏建筑外观和拍照。室内活动请事先确认日程。',
      ja: '3つの器を思わせる曲面建築が特徴の文化施設です。外観見学や写真撮影に適しており、館内イベントは事前確認が必要です。',
    },
  },
  {
    id: 'g-tower', lat: 37.39609, lon: 126.63428, category: 'view',
    linkedFacilityId: 'g-tower-ifez-observatory', naverSearch: '인천 송도 G타워',
    detail: {
      ko: '송도 국제도시의 풍경을 조망하는 G타워 33층 IFEZ 홍보관 전망대가 있습니다. 관람 가능 시간과 휴관일을 먼저 확인해 주세요.',
      en: 'Visit the 33rd-floor IFEZ observatory for views of Songdo. Check visiting hours and closure dates before going.',
      'zh-CN': 'G塔33层设有IFEZ展示与观景空间，可眺望松岛国际城。请事先确认开放时间及休馆日期。',
      ja: '33階にIFEZ広報館の展望スペースがあり、松島の街並みを見渡せます。観覧時間と休館日は事前にご確認ください。',
    },
  },
  {
    id: 'hanok-village', lat: 37.39071, lon: 126.63923, category: 'heritage', naverSearch: '송도 한옥마을',
    detail: {
      ko: '전통 한옥 양식의 건물과 음식점이 모인 구역입니다. 역사적인 마을 유적지가 아닌 관광·외식 공간이므로 방문 목적에 맞게 안내해 주세요.',
      en: 'A cluster of Korean-style buildings and restaurants. It is a modern dining and sightseeing area, not a preserved historic village.',
      'zh-CN': '汇集韩屋风格建筑和餐厅的现代观光餐饮区，并非保存下来的历史古村落。',
      ja: '韓屋風の建物とレストランが集まる現代の観光・飲食エリアで、保存された歴史的集落ではありません。',
    },
  },
  {
    id: 'haedoji-park', lat: 37.38766, lon: 126.65456, category: 'park', naverSearch: '송도 해돋이공원',
    detail: {
      ko: '산책로와 녹지, 연못 등을 갖춘 송도의 공원입니다. 장미원·음악분수 등 시설은 계절과 관리 일정에 따라 이용이 달라질 수 있습니다.',
      en: 'A Songdo park with walking paths, greenery and ponds. Seasonal areas such as rose gardens and fountains may operate at different times.',
      'zh-CN': '拥有步道、绿地和池塘的公园。玫瑰园、音乐喷泉等设施可能因季节和管理安排而变化。',
      ja: '散策路や緑地、池がある公園です。バラ園や噴水などは季節や管理日程によって利用状況が変わります。',
    },
  },
  {
    id: 'michuhol-park', lat: 37.38222, lon: 126.64957, category: 'park', naverSearch: '송도 미추홀공원',
    detail: {
      ko: '전통 정원 요소와 산책 공간을 갖춘 공원으로, 도심에서 한적하게 쉬거나 가볍게 걷기 좋습니다.',
      en: 'A peaceful urban park with traditional-style landscaping and paths for a relaxed walk.',
      'zh-CN': '具有传统庭园元素和散步空间的城市公园，适合轻松漫步与休息。',
      ja: '伝統的な庭園の要素や散策路があり、落ち着いて散歩や休憩を楽しめる都市公園です。',
    },
  },
]

export const HOTEL_MAP_POINT = { lat: 37.39059, lon: 126.63735 } as const

// Longitude/latitude positions are scaled to a drawing. No base map, roads, or routing.
export function approximateMapPosition(lat: number, lon: number): { x: number; y: number } {
  const minLon = 126.626, maxLon = 126.659
  const minLat = 37.379, maxLat = 37.399
  const x = 10 + 80 * (lon - minLon) / (maxLon - minLon)
  const y = 8 + 84 * (maxLat - lat) / (maxLat - minLat)
  return { x: Math.max(6, Math.min(94, x)), y: Math.max(6, Math.min(94, y)) }
}

export interface TourismMapUi {
  diagramTitle: string
  diagramSubtitle: string
  north: string
  hotelLabel: string
  placesTitle: string
  selectedLabel: string
  directionsLink: string
  searchLink: string
  uncertainty: string
  mapCredit: string
}

export const TOURISM_MAP_UI: Record<GuideLanguage, TourismMapUi> = {
  ko: {
    diagramTitle: '송도 관광 위치 안내도',
    diagramSubtitle: '자체 제작 위치 개념도 · 실제 도로·거리·이동 동선을 표시한 지도가 아닙니다.',
    north: '북',
    hotelLabel: '송도센트럴파크호텔',
    placesTitle: '관광지 선택',
    selectedLabel: '장소 설명',
    directionsLink: '호텔 출발 네이버 길찾기',
    searchLink: '네이버 지도에서 장소 검색',
    uncertainty: '실제 이동 경로는 네이버 지도에서 확인해 주세요. 관광지별 운영시간과 이용 가능 여부는 변경될 수 있습니다.',
    mapCredit: '위치 참고: © OpenStreetMap contributors (ODbL). 지도 그림·레이아웃은 자체 제작이며 타사 지도 타일을 사용하지 않습니다.',
  },
  en: {
    diagramTitle: 'Songdo sightseeing location guide',
    diagramSubtitle: 'Original schematic · Not a street map and not suitable for navigation or distance estimates.',
    north: 'N',
    hotelLabel: 'Songdo Central Park Hotel',
    placesTitle: 'Choose a place',
    selectedLabel: 'About this place',
    directionsLink: 'Directions from the hotel (Naver)',
    searchLink: 'Find this place on Naver Map',
    uncertainty: 'Use Naver Map for actual routes. Opening hours and access to attractions may change.',
    mapCredit: 'Location references: © OpenStreetMap contributors (ODbL). Original drawing; no third-party map tiles.',
  },
  'zh-CN': {
    diagramTitle: '松岛景点位置示意图',
    diagramSubtitle: '原创位置示意图，并非道路地图，不用于导航或估算距离。',
    north: '北',
    hotelLabel: '松岛中央公园酒店',
    placesTitle: '选择景点',
    selectedLabel: '景点介绍',
    directionsLink: '从酒店出发的Naver路线',
    searchLink: '在Naver地图搜索地点',
    uncertainty: '实际路线请使用Naver地图。景点开放时间及入场情况可能发生变化。',
    mapCredit: '位置参考：© OpenStreetMap contributors (ODbL)。示意图为原创，未使用第三方地图瓦片。',
  },
  ja: {
    diagramTitle: '松島観光スポット位置案内',
    diagramSubtitle: '独自制作の位置概略図です。道路地図ではなく、経路案内や距離の目安には使えません。',
    north: '北',
    hotelLabel: '松島セントラルパークホテル',
    placesTitle: '観光地を選択',
    selectedLabel: 'スポット紹介',
    directionsLink: 'ホテルからのNaver経路案内',
    searchLink: 'Naverマップで場所を検索',
    uncertainty: '実際の移動経路はNaverマップでご確認ください。営業時間・入場可否は変更される場合があります。',
    mapCredit: '位置情報の参考：© OpenStreetMap contributors (ODbL)。図は独自制作で、他社の地図タイルは使用していません。',
  },
}
