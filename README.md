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
STEP 01 검증: TypeScript 검사·프로덕션 빌드·린트를 통과했습니다.
Guest/Staff/없는 주소의 React 렌더링과 공통 레이아웃, 개발 서버 HTTP 응답 및 모듈 변환도 확인했습니다.
실제 브라우저의 클릭·모바일 표시와 Cloudflare 배포는 아직 검증하지 않았습니다. 지속적인 자동화 테스트 스위트는 후속 단계에서 검토합니다.

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
