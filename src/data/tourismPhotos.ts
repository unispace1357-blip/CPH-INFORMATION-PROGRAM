import type { GuideLanguage } from '../types/guide.ts'

/**
 * Archived pictures distributed by Incheon Free Economic Zone Authority (IFEZ).
 * Each source page explicitly licenses its contents under Korea Open Government
 * License (KOGL) Type 1 (attribution required, commercial reuse permitted).
 * External image links can expire or prohibit embedding; the UI falls back to the
 * original credited source page if the picture cannot load.
 */
export interface TourismPhoto {
  readonly imageUrl: string
  readonly sourceUrl: string
  readonly photographedOn: string
  readonly alt: Readonly<Record<GuideLanguage, string>>
}

export const TOURISM_PHOTOS: Readonly<Record<string, TourismPhoto>> = {
  'central-park': {
    imageUrl: 'https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=BBF6B536673A5B2&sn=85706',
    sourceUrl: 'https://www.ifez.go.kr/promote/pst/view.do?pst_id=scene_photo&pst_sn=667087',
    photographedOn: '2024-09-23',
    alt: {
      ko: '송도 센트럴파크 수로, 보행교 및 주변 건물의 낮 풍경',
      en: 'Daytime view of Songdo Central Park canal, footbridge and surrounding buildings',
      'zh-CN': '松岛中央公园水道、步行桥与周边建筑的日间景观',
      ja: '松島セントラルパークの水路、歩道橋と周辺建物の昼景',
    },
  },
  'tri-bowl': {
    imageUrl: 'https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=045DA12E9951914&sn=77775',
    sourceUrl: 'https://www.ifez.go.kr/promote/pst/view.do?pst_id=scene_photo&pst_sn=249272',
    photographedOn: '2009-08-06',
    alt: {
      ko: '화려한 조명이 켜진 트라이볼의 곡선형 건축물 야경',
      en: 'Nighttime view of the illuminated curved Tri-Bowl cultural building',
      'zh-CN': '灯光点缀下的曲面建筑 Tri-Bowl 夜景',
      ja: 'ライトアップされた曲面建築トライボウルの夜景',
    },
  },
  'g-tower': {
    imageUrl: 'https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=BDB6955ECD28406&sn=79214',
    sourceUrl: 'https://www.ifez.go.kr/promote/pst/view.do?pst_id=scene_photo&pst_sn=664965',
    photographedOn: '2015-04-01',
    alt: {
      ko: '송도 센트럴파크 수로 옆 G타워 건물과 주변 도시 풍경',
      en: 'G-Tower beside Songdo Central Park canal and surrounding city skyline',
      'zh-CN': '松岛中央公园水道旁的 G 塔及周边城市景观',
      ja: '松島セントラルパークの水路沿いのGタワーと街並み',
    },
  },
} as const

export interface TourismPhotoUi {
  readonly photoLabel: string
  readonly sourceLabel: string
  readonly photoUnavailable: string
  readonly historicNotice: string
}

export const TOURISM_PHOTO_UI: Readonly<Record<GuideLanguage, TourismPhotoUi>> = {
  ko: {
    photoLabel: '사진',
    sourceLabel: '출처: 인천경제자유구역청(IFEZ) · 공공누리 제1유형(출처표시)',
    photoUnavailable: '사진을 불러올 수 없습니다. 출처 페이지에서 확인해 주세요.',
    historicNotice: '과거 촬영된 참고 사진으로, 현재 시설 상태와 다를 수 있습니다.',
  },
  en: {
    photoLabel: 'Photograph',
    sourceLabel: 'Source: Incheon Free Economic Zone Authority (IFEZ) · KOGL Type 1 (attribution)',
    photoUnavailable: 'Photo unavailable. Please view it on the source website.',
    historicNotice: 'An archival photo; the site may look different today.',
  },
  'zh-CN': {
    photoLabel: '照片',
    sourceLabel: '来源：仁川经济自由区厅（IFEZ）· 韩国公共著作物自由利用许可第1类（署名）',
    photoUnavailable: '无法加载照片。请前往来源网页查看。',
    historicNotice: '历史参考照片，设施现状可能不同。',
  },
  ja: {
    photoLabel: '写真',
    sourceLabel: '出典：仁川経済自由区域庁（IFEZ）・韓国公共著作物自由利用許諾第1類（出典表示）',
    photoUnavailable: '写真を読み込めません。出典ページをご確認ください。',
    historicNotice: '過去の参考写真です。現在の施設とは異なる場合があります。',
  },
} as const
