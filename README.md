# CPH Guest Information Guide

송도 센트럴파크호텔 프론트의 QR 기반 다국어 안내 프로그램입니다.
현재 **STEP 02: 공통 데이터 구조와 가상 데이터**까지 구현했습니다. 화면은 STEP 01 기본 화면을 유지하며 검색, 상세 화면, 언어 전환, 관리자 기능은 이후 단계에서 구현합니다.

## 실행

Node.js 24 LTS와 npm을 사용합니다. 저장소 루트에서 실행하세요.

```bash
npm ci
npm run dev -- --host 0.0.0.0
```

기본 개발 포트는 5173입니다. `/`는 `/guest`로 이동합니다.
- `/guest`: 고객용 기본 화면
- `/staff`: 직원용 기본 화면
- 그 외 주소: 페이지 없음 화면

쓰기 제한이 있는 클라우드 환경에서는 `npm --cache /tmp/cph-npm-cache ci`를 사용할 수 있습니다.

## 검증 및 빌드

```bash
npm run validate
npm run test
npm run lint
npm run build
npm run preview -- --host 0.0.0.0
```

`validate`는 시설·호텔 JSON을 로컬에서 검증하고, `test`는 데이터 코드·테스트의 엄격한 타입 검사와 자동 테스트를 실행합니다. Node.js 24의 TypeScript 실행을 사용합니다. 기존 `validate:data`, `test:data`도 별칭으로 유지합니다.
`build`는 개발용 JSON 검증, 앱 TypeScript 검사와 정적 파일 빌드를 실행하며 결과는 `dist/`에 생성됩니다. 개발 빌드에서는 demo 데이터를 허용합니다.

고객 배포용 빌드는 별도 명령을 사용합니다.

```bash
npm run validate:production
npm run build:production
```

시설·호텔 데이터가 모두 `production`이고 공개 시설·호텔의 필수 안내와 확인일을 충족해야 성공합니다. 운영 확인일은 미래 날짜를 허용하지 않습니다. 현재 demo 파일로는 종료 코드 1로 차단됩니다. 배포 빌드 출력은 개발 빌드와 분리된 `dist-production/`입니다. 자세한 필수 조건은 [데이터 명세](docs/data-model.md)에 있습니다.

STEP 02 보완 검증: `validate`, `test`, `lint`, `build` PASS, 테스트 56개 통과(실패·스킵 0개). demo 상태의 `validate:production`, `build:production`은 예상대로 종료 코드 1로 차단됐고 배포 출력은 생성되지 않았습니다. 이번 보완의 브라우저·실제 호스팅 배포는 미검증입니다.

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

남은 문제: favicon 파일이 없어 브라우저 자동 요청에 404가 발생합니다. 화면 이동·렌더링은 정상이며 이번 수정에서는 favicon을 추가하지 않았습니다. Cloudflare 배포, 실제 휴대전화, Safari·Firefox는 미검증입니다. STEP 01 당시에는 자동화 테스트 스위트가 없었습니다. STEP 02에서는 데이터 검증 테스트를 추가했습니다.

## 폴더 구조

```text
src/
  components/layout/GuideLayout.tsx  # 공통 헤더, 내비게이션, 본문, 푸터
  pages/guest/GuestPage.tsx          # 고객용 시작 화면
  pages/staff/StaffPage.tsx          # 직원용 시작 화면
  pages/NotFoundPage.tsx            # 잘못된 주소 안내
  data/facilities.json              # 가상 시설 6개를 포함하는 공통 데이터
  data/facilities.schema.json       # JSON Schema (draft-07)
  data/validateFacilityDataset.ts   # 스키마·날짜·중복 ID 검증
  data/hotel.json                  # 4개 언어의 빈 호텔 기본 정보
  data/hotel.schema.json           # 호텔 JSON Schema
  data/validateHotelDataset.ts     # 호텔 정보 검증
  data/validateProductionData.ts   # 고객 배포용 운영 필수 조건 검증
  data/index.ts                    # Staff/Guest의 향후 공통 진입점
  types/guide.ts                   # 공통 언어·데이터 상태 타입
  types/facility.ts                # 시설 타입
  types/hotel.ts                   # 호텔 기본 정보 타입
  styles/global.css                # 모바일 우선 공통 스타일
  App.tsx                          # React Router 라우트
  main.tsx                         # React 진입점
  index.css                        # 공통 스타일 진입점
```

시설 데이터와 UI를 분리했습니다. 후속 단계의 Staff/Guest 기능은 `src/data/index.ts`를 통해 동일한 JSON을 사용합니다. 현재 화면에는 데이터를 연결하지 않았습니다. 모든 시설은 가상 데이터이며 호텔 기본 정보는 빈 데이터입니다. 실제 호텔 정보는 없습니다. 기존 시설 JSON의 새 필드가 누락된 경우 원본을 변경하지 않고 기본값으로 보완합니다.

데이터 필드와 관리 규칙은 [데이터 명세](docs/data-model.md)에 있습니다.

## 운영 및 배포 원칙

- 백엔드, 서버 DB, 외부 API, 실시간 지도·번역 API를 사용하지 않습니다.
- 고객 개인정보를 수집하지 않으며 공개 코드·JSON에 비밀 정보를 저장하지 않습니다.
- Staff 경로는 공개 화면입니다. 경로 이름은 접근 제어 기능이 아닙니다.
- Admin은 이후 로컬 전용으로 분리합니다. 현재 관리자 화면은 없습니다.
- 무료 정적 호스팅을 지원합니다. 향후 고객용 Cloudflare Pages 빌드 명령은 `npm run build:production`, 출력 경로는 `dist-production`입니다.
- BrowserRouter를 사용합니다. 직접 접속·새로고침을 위해 호스팅에서 SPA fallback이 필요합니다. Cloudflare Pages는 최상위 `404.html`이 없으면 기본 SPA fallback을 지원합니다. 실제 배포는 아직 하지 않았습니다.
- QR 생성 및 연결은 실제 배포 주소가 확정된 후 진행합니다.

## 다음 단계 제안 (검수 후 진행)

STEP 02의 데이터 구조를 검수한 후 STEP 03에서 직원용 기본 조회·검색·카테고리 필터와 내비게이션 구분을 진행하는 것을 제안합니다. 이후 단계별로 상세·언어 전환·로컬 관리자 기능을 구현합니다.

### STEP 03 예정 작업

고객용 화면에서 직원용 메뉴를 숨기도록 내비게이션을 개선합니다. STEP 02까지는 메뉴와 화면 동작을 변경하지 않습니다. 메뉴 숨김은 접근 제어가 아니며 직원용 화면에도 비밀 정보를 저장하지 않습니다.
