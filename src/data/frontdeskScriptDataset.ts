import rawScripts from './frontdesk-scripts.json' with { type: 'json' }
import { parseFrontdeskScriptDataset } from './validateFrontdeskScriptDataset.ts'
import type { FrontdeskScript, FrontdeskScriptDataset } from '../types/frontdeskScript.ts'
import { coolingNotice, ROOM_CLIMATE_COPY, WINTER_COOLING_UNAVAILABLE } from './roomClimateNotices.ts'

/** Apply the current operational amendment without rewriting the historical script snapshot. */
export function applyRoomClimateScripts(dataset: FrontdeskScriptDataset, winter = WINTER_COOLING_UNAVAILABLE): FrontdeskScriptDataset {
  const ko = ROOM_CLIMATE_COPY.ko, en = ROOM_CLIMATE_COPY.en
  const koCooling = coolingNotice('ko', winter), enCooling = coolingNotice('en', winter)
  const heating: FrontdeskScript = {
    id: 'room-heating-controls', category: 'room-usage', title: '객실 난방 조절',
    keywords: ['난방', '히터', '온도', '전화기', 'heating', 'heater', 'temperature', 'telephone'],
    question: { en: 'How do I adjust the room heating?', ko: '객실 난방은 어떻게 조절하나요?' },
    quickAnswer: { en: en.heating, ko: ko.heating },
    staffChecks: ['난방과 냉방 조절 패널 위치 구분'],
    sourceType: 'user-provided', sourceSection: null, reviewStatus: 'draft', lastVerifiedAt: null,
  }
  const scripts = dataset.scripts.flatMap(script => {
    if (script.id === 'air-conditioning-controls') {
      const cooling: FrontdeskScript = {
        ...script, title: '에어컨·냉방 조절', keywords: [...script.keywords, '냉방 조절', 'cooling', '동절기', '겨울'],
        quickAnswer: { en: enCooling.primary, ko: koCooling.primary },
        details: { en: enCooling.secondary ?? en.coolingControls, ko: koCooling.secondary ?? ko.coolingControls },
        staffChecks: ['현재 안내 내용은 냉방 조절 기준', '난방 조절 패널은 객실 전화기 위에 위치'],
      }
      return [cooling, heating]
    }
    if (script.id === 'indoor-smoking-policy') return [{
      ...script, keywords: [...script.keywords, '흡연센서', '흡연 감지 센서', 'smoking detection sensor'],
      quickAnswer: { en: script.quickAnswer.en + ' ' + en.smokingSensor, ko: script.quickAnswer.ko + ' ' + ko.smokingSensor },
      details: { en: (script.details?.en ?? script.quickAnswer.en) + ' ' + en.smokingSensor, ko: (script.details?.ko ?? script.quickAnswer.ko) + ' ' + ko.smokingSensor },
    }]
    return [script]
  })
  return parseFrontdeskScriptDataset({ ...dataset, scripts })
}

/** Staff-only lazy dataset; validation still rejects unreviewed production scripts. */
export const frontdeskScriptDataset = applyRoomClimateScripts(parseFrontdeskScriptDataset(rawScripts))
