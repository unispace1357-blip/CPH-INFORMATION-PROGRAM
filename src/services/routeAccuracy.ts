import type { Facility } from '../types/facility.ts'
import type { GuideLanguage } from '../types/guide.ts'
import { validatedNaverMapUrl } from './naverMapUrl.ts'

export interface RouteEndpoint {
  originName: string
  originPoiId: string
  destinationName: string
  destinationPoiId: string
  mode: string
}

/** Parse only validated Naver directions, never treat URL syntax as live route proof. */
export function parseRegisteredRoute(value: unknown): RouteEndpoint | null {
  const safe=validatedNaverMapUrl(value)
  if(!safe) return null
  const url=new URL(safe)
  if(url.hostname!=='map.naver.com') return null
  try {
    const sections=url.pathname.split('/').slice(1).map(decodeURIComponent)
    const point=(raw:string)=>{
      const segments=raw.split(',')
      if(segments.length<5 || segments.at(-1)!=='PLACE_POI') return null
      return {name:segments.slice(2,-2).join(','),id:segments.at(-2)!}
    }
    const origin=point(sections[2]??'')
    const destination=point(sections[3]??'')
    if(!origin||!destination) return null
    return {originName:origin.name,originPoiId:origin.id,destinationName:destination.name,destinationPoiId:destination.id,mode:sections[5]??''}
  }catch{return null}
}

/** Known multi-floor / endpoint mismatches are explicit rather than hiding them. */
export const ROUTE_SPECIAL_ENDPOINTS = {
  'songdo-timespace-complex':'landmark',
  'incheon-port-hangdong-7ga':'terminal',
  'songdo-central-park-water-taxi':'boarding',
  'g-tower-ifez-observatory':'building',
} as const
export type RouteSpecialKind = (typeof ROUTE_SPECIAL_ENDPOINTS)[keyof typeof ROUTE_SPECIAL_ENDPOINTS]
const messages: Record<RouteSpecialKind,Record<GuideLanguage,string>> = {
  landmark:{
    ko:'지도 도착지는 타임스페이스 건물이 아닌 인근 스타벅스 송도캐슬파크점입니다. 도착 후 하모니로 158까지 추가 이동하세요. 15분(835m)은 스타벅스 기준입니다.',
    en:'This route ends at Starbucks Songdo Castle Park near Timespace, not at the Timespace building. Continue to 158 Harmony-ro. The 15 min / 835 m estimate ends at Starbucks.',
    'zh-CN':'路线终点是 Timespace 附近的星巴克 Songdo Castle Park 店，并非 Timespace 大楼。请继续前往 Harmony-ro 158。15分钟（835米）为到星巴克的距离。',
    ja:'経路の終点はタイムスペース本館ではなく、近隣のスターバックス松島キャッスルパーク店です。ハーモニーロ158までさらに移動してください。15分（835m）はスターバックスまでの目安です。',
  },
  terminal:{
    ko:'지도 도착지는 인천항 전체가 아니라 인천항 연안여객터미널입니다. 국제여객터미널 등 다른 목적지는 별도 확인하세요.',
    en:'The map destination is Incheon Coastal Passenger Terminal, not every Incheon Port terminal. Confirm a different terminal separately.',
    'zh-CN':'地图终点为仁川港沿岸客运站，不代表仁川港所有码头。其他客运站请另行确认。',
    ja:'地図の目的地は仁川港沿岸旅客ターミナルです。仁川港の全ターミナルではありません。他のターミナルは別途ご確認ください。',
  },
  boarding:{
    ko:'지도는 수상택시 승선 시설인 웨스트보트하우스로 안내합니다. 운항·탑승 위치는 방문 전 운영사에 확인하세요.',
    en:'The map leads to West Boathouse, the water-taxi boarding area. Confirm sailings and boarding arrangements before visiting.',
    'zh-CN':'地图终点是水上出租车乘船点 West Boathouse。请在出发前确认班次与登船地点。',
    ja:'地図は水上タクシーの乗船場所（ウェストボートハウス）を案内します。運航と乗船場所は事前にご確認ください。',
  },
  building:{
    ko:'지도 도착지는 G타워 건물입니다. IFEZ 홍보관 전망대는 건물 33층에 있습니다. 29층 하늘정원과는 별도 시설입니다.',
    en:'The map ends at the G-Tower building. The IFEZ observatory is on the 33rd floor; the 29th-floor sky garden is a separate facility.',
    'zh-CN':'地图终点为 G-Tower 大楼。IFEZ 展望台位于 33 层，与 29 层空中花园不同。',
    ja:'地図はGタワーの建物まで案内します。IFEZ展望台は33階にあり、29階のスカイガーデンとは別施設です。',
  },
}
export function specialRouteNotice(facilityId:string,language:GuideLanguage):string|null {
  const kind=ROUTE_SPECIAL_ENDPOINTS[facilityId as keyof typeof ROUTE_SPECIAL_ENDPOINTS]
  return kind ? messages[kind][language] : null
}

/** Human review needed: syntax/POI text checks never assert physical pin accuracy. */
export function auditFacilityRoute(facility:Facility):{
  facilityId:string
  name:string
  originMatches:boolean
  routeRegistered:boolean
  destinationLabel:string|null
  routeMode:string|null
  review:string[]
} {
  const route=parseRegisteredRoute(facility.naverMapUrl)
  const review:string[]=[]
  if(!route) review.push('수동 검수: 네이버 길찾기 POI 형식·경로 점검 필요')
  else {
    if(route.originPoiId!=='19398065' || route.originName!=='송도센트럴파크호텔')
      review.push('출발지와 호텔 POI 불일치')
    if(!['walk','transit','car','bike','bicycle'].includes(route.mode))
      review.push('이동 수단 재확인')
    if(route.mode!=='walk' && facility.walkingMinutes!==null)
      review.push('도보시간이 비도보 경로와 함께 등록됨')
  }
  const special=ROUTE_SPECIAL_ENDPOINTS[facility.id as keyof typeof ROUTE_SPECIAL_ENDPOINTS]
  if(special) review.push('도착지 보충안내 필요: '+special)
  if(!facility.lastVerifiedAt) review.push('마지막 현장 확인일 미등록')
  return {facilityId:facility.id,name:facility.translations.ko.name,
    originMatches:!!route&&route.originPoiId==='19398065'&&route.originName==='송도센트럴파크호텔',
    routeRegistered:!!route,destinationLabel:route?.destinationName??null,routeMode:route?.mode??null,review}
}
