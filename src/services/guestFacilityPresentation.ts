import type { Facility } from '../types/facility.ts'
import type { GuideLanguage } from '../types/guide.ts'
import { TIMESPACE_CATEGORY_ORDER, timespaceCategoryLabel } from './timespaceDirectory.ts'
import { specialRouteNotice } from './routeAccuracy.ts'

/**
 * Customer-facing presentation only. The source facility descriptions, operational
 * caveats and staff scripts remain intact for the front desk and administration.
 */
export const GUEST_FACILITY_COPY: Record<GuideLanguage, {
  timespaceSummary: string
  menuTitle: string
  nearbyLandmark: string
  timespaceRouteNotice: string
  travelDetails: string
  mapUnavailable: string
}> = {
  ko: {
    timespaceSummary: '다양한 음식점과 쇼핑 시설이 모여 있는 복합상업시설입니다.',
    menuTitle: '대표 음식과 메뉴',
    nearbyLandmark: '인근 기준점까지 도보',
    timespaceRouteNotice: '현재 네이버 길찾기는 인근 스타벅스 송도캐슬파크점에서 끝납니다. 송도 타임스페이스(하모니로 158)까지 조금 더 이동해 주세요.',
    travelDetails: '자세한 이동 안내',
    mapUnavailable: '지도 길찾기 준비 중',
  },
  en: {
    timespaceSummary: 'A shopping and dining complex with a variety of restaurants.',
    menuTitle: 'Food and menu highlights',
    nearbyLandmark: 'Walk to nearby landmark',
    timespaceRouteNotice: 'The current Naver walking route ends at Starbucks Songdo Castle Park nearby. Continue on to Songdo Timespace at 158 Harmony-ro.',
    travelDetails: 'More travel information',
    mapUnavailable: 'Map directions coming soon',
  },
  'zh-CN': {
    timespaceSummary: '汇集多家餐厅与购物设施的综合商业区。',
    menuTitle: '特色餐饮与菜品',
    nearbyLandmark: '步行至附近地标',
    timespaceRouteNotice: '当前 Naver 步行路线的终点是附近的星巴克 Songdo Castle Park 店。请继续前往 Harmony-ro 158 的松岛 Timespace。',
    travelDetails: '查看详细交通信息',
    mapUnavailable: '路线导航准备中',
  },
  ja: {
    timespaceSummary: '飲食店やショッピング施設が集まる複合商業施設です。',
    menuTitle: 'おすすめの料理・メニュー',
    nearbyLandmark: '近くの目印まで徒歩',
    timespaceRouteNotice: '現在のNAVER徒歩経路は近くのスターバックス松島キャッスルパーク店が終点です。そこからHarmony-ro 158の松島タイムスペースまでお進みください。',
    travelDetails: '詳しいアクセス案内',
    mapUnavailable: '経路案内は準備中',
  },
}

export const TIMESPACE_FACILITY_ID = 'songdo-timespace-complex'

const MENU_EXAMPLES = /^(.*?) · (?:주요 메뉴 예시|Menu examples|菜品示例|メニュー例)[:：]\s*(.+)$/u

export function guestFacilityPresentation(facility: Facility, language: GuideLanguage): {
  summary: string
  menuExamples: string[]
  routeNotice: string | null
} {
  const copy = GUEST_FACILITY_COPY[language]
  if (facility.id === TIMESPACE_FACILITY_ID) {
    return {
      summary: copy.timespaceSummary,
      menuExamples: TIMESPACE_CATEGORY_ORDER.filter(category => category !== 'all').map(category => timespaceCategoryLabel(category, language)),
      routeNotice: specialRouteNotice(facility.id, language) ?? copy.timespaceRouteNotice,
    }
  }
  const description = facility.translations[language].description.trim()
  const parsed = description.match(MENU_EXAMPLES)
  return {
    summary: parsed ? parsed[1]!.trim() : description,
    menuExamples: parsed ? parsed[2]!.split(/[,，、]/u).map(item => item.trim()).filter(Boolean) : [],
    routeNotice: specialRouteNotice(facility.id, language),
  }
}

export function guestFacilityCardTeaser(facility: Facility, language: GuideLanguage): string {
  const { summary, menuExamples } = guestFacilityPresentation(facility, language)
  return menuExamples.length ? `${summary} · ${menuExamples.slice(0, 3).join(' · ')}` : summary
}
