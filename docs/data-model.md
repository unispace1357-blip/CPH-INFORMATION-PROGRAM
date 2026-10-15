# 시설·호텔 데이터 계약

Staff와 Guest는 `src/data/facilities.json`을 공유하고 호텔 기본 안내는 `src/data/hotel.json`으로 분리합니다. 각 파일의 `schemaVersion`은 1, `dataStatus`는 demo/production입니다. Ajv로 로컬 검증하며 외부 API를 호출하지 않습니다.

## 시설 필드

| 필드 | 규칙 |
| --- | --- |
| id | 고유한 영문 소문자·숫자·하이픈, 최대 80자 |
| category | hotel, dining, cafe, convenience, pharmacy, shopping, attraction, transportation, sauna_spa, atm |
| isPublished | Staff/Guest 표시 여부. 인증·운영 배포 승인이 아님 |
| lastVerifiedAt | 근거 있는 확인일 YYYY-MM-DD 또는 null |
| walkingMinutes | 0 이상 유한 숫자 또는 미확인 null. 언어별 중복 저장 금지 |
| closedDays | ko/en/zh-CN/ja 문자열. 미확인은 빈 문자열 |
| translations | 4개 언어별 name, description, address, openingHours, directions, notes |
| keywords | 4개 언어별 키워드 배열 |
| englishPhrases | 직원용 영어 응대 문구 배열 |
| naverMapUrl | 선택 string/null. 생략/null은 미등록 |

개발 데이터는 이름 이외의 미확인 안내를 비워둘 수 있습니다. 구버전 입력은 누락 walkingMinutes=null, closedDays=4개 빈 문자열, keywords.zh-CN/ja=빈 배열로 보완하며 입력 객체는 바꾸지 않습니다. 명시한 closedDays는 4개 언어가 모두 필요합니다. 카테고리 코드는 유지하되 Staff/Guest 버튼은 ATM을 제외하고, 관리자에는 전체 카테고리가 있습니다.

호텔은 공통 lastVerifiedAt·checkInTime·checkOutTime과 4개 언어의 name, description, address, checkIn, checkOut, breakfast, parking, roomUsage, notes를 가집니다. 공통 시간은 HH:mm 또는 null입니다. 승인 원고와 H33 보류는 [원고 보호 기준](step07a-hotel-data.md)을 따릅니다.

## 실제 시설 출처와 검수 상태

원본: 사용자 수정 `1212.xlsx`, 시트 `01_시설후보_24개`.
SHA-256: `90c817d2d2dba4c0384105c0730aeef144b664c9e794f45c3d58e5d71a043731`.
이름·주소는 C/D열, 업종 B열, 운영시간 G열을 사용합니다. I열의 내부 확인 목록과 출처 링크를 고객 안내 문구로 노출하지 않습니다. 전체 안내의 단일 원본은 시설 JSON이며 별도 번역표·원본 셀 복제본을 보관하지 않습니다.

기존 C01/C04/C03/C02/C16의 ID·내용은 그대로 유지하고 C05–C15, C17–C20, C22–C24를 추가했습니다. 전체 23개가 DEMO 미리보기에서 표시됩니다. 같은 주소의 한옥마을·센트럴로 상권은 상호와 동/층/호수가 다른 별도 시설입니다. C21 공항버스는 시설로 등록하지 않고 기존 비활성 안내를 유지합니다. 외부 ATM은 추가하지 않습니다.

사용자 최신 확인을 우선해 CU의 과거 ‘제3자 표기, 재확인’과 신규 시설의 ‘제3자 참고’를 되살리지 않았으며 채움약국 ‘휴계시간’ 정정을 유지합니다. 시간·브레이크타임·라스트오더·요일별 마감·층/호수는 보존합니다. 추가 표기 정리는 24시간제와 구간 시간의 분 표기이며 운영시간 변경이 아닙니다.

- C15 `incheon-port-hangdong-7ga`: 인천항, 인천광역시 중구 항동7가 88. 사용자가 네이버 지도에서 확인한 16-1번 → 연안아파트에서 36번/14번 환승 → 이후 약 7분, 전체 약 1시간을 4개 언어에 반영합니다. 도보시간은 null이며 국내/국제 여객터미널로 확정하지 않습니다. 잘못된 약국 출처를 사용하지 않습니다.
- C16 채움약국과 기존 블루오션의 정체성을 유지합니다. 잘못된 센트럴원약국 링크나 다른 블루오션 시설로 바꾸지 않습니다.
- C18 `playground-brewery-taproom-songdo`: 엑셀의 ‘15:00~00:00 등’은 이번 사용자의 추가 확인에 따라 **15:00~00:00, 라스트오더 23:00**으로 확정해 미리보기에서 표시합니다.
- C20 `central-park-station-exit-3`: 엑셀 E/H열의 호텔 공식 도보 약 5분만 walkingMinutes=5로 반영합니다. 실측·특정 출입구 동선을 새로 검증했다고 주장하지 않습니다. Staff/Guest는 같은 간단한 안정 정렬을 사용해 확인된 시간이 짧은 시설부터 표시하고 동률·null은 원본 순서를 유지합니다. 원본 JSON 배열은 바꾸지 않습니다.
- C23 `songdo-central-park`: 사용자 지정 송도 센트럴파크, 컨벤시아대로 160 일원. 기본 정보는 운영 공개 전 사용자 확인이 필요한 초안입니다. 출입구·도보시간은 만들지 않습니다.
- C24 `byeol-onnuri-pharmacy-songdo`: 약국 운영 08:30~다음날 01:00과 24시간 자판기를 구분합니다. 약국 자체가 24시간 운영한다고 표시하지 않습니다.

설문 표제일 2026-10-15는 시설별 실제 확인일이 아니므로 lastVerifiedAt은 전체 null입니다. 실제 길찾기 URL도 23개 모두 null입니다. 과거 공유한 터미널 경로를 인천항 목적지로 임의 연결하지 않습니다. C20 이외 도보시간 22개와 블루오션 이외 휴무일은 미확인 상태를 유지합니다. 시설명·주소·시간의 단일 원본은 시설 JSON이며 내부 검수 목록을 고객 notes에 노출하지 않습니다. 외국어 안내·기본 영어 문구는 사용자 감수 전 초안이며 공식 외국어 상호·외부 번역기 대조를 확인했다고 주장하지 않습니다.

## 지도 링크

URL 자동 생성·지도 API·SDK·임베드는 없습니다. `src/services/naverMapUrl.ts`의 동일 검증기를 데이터/관리자/UI에서 재사용합니다. HTTPS와 정확한 map.naver.com/m.map.naver.com만 허용하며, 위장 도메인·위험 스킴·인증정보·민감 쿼리·잘못된 인코딩·일반 홈/검색/장소 상세·출발/도착 누락은 거부합니다.

데스크톱 p/directions, v5/directions의 숫자 좌표·PLACE_POI 위치 식별값, 모바일 route.nhn의 숫자 sX/sY/eX/eY를 지원합니다. 한국어 원문·퍼센트 인코딩 URL 모두 원본 문자열을 보존합니다. 새 탭 링크는 noopener noreferrer를 사용하고 미등록/무효이면 비활성입니다. 실제 출발지·도착지·이동수단·경로 정확성은 자동 확인할 수 없으므로 담당자가 호텔 출발/정확한 지점 도착/모바일 실행을 확인해야 합니다.

## 개발·운영 구분

`validate`는 스키마·중복·날짜·URL을, `validate:hotel-copy`는 승인 원고를 검사합니다. `build`는 demo를 허용하는 개발 산출물입니다. 운영 명령 `build:production`은 이전 출력 정리 → 원본 구조 검사 → 공개 스냅샷 생성/운영 검증 → 관리자 코드 제외 빌드 순서이며 실패 시 운영 산출물을 남기지 않습니다.

운영은 두 데이터의 production 상태, 미래가 아닌 실제 확인일, 호텔 공통 시간, 공개 시설의 4개 언어 이름·설명·주소·시간·이동 안내·휴무일, 호텔의 필수 안내·설명을 요구합니다. 현재 demo·누락 확인일/안내·빈 호텔 description 때문에 운영 준비가 되지 않았습니다. 상태만 바꾸어 우회하지 않습니다. 비공개 시설도 구조 검사를 받으며 운영 번들에서는 제외됩니다. 원본 GitHub/개발 번들은 공개될 수 있으므로 비밀 정보·고객 개인정보를 저장하지 않습니다.
