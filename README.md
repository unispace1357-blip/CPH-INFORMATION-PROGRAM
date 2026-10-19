# CPH Guest Information Guide

송도 센트럴파크호텔 프론트에서 시험 사용하는 시설 안내 MVP입니다. React·TypeScript·Vite·React Router·CSS·JSON을 사용하며 서버 DB·외부 API·원격 폰트·고객 개인정보 수집은 없습니다.

## 회사 PC에서 공개 테스트 사용

GitHub Actions의 **Public test web and Windows portable** 워크플로가 GitHub Pages와 Windows ZIP을 만듭니다. Pages 설정의 Source는 **GitHub Actions**입니다. 배포 성공 후 `https://unispace1357-blip.github.io/CPH-INFORMATION-PROGRAM/`을 열면 직원 화면이 표시됩니다. `#/staff`, `#/guest`를 직접 열거나 새로고침할 수 있으며 `/staff/`, `/guest/`도 해당 화면으로 이동합니다. 별도 로그인·Node.js·VS Code 설치는 필요하지 않습니다.

Windows 10/11 **x64**에서는 해당 Actions 실행의 **Artifacts → CPH-Front-Desk-Public-Test-win-x64**를 내려받아 ZIP을 모두 압축 해제하고 `CPH-Front-Desk.exe`를 실행합니다. EXE와 함께 제공되는 DLL·resources 등은 같은 폴더에 유지하세요. 검색·영어 안내·복사는 오프라인에서 사용하며 지도는 인터넷 연결 시 기본 브라우저로 열립니다. 실제 회사 PC의 실행 허용 정책은 현장에서 확인합니다.

개발자가 `npm run build:public-test`를 실행하면 공개 테스트 웹 파일을 `dist-public-test/`에, `npm run desktop:package`를 실행하면 Windows 런타임을 포함한 ZIP을 `release/`에 만듭니다. 공개 테스트는 **미검수 DEMO**로 표시하고 관리자와 비공개 시설을 제외합니다. 정식 운영용 `build:production`의 검증·차단과 `dist-production/`은 별도로 유지합니다.

## 실행

Node.js 24 LTS에서 실행합니다.

```bash
npm ci
npm run dev
# 별도 터미널: 로컬 관리자
npm run admin:dev
```

개발 서버가 출력하는 주소의 `/staff`, `/guest`를 여세요. `/`는 `/guest`로 이동하고 없는 경로는 404 안내를 표시합니다. 관리자는 localhost에서만 실행합니다.

## 현재 사용 범위

- Staff: 기본 탭의 호텔 업무 영어 응대 30개 검색·6개 카테고리·즉시 응대와 한국어 뜻·선택형 상세 설명/직원 확인사항·영어 원문 복사. 검수 전 스크립트는 draft로 구분하며, 별도 주변 시설 안내 탭에서 기존 시설 검색·지도·영어 안내 개별/전체 복사 및 한글 발음 참고 기능을 제공합니다.
- Guest: 모바일 화면, 한국어·영어·중국어 간체·일본어 선택, 카테고리·시설 검색·상세, 승인된 호텔 기본 안내.
- Admin: 시설·호텔 JSON 편집, 메모리 저장, 파일 다운로드·다시 불러오기, 개발/운영 검증.
- 실제 주변 시설 26개: 기존 5개를 유지하고 엑셀 나머지 후보를 일괄 반영했습니다. C21 공항버스는 시설 레코드에서 제외하고 비활성 안내를 유지합니다. 가상 시설·외부 ATM 추천은 없습니다.

실제 시설은 **개발 및 공개 테스트에서 표시**하도록 `isPublished: true`이며, 시설·호텔 모두 **demo**입니다. 시설 외국어는 사용자 검수 전 초안입니다. 센트럴파크역 3번 출구만 호텔 공식 안내의 도보 약 5분을 반영합니다. 거리순 자동 정렬은 도보 자료가 충분히 확보될 때까지 비활성화하며, 검색·카테고리 적용 후에도 JSON 원본 배열의 상대 순서를 유지합니다. 나머지 도보시간과 모든 시설별 확인일은 null이며, 기존 23개 시설의 제공된 네이버 길찾기 URL이 등록되어 있습니다. 인천항의 약 1시간은 대중교통 안내이며 도보시간으로 쓰지 않습니다. 송도 센트럴파크 기본 정보는 운영 공개 전 사용자 확인이 필요한 초안입니다. 지도 버튼은 등록된 유효 URL이 있을 때만 활성화됩니다. 공항버스는 안내 준비 중으로 비활성이며 외부 ATM 추천은 없습니다.

정식 운영 사이트·Cloudflare·QR 배포는 하지 않습니다. 승인된 회사 시범 운영용 공개 테스트만 별도 빌드합니다. `npm run build`의 `dist/`는 개발 확인용입니다. `npm run build:production`은 DEMO를 차단하고 운영 조건을 만족할 때만 `dist-production/`을 만듭니다. 공개 여부는 인증 기능이 아니며 공개 GitHub·JSON에 비밀 정보나 개인정보를 넣지 않습니다.

## 구조

`src/data/`에 시설·호텔 JSON과 스키마, `src/types/`에 공통 계약, `src/services/`에 검색·표시·복사·지도 검증, `src/i18n/`에 고객 UI 문구가 있습니다. Staff/Guest는 같은 시설 JSON을 읽고 관리자는 `tools/admin/`의 별도 진입점을 사용합니다.

`src/components/ui/`의 버튼·검색창·카테고리·시설 카드·안내·언어 선택 등을 공유합니다. 색상·간격은 `src/styles/tokens.css`에 있으며 외부 CDN 대신 로컬 SVG·시스템 폰트를 사용합니다. Guest는 모바일 2열, 600px부터 3열, 1000px부터 4열 카테고리이며 Staff 결과/상세는 1000px부터 2열입니다. 고객 화면에는 직원 메뉴가 없습니다.

## 검증

```bash
npm run validate
npm run validate:hotel-copy
npm run test
npm run lint
npm run build
npm run admin:build
# 현재 데이터에서 실패해야 정상: DEMO 운영 배포 차단
npm run build:production
```

보안·데이터 무결성·승인 호텔 원고/H33 보류·비공개 번들 제외·운영 배포 차단 테스트는 유지합니다. 반복되던 단계별 브라우저 검사는 `npm run test:ui`(최종 Chromium 회귀 스크립트)로 실행합니다. 이전 `scripts/ui-smoke.cjs`는 23곳 기준이므로 새 자동 QA 기준으로 사용하지 않습니다. 별도 QA 환경의 Playwright·Chromium과 실행 중인 앱/관리자 서버가 필요하며 앱 의존성에는 추가하지 않았습니다. `.github/workflows/final-browser-qa.yml`에서 동일 검사를 별도 격리 환경으로 실행하고 배포하지 않습니다.

```bash
NODE_PATH=/tmp/cph-browser-check/node_modules \
CPH_UI_BASE_URL=http://127.0.0.1:5173 \
CPH_ADMIN_BASE_URL=http://127.0.0.1:5190 \
npm run test:ui
```

이 검사는 실제 시설 검색·카테고리·4개 언어·주소/시간·실제 클립보드·관리자 편집/파일 왕복을 확인합니다. 실물 모바일·Safari/Firefox·실제 네이버 경로 연결·현장 정보 정확성·시설 번역 감수는 별도 확인 대상입니다. 과거 단계별 결과는 Git 히스토리에 있습니다.

- [STEP 3 신규 시설 검수 및 호텔 직원 지도 링크 체크리스트](docs/step03-facility-verification.md)
- [STEP 4 음식점·카페 메뉴 자료 및 검색 검수](docs/step04-menu-verification.md)
- [STEP 5 다국어 검색·별칭·영어 발음 보조 검수](docs/step05-search-pronunciation-qa.md)
- [데이터 계약·출처·미확인 항목](docs/data-model.md)
- [관리자 저장·파일 반영 절차](docs/admin-manager.md)
- [승인 호텔 원고·H33 보류 기준](docs/step07a-hotel-data.md)
