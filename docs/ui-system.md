# STEP 03 UI 구조와 검증

## 구현 범위

공통 디자인 토큰과 재사용 컴포넌트, 직원용 PC 기본 화면, 고객용 모바일 기본 화면을 만들었습니다. 기존 데이터·스키마·운영 배포 검증·자동 테스트는 수정하지 않았습니다. 새로운 애플리케이션 의존성을 추가하지 않았습니다.

현재 화면은 개발용 미리보기입니다. 실제 호텔 정보·가상 시설 데이터 모두 UI에 연결하지 않았습니다. 검색, 필터, 상세 안내, 복사, 실제 언어 전환과 관리자는 아직 구현하지 않았습니다. 관련 입력과 버튼은 native `disabled` 상태이며 안내 문구를 함께 제공합니다. 검색 입력은 작은 화면에서도 안내가 잘리지 않도록 짧은 placeholder를 사용하고 예시는 줄바꿈 가능한 힌트로 표시합니다.

## 디자인 토큰

`src/styles/tokens.css`에서 색상·시스템 폰트·간격·모서리·그림자를 관리합니다. 호텔 브랜드 가이드 확정 전 임시 디자인입니다.

| 토큰 | 색상 |
| --- | --- |
| primary | #214D47 |
| primary-hover | #183C37 |
| background | #F5F7F6 |
| surface | #FFFFFF |
| text | #183C3B |
| text-secondary | #536C67 |
| border | #D7E2DF |
| focus | #B56B21 |

원격 폰트나 CDN을 사용하지 않습니다. `Icon.tsx`의 내부 SVG와 로컬 임시 CPH 문자 favicon을 사용합니다. 공식 호텔 로고를 재현하지 않았습니다.

## 공통 컴포넌트

파일 위치는 `src/components/ui/`입니다.

| 컴포넌트 | 주요 props / 역할 |
| --- | --- |
| Button | primary/secondary/quiet variant, 아이콘, 표준 버튼 props, disabled |
| SearchInput | label, placeholder, value, onChange, disabled, hint; 고유 label 연결 |
| CategoryCard | label, icon, selected, compact, 표준 버튼 props; 선택·Hover·Focus 스타일 |
| FacilityCard | 시설명, 분류, 영업시간, 공통 walkingMinutes, 상세 버튼; 기본 비활성화 |
| PageHeader | eyebrow, title, description, actions |
| PageContainer | guest/staff variant, 공통 콘텐츠 폭과 여백 |
| EmptyState | title, description, icon, actions |
| LoadingState | label, role=status; 모션 감소 설정 지원 |
| InformationNotice | title, children, info/warning tone |
| LanguageSelector | value, onChange, disabled, label, hint; 4개 언어 선택 상태 표현 |

`FacilityCard`와 `LoadingState`는 후속 기능을 위한 컴포넌트이며 현재 실제 페이지에서 시설이나 로딩 데이터를 보여주지 않습니다. 타입 검사·빌드 대상에 포함됩니다. LanguageSelector는 값과 콜백을 props로 받는 구조이며 현재 GuestPage에는 콜백을 연결하지 않았습니다. 영어 선택 상태만 표시합니다.

아이콘은 장식용 `aria-hidden` 처리하고 텍스트 이름을 함께 표시합니다. 입력에는 label과 힌트 연결을 제공합니다. 활성 링크는 키보드로 사용할 수 있고 3px 포커스 표시와 본문 건너뛰기를 지원합니다. 미구현 native disabled 버튼은 탭 순서에서 제외합니다. 후속 단계에서 활성화할 카테고리·언어 버튼의 native 키보드 동작과 focus-visible 스타일은 공통 컴포넌트에 준비했습니다.

## 화면과 내비게이션

공통 `GuideLayout` Shell이 audience에 따라 전용 헤더·콘텐츠 폭·푸터를 구성합니다. Guest 경로에서는 직원용 링크를 렌더링하지 않습니다. Staff 경로에서는 전용 헤더와 고객 화면 미리보기 링크를 제공합니다. `/staff`는 인증 경로가 아니므로 비밀 정보나 개인정보를 넣지 않습니다.

- `/`: 기존처럼 `/guest`로 리다이렉트
- `/guest`: 영어 기본 화면과 문서 언어 `en`
- `/staff`: 한국어 직원 화면과 문서 언어 `ko`
- 존재하지 않는 경로: 404 안내와 고객 화면 복귀 링크 유지

Guest의 Hotel / Nearby / Search 메뉴는 실제 페이지 내 영역으로 이동하는 앵커입니다. 기능이 없는 시설 카테고리 버튼과는 구분됩니다. 언어 UI는 English, 简体中文, 日本語, 한국어 순서이며 영어 선택 상태입니다. 실제 번역이나 언어별 데이터 연결을 구현하지 않았습니다.

### Staff Guide

헤더 → 페이지 제목·개발 안내 → 검색 입력 → 전체와 원본 10개 카테고리 → 검색 결과·상세 정보 영역 → English Guide 및 비활성 복사 버튼 → 정보 확인 안내 푸터.

`src/config/uiCategories.ts`는 코드별 UI 이름과 아이콘만 제공합니다. 실제 JSON을 불러오지 않습니다. 원본 카테고리 코드는 그대로 유지합니다.

### Guest Guide

호텔명·고객용 헤더 → 언어 선택 UI → Welcome 메시지·개발 안내 → 호텔 기본 정보 카드 → 주변 시설 카드 → 검색 UI·목록 준비 상태 → 정보 확인 및 프론트 문의 푸터.

호텔 카드에는 체크인, 체크아웃, 조식, 주차, 객실 이용 정보의 표시 공간만 준비합니다. 실제 시간·가격·주소·전화·영업일을 임의로 만들지 않았습니다.

## 반응형 기준

| 폭 | Guest 카테고리 | Staff 결과/상세 |
| --- | --- | --- |
| 320, 375, 390, 430px | 2열 | 1열 |
| 768px | 3열 | 1열 |
| 1280px | 4열 | 2열 |

CSS 기준은 600px(여백·카드 배열), 768px(헤더 가로 배치), 1000px(직원 결과/상세 2열)입니다. 390px을 기본 모바일 검수 화면으로 사용했습니다. 주요 버튼·입력·내비게이션의 목표 영역은 44×44 CSS px 이상입니다.

## 검증 결과 (2026-10-15)

| 검사 | 결과 |
| --- | --- |
| `npm run validate` | PASS |
| `npm run test` | PASS, 기존 테스트 56개, 실패·스킵 0 |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npm run test:ui` (QA 도구 경로 지정) | PASS, 실제 headless Chromium |
| demo `npm run build:production` | 예상 차단, 종료 코드 1 |

실제 Chromium에서 6개 너비마다 `/`, `/guest`, `/staff`, 없는 경로를 확인했습니다. 직접 접속·새로고침·고객 화면 이동·브라우저 뒤로 이동·404 복귀·페이지 내 메뉴 이동이 정상입니다. 고객 페이지에서 직원 메뉴가 노출되지 않았습니다. 가로 넘침과 화면 텍스트 잘림이 없고 준비 중 컨트롤이 비활성화되어 있음을 확인했습니다. 본문 건너뛰기와 내비게이션의 키보드 이동·포커스도 확인했습니다.

SVG/ICO favicon 요청은 모두 HTTP 200이며 두 파일이 빌드 결과에도 포함됩니다. 콘솔·JavaScript·HTTP 오류와 원격 리소스/API 요청은 없었습니다. 화면에서 시설·호텔 JSON을 가져오는 요청도 없었습니다. 주요 텍스트 토큰 조합은 4.5:1 이상, 흰 표면의 포커스 색은 3:1 이상을 확인했습니다. 이 결과는 전체 WCAG 적합성 인증을 의미하지 않습니다.

실제 브라우저 캡처: 직원용 1280px PC 화면, 고객용 390px 모바일 화면. 실물 휴대전화, Safari/Firefox, 스크린리더, 실제 정적 호스팅 배포는 미검증입니다. 미사용 FacilityCard/LoadingState의 별도 브라우저 상호작용도 미검증입니다.

### 브라우저 QA 재실행

기본 앱 의존성에 Playwright를 추가하지 않았습니다. 현재 QA 환경의 Playwright와 시스템 Chromium을 재사용합니다.

```bash
# 터미널 1: 개발 서버
npm run dev -- --host 0.0.0.0 --port 5174 --strictPort

# 터미널 2: 이 클라우드 QA 환경의 기존 도구로 실행
NODE_PATH=/tmp/cph-browser-check/node_modules \
CPH_UI_ARTIFACT_DIR=/workspace/exports/step03 \
npm run test:ui
```

다른 환경에서는 Playwright를 별도 QA 경로에 준비한 뒤 `NODE_PATH`로 연결해야 합니다. 기본 Chromium 경로는 `/usr/bin/chromium`이며 `CPH_CHROMIUM_PATH`로 지정할 수 있습니다. `CPH_UI_BASE_URL`은 테스트 서버 주소, `CPH_UI_ARTIFACT_DIR`은 캡처·결과 저장 경로입니다. QA 도구가 없으면 브라우저 테스트를 실행할 수 없으며 이를 PASS로 간주하지 않습니다.

## 다음 단계

STEP 04 검수 범위: 직원용 공통 JSON 연결, 한·영 검색, 카테고리 필터, 시설 상세 안내, 영어 응대 문구와 복사. 실제 고객용 언어 전환은 STEP 05에서 진행합니다. 이번 STEP에서는 해당 기능이나 관리자·QR·실제 배포를 구현하지 않았습니다.
