/**
 * Staff operations reference only. Source: staff-supplied procedure notes and six photographed
 * paper sheets (2026-10-27), with later direct corrections taking precedence.
 * Fees and historic paper instructions are not independently verified as current policy.
 * Keep this dataset separate from guest/hotel customer-facing records.
 */
export const OPERATION_CATEGORIES = [
  { id: 'facilities', label: '객실 시설 문제', hint: '와이파이 · 배연창 · TV · 온수' },
  { id: 'rooms', label: '객실 타입·배정', hint: '객실 위치 · 스마트 TV · 추가 요금' },
  { id: 'vouchers', label: '숙박권·예약', hint: 'COMP · 판매 숙박권' },
  { id: 'requests', label: '고객 요청 응대', hint: '수건 · 생수 · 비품 · 냉난방' },
  { id: 'pets', label: '펫캉스', hint: '반려견 · 객실 · 청소비' },
  { id: 'services', label: '부가서비스·요금', hint: '체크인 · 침대 · 판매·대여' },
  { id: 'contacts', label: '부서 연락처', hint: '예약실 · H/K · 시설팀' },
] as const

export type OperationCategory = (typeof OPERATION_CATEGORIES)[number]['id']
export type OperationSource = '직접 전달' | '사진 매뉴얼' | '최신 정정'
export interface OperationArticle {
  id: string
  category: OperationCategory
  title: string
  keywords: string[]
  summary?: string
  steps: string[]
  notes?: string[]
  caution?: string
  followUp?: string
  source: OperationSource
  review?: boolean
}

export const OPERATION_ARTICLES: readonly OperationArticle[] = [
  // 시설·고장 응대: 1차 구술 자료 + 사진 내 추가 냉난방 안내
  { id:'wifi-router',category:'facilities',title:"객실 와이파이 안 됨",keywords:['인터넷','공유기','wifi','무선 인터넷'],steps:["방재실에서 새 공유기 수령","객실 화장대 쪽에 설치","와이파이 연결 및 정상 작동 확인","H/K 리포트 작성"],followUp:"설치 후에도 연결되지 않으면 시설팀 연락.",source:'직접 전달' },
  { id:'smoke-window',category:'facilities',title:"배연창이 안 닫힘",keywords:['배연창','창문','안닫힘','차단기'],steps:["프론트에서 배연창 닫기 시도","안 되면 시설팀에 객실 옷장 위 상단 차단기 점검 요청(5초 내렸다가 올리는 방식)","카드키를 문에 다시 터치한 뒤 슬롯에 꽂고 재확인"],followUp:"계속 안 닫히면 시설팀 전달.",caution:"차단기 조작은 시설팀 담당. 감전 주의.",source:'직접 전달' },
  { id:'whirlpool-noise',category:'facilities',title:"월풀 소리가 안 꺼짐",keywords:['욕조','월풀','제트','소음','모터'],steps:["시설팀에 옷장 위 하단 차단기 점검 요청(5초 내렸다가 올리는 방식)","월풀 정상 작동 확인"],followUp:"해결되지 않으면 시설팀과 하단 차단 유지 여부 확인. 욕실 회로가 꺼진 경우 드라이기 별도 전달.",notes:["옷장 위 차단기: 상단은 객실 전체 / 하단은 욕실·스카이창"],caution:"차단기 조작 및 전원 유지 여부는 시설팀 확인 필수.",source:'직접 전달' },
  { id:'door-lock',category:'facilities',title:"객실 문이 안 열림",keywords:['도어락','키카드','객실키','마스터키','출입문'],steps:["카드키 최신화 후 재시도","그래도 안 열리면 투숙객 확인 후 마스터키로 개방","시설팀에 상단 차단기 점검 요청(5초 내렸다가 올리는 방식)"],followUp:"계속 안 열리면 시설팀 전달.",caution:"마스터키는 투숙객 확인 후 사용. 차단기 조작은 시설팀 담당.",source:'직접 전달' },
  { id:'room-lights',category:'facilities',title:"객실 불이 안 들어옴",keywords:['불 안들어와','전등','조명','전기','키슬롯'],steps:["카드키 문 터치 및 슬롯 삽입 여부 확인","안 되면 시설팀에 옷장 위 상단 차단기 점검 요청(5초 내렸다가 올리는 방식)","조명 정상 작동 확인"],followUp:"계속 안 켜지면 시설팀 전달.",caution:"차단기 조작은 시설팀 담당.",source:'직접 전달' },
  { id:'shower-drain',category:'facilities',title:"샤워실 배수구가 막힘",keywords:['배수구','하수구','배수','막힘','머리카락'],steps:["배수구 머리카락 막힘 여부 확인","H/K 또는 시설 담당자에게 배수구 뚜껑 및 내부 관 분리 요청","분리한 관은 스테이션에 보관","H/K 리포트 작성"],followUp:"물이 계속 안 내려가면 시설팀 전달.",caution:"배수구 내부 분해는 담당자에게 요청.",source:'직접 전달' },
  { id:'ac-timer',category:'facilities',title:"에어컨이 잠시 후 꺼짐",keywords:['냉방','타이머','에어컨','자동 꺼짐'],steps:["에어컨 타이머 설정 확인","에어컨 스위치에서 타이머 해제","정상 작동 확인"],source:'직접 전달' },
  { id:'bath-beep',category:'facilities',title:"화장실에서 삐 소리가 남",keywords:['삐소리','삐','경고음','물사용량','만실'],steps:["만실 등으로 물 사용량이 많을 때 일시적으로 발생할 수 있음","잠시 후 멈출 수 있다고 안내"],followUp:"소리가 계속 나거나 다른 이상이 있으면 시설팀 확인.",source:'직접 전달',review:true },
  { id:'window-noise',category:'facilities',title:"창문 쪽 소음이 심함",keywords:['창문 소음','실외기','배연창','소음','룸체인지'],steps:["배연창 닫혀 있는지 확인","소음이 계속되면 객실 방문해 확인","실외기 소음이면 시설팀 확인 후 룸체인지 검토"],followUp:"해결되지 않으면 룸체인지 진행 가능 여부 확인.",source:'직접 전달' },
  { id:'no-hot-water',category:'facilities',title:"뜨거운 물이 안 나옴",keywords:['온수','뜨거운물','세면대','샤워기','욕조'],steps:["세면대·샤워실·욕조를 모두 온수 방향으로 약 5분간 틀어보도록 안내","온수 공급 확인"],followUp:"계속 안 나오면 시설팀 전달.",caution:"온수 확인 중 화상 주의.",source:'직접 전달' },
  { id:'skylight-remote',category:'facilities',title:"스카이창이 안 열리거나 안 닫힘",keywords:['천창','스카이창','리모컨','주파수','방향키'],steps:["리모컨 방향키 아래의 주파수 설정 버튼 1회 누름","열림·닫힘 방향키 다시 눌러보기","안 되면 시설팀에 상단 차단기 점검 요청","카드키 문 터치 후 슬롯에 꽂고 재시도"],followUp:"계속 안 되면 시설팀 전달.",caution:"차단기 조작은 시설팀 담당.",source:'직접 전달' },
  { id:'skylight-lights',category:'facilities',title:"스카이창 쪽 불이 안 꺼짐",keywords:['스카이창','전등','조명','차단기','네모난거'],steps:["차단기 아래 네모난 부품 6개 중 2~3번째 관련 회로 확인 필요","시설팀에 점검 요청"],followUp:"시설팀 점검 후 조명 작동 확인.",caution:"감전 위험. 전기 부품을 두드리거나 직접 만지지 말 것.",source:'직접 전달' },
  { id:'parksuite-skylight',category:'facilities',title:"파크스위트 스카이창이 안 열림",keywords:['파크스위트','스카이창','주파수','리모컨'],steps:["스카이창 2개가 각각 다른 주파수일 수 있음","각 창에 맞는 주파수 설정 후 방향키로 다시 시도"],followUp:"안 되면 시설팀 전달.",source:'직접 전달' },
  { id:'tv-voice',category:'facilities',title:"스마트 TV 음성 안내 끄기",keywords:['티비','TV','음성지원','접근성','화면 설명'],steps:["설정 → 일반 → 접근성 → 음성 안내 설정","음성 안내 '꺼짐' 선택"],source:'직접 전달' },
  { id:'tv-network',category:'facilities',title:"스마트 TV 네트워크 연결 안 됨",keywords:['티비','TV','와이파이','wifi','인터넷','네트워크 초기화'],steps:["리모컨 홈 버튼 누르기","왼쪽 방향키 → 설정(톱니바퀴) → 네트워크","네트워크 초기화 → 재설정 확인","무선 연결 → 해당 객실 층 와이파이 재연결"],followUp:"연결 안 되면 객실에서 직접 확인. 그래도 안 되면 층별 와이파이 초기화 검토 및 시설팀 전달(야간 제외).",source:'직접 전달' },
  { id:'loose-outlet',category:'facilities',title:"콘센트 전기가 안 들어옴",keywords:['콘센트','멀티탭','플러그','헐거움'],steps:["콘센트가 헐거운지 먼저 확인","헐겁다면 시설팀에 상태 확인 요청","안전 확인 후 멀티탭 전달 가능 여부 판단"],followUp:"헐거움·과열·손상이 있으면 시설팀 점검.",caution:"접촉 불량 콘센트는 발열 위험. 점검 없이 멀티탭으로 대체하지 말 것.",source:'직접 전달' },
  { id:'fridge-noise',category:'facilities',title:"냉장고 소음 줄이기",keywords:['냉장고','소음','레버','약'],steps:["냉장고 내부 조절 레버를 '약'으로 변경","냉각 상태 확인"],source:'직접 전달' },
  { id:'tv-general-reset',category:'facilities',title:"일반 TV 채널 리셋",keywords:['TV','티비','일반TV','DTV','방송','채널 리셋'],steps:["메뉴 → 채널 → DTV 채널 선택","유선방송 선택 후 확인","자동 채널 설정 실행","100%가 되면 확인 → '중지하시겠습니까?' → 예 선택 → TV 채널 화면 복귀"],source:'직접 전달',review:true },
  { id:'tv-smart-reset',category:'facilities',title:"스마트 TV 채널 리셋",keywords:['TV','티비','스마트TV','채널','자동채널설정'],steps:["홈 → 설정 → 채널/방송 → 자동 채널 설정","시작 선택","100% 완료 후 자동으로 TV 채널 화면 복귀(중지 버튼 누르지 않음)"],source:'직접 전달' },
  { id:'tv-remote',category:'facilities',title:"일반 TV 전원·리모컨 작동 안 됨",keywords:['TV','티비','리모컨','빨간불','대기등','전원'],steps:["TV 아래 빨간 대기등이 켜져 있는지 확인","대기등이 켜져 있으면 리모컨 전원 버튼 여러 번 눌러보기"],followUp:"대기등이 없으면 TV 고장 가능성. 시설팀 전달.",source:'직접 전달' },
  { id:'tv-optical',category:'facilities',title:"TV 소리 조절 시 '옵티컬만 연결' 표시",keywords:['TV','티비','음향','옵티컬','스피커','음량'],steps:["홈 → 설정 → 음향","출력 장치 '옵티컬' → 'TV 스피커' 변경"],source:'직접 전달' },
  { id:'room-heating',category:'facilities',title:"객실 난방이 안 됨",keywords:['난방','에어컨','온풍','온도','벽면 패널'],steps:["전화기 위 냉난방 스위치 확인","욕실 벽면 패널로 난방 조절 안내","온돌 난방은 따뜻해지기까지 시간이 걸림"],notes:["겨울철에는 에어컨 냉방 기능이 제한될 수 있음","온도 설정은 26도 이내 안내(기기별 확인)"],followUp:"'조작 무효' 표시가 뜨면 전화기 근처 냉난방 스위치 확인.",source:'사진 매뉴얼',review:true },
  // 객실 배정: 최신 구술 정정이 이전 종이 자료보다 우선
  { id:'room-views',category:'rooms',title:'객실 전망과 배정 위치',keywords:['파크뷰','시티뷰','파크앤시티','객실타입','층','호실'],steps:['파크뷰: 디럭스 더블 파크(각 층 2~15호) 및 16층 파크스위트 1602~1608호.','시티뷰: 패밀리 트윈(각 층 16~27호), 16층 스카이 디럭스 1601호·1616~1628호.','파크앤시티: 각 층 1호·28호는 반(파크뷰)·반(시티뷰) 전망이라고 사진에 기재되어 있습니다.'],notes:['객실 범위는 사진 메모 기준입니다. 8층·10층 일부 예외로 보이는 손글씨는 확인 후 별도 반영합니다.','사진 매뉴얼에는 파크스위트 전 객실이 스마트 TV 설치 객실로 기재되어 있으나, 현행 설치 상태는 추가 확인이 필요합니다.'],source:'사진 매뉴얼',review:true },
  { id:'smart-tv-pricing',category:'rooms',title:'스마트 TV 객실 배정과 추가 요금 (최신)',keywords:['DBP','DTW','SDL','DBC','스마트티비','스마트 TV','요금','추가금','11층','15층'],summary:'직접 수정한 최신 기준. 이전 사진과 충돌하는 구형 표기는 적용하지 않습니다.',steps:['DBP: 11~14층 스마트 TV 객실 — 1박·1객실당 10,000원 추가.','DBP: 15층 스마트 TV 객실 — 1박·1객실당 20,000원 추가.','DTW: 14~15층 스마트 TV 객실 — 10,000원 추가.','SDL·DBC 객실: 스마트 TV 없음.'],notes:['DTW의 10,000원 적용 단위는 사용자 전달 내용에서 별도로 명시되지 않아 확인이 필요합니다.','사진의 과거 스마트 TV 객실 목록보다 이 최신 정정을 우선합니다.'],source:'최신 정정' },
  // COMP 예약: 3번째 사진
  { id:'voucher-steps',category:'vouchers',title:'COMP / 판매 숙박권 예약 생성',keywords:['컴프','COMP','무료숙박권','판매숙박권','시리얼','바우처','예약'],steps:['고객에게 숙박권 시리얼 번호를 확인하고 예약 리마크에 기재합니다.','숙박권 유형·유효기간·조식 포함 여부를 확인해 예약 가능 여부를 판단합니다.','투숙 인원이 3인 이상이면 추가 인원 요금을 안내합니다.','취소 규정과 체크인 시 실물 숙박권 지참 필요 여부를 안내합니다. 결제정보 확인이 필요하면 호텔의 승인된 결제 절차를 따릅니다.','더블체크가 끝나면 예약 문자를 발송합니다. 판매 숙박권은 거래처 정보 입력 여부도 확인합니다.'],notes:['사진 표기: DETAIL: COMP/COMP.','판매 숙박권은 기업에 정해진 금액으로 판매한 숙박권이며 객단가 입력 필요.','무료 숙박권은 객실 유형을 COMP로 선택하고 객단가 0원으로 처리하는 것으로 사진에 기재됨.','무료 숙박권은 금·토 및 특정 성수기·공휴일 등 사용 제한이 있다고 기재됨.'],caution:'카드번호와 같은 결제정보를 공개 매뉴얼이나 요청사항에 기록하지 않습니다.',source:'사진 매뉴얼',review:true },
  // 비품·고객 문의: 4번째 사진
  { id:'request-towels',category:'requests',title:'수건이나 휴지가 없어요',keywords:['수건','휴지','타월','욕실 비품'],steps:['세면대와 서랍장에 비치된 여분 수건·휴지를 사용했는지 먼저 확인합니다.','이미 사용했거나 없다면 담당 부서에 요청해 올려드린다고 안내합니다.'],source:'사진 매뉴얼' },
  { id:'request-water',category:'requests',title:'생수는 어디에 있나요?',keywords:['물','생수','냉장고','객실 무료물'],steps:['객실 내 옷장 옆 냉장고 안에 생수가 있다고 안내합니다.','냉장고에도 없다면 가져다드린다고 안내합니다.'],source:'사진 매뉴얼' },
  { id:'request-toothbrush',category:'requests',title:'칫솔이나 다른 비품이 없어요',keywords:['칫솔','어메니티','욕실용품','면도기','덴탈키트'],steps:['고객이 비품 위치를 몰라 찾지 못했을 수 있으므로 해당 품목의 객실 비치 위치를 확인해 안내합니다.','칫솔은 프론트에서 구매할 수 있다고 안내한 사진 메모가 있습니다.','실제 비치·재고·판매 정책을 확인한 뒤 제공 여부를 안내합니다.'],notes:['사진 기준 무료 객실 어메니티: 빗, 커피, 녹차, 로션, 스킨, 버블, 샤워캡.','옷장: 가운 / 냉장고: 생수 3개 / 욕실: 샴푸, 린스, 바디클렌저, 비누, 드라이기, 수건.'],source:'사진 매뉴얼',review:true },
  { id:'request-amenities',category:'requests',title:'객실 무료 비품 위치 한눈에 보기',keywords:['비품목록','어메니티','가운','커피','녹차','수건','생수'],steps:['객실 어메니티: 빗·커피·녹차·로션·스킨·버블·샤워캡.','옷장: 가운. 냉장고: 생수 3개.','욕실: 샴푸·린스·바디클렌저·비누·드라이기·수건.'],notes:['사진의 비품 목록 기준으로, 실제 객실 유형·현재 제공 정책은 확인이 필요합니다.'],source:'사진 매뉴얼',review:true },
  // 반려견: 사진 + 최신 보증금 폐지
  { id:'pet-policy',category:'pets',title:'펫캉스 객실과 이용 조건',keywords:['펫캉스','강아지','반려견','애견','반려동물','9층'],summary:'최신 정정: 과거 20만 원 보증금은 받지 않습니다.',steps:['반려견 동반 객실은 사진 매뉴얼상 9층에 한정 배정됩니다.','디럭스 더블 센트럴파크뷰와 디럭스 패밀리 트윈에서 동반 가능하다고 기재되어 있습니다. 스카이 디럭스·파크스위트는 불가로 기재되어 있습니다.','반려견은 호텔 내 이동 시 캐리어 또는 강아지가방에 넣도록 안내합니다.','반려견 이외의 물품은 투숙객이 준비하며, 기본 제공 키트에 애견침대·애견식기·배변패드가 기재되어 있습니다.','예약 시 반려견 견종과 몸무게, 중성화 수술 여부를 확인해 리마크에 남기도록 기재되어 있습니다.'],notes:['사진 기준 반려견 무게는 10kg 초과 불가로 표기되어 있습니다. 마리 수 제한은 없으나 여러 마리면 사전 확인이 필요합니다.','중성화 수술을 하지 않은 경우 매너벨트 착용을 안내하도록 기재되어 있습니다.','기존 20만 원 보증금 징수 문구는 폐기.'],source:'최신 정정',review:true },
  { id:'pet-fee',category:'pets',title:'펫캉스 청소비 및 보증금 (수정)',keywords:['펫캉스','펫청소','애견 청소비','보증금','20만원','비용'],steps:['펫캉스 20만 원 보증금은 받지 않습니다(최신 직접 정정).','사진 매뉴얼상 펫 청소비는 월~일 33,000원으로 기재되어 있습니다.','사진 매뉴얼상 성수기 청소비 55,000원과 예시 기간 7월 16일~8월 31일이 기재되어 있습니다.'],notes:['청소비·성수기 기간은 사진 자료 기준이며 현재 금액·운영 기간 확인이 필요합니다.','마리 수·박수·객실 수에 따른 산정 방식은 예약 시 확인합니다.'],source:'최신 정정',review:true },
  // 요금·부가서비스: 사진 5,6
  { id:'bed-guard',category:'services',title:'침대가드 설치',keywords:['베드가드','가드','아기','침대'],steps:['사진 매뉴얼 기준 무료, 객실당 1개 설치 가능.','사전 요청 고객 위주로 설치하며 당일 요청은 재고를 확인합니다.','양쪽 설치 요청 시 매트리스 아래에 넣어 고정하는 방식이어서 불안정할 수 있음을 안내합니다.'],source:'사진 매뉴얼',review:true },
  { id:'baby-crib',category:'services',title:'아기침대 설치',keywords:['유아침대','아기침대','크립','crib'],steps:['사진 기준 설치 비용 20,000원이며 12개월 미만 유아 대상으로 기재되어 있습니다.','침대가 낮아 아이가 잡고 일어나면 낙상 위험이 있음을 안내합니다.','재고가 없으면 두꺼운 담요 대여 등 대체 방법을 확인합니다.'],source:'사진 매뉴얼',review:true },
  { id:'late-checkout',category:'services',title:'레이트 체크아웃 (L.O)',keywords:['체크아웃 연장','늦은퇴실','L.O','퇴실시간'],steps:['사진 기준 체크아웃 시간 초과 시 1시간당 11,000원 추가 요금.','17시 이후에는 1박 요금 적용이라고 기재되어 있습니다.','객실 상황에 따라 불가할 수 있으므로 체크아웃 전 프론트에 문의하도록 안내합니다.','룸체크 결과와 객실 상황을 보고 연장 가능 여부를 결정합니다.'],source:'사진 매뉴얼',review:true },
  { id:'early-checkin',category:'services',title:'얼리 체크인 (E.I)',keywords:['일찍 체크인','조기입실','E.I','얼리체크인'],steps:['규정 체크인 시간보다 일찍 입실할 경우 사진 기준 1시간당 11,000원 추가 요금.','사진 기준 오전 9시부터 가능하며 체크인 당일 프론트 문의가 필요합니다.','오전 9시 이전에는 1박 요금 부과라고 기재되어 있습니다.'],source:'사진 매뉴얼',review:true },
  { id:'extra-person',category:'services',title:'추가 인원 요금',keywords:['인원추가','3인','추가인원','투숙인원','성인'],steps:['사진 기준 만 나이 13세부터 성인으로 기재되어 있습니다.','1인·1박당 33,000원(일부 객실 제외)으로 기재되어 있습니다.','3인 세팅이 필요하면 H/K에 전달합니다.','18시 이후 H/K 업무 종료 시에는 인차지·팀장님에게 전달하도록 사진에 기재되어 있습니다.'],notes:['DBP 추가 인원 불가라고 표시되어 있으므로 예약 단계에서 객실 유형별 가능 여부를 확인합니다.'],source:'사진 매뉴얼',review:true },
  { id:'extra-bed',category:'services',title:'엑스트라 베드 설치 요금',keywords:['엑스트라베드','extra bed','보조침대','DBC','PSU'],steps:['DBC: 엑스트라 베드 1개 설치 가능, 최대 총 3명 투숙 가능이라고 기재되어 있습니다.','PSU: 엑스트라 베드 최대 2개 설치 가능, 최대 총 4명 투숙 가능이라고 기재되어 있습니다.','1개 55,000원 / 2개 110,000원(1인·1박 기준)으로 기재되어 있습니다.','인원 추가 비용 포함 금액이라고 기재되어 있으며, 프론트 설치 시 3인 세팅도 필요합니다.'],source:'사진 매뉴얼',review:true },
  { id:'lost-key',category:'services',title:'객실 키 분실 비용',keywords:['키 분실','카드키','객실키','키카드','분실료'],steps:['사진 기준 객실 키 분실 비용: 1개당 11,000원.','추후 분실한 키를 찾더라도 환불되지 않는다고 안내하도록 기재되어 있습니다.'],source:'사진 매뉴얼',review:true },
  { id:'rentals-sales',category:'services',title:'프론트 판매·대여 품목',keywords:['우산','덴탈키트','면도기','충전기','대여','판매'],steps:['우산: 사진 기준 6,000원에 판매. 1시간 대여가 가능하며 반납해야 한다고 기재되어 있습니다.','덴탈키트: 2,000원 / 면도기: 1,000원(단품 가격).','충전기: 사진 기준 현금 10,000원을 보증금으로 받고 대여 가능이라고 기재되어 있습니다.'],notes:['우산 1시간 초과 사용은 구매를 권유한다는 메모가 있습니다.','품목 재고와 최신 판매 가격은 안내 전 확인해야 합니다.'],source:'사진 매뉴얼',review:true },
  // 부서 전화번호: 1차 직원 구술
  { id:'departments',category:'contacts',title:'부서별 내선번호 전체',keywords:['전화','내선','연락처','예약실','하키','HK','하우스키핑','시설','식당','주방','F/B'],steps:['객실 예약실: 5000 / 5031 / 5032 / 4099','하우스키핑(H/K): 5080 (지희주 계장님) / 5081 (이선미 주임님)','시설팀: 5030','하이웨이브 조식 및 오전 행사 세팅: 5016','룸서비스(라운지 오픈 이후): 5082','재경팀: 5008','메인주방: 5042','F/B 사무실: 5012 / 5013'],notes:['내선번호와 담당자 정보는 사용자가 직접 제공한 내부 업무 자료 기준입니다.'],source:'직접 전달' },
]

const normalize = (text: string): string => text.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
export function searchOperations(articles: readonly OperationArticle[], query: string, category: OperationCategory | 'all'): OperationArticle[] {
  const compact = normalize(query.trim())
  return articles.filter(article => {
    if (category !== 'all' && article.category !== category) return false
    if (!compact) return true
    const corpus = [
      article.title, article.summary ?? '', ...article.keywords,
      ...article.steps, ...(article.notes ?? []), article.followUp ?? '',
      OPERATION_CATEGORIES.find(item => item.id === article.category)?.label ?? '',
    ]
    return corpus.some(word => normalize(word).includes(compact))
  })
}
