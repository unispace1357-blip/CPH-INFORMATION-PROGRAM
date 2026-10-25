import type { GuideLanguage } from '../types/guide.ts'

export type HoursSegmentKind = 'schedule'|'break'|'lastOrder'|'lastEntry'|'delivery'|'note'
export type HoursSegment = { kind: HoursSegmentKind; text: string }
export const HOURS_COPY:Record<GuideLanguage,{
  schedule:string;break:string;lastOrder:string;lastEntry:string;delivery:string;note:string;unverified:string;empty:string
}>={
  ko:{schedule:'등록 영업시간',break:'브레이크·휴게',lastOrder:'라스트오더',lastEntry:'입장 마감',delivery:'배달 시간',note:'참고',unverified:'현재 영업 중 여부는 확인되지 않았습니다. 방문 전 영업시간·휴무를 확인해 주세요.',empty:'영업시간 미확인'},
  en:{schedule:'Listed hours',break:'Break',lastOrder:'Last order',lastEntry:'Last entry',delivery:'Delivery hours',note:'Note',unverified:'Live opening status is not verified. Please confirm hours and closing days before visiting.',empty:'Opening hours not confirmed'},
  'zh-CN':{schedule:'登记营业时间',break:'休息时间',lastOrder:'最后点单',lastEntry:'最晚入场',delivery:'配送时间',note:'备注',unverified:'无法实时确认是否营业，请出发前核对营业时间及休息日。',empty:'营业时间待确认'},
  ja:{schedule:'登録営業時間',break:'休憩時間',lastOrder:'ラストオーダー',lastEntry:'最終入場',delivery:'デリバリー時間',note:'補足',unverified:'現在営業中かどうかは未確認です。訪問前に営業時間・休業日をご確認ください。',empty:'営業時間未確認'},
}
const classification:[HoursSegmentKind,RegExp][]=[
  ['lastEntry',/입장\s*마감|last\s*entry|最晚入场|最終入場/i],
  ['lastOrder',/라스트\s*오더|라스트오더|last\s*order|最后点单|ラストオーダー/i],
  ['break',/브레이크|휴게시간|\bbreak\b|休息时间|休憩/i],
  ['delivery',/배달|\bdelivery\b|配送|デリバリー/i],
]
const segmentKind=(value:string):HoursSegmentKind=>classification.find(([,test])=>test.test(value))?.[0]??'note'
const clean=(s:string)=>s.trim().replace(/^[,;，；/\s]+|[,;，；/\s]+$/g,'').trim()

/** A faithful rendering of the *stored* string; it never computes "open now". */
export function segmentOperatingHours(value:string):HoursSegment[] {
  const input=value.trim()
  if(!input)return []
  const normalized=input.replace(/（/g,'(').replace(/）/g,')')
  const main=clean(normalized.replace(/\(([^()]*)\)/g,' ').replace(/\s{2,}/g,' '))
  const parens=[...normalized.matchAll(/\(([^()]*)\)/g)].map(m=>m[1]??'')
  const segments:HoursSegment[]=[]
  if(main){
    // Split clearly delimited trailing last-order notes; preserve ambiguous schedules verbatim.
    const pieces=main.split(/(?=\b(?:last\s*order|last\s*entry)\b|라스트\s*오더|最后点单|最晚入场|ラストオーダー|最終入場)/i)
    for(const piece of pieces){
      const text=clean(piece)
      if(!text)continue
      const kind=segmentKind(text)
      segments.push({kind:kind==='note'?'schedule':kind,text})
    }
  }
  for(const p of parens)for(const part of p.split(/\s*[,，;；]\s*/)){
    const text=clean(part)
    if(text)segments.push({kind:segmentKind(text),text})
  }
  return segments.length?segments:[{kind:'schedule',text:input}]
}
