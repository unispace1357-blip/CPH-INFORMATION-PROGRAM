# STEP 05 Guest Guide

이 문서는 STEP 05 당시 구현·검증 기록입니다. STEP 06에서도 Guest 동작과 기존 테스트를 유지합니다. 아래의 비공개 게시 제외 절차 준비 항목은 STEP 06에서 운영 빌드의 공개 스냅샷 선별로 구현했습니다. 현재 관리자·166개 테스트·배포 데이터 제외 검증은 [관리자 사용 안내](admin-manager.md)를 참고하세요.

## 구현 범위와 화면 구조

`/guest`에서 영어·한국어·중국어 간체·일본어 안내, 호텔 기본 정보 조회, 공개 시설 목록·검색·카테고리 필터·상세 조회를 구현했습니다. 기존 `/` → `/guest`, `/staff`, 404 화면과 공통 디자인 시스템을 유지합니다. 직원용 메뉴는 Guest에 표시하지 않습니다.

화면 순서: 전용 헤더·영역 내비게이션 → 언어 선택 → 환영 메시지·데이터 상태 안내 → 호텔 5개 주제·상세 → 주변 시설 10개 카테고리 → 검색·초기화 → 결과 개수·카드 → 시설 상세 → 정보 확인·프론트 문의 푸터.

`GuestPage`는 검색어·카테고리·시설 ID·호텔 주제와 서로 독립적인 시설/호텔 로딩 상태를 관리합니다. `HotelInformation`, `GuestFacilityResults`, `GuestFacilityDetail`은 표시 책임을 분리합니다. 공통 LanguageSelector, SearchInput, CategoryCard, FacilityCard, Button, LoadingState, EmptyState, InformationNotice를 재사용합니다. 새 애플리케이션 의존성은 없습니다.

## 지원 언어와 상태 관리

| 코드 | 언어 선택 표시 |
| --- | --- |
| en | English |
| ko | 한국어 |
| zh-CN | 简体中文 |
| ja | 日本語 |

초기 언어는 `en`입니다. `GuestLanguageProvider`를 Router 상위에 두어 Guest 페이지·헤더·푸터·404가 동일한 Context를 사용합니다. 앱 내 이동이나 상세 선택으로 언어를 초기화하지 않습니다. 언어 변경은 검색어·카테고리·선택 시설·호텔 주제를 유지하며, 검색 결과 내용과 상세 내용을 새 언어로 다시 표시합니다. 전체 새로고침이나 새 탭에서는 영어로 시작합니다. 쿠키·localStorage·분석 도구는 사용하지 않습니다.

`GuideLayout`은 선택 언어에 맞춰 `document.documentElement.lang`과 `document.title`을 갱신합니다. Staff 화면에서는 기존 한국어 문서 설정·텍스트를 유지합니다. 제공받은 호텔 고유 표기 `SONGDO CENTRAL PARK HOTEL`과 CPH 문자는 공통 브랜드 표기로 유지하며 임의의 호텔명 번역을 만들지 않았습니다. 언어 버튼은 각 언어의 원어 이름을 유지합니다.

## 다국어 UI 사전

`src/i18n/messages.ts`에 4개 언어별 사전을 관리합니다. `types.ts`의 `GuestMessages`와 `satisfies Record<GuideLanguage, GuestMessages>`가 UI 키 **70개**, 원본 시설 카테고리 **10개**, 호텔 주제 **5개**를 모든 언어에 요구합니다. 자동 테스트는 키 구성·빈 값·치환 변수의 일치도 검사합니다.

`formatters.ts`는 결과 개수·도보시간·확인일의 공통 값을 현지화된 문구에 넣습니다. UI 메시지는 직접 작성한 일반 안내 문구입니다. 시설·호텔 정책을 생성하거나 번역 API를 호출하지 않습니다. 실제 정책은 검수된 JSON의 선택 언어 필드에 등록해야 합니다.

## 공통 JSON 연결과 오류 분리

Staff와 Guest는 같은 `src/data/facilities.json`을 기존 검증기로 읽은 동일한 `facilityDataset` 객체를 사용합니다. 별도의 시설 목록은 만들지 않습니다. 호텔은 기존 `src/data/hotel.json`과 호텔 검증기를 사용합니다. 원본 JSON·JSON Schema·TypeScript 데이터 타입과 production 검증은 변경하지 않았습니다.

두 검증 객체의 생성 책임을 `data/facilityDataset.ts`, `data/hotelDataset.ts`로 나눴으며 `data/index.ts`는 기존 이름을 다시 내보냅니다. Guest가 기존 index 전체를 한 번에 불러오면 호텔 검증 오류가 시설까지 차단할 수 있어, `loadGuestData.ts`에서 두 모듈을 각각 가져옵니다. Staff 로더도 시설 모듈만 가져오도록 필요한 한 부분을 수정했습니다. 기존 index·Staff·Guest가 동일한 시설 객체를 반환하는지 자동 테스트로 확인했습니다.

각 영역은 로딩·검증/로딩 오류·빈 데이터·정상 데이터를 따로 표시합니다. 오류는 선택 언어로 안내하고 전체 새로고침 버튼을 제공합니다. 한 영역이 오류여도 다른 정상 영역은 사용할 수 있습니다. 로딩/오류 상태의 관련 데이터 컨트롤은 비활성화합니다. 오류 대신 허위 시설이나 호텔 안내를 만들지 않습니다.

## 호텔 기본 정보

| 주제 코드 | 영어 표시 | 한국어 표시 |
| --- | --- | --- |
| checkIn | Check-in | 체크인 |
| checkOut | Check-out | 체크아웃 |
| breakfast | Breakfast | 조식 안내 |
| parking | Parking | 주차 안내 |
| roomUsage | Room information | 객실 이용 안내 |

중국어·일본어도 동일한 5개 주제를 제공합니다. 주제 선택 시 같은 페이지의 상세 패널에 `hotel.translations[language][topic]`을 표시하며, 이름·설명·주소·참고 사항도 선택 언어의 등록 값만 사용합니다. 체크인/체크아웃 주제는 공통 `checkInTime`/`checkOutTime`을 사용합니다. null 시간은 현지화된 미확인 상태이며 기본 시간을 만들어 넣지 않습니다.

선택 언어의 모든 안내와 공통 시간이 비어 있으면 호텔 안내 미등록 메시지를 표시합니다. 현재 원본 호텔 JSON은 빈 demo 데이터입니다. 5개 주제 선택과 미확인 안내는 사용할 수 있으나 실제 호텔 정책은 제공하지 않습니다. 닫기는 선택 주제를 해제하고 해당 카드에 포커스를 돌려줍니다.

## 시설 카테고리와 공개 조건

| 원본 코드 | 영어 표시 |
| --- | --- |
| hotel | Hotel facilities |
| dining | Restaurants |
| cafe | Cafes |
| convenience | Convenience stores |
| pharmacy | Pharmacies |
| shopping | Shopping |
| attraction | Attractions |
| transportation | Transportation |
| sauna_spa | Sauna & Spa |
| atm | ATMs |

원본 10개 코드는 유지하고 표시명만 4개 언어로 관리합니다. 처음에는 전체를 선택합니다. 카테고리는 검색어와 AND로 적용합니다. 선택 카테고리를 다시 누르거나 전체를 누르면 카테고리 조건을 해제합니다. 선택 스타일과 `aria-pressed`를 제공합니다.

`isPublished: true`인 시설만 전체 목록·필터·검색·상세에 표시합니다. 조건 변경으로 선택 시설이 결과에서 제외되면 선택 ID를 해제합니다. 언어 변경은 동일한 공개 시설 선택을 유지합니다. 현재 원본 시설은 가상 6개이며 공개 시설 5개가 표시됩니다.

## Guest 검색 정책

`guestFacilitySearch.ts`의 독립 함수가 아래 필드를 검색합니다.

- 4개 언어 `translations[language].name`
- 4개 언어 `keywords[language]`

선택 언어의 이름·키워드를 먼저 검사하고 나머지 언어도 검사합니다. 결과 순서는 원본 JSON 순서이며 선택 언어와 무관하게 등록된 다른 언어 검색어로도 같은 시설을 찾습니다. 표시 내용은 검색어 언어가 아닌 화면 선택 언어를 따릅니다.

기존 `normalizeSearchTerm`을 재사용하여 NFC 정규화·앞뒤 공백 제거·대소문자 무시 후 부분 문자열 `includes`로 비교합니다. 특수문자는 정규식으로 실행하지 않습니다. 빈 검색어는 전체 공개 시설을 반환합니다. 주소·설명·카테고리명은 Guest 검색 대상이 아니며 병음·로마자 변환이나 임의의 키워드 확장은 하지 않습니다.

검색은 입력 시 갱신하고 결과 개수를 안내합니다. 지우기는 검색어만 초기화합니다. 공개 목록 자체가 없을 때와 검색 조건에 일치하는 시설이 없을 때를 구분합니다. 기존 Staff는 한·영 이름·키워드·주소 검색을 유지하며 Guest 함수로 대체하지 않습니다.

## 상세 표시와 미확인 정보

선택한 시설의 이름·카테고리·설명·주소·영업시간·휴무일·도보시간·이동 안내·참고 사항·확인일을 같은 페이지의 상세 패널에 표시합니다. 번역 필드는 `facility.translations[language]` 및 `closedDays[language]`을 사용합니다. 닫기는 선택을 해제하고 원래 결과 카드의 상세 버튼에 포커스를 돌려줍니다. 상세 제목에 포커스를 이동하며 언어 변경만으로 선택을 해제하거나 스크롤을 다시 이동하지 않습니다.

빈 문자열·공백·null은 해당 언어의 미확인 문구로 처리합니다. 다른 언어의 정보로 대체하거나 주소·시간·안내 정책을 추정하지 않습니다. walkingMinutes가 유효한 비음수 숫자이면 현지화된 도보시간을 표시하고 null이면 미확인으로 표시합니다. lastVerifiedAt은 등록된 날짜와 현지화된 제목 또는 확인 전 상태입니다. 날짜 형식은 공통 YYYY-MM-DD를 유지합니다.

실시간 영업 상태, 현재 방문 가능 여부, 도보시간 계산, 길찾기는 구현하지 않습니다. 등록된 시간·확인일이 현재 영업을 보장하지 않는다는 안내를 표시합니다.

## demo·production 안전장치

어느 한 정상 데이터가 demo이면 상단에 4개 언어의 개발용 미리보기 경고를 표시합니다. 가상 정보는 실제 방문/고객 안내에 사용할 수 없음을 안내합니다. 두 데이터가 production이면 확인일과 프론트 확인 안내를 표시하며 실제 정보 정확성을 보증하지 않습니다.

시설·호텔 원본은 계속 demo입니다. 개발 `validate`/`build`에서는 demo를 허용하고, 고객 배포용 `validate:production`/`build:production`은 기존 필수 정보·날짜·production 조건을 유지합니다. 현재 demo 파일에서는 두 운영 명령이 종료 코드 1로 차단되며 `dist-production/`이 생성되지 않습니다. 실제 배포는 수행하지 않았습니다.

비공개 UI 제외는 정적 파일의 접근 제어가 아닙니다. 원본 JSON과 코드에는 비밀 정보·개인정보를 저장하지 않습니다. 비공개 데이터를 배포 결과물에서 제외하는 게시 절차는 STEP 06/09에서 별도로 검증해야 합니다.

## 모바일·접근성

기존 색상·시스템 폰트·여백·로컬 SVG 디자인을 유지합니다. 언어 선택은 스크롤 중에도 보이는 sticky 영역입니다. 모바일 카테고리는 2열, 600px 이상 3열, 1000px 이상 4열입니다. 시설 결과는 768px 미만 1열, 이상 2열입니다. 긴 중국어·일본어 문구와 상세 필드는 줄바꿈하며 주요 버튼/입력은 44×44 CSS px 이상을 목표로 합니다.

native 버튼·label 연결·선택 `aria-pressed`·본문 건너뛰기·포커스 표시·결과 개수 `role=status`/`aria-live`·오류 `role=alert`를 사용합니다. 상세 열기/닫기는 키보드 포커스를 관리합니다. 전체 접근성 인증이나 스크린리더 실기 검증은 수행하지 않았습니다.

## 검증 결과 (2026-10-15)

| 명령 | 최종 결과 |
| --- | --- |
| `npm run validate` | PASS, 시설 6개와 빈 호텔 demo 데이터 유효 |
| `npm run test` | PASS, 131개, 실패·스킵 0 |
| `npm run lint` | PASS |
| `npm run build` | PASS, 타입 검사·JSON 검증·정적 빌드 |
| `npm run test:ui` | PASS, 기존 경로·반응형·favicon·키보드 회귀 |
| `npm run test:staff-ui` | PASS, 기존 직원용 검색·상세·복사 회귀 |
| `npm run test:guest-ui` | PASS, 4개 언어·6개 폭·오류 분리 |
| demo `npm run validate:production` | 예상 차단, 종료 코드 1 |
| demo `npm run build:production` | 예상 차단, 종료 코드 1, 배포 출력 없음 |

기존 데이터 56개와 Staff 35개 테스트를 유지했으며 Guest 검색 18개·다국어 13개·호텔/로더 9개, 총 40개를 추가했습니다. 검색·호텔 테스트는 독립적인 가상 Fixture를 사용합니다. 기존 91개 테스트 파일·JSON·스키마·데이터 타입·의존성 잠금 파일은 변경하지 않았습니다.

| 실제 headless Chromium 폭 | Guest 4개 언어 | 기존 화면/경로 회귀 |
| --- | --- | --- |
| 320px | PASS | PASS |
| 375px | PASS | PASS |
| 390px | PASS | PASS |
| 430px | PASS | PASS |
| 768px | PASS | PASS |
| 1280px | PASS | PASS |

Guest는 각 폭에서 헤더·푸터·UI·시설 데이터 전환, 5개 호텔 주제, 10개 카테고리, 검색/필터, 상세 선택 유지·닫기/포커스, 미확인 값, 비공개 제외, 문서 언어/제목, 터치 영역·가로 넘침·잘림을 확인했습니다. 앱 내 404 이동/복귀 후 언어 유지와 Guest에서 Staff 이동 시 한국어 문서 설정도 확인했습니다. 기존 `/`, `/guest`, `/staff`, 404 직접 접속·화면 이동은 회귀 스크립트에서 검증했습니다.

브라우저 메모리에서만 가상 검증 값을 주입하여 호텔/시설 검증 오류, 모듈 로딩 실패, 빈 공개 목록, 등록된 4개 언어 텍스트·공통 시간/도보시간/확인일, production 상태 안내를 확인했습니다. 이런 값은 원본 JSON·배포 데이터에 기록하지 않았습니다. 호텔 오류 상황에서도 Staff 검색과 실제 clipboard write/read 복사는 성공했습니다. 기존 직원 스크립트의 0개·1개·여러 문구·전체 복사도 정상입니다. 클립보드 미지원/권한 거부는 모의 검증입니다.

로컬 SVG/ICO favicon은 HTTP 200입니다. 최종 QA에서 JavaScript·콘솔·HTTP 오류와 외부 API/원격 리소스 요청은 없었습니다. 실제 Chromium 모바일 4개 언어·시설 상세·직원 PC 캡처를 저장했습니다. 캡처는 원본 demo 데이터 실행 화면이며 실제 호텔 정책을 표현하지 않습니다.

### 브라우저 재검증 방법

앱에 Playwright를 추가하지 않고 별도 QA 환경의 기존 Playwright와 시스템 Chromium을 재사용했습니다.

```bash
# 터미널 1
npm run dev -- --host 0.0.0.0 --port 5174 --strictPort

# 터미널 2: 이 클라우드 QA 환경
NODE_PATH=/tmp/cph-browser-check/node_modules \
CPH_UI_ARTIFACT_DIR=/workspace/exports/step05 \
npm run test:guest-ui

NODE_PATH=/tmp/cph-browser-check/node_modules \
CPH_UI_ARTIFACT_DIR=/workspace/exports/step05-staff \
npm run test:staff-ui

NODE_PATH=/tmp/cph-browser-check/node_modules \
CPH_UI_ARTIFACT_DIR=/workspace/exports/step05-regression \
npm run test:ui
```

다른 환경에서는 별도 Playwright 경로와 Chromium이 필요합니다. `CPH_CHROMIUM_PATH`, `CPH_UI_BASE_URL`, `CPH_UI_ARTIFACT_DIR`로 지정할 수 있습니다. 도구가 없거나 명령을 실행하지 않았다면 브라우저 항목은 미검증입니다.

## 알려진 제한·미구현 기능·STEP 06 준비

현재 검증 범위에서 미해결 코드 오류는 발견하지 않았습니다. 실물 휴대전화, Safari/Firefox, 스크린리더, 실제 호스팅과 호텔 운영 환경은 미검증입니다. 일반 UI 문구의 원어민 감수와 실제 안내 데이터 검수도 진행하지 않았습니다. 따라서 실제 투숙객 안내에는 아직 사용할 수 없습니다.

관리자 등록·수정·삭제·로그인, 실제 운영 정보 입력, AI/번역/지도 API, 서버·DB, 실시간 영업/거리 계산, 개인정보 수집·행동 추적, QR 발급과 Cloudflare 배포는 구현하지 않았습니다.

STEP 05 검수 후 STEP 06 로컬 관리자 작업을 시작할 수 있습니다. 다음 단계에서는 JSON 불러오기/내보내기·시설 공개 상태·4개 언어 편집·스키마/날짜 검증·호텔 정보 분리 관리, 비공개 데이터의 게시 제외 방식과 운영 전 사람의 확인 절차를 먼저 설계합니다. 기존 Staff/Guest가 같은 형식의 JSON을 읽는 계약과 production 배포 차단을 유지해야 합니다.
