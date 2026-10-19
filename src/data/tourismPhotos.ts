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
    // File 3875: the G-Tower fills the middle of the original 3:2 shot, unlike old 3882 (mostly sky).
    imageUrl: 'https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=BDB6955ECD28406&sn=79213',
    sourceUrl: 'https://www.ifez.go.kr/promote/pst/view.do?pst_id=scene_photo&pst_sn=664965',
    photographedOn: '2015-04-01',
    alt: {
      ko: 'G타워 건물 전체와 송도 센트럴파크를 한눈에 담은 전경',
      en: 'Full G-Tower building in the center of a Songdo Central Park cityscape',
      'zh-CN': 'G塔建筑位于画面中央的松岛中央公园全景',
      ja: 'Gタワーの建物全体が中央に写る松島セントラルパークの眺め',
    },
  },
  'hanok-village': {
    // File 0316: hanok rooflines with city buildings; selected from a visually inspected official photo.
    imageUrl: 'https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=82F891E36E940DF&sn=79153',
    sourceUrl: 'https://www.ifez.go.kr/promote/pst/view.do?pst_id=scene_photo&pst_sn=664955',
    photographedOn: '2015-01-05',
    alt: {
      ko: '송도 한옥마을 기와지붕과 뒤편의 현대식 고층 건물',
      en: 'Traditional tiled hanok rooftops with modern buildings behind them in Songdo',
      'zh-CN': '松岛韩屋村的传统瓦屋顶及背后的现代高层建筑',
      ja: '松島韓屋村の瓦屋根と背後にそびえる近代的な高層ビル',
    },
  },
  'haedoji-park': {
    // File 6751: use the official spring series without claiming a particular sculpture in its alt.
    imageUrl: 'https://www.ifez.go.kr/other/attach/process.file.do?TP=img&key=D1B3601E7AA9725&sn=79708',
    sourceUrl: 'https://www.ifez.go.kr/promote/pst/view.do?pst_id=scene_photo&pst_sn=665089',
    photographedOn: '2022-05-02',
    alt: {
      ko: '송도 해돋이공원의 봄철 공원 풍경',
      en: 'Spring scenery of Haedoji Park in Songdo',
      'zh-CN': '松岛迎日公园里绿树与花坛的春日风景',
      ja: '松島ヘドジ公園の春に広がる緑と花々の風景',
    },
  },
  'michuhol-park': {
    // Official 2019 spring file 9723: pavilion and pond; image also published on the IFEZ English site.
    imageUrl: 'https://www.ifez.go.kr/other/attach/process.file.do?TP=dn&key=ECC9BD5DA50E85F&sn=79476',
    sourceUrl: 'https://www.ifez.go.kr/promote/pst/view.do?pst_id=scene_photo&pst_sn=665035',
    photographedOn: '2019-04-19',
    alt: {
      ko: '미추홀공원 연못에 비친 전통 정자와 수변 산책길',
      en: 'Traditional pavilion reflected in the pond at Michuhol Park',
      'zh-CN': '弥邹忽公园池塘中倒映的韩国传统亭阁与步道',
      ja: 'ミチュホル公園の池に映る伝統的な東屋と水辺',
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
