# CPH Guest Information Guide

송도 센트럴파크호텔 프론트의 QR 기반 다국어 안내 프로그램입니다.
현재 **STEP 01: 프로젝트 기반 구성**만 구현했습니다. 실제 호텔·시설 정보, 검색, 번역, 관리자 기능은 포함하지 않습니다.

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
npm run lint
npm run build
npm run preview -- --host 0.0.0.0
```

`build`는 TypeScript 검사와 정적 파일 빌드를 실행하며 결과는 `dist/`에 생성됩니다.
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

남은 문제: favicon 파일이 없어 브라우저 자동 요청에 404가 발생합니다. 화면 이동·렌더링은 정상이며 이번 수정에서는 favicon을 추가하지 않았습니다. Cloudflare 배포, 실제 휴대전화, Safari·Firefox는 미검증입니다. 지속적인 자동화 테스트 스위트는 아직 없습니다.

## 폴더 구조

```text
src/
  components/layout/GuideLayout.tsx  # 공통 헤더, 내비게이션, 본문, 푸터
  pages/guest/GuestPage.tsx          # 고객용 시작 화면
  pages/staff/StaffPage.tsx          # 직원용 시작 화면
  pages/NotFoundPage.tsx            # 잘못된 주소 안내
  data/facilities.json              # 공통 JSON 자리, 현재 빈 배열
  types/                           # 후속 단계에서 데이터 타입 정의
  styles/global.css                # 모바일 우선 공통 스타일
  App.tsx                          # React Router 라우트
  main.tsx                         # React 진입점
  index.css                        # 공통 스타일 진입점
```

시설 데이터와 UI를 분리하고 Staff와 Guest가 동일한 JSON을 사용하는 구조로 확장합니다.
현재 JSON은 빈 배열이며 가상 정보와 실제 호텔 정보 모두 아직 넣지 않았습니다.

## 운영 및 배포 원칙

- 백엔드, 서버 DB, 외부 API, 실시간 지도·번역 API를 사용하지 않습니다.
- 고객 개인정보를 수집하지 않으며 공개 코드·JSON에 비밀 정보를 저장하지 않습니다.
- Staff 경로는 공개 화면입니다. 경로 이름은 접근 제어 기능이 아닙니다.
- Admin은 이후 로컬 전용으로 분리합니다. 현재 관리자 화면은 없습니다.
- 무료 정적 호스팅을 지원합니다. 향후 Cloudflare Pages 빌드 명령은 `npm run build`, 출력 경로는 `dist`입니다.
- BrowserRouter를 사용합니다. 직접 접속·새로고침을 위해 호스팅에서 SPA fallback이 필요합니다. Cloudflare Pages는 최상위 `404.html`이 없으면 기본 SPA fallback을 지원합니다. 실제 배포는 아직 하지 않았습니다.
- QR 생성 및 연결은 실제 배포 주소가 확정된 후 진행합니다.

## 다음 단계 제안 (검수 후 진행)

STEP 02에서 공통 시설 데이터 타입과 JSON 스키마(다국어 필드, 카테고리, 공개 여부, 마지막 확인일)를 정하고 가상 테스트 데이터를 준비합니다. 이후 단계별로 검색·상세·언어 전환·로컬 관리자 기능을 구현합니다.

### STEP 03 예정 작업

고객용 화면에서 직원용 메뉴를 숨기도록 내비게이션을 개선합니다. STEP 01에서는 메뉴와 화면 동작을 변경하지 않습니다. 메뉴 숨김은 접근 제어가 아니며 직원용 화면에도 비밀 정보를 저장하지 않습니다.
