# CPH Guest Information Guide

송도 센트럴파크호텔 프론트의 QR 기반 다국어 안내 프로그램입니다.
현재 **STEP 06: 로컬 관리자 프로그램**까지 구현했습니다. 관리자에서 시설 등록·수정·삭제·공개 설정, 4개 국어·영어 문구·호텔 정보 편집, JSON 입출력과 검증을 사용할 수 있습니다. 기존 Guest 4개 국어 안내와 Staff 검색·상세·영어 문구 복사를 유지합니다. 시설은 가상 데이터이며 호텔 정보는 비어 있으므로 실제 고객 안내에 사용하지 않습니다. 실제 운영 정보 입력·조사·배포는 진행하지 않았습니다.

## 실행

Node.js 24 LTS와 npm을 사용합니다. 저장소 루트에서 실행하세요.

```bash
npm ci
npm run dev -- --host 0.0.0.0
```

기본 개발 포트는 5173입니다. `/`는 `/guest`로 이동합니다.
- `/guest`: 고객용 4개 국어 호텔·주변 시설 안내
- `/staff`: 직원용 검색·상세·English Guide
- 그 외 주소: 페이지 없음 화면

쓰기 제한이 있는 클라우드 환경에서는 `npm --cache /tmp/cph-npm-cache ci`를 사용할 수 있습니다.

## 로컬 관리자 실행

```bash
npm run admin:dev
```

담당자 PC에서 실행하면 기본 `127.0.0.1:5190`에서 관리자 화면을 사용할 수 있습니다. 공개 앱의 `/admin` 라우트는 없습니다. 관리자와 공개 앱은 진입점·빌드 경로·개발 캐시가 분리돼 있습니다. 관리자 로컬 빌드 검사는 `npm run admin:build`이며 출력 `dist-admin/`은 공개 배포하지 않습니다.

시설을 선택하거나 추가한 뒤 언어별 정보를 입력하고 **편집 내용 저장**을 누르세요. 이 저장은 현재 브라우저 작업 데이터만 변경합니다. 가져오기/내보내기에서 전체 시설·호텔 JSON을 내려받고, PC에 파일이 저장된 것을 확인한 뒤 **파일 저장 확인** 버튼을 누릅니다. 다운로드 요청만으로 변경사항 경고를 해제하지 않습니다. 원본 JSON·GitHub·사이트에는 자동 반영되지 않습니다. 자세한 사용법은 [관리자 사용 안내](docs/admin-manager.md)에 있습니다.

## 검증 및 빌드

```bash
npm run validate
npm run test
npm run lint
npm run build
npm run preview -- --host 0.0.0.0
```

STEP 06 (2026-10-15): 위 4개 명령과 `admin:build` PASS, **166개 자동 테스트** 통과(기존 131 + 신규 35, 실패·스킵 0). `test:admin-ui`, `test:ui`, `test:staff-ui`, `test:guest-ui`도 실제 Chromium에서 PASS입니다. 관리자 390·768·1280·1440px, Guest/경로 6개 폭, Staff 업무 4개 폭을 확인했습니다. 가상 production Fixture로 실제 Vite 산출물을 만들어 비공개 고유 문자열 34개와 관리자 코드·HTML·에셋이 없는지 검사했습니다. 두 원본 JSON은 demo 상태로 유지하고 운영 명령은 예상 종료 코드 1로 차단됩니다. 사용법·제한·브라우저 재실행 명령은 [관리자 사용 안내](docs/admin-manager.md)에 있습니다.

아래는 STEP 05 당시 결과입니다. 위 4개 검증 명령 PASS, 기존 91개와 신규 40개 자동 테스트 **131개** 통과(실패·스킵 0개). 실제 headless Chromium으로 Guest의 4개 언어를 320·375·390·430·768·1280px에서 확인했습니다. 기존 `test:ui`, `test:staff-ui`와 신규 `test:guest-ui`도 PASS입니다. 호텔/시설 오류 분리, 언어·상세 선택 유지, 키보드·터치 영역, 가로 넘침, favicon과 외부 요청을 검증했습니다. demo 운영 배포 차단은 유지합니다. 자세한 구조·당시 결과는 [고객용 가이드](docs/guest-guide.md)에 있습니다.

아래는 STEP 04 당시 결과입니다. 위 4개 검증 명령 PASS, 기존 56개와 신규 35개 자동 테스트 **91개** 통과. 직원용 검색·선택·복사는 실제 Chromium 320·390·768·1280px에서 확인했습니다. 자세한 직원용 규칙과 당시 결과는 [직원용 가이드](docs/staff-guide.md)에 있습니다.

아래는 STEP 03 당시 검증 결과입니다. STEP 03: 위 4개 검증 명령 PASS, 기존 테스트 56개 통과. 실제 Chromium으로 320·375·390·430·768·1280px 화면과 경로·키보드·비활성 상태를 확인했습니다. favicon SVG/ICO는 HTTP 200이며 브라우저 콘솔 오류·외부 리소스 요청이 없었습니다.

UI 구조, 공통 컴포넌트, 반응형 기준과 선택적인 `npm run test:ui` 실행 방법은 [STEP 03 UI 문서](docs/ui-system.md)에 있습니다.

`validate`는 시설·호텔 JSON을 로컬에서 검증하고, `test`는 데이터 코드·테스트의 엄격한 타입 검사와 자동 테스트를 실행합니다. Node.js 24의 TypeScript 실행을 사용합니다. 기존 `validate:data`, `test:data`도 별칭으로 유지합니다.
`build`는 개발용 JSON 검증, 앱 TypeScript 검사와 정적 파일 빌드를 실행하며 결과는 `dist/`에 생성됩니다. 개발 빌드에서는 demo 데이터를 허용합니다.

고객 배포용 빌드는 별도 명령을 사용합니다.

```bash
npm run validate:production
npm run build:production
```

시설·호텔 데이터가 모두 `production`이고 공개 시설·호텔의 필수 안내와 확인일을 충족해야 성공합니다. 운영 확인일은 미래 날짜를 허용하지 않습니다. 현재 demo 파일로는 종료 코드 1로 차단됩니다. 배포 빌드 출력은 개발 빌드와 분리된 `dist-production/`입니다. 자세한 필수 조건은 [데이터 명세](docs/data-model.md)에 있습니다.

STEP 06부터 운영 빌드는 원본 검증 → 공개 시설만 선별 → 운영 검증 → 임시 스냅샷 → Vite 빌드로 연결됩니다. 원본 전체 JSON을 덮어쓰지 않으며 비공개 시설은 운영 번들에 들어가지 않습니다. 공개 빌드의 관리자 모듈 의존성도 검사합니다. `dist/` 개발 빌드는 기존 전체 demo JSON을 포함할 수 있으므로 고객 배포에 사용하지 않습니다.

STEP 02 보완 검증: `validate`, `test`, `lint`, `build` PASS, 테스트 56개 통과(실패·스킵 0개). demo 상태의 `validate:production`, `build:production`은 예상대로 종료 코드 1로 차단됐고 배포 출력은 생성되지 않았습니다. 이 문단은 STEP 02 당시 결과입니다. STEP 03의 브라우저 결과는 UI 문서에서 확인할 수 있으며 실제 호스팅 배포는 수행하지 않았습니다.

STEP 01 재검수 (2026-10-13):

| 검사 | 결과 |
| --- | --- |
| `npm ci --cache /tmp/cph-npm-cache` | PASS (종료 코드 0, 잠금 파일 변경 없음) |
| `npm run lint` | PASS (종료 코드 0) |
| `npm run build` | PASS (종료 코드 0, TypeScript 검사 포함) |
| 개발 서버 및 `/guest`, `/staff`, 없는 경로 | PASS (HTTP 200, 각 화면의 제목 확인) |
| `.env`, `.env.*` 제외 / `.env.example` 예외 | PASS (`git check-ignore` 확인) |
| 실제 Chromium 154 브라우저 검증 | PASS (아래 범위) |
| 브라우저 콘솔의 리소스 오류 없음 | FAIL (`/favicon.ico` 404 발생) |

실제 headless Chromium에서 1280px·390px·320px 너비로 직접 접속, 새로고침, 메뉴 클릭, 활성 메뉴, 뒤로/앞으로 이동, 없는 경로에서 고객 화면으로 복귀, `/`에서 `/guest`로 이동을 확인했습니다. 가로 넘침과 JavaScript 실행 예외는 없었으며 데스크톱·390px 화면 캡처도 확인했습니다. 없는 경로는 SPA 특성상 HTTP 200으로 로드된 뒤 앱 내부에서 404 안내 화면을 표시합니다.

위 STEP 01 당시의 favicon 404는 STEP 03에서 로컬 SVG/ICO를 추가하여 해결했습니다. Cloudflare 배포, 실제 휴대전화, Safari·Firefox는 미검증입니다. STEP 01 당시에는 자동화 테스트 스위트가 없었습니다. STEP 02에서는 데이터 검증 테스트를 추가했습니다.

## 폴더 구조

```text
src/
  components/layout/GuideLayout.tsx  # audience별 전용 헤더·내비게이션·푸터
  components/ui/                    # 공통 UI 컴포넌트 10개와 로컬 Icon
  components/staff/                 # 검색 결과·상세·English Guide
  components/guest/                 # 호텔 안내·시설 결과·고객용 상세
  i18n/                            # 4개 언어 UI 사전·표시 함수·언어 Context
  services/                        # 검색·표시·데이터 로딩·클립보드
  config/uiCategories.ts            # 원본 코드의 Staff/Guest 표시 이름
  pages/guest/GuestPage.tsx          # 고객용 언어·검색·필터·선택 상태
  pages/staff/StaffPage.tsx          # 직원용 시작 화면
  pages/NotFoundPage.tsx            # 잘못된 주소 안내
  data/facilities.json              # 가상 시설 6개를 포함하는 공통 데이터
  data/facilities.schema.json       # JSON Schema (draft-07)
  data/validateFacilityDataset.ts   # 스키마·날짜·중복 ID 검증
  data/hotel.json                  # 4개 언어의 빈 호텔 기본 정보
  data/hotel.schema.json           # 호텔 JSON Schema
  data/validateHotelDataset.ts     # 호텔 정보 검증
  data/validateProductionData.ts   # 고객 배포용 운영 필수 조건 검증
  data/facilityDataset.ts          # 공통 시설 JSON 검증·객체 생성
  data/hotelDataset.ts             # 호텔 JSON 검증·객체 생성
  data/index.ts                    # 두 공통 객체의 기존 공개 인터페이스
  types/guide.ts                   # 공통 언어·데이터 상태 타입
  types/facility.ts                # 시설 타입
  types/hotel.ts                   # 호텔 기본 정보 타입
  styles/tokens.css                # 색상·폰트·간격·모서리 토큰
  styles/global.css                # 모바일 우선 공통 스타일
  App.tsx                          # React Router 라우트
  main.tsx                         # React 진입점
  index.css                        # 공통 스타일 진입점
```

시설 데이터와 UI를 분리했습니다. Staff와 Guest는 동일한 `facilityDataset` 객체를 사용합니다. `src/data/index.ts`의 기존 export를 유지하면서 객체 생성은 시설·호텔 모듈로 분리했습니다. UI는 각 모듈을 독립적으로 불러오므로 호텔 오류가 정상 시설 안내와 Staff를 차단하지 않습니다. JSON·스키마·타입은 변경하지 않았습니다. 모든 시설은 가상 데이터이며 호텔 기본 정보는 빈 데이터입니다. 실제 호텔 정보는 없습니다. 기존 시설 JSON의 새 필드가 누락된 경우 원본을 변경하지 않고 기본값으로 보완합니다.

Guest는 4개 언어 시설명·키워드를 검색하며, Staff는 기존 한·영 시설명·키워드·주소 검색을 유지합니다. Guest 화면의 시설 정보는 선택 언어의 값만 사용하고, 누락된 정보를 다른 언어로 대체하지 않습니다. 언어 상태는 앱 내 이동·시설 선택 동안 유지하며 전체 새로고침 시 영어로 초기화합니다. 개인정보나 언어 설정을 브라우저 저장소에 기록하지 않습니다.

데이터 필드와 관리 규칙은 [데이터 명세](docs/data-model.md)에 있습니다.

관리자·게시 준비 파일:

```text
tools/admin/
  index.html / main.tsx / AdminApp.tsx # 공개 앱과 독립된 로컬 진입점
  components/                        # 시설·호텔 편집, 필드·목록·검증 표시
  services/                          # 메모리 작업·검증·JSON 다운로드
  styles/admin.css                   # 공통 디자인을 사용하는 PC 레이아웃
src/data/createPublicDataset.ts      # 검증 후 공개 시설 선별
src/data/preparePublicDeployment.ts  # 운영 스냅샷 검증
scripts/build-production.ts          # OS 전용 셸 명령 없는 운영 빌드
vite.admin.config.ts / tsconfig.admin.json
```

## 운영 및 배포 원칙

- 백엔드, 서버 DB, 외부 API, 실시간 지도·번역 API를 사용하지 않습니다.
- 고객 개인정보를 수집하지 않으며 공개 코드·JSON에 비밀 정보를 저장하지 않습니다.
- Staff 경로는 공개 화면입니다. 경로 이름은 접근 제어 기능이 아닙니다.
- Admin은 로컬 전용 독립 진입점입니다. 공개 앱의 라우트·메뉴·번들에 포함하지 않습니다.
- 무료 정적 호스팅을 지원합니다. 향후 고객용 Cloudflare Pages 빌드 명령은 `npm run build:production`, 출력 경로는 `dist-production`입니다.
- BrowserRouter를 사용합니다. 직접 접속·새로고침을 위해 호스팅에서 SPA fallback이 필요합니다. Cloudflare Pages는 최상위 `404.html`이 없으면 기본 SPA fallback을 지원합니다. 실제 배포는 아직 하지 않았습니다.
- QR 생성 및 연결은 실제 배포 주소가 확정된 후 진행합니다.

## 다음 단계 제안 (검수 후 진행)

STEP 06 검수 후 STEP 07에서 담당자가 실제 호텔·시설 정보와 번역을 조사·확인·입력할 수 있습니다. 코드·스키마 PASS는 실제 정보 정확성의 보증이 아닙니다. STEP 07 조사·입력, QR 발급, 실제 배포는 이번 작업에서 진행하지 않았습니다.

STEP 03에서 고객 화면의 직원용 메뉴를 숨겼습니다. `/staff`에는 직접 접속할 수 있으며 메뉴 숨김은 인증 기능이 아닙니다. 직원용 화면에도 비밀 정보나 개인정보를 저장하지 않습니다.
