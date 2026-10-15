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

| 관리번호·행 | JSON ID | 남은 내부 확인 사항 |
| --- | --- | --- |
| C01·7 | cu-songdo-senseuri | 출입구·호텔 도보경로 |
| C04·10 | blue-ocean-sauna-songdo | 입장료·찜질방 이용·도보경로 |
| C03·9 | malt-house-incheon-songdo | 메뉴·가격·엘리베이터 |
| C02·8 | compose-coffee-incheon-songdo-central-park | 호텔 도보경로 |
| C16·22 | chaeum-pharmacy-songdo | 전화·도보경로, 엑셀 출처 링크 정정 |

사용자의 최신 확인 지시에 따라 CU의 오래된 ‘제3자 표기, 재확인’을 4개 언어에서 제거하고 채움약국 ‘휴계시간’을 ‘휴게시간’으로 정정했습니다. 시간·브레이크타임·라스트오더·요일별 마감·층/호수는 보존합니다. 블루오션은 원본 상호를 유지하며 사우나 분류로 식별합니다. 채움약국의 잘못된 센트럴원약국 검색 링크는 정체성 판단에 사용하지 않습니다.

설문 표제일 2026-10-15는 시설별 실제 확인일이 아니므로 lastVerifiedAt은 모두 null입니다. 5개 도보시간·이동 안내·길찾기 URL도 미확인입니다. 블루오션만 원본의 연중무휴를 반영하며 나머지 휴무일은 비웁니다. 4개 언어 문구와 기본 영어 응대는 사용자 검수 전 초안입니다. 공식 외국어 상호가 확인되지 않아 원 상호를 유지하며 외부 번역기 대조를 수행했다고 주장하지 않습니다.

가상 시설 6개는 앱 JSON에서 제거했습니다. 독립 테스트용 가상 객체는 오류·비공개·보안 검증을 위해 코드 내부에만 남깁니다. 후속 자료에서 C15 경로는 사용자 검증 완료 상태를 유지하고 잘못된 출처만 정정 대상입니다. 공항버스 비활성 정책과 외부 ATM 미등록 정책은 유지합니다.

## 지도 링크

URL 자동 생성·지도 API·SDK·임베드는 없습니다. `src/services/naverMapUrl.ts`의 동일 검증기를 데이터/관리자/UI에서 재사용합니다. HTTPS와 정확한 map.naver.com/m.map.naver.com만 허용하며, 위장 도메인·위험 스킴·인증정보·민감 쿼리·잘못된 인코딩·일반 홈/검색/장소 상세·출발/도착 누락은 거부합니다.

데스크톱 p/directions, v5/directions의 숫자 좌표·PLACE_POI 위치 식별값, 모바일 route.nhn의 숫자 sX/sY/eX/eY를 지원합니다. 한국어 원문·퍼센트 인코딩 URL 모두 원본 문자열을 보존합니다. 새 탭 링크는 noopener noreferrer를 사용하고 미등록/무효이면 비활성입니다. 실제 출발지·도착지·이동수단·경로 정확성은 자동 확인할 수 없으므로 담당자가 호텔 출발/정확한 지점 도착/모바일 실행을 확인해야 합니다.

## 개발·운영 구분

`validate`는 스키마·중복·날짜·URL을, `validate:hotel-copy`는 승인 원고를 검사합니다. `build`는 demo를 허용하는 개발 산출물입니다. 운영 명령 `build:production`은 이전 출력 정리 → 원본 구조 검사 → 공개 스냅샷 생성/운영 검증 → 관리자 코드 제외 빌드 순서이며 실패 시 운영 산출물을 남기지 않습니다.

운영은 두 데이터의 production 상태, 미래가 아닌 실제 확인일, 호텔 공통 시간, 공개 시설의 4개 언어 이름·설명·주소·시간·이동 안내·휴무일, 호텔의 필수 안내·설명을 요구합니다. 현재 demo·누락 확인일/안내·빈 호텔 description 때문에 운영 준비가 되지 않았습니다. 상태만 바꾸어 우회하지 않습니다. 비공개 시설도 구조 검사를 받으며 운영 번들에서는 제외됩니다. 원본 GitHub/개발 번들은 공개될 수 있으므로 비밀 정보·고객 개인정보를 저장하지 않습니다.
