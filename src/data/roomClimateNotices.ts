import type { GuideLanguage } from '../types/guide.ts'

/** Operational instruction received 2026-11-25. Switch off when the hotel resumes cooling.
 * No calendar inference; both public and staff copy use this setting.
 */
export const WINTER_COOLING_UNAVAILABLE = true

type RoomClimateCopy = {
  title: string
  heatingTitle: string
  heating: string
  coolingTitle: string
  winter: string
  coolingControls: string
  seasonalControls: string
  smokingSensor: string
}
export const ROOM_CLIMATE_COPY: Record<GuideLanguage, RoomClimateCopy> = {
  ko: {
    title: '객실 온도 조절', heatingTitle: '객실 난방 조절',
    heating: '객실 난방은 객실 전화기 위에 설치된 조절 패널에서 조절하실 수 있습니다.',
    coolingTitle: '냉방 조절', winter: '동절기에는 에어컨(냉방)을 이용하실 수 없습니다.',
    coolingControls: '냉방은 화장실 입구 왼쪽 벽면의 흰색 패널 또는 에어컨 리모컨으로 조절할 수 있습니다.',
    seasonalControls: '냉방 이용이 가능한 기간에는 화장실 입구 왼쪽 벽면의 흰색 패널 또는 에어컨 리모컨으로 조절하실 수 있습니다.',
    smokingSensor: '객실 내에는 흡연 감지 센서가 설치되어 있습니다.',
  },
  en: {
    title: 'Room temperature controls', heatingTitle: 'Room heating',
    heating: 'You can adjust the room heating using the control panel located above the telephone in your room.',
    coolingTitle: 'Air conditioning (cooling)', winter: 'Air conditioning (cooling) is unavailable during the winter season.',
    coolingControls: 'Use the white wall panel to the left of the bathroom entrance or the air conditioner remote control.',
    seasonalControls: 'When cooling is available, use the white wall panel to the left of the bathroom entrance or the air conditioner remote control.',
    smokingSensor: 'Smoking detection sensors are installed in guest rooms.',
  },
  'zh-CN': {
    title: '客房温度调节', heatingTitle: '客房暖气调节',
    heating: '您可以使用客房电话上方的控制面板调节暖气。',
    coolingTitle: '空调制冷', winter: '冬季无法使用空调制冷功能。',
    coolingControls: '可使用浴室入口左侧墙上的白色控制面板或空调遥控器调节制冷。',
    seasonalControls: '在可使用制冷的期间，请使用浴室入口左侧墙上的白色控制面板或空调遥控器。',
    smokingSensor: '客房内安装了吸烟检测传感器。',
  },
  ja: {
    title: '客室の温度調節', heatingTitle: '客室の暖房調節',
    heating: '客室の暖房は、客室電話の上に設置された操作パネルで調節できます。',
    coolingTitle: '冷房の操作', winter: '冬季はエアコンの冷房機能をご利用いただけません。',
    coolingControls: '浴室入口の左側の壁にある白いパネル、またはエアコンのリモコンで冷房を調節できます。',
    seasonalControls: '冷房をご利用いただける期間は、浴室入口の左側の壁にある白いパネル、またはエアコンのリモコンで調節できます。',
    smokingSensor: '客室内には喫煙検知センサーが設置されています。',
  },
}

export function coolingNotice(language: GuideLanguage, winter = WINTER_COOLING_UNAVAILABLE): { primary: string; secondary?: string } {
  const copy = ROOM_CLIMATE_COPY[language]
  return winter ? { primary: copy.winter, secondary: copy.seasonalControls } : { primary: copy.coolingControls }
}
