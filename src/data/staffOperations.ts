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
  { id:'room-heating',category:'facilities',title:"객실 난방이 안 됨",keywords:['난방','에어컨','온풍','온도','벽면 패널'],steps:["전화기 위 냉난방 스위치 확인","욕실 벽면 패널로 난방 조절 안내","온돌 난방은 따뜻해지기까지 시간이 걸림"],notes:["겨울철 에어컨 냉방 미운영","난방 온도 설정: 최대 26도"],followUp:"'조작 무효' 표시가 뜨면 전화기 근처 냉난방 스위치 확인.",source:'사진 매뉴얼',review:true },
  // 객실 배정: 최신 구술 정정이 이전 종이 자료보다 우선
  { id:'room-views',category:'rooms',title:"객실 전망·호실 구분",keywords:['파크뷰','시티뷰','파크앤시티','객실타입','층','호실'],steps:["파크뷰: 디럭스 더블 파크 각 층 2~15호 / 파크스위트 1602~1608호","시티뷰: 패밀리 트윈 각 층 16~27호 / 스카이 디럭스 1601호·1616~1628호","파크앤시티: 각 층 1호·28호(파크뷰·시티뷰 혼합)"],source:'사진 매뉴얼',review:true },
  { id:'smart-tv-pricing',category:'rooms',title:"스마트 TV 객실 및 추가 요금",keywords:['DBP','DTW','SDL','DBC','스마트티비','스마트 TV','요금','추가금','11층','15층'],summary:"DBP·DTW 스마트 TV 객실 배정 시 추가 요금 확인",steps:["DBP 11~14층: 1박·1객실당 10,000원 추가","DBP 15층: 1박·1객실당 20,000원 추가","DTW 14~15층: 1박·1객실당 10,000원 추가","SDL·DBC: 스마트 TV 없음"],source:'최신 정정' },
  // COMP 예약: 3번째 사진
  { id:'voucher-steps',category:'vouchers',title:"판매·무료 숙박권 예약",keywords:['컴프','COMP','무료숙박권','판매숙박권','시리얼','바우처','예약'],steps:["숙박권 시리얼 번호 확인 → 예약 리마크 작성","숙박권 종류·유효기간·조식 포함 여부 확인","3인 이상 투숙 시 추가 인원 요금 안내","취소 규정과 체크인 시 숙박권 지참 안내","더블체크 후 예약 문자 발송. 판매 숙박권은 거래처 입력 확인"],notes:["예약 DETAIL: COMP / COMP","판매 숙박권: 거래처·객단가 입력","무료 숙박권: 객실 타입 COMP, 객단가 0원","무료 숙박권: 금·토요일, 성수기, 공휴일 등 사용 제한일 확인"],caution:"카드번호는 업무용 매뉴얼이나 요청사항에 입력하지 말 것.",source:'사진 매뉴얼',review:true },
  // 비품·고객 문의: 4번째 사진
  { id:'request-towels',category:'requests',title:"수건·휴지가 없다고 할 때",keywords:['수건','휴지','타월','욕실 비품'],steps:["세면대·서랍장에 있는 여분 수건 사용 여부 확인","없거나 모두 사용한 경우 H/K 요청 후 객실 전달"],source:'사진 매뉴얼' },
  { id:'request-water',category:'requests',title:"생수 위치 문의",keywords:['물','생수','냉장고','객실 무료물'],steps:["옷장 옆 냉장고 안에 생수 있다고 안내","냉장고에도 없으면 객실 전달"],source:'사진 매뉴얼' },
  { id:'request-toothbrush',category:'requests',title:"칫솔·비품 문의",keywords:['칫솔','어메니티','욕실용품','면도기','덴탈키트'],steps:["객실 내 비품 위치 먼저 안내","칫솔은 프론트 구매 안내","재고 확인 후 판매·전달"],notes:["무료 비품: 빗, 커피, 녹차, 로션, 스킨, 버블, 샤워캡","옷장: 가운 / 냉장고: 생수 3개 / 욕실: 샴푸, 린스, 바디클렌저, 비누, 드라이기, 수건"],source:'사진 매뉴얼',review:true },
  { id:'request-amenities',category:'requests',title:"객실 기본 비품 위치",keywords:['비품목록','어메니티','가운','커피','녹차','수건','생수'],steps:["객실 비품: 빗·커피·녹차·로션·스킨·버블·샤워캡","옷장: 가운 / 냉장고: 생수 3개","욕실: 샴푸·린스·바디클렌저·비누·드라이기·수건"],source:'사진 매뉴얼',review:true },
  // 반려견: 사진 + 최신 보증금 폐지
  { id:'pet-policy',category:'pets',title:"펫캉스 이용 규정",keywords:['펫캉스','강아지','반려견','애견','반려동물','9층'],summary:"펫캉스 보증금 없음",steps:["반려견 동반 객실은 9층 배정","이용 가능: 디럭스 더블 센트럴파크뷰·디럭스 패밀리 트윈","이용 불가: 스카이 디럭스·파크스위트","호텔 내 이동 시 캐리어 또는 강아지가방 사용","제공 키트: 애견침대·애견식기·배변패드. 그 외 물품은 고객 준비","예약 시 견종·몸무게·중성화 여부 확인 후 리마크 작성"],notes:["10kg 초과 반려견 불가. 여러 마리 동반 시 사전 확인","중성화 수술을 하지 않았다면 매너벨트 안내"],source:'최신 정정',review:true },
  { id:'pet-fee',category:'pets',title:"펫캉스 청소비·보증금",keywords:['펫캉스','펫청소','애견 청소비','보증금','20만원','비용'],steps:["펫캉스 20만 원 보증금은 받지 않습니다.","청소비: 33,000원","성수기 청소비: 55,000원(7월 16일~8월 31일)"],source:'최신 정정',review:true },
  // 요금·부가서비스: 사진 5,6
  { id:'bed-guard',category:'services',title:"침대가드 설치",keywords:['베드가드','가드','아기','침대'],steps:["무료 / 객실당 1개","사전 요청 우선 설치. 당일 요청은 재고 확인","양쪽 설치 요청 시 고정 방식 특성상 흔들릴 수 있다고 안내"],source:'사진 매뉴얼',review:true },
  { id:'baby-crib',category:'services',title:"아기침대 설치",keywords:['유아침대','아기침대','크립','crib'],steps:["설치비 20,000원 / 12개월 미만 유아","아이가 잡고 일어서면 낙상 위험이 있으므로 안내","재고 없을 때는 두꺼운 담요 등 대체품 확인"],source:'사진 매뉴얼',review:true },
  { id:'late-checkout',category:'services',title:"레이트 체크아웃",keywords:['체크아웃 연장','늦은퇴실','L.O','퇴실시간'],steps:["퇴실 연장: 1시간당 11,000원","17시 이후: 1박 요금","객실 상황 확인 후 가능 여부 안내","연장 전 객실 상황·룸체크 확인"],source:'사진 매뉴얼',review:true },
  { id:'early-checkin',category:'services',title:"얼리 체크인",keywords:['일찍 체크인','조기입실','E.I','얼리체크인'],steps:["규정 체크인 시간 전 입실: 1시간당 11,000원","오전 9시부터 가능 여부 확인(당일 객실 상황 기준)","오전 9시 이전: 1박 요금"],source:'사진 매뉴얼',review:true },
  { id:'extra-person',category:'services',title:"인원 추가 요금",keywords:['인원추가','3인','추가인원','투숙인원','성인'],steps:["만 13세부터 성인 요금 적용","추가 인원: 1인·1박당 33,000원(객실 타입별 제외 조건 확인)","3인 세팅 필요 시 H/K 전달","18시 이후 H/K 업무 종료 시 인차지·팀장 전달"],notes:["DBP: 인원 추가 불가"],source:'사진 매뉴얼',review:true },
  { id:'extra-bed',category:'services',title:"엑스트라 베드",keywords:['엑스트라베드','extra bed','보조침대','DBC','PSU'],steps:["DBC: 1개 설치 가능 / 총 3인까지","PSU: 최대 2개 설치 가능 / 총 4인까지","1개 55,000원 / 2개 110,000원 (1박 기준)","추가 인원 요금 포함. 설치 시 3인 세팅 확인"],source:'사진 매뉴얼',review:true },
  { id:'lost-key',category:'services',title:"객실 키 분실",keywords:['키 분실','카드키','객실키','키카드','분실료'],steps:["분실 키 1개당 11,000원","추후 키를 찾아도 환불 불가 안내"],source:'사진 매뉴얼',review:true },
  { id:'rentals-sales',category:'services',title:"프론트 판매·대여 물품",keywords:['우산','덴탈키트','면도기','충전기','대여','판매'],steps:["우산: 판매 6,000원 / 1시간 대여 가능(반납 필수)","덴탈키트 2,000원 / 면도기 1,000원","충전기: 현금 보증금 10,000원 받고 대여"],notes:["우산 1시간 이상 필요하면 구매 안내","판매·대여 전 재고 확인"],source:'사진 매뉴얼',review:true },
  // 부서 전화번호: 1차 직원 구술
  { id:'departments',category:'contacts',title:"부서별 내선번호",keywords:['전화','내선','연락처','예약실','하키','HK','하우스키핑','시설','식당','주방','F/B'],steps:["객실 예약실: 5000 / 5031 / 5032 / 4099","H/K: 5080 (지희주 계장님) / 5081 (이선미 주임님)","시설팀: 5030","하이웨이브 조식·오전 행사 세팅: 5016","룸서비스(라운지 오픈 이후): 5082","재경팀: 5008","메인주방: 5042","F/B 사무실: 5012 / 5013"],source:'직접 전달' },
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
