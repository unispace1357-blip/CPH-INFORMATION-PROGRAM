import { useState } from 'react'
import type { ReactNode } from 'react'
import type { OperationArticle } from '../../data/staffOperations'
import { hasVisualGuide } from '../../data/staffVisualGuideIds'

const glyphs = {
  tv: 'M3 4h18v13H3z M8 21h8 M12 17v4',
  remote: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M10 6h4 M12 10v4 M10 12h4 M10 18h4',
  home: 'm3 11 9-8 9 8 M5 10v11h14V10 M10 21v-7h4v7',
  settings: 'M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.5 5.5l2 2 M16.5 16.5l2 2 M5.5 18.5l2-2 M16.5 7.5l2-2 M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  wifi: 'M2 8a15 15 0 0 1 20 0 M5 12a10 10 0 0 1 14 0 M8 16a5 5 0 0 1 8 0 M12 20h.01',
  reset: 'M4 11a8 8 0 1 1 2 6 M4 4v7h7',
  check: 'm4 12 5 5 11-11',
  speaker: 'M3 9h4l6-5v16l-6-5H3z M16 8a6 6 0 0 1 0 8 M19 5a10 10 0 0 1 0 14',
  card: 'M3 5h18v14H3z M3 9h18 M6 15h4',
  door: 'M4 21V3h14v18 M2 21h20 M14 12h.01',
  alert: 'M12 3 2 21h20z M12 9v5 M12 17h.01',
  phone: 'M4 3h4l2 5-3 2a15 15 0 0 0 7 7l2-3 5 2v4c-9 3-20-8-17-17z',
  thermometer: 'M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0z M12 8v9',
  window: 'M3 3h18v18H3z M12 3v18 M3 12h18',
  bath: 'M2 12h20v2a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z M5 12V5a3 3 0 0 1 6 0v2 M5 20v2 M19 20v2',
  elevator: 'M3 3h18v18H3z M12 3v18 M6 10l3-3 M6 10l3 3 M18 14l-3-3 M18 14l-3 3',
  shirt: 'm7 3 5 3 5-3 5 5-4 4-2-2v11H8V10l-2 2-4-4z',
  fridge: 'M5 2h14v20H5z M5 9h14 M8 5v2 M8 12v4',
  coffee: 'M3 7h13v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z M16 8h3a3 3 0 0 1 0 6h-3 M3 22h15',
  ticket: 'M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4z M12 5v2 M12 10v4 M12 17v2',
  clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z M12 7v5l4 2',
  pet: 'M6 10a2 3 0 1 0 0-6 2 3 0 0 0 0 6 M18 10a2 3 0 1 0 0-6 2 3 0 0 0 0 6 M10 7a2 3 0 1 0 0-6 2 3 0 0 0 0 6 M14 7a2 3 0 1 0 0-6 2 3 0 0 0 0 6 M5 18c0-3 4-7 7-7s7 4 7 7-3 4-7 2c-4 2-7 1-7-2z',
  document: 'M5 2h10l4 4v16H5z M15 2v5h4 M8 12h8 M8 16h8',
} as const
type Glyph = keyof typeof glyphs
function Symbol({name}: {name: Glyph}) {
  return <svg className="visual-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={glyphs[name]}/></svg>
}
type Step = { title: string; detail?: string; icon?: Glyph; warn?: boolean }
function Node({title,detail,icon,warn}: Step) {
  return <div className={'visual-node'+(warn?' visual-node--warning':'')}>{icon&&<Symbol name={icon}/>}<strong>{title}</strong>{detail&&<span>{detail}</span>}</div>
}
function Flow({steps,grid=false}:{steps:readonly Step[];grid?:boolean}) {
  return <ol className={'visual-flow'+(grid?' visual-flow--grid':'')}>{steps.map((step,i)=><li key={i}><span className="visual-step-index">{i+1}</span><Node {...step}/>{!grid&&i<steps.length-1&&<span className="visual-down" aria-hidden="true">↓</span>}</li>)}</ol>
}
function Branch({question,yes,no,footer}:{question:Step;yes:Step;no:Step;footer?:string}) {
  return <div className="visual-branch">
    <Node {...question}/>
    <svg className="visual-connector" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><path d="M50 0 V10 H25 V24 M50 10 H75 V24" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/></svg>
    <div className="visual-branch-pair"><Node {...yes}/><Node {...no}/></div>
    {footer&&<div className="visual-callout"><Symbol name="alert"/><span>{footer}</span></div>}
  </div>
}
function Callout({children}:{children:ReactNode}) {return <div className="visual-callout"><Symbol name="alert"/><span>{children}</span></div>}
function Cards({items}:{items:readonly Step[]}) {return <div className="visual-cards">{items.map(item=><Node key={item.title} {...item}/>)}</div>}
function RoomChange({article}:{article:OperationArticle}) {
  const [mode,setMode]=useState(0)
  const modes=['입실 전 1박','입실 전 장박','입실 후']
  const branches: Step[][]=[
    [{title:'객실료 고정',icon:'card'},{title:'룸타입 조회 및 객실 배정'},{title:'재변경 불가 안내 · 리마크 작성',detail:'DTW > DBP 임의변경 재변경 불가 안내완료',icon:'document'}],
    [{title:'객실료 고정 금지',warn:true,icon:'alert'},{title:'일자별 객실료 메모장에 기록',icon:'document'},{title:'룸타입 변경 및 객실 배정'},{title:'재변경 불가 안내 · 리마크 작성'},{title:'퇴실 화면에서 기존 일별요금으로 수정'}],
    [{title:'올라갔다가 바로 내려온 경우 · 객실 사용 여부 확인',icon:'door'},{title:'미사용: 퇴실 → 폴리오 → 객실 변경'},{title:'기존 객실 LS 룸터치 설정'},{title:'H/K 룸터치 요청'},{title:'예약실에 룸타입 변경 전달'}],
  ]
  return <>
    <Flow steps={[{title:'사용 가능 객실 수 확인',icon:'door'},{title:'인차지 보고 및 승인',icon:'check'}]}/>
    <div className="visual-mode-controls" role="group" aria-label="룸타입 변경 상황 선택">{modes.map((label,i)=><button type="button" key={label} aria-pressed={mode===i} onClick={()=>setMode(i)}>{label}</button>)}</div>
    {branches.map((steps,i)=><section key={modes[i]} className={'visual-mode-panel'+(mode===i?' is-active':'')} aria-label={modes[i]}><h4>{modes[i]}</h4><Flow steps={steps}/>{i===2&&<Callout>{article.followUp}</Callout>}</section>)}
    <div className="visual-final"><Symbol name="check"/><strong>최종 확인</strong><span>{article.steps[9]}</span></div>
  </>
}
function Elevator() {
  return <><div className="visual-elevator-head"><Symbol name="elevator"/><strong>엘리베이터 인접 객실</strong></div>
    {[{label:'더블',rooms:['04','05','06','07'],front:'06'},{label:'트윈',rooms:['22','23','24','25'],front:'24'}].map(group=><div key={group.label} className="visual-room-line"><strong>{group.label} 인접 호실</strong><div>{group.rooms.map(room=><span key={room} className={room===group.front?'is-front':''}><b>{room}호</b>{room===group.front&&<small>바로 앞</small>}</span>)}</div></div>)}
    <Node title="추가로 바로 앞인 호실" detail="1604·1605호, 23~25호" warn/>
    <Callout>먼 객실 요청 시 위 인접 호실을 피해서 배정. 실제 평면도가 아닌 호실 분류 도식이며, 23~25호의 층수는 임의로 확정하지 않음.</Callout></>
}
function SmartTvTable() {
  return <><table className="visual-table"><caption>스마트 TV 객실 · 1박당 / 1객실당 추가 요금</caption><thead><tr><th scope="col">층</th><th scope="col">DBP</th><th scope="col">DTW</th></tr></thead><tbody>{[15,14,13,12,11].map(floor=><tr key={floor}><th scope="row">{floor}층</th><td><span>스마트 TV</span><strong>{floor===15?'20,000':'10,000'}원</strong></td><td>{floor>=14?<><span>스마트 TV</span><strong>10,000원</strong></>:<span>일반 TV</span>}</td></tr>)}</tbody></table><Node title="SDL · DBC" detail="스마트 TV 없음" icon="tv"/></>
}
function TimeGuide({early,article}:{early:boolean;article:OperationArticle}) {
  return <><div className="visual-timeline">{(early?[{time:'09:00 이전',label:'1박 요금',warn:true},{time:'09:00~15:00 전',label:'시간당 11,000원',warn:false},{time:'15:00',label:'정규 체크인',warn:false}]:[{time:'12:00',label:'정규 체크아웃',warn:false},{time:'12:00 이후',label:'시간당 11,000원',warn:false},{time:'17:00 이후',label:'1박 요금',warn:true}]).map(item=><div key={item.time} className={'visual-time'+(item.warn?' is-warning':'')}><Symbol name="clock"/><strong>{item.time}</strong><span>{item.label}</span></div>)}</div><Callout>{early?article.steps[1]:article.steps.slice(2).join(' · ')}</Callout></>
}
function Content({article}:{article:OperationArticle}) {
  const s=article.steps
  switch(article.id){
    case 'tv-remote': return <Branch question={{title:'일반 TV 하단 대기등 확인',detail:'빨간색 불빛이 보이나요?',icon:'tv'}} yes={{title:'불빛 있음',detail:'리모컨 전원 버튼 여러 번 누르기',icon:'remote'}} no={{title:'불빛 없음',detail:'메인보드·기타 고장 가능성 → 시설팀 전달',icon:'alert',warn:true}} footer={article.followUp}/>
    case 'tv-general-reset': return <><Flow steps={[{title:'메뉴 → 채널 → DTV 채널 선택',icon:'tv'},{title:'유선방송 → 확인',icon:'check'},{title:'자동 채널 설정 → 확인',icon:'settings'},{title:'100%가 되자마자 확인',icon:'alert',warn:true},{title:'중지하시겠습니까? → 예 → 확인',icon:'remote'},{title:'TV 채널 화면 복귀',icon:'tv'}]}/><Callout>일반 TV는 100% 즉시 확인 후 중지 선택.</Callout></>
    case 'tv-smart-reset': return <><Flow steps={[{title:'홈 → 설정',icon:'home'},{title:'채널/방송 → 자동 채널 설정',icon:'settings'},{title:'시작',icon:'check'},{title:'100% 완료 후 자동 전환',icon:'tv'}]}/><Node title="중지 버튼 불필요" icon="check"/></>
    case 'tv-network': return <><Flow grid steps={[{title:'집 모양 홈 버튼',icon:'home'},{title:'왼쪽 방향키 → 설정',icon:'settings'},{title:'네트워크',icon:'wifi'},{title:'초기화 → 재설정 확인',icon:'reset'},{title:'무선 연결',icon:'wifi'},{title:'해당 객실 층 Wi-Fi',detail:'CPH_층수',icon:'check'}]}/><Callout>{article.followUp}</Callout></>
    case 'tv-optical': return <><Flow steps={[{title:'홈 → 설정 → 음향',icon:'settings'}]}/><div className="visual-output"><div><Symbol name="speaker"/><strong>현재 출력</strong><span>옵티컬</span></div><span aria-hidden="true">→</span><div><Symbol name="tv"/><strong>변경할 출력</strong><span>TV 스피커</span></div></div><Node title="음량 조절 및 정상 출력 확인" icon="check"/><small>실제 TV 화면이 아닌 설정 변경 도식</small></>
    case 'room-lights': return <Branch question={{title:'도어락에 터치한 동일한 카드키 삽입 확인',icon:'card'}} yes={{title:'전원 정상',detail:'조명 작동 확인',icon:'check'}} no={{title:'계속 전원 불량',detail:'시설팀에 상단 차단기 점검 요청',warn:true,icon:'alert'}} footer="차단기 조작은 시설팀 담당. 계속 안 켜지면 시설팀 전달."/>
    case 'door-lock': return <><Branch question={{title:'카드키 최신화 후 재시도',icon:'card'}} yes={{title:'문 열림',icon:'check'}} no={{title:'문 안 열림',detail:'투숙객 확인 후 마스터키 개방',icon:'door',warn:true}} footer="시설팀에 상단 차단기 점검 요청. 마스터키는 투숙객 확인 후 사용."/><Node title="계속 안 열리면 시설팀 전달" icon="alert" warn/></>
    case 'room-heating': return <><div className="visual-heating"><div><Symbol name="thermometer"/><strong>난방 조절 패널</strong><b>최대 26°C</b></div><span aria-hidden="true">↑</span><div><Symbol name="phone"/><strong>객실 전화기</strong></div></div><Cards items={[{title:'온돌(바닥난방)',detail:'따뜻해지기까지 시간 소요',icon:'clock'},{title:'동절기 냉방 불가',detail:'난방과 냉방 패널 구분',icon:'alert',warn:true}]}/><small>실제 기기 사진이 아닌 상대적 위치 도식</small></>
    case 'smoke-window': return <><Flow steps={s.map((title,i)=>({title,icon:(['window','alert','card'] as const)[i],warn:i===1}))}/><Callout>{article.caution} {article.followUp}</Callout></>
    case 'skylight-remote': return <><Flow steps={s.map((title,i)=>({title,icon:(['remote','window','alert','card'] as const)[i],warn:i===2}))}/><Callout>{article.caution} {article.followUp}</Callout></>
    case 'skylight-lights': return <><Flow steps={s.map(title=>({title,icon:'alert',warn:true}))}/><Callout>{article.caution}</Callout></>
    case 'parksuite-skylight': return <><Cards items={[{title:'스카이창 1',detail:'해당 창 주파수 확인',icon:'window'},{title:'스카이창 2',detail:'서로 다른 주파수일 수 있음',icon:'window'}]}/><Flow steps={[{title:s[1]!,icon:'remote'}]}/><Callout>{article.followUp}</Callout></>
    case 'whirlpool-noise': return <Branch question={{title:'시설팀에 하단 차단기 점검 요청',detail:'옷장 위 · 시설팀 조작',icon:'bath',warn:true}} yes={{title:'소음 해결',detail:'월풀 정상 작동 확인',icon:'check'}} no={{title:'소음 지속',detail:'시설팀과 하단 차단 유지 여부 확인',icon:'alert',warn:true}} footer={article.followUp}/>
    case 'room-type-change': return <RoomChange article={article}/>
    case 'elevator-room-assignment': return <Elevator/>
    case 'smart-tv-pricing': return <SmartTvTable/>
    case 'room-views': return <><div className="visual-room-line"><strong>파크뷰 · 디럭스 더블 파크</strong><div><span>02호</span><span>…</span><span>15호</span></div></div><div className="visual-room-line"><strong>시티뷰 · 패밀리 트윈</strong><div><span>16호</span><span>…</span><span>27호</span></div></div><Cards items={[{title:'파크스위트 · 파크뷰',detail:'1602~1608호',icon:'window'},{title:'스카이 디럭스 · 시티뷰',detail:'1601호 · 1616~1628호',icon:'window'},{title:'파크앤시티',detail:'각 층 01호·28호',icon:'window'}]}/><small>객실번호 분류 도식 · 실제 평면도 아님</small></>
    case 'request-amenities': return <Cards items={s.map((line,i)=>({title:line.split(':')[0]!,detail:line.split(':').slice(1).join(':').trim(),icon:(['coffee','shirt','fridge','bath'] as const)[i]}))}/>
    case 'voucher-steps': return <><Flow steps={s.map(title=>({title,icon:'ticket'}))}/><Cards items={[{title:'판매 숙박권',detail:'거래처·객단가 입력',icon:'document'},{title:'무료 숙박권',detail:'객실 타입 COMP · 객단가 0원 · 사용 제한일 확인',icon:'ticket',warn:true}]}/><Node title="예약 DETAIL: COMP / COMP"/></>
    case 'pet-policy': return <><Node title="반려견 동반 객실 · 9층 배정" icon="pet"/><Cards items={[{title:'이용 가능',detail:'디럭스 더블 센트럴파크뷰 · 디럭스 패밀리 트윈',icon:'check'},{title:'이용 불가',detail:'스카이 디럭스 · 파크스위트',warn:true,icon:'alert'},{title:'10kg 초과 불가',detail:'여러 마리 동반 시 사전 확인',warn:true,icon:'pet'},{title:'예약 확인',detail:'견종·몸무게·중성화 여부 확인 → 리마크',icon:'document'}]}/><Node title="호텔 내 이동" detail="캐리어 또는 강아지가방 사용" icon="pet"/></>
    case 'early-checkin': return <TimeGuide early article={article}/>
    case 'late-checkout': return <TimeGuide early={false} article={article}/>
    default: return null
  }
}
export function StaffVisualGuide({article}:{article:OperationArticle}) {
  if(!hasVisualGuide(article.id)) return null
  return <section className="staff-visual-guide" data-visual-guide={article.id} aria-label="시각적 업무 가이드"><header><span>VISUAL GUIDE</span><h3>한눈에 보는 처리 방법</h3></header><Content article={article}/></section>
}
