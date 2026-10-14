# STEP 07-B-1 네이버 지도 링크 기반 기능

## 목적과 범위

호텔에서 시설까지 담당자가 확인한 경로 URL을 저장하고 Staff/Guest에서 새 탭으로 여는 기능입니다. 외부 지도 API·SDK·임베드·실시간 지도·자동 URL 조립·네이버 화면 인쇄/캡처는 없습니다. 실제 시설 24개와 실제 경로 URL은 등록하지 않았습니다. 다음 STEP 07-B-2에서 승인 데이터를 입력합니다.

## 데이터 구조와 호환성

```ts
naverMapUrl?: string | null
```

Facility의 선택 필드입니다. 기존 schemaVersion 1을 유지합니다. 생략/null은 미등록이며 빈 문자열은 JSON 저장 값으로 허용하지 않습니다. 관리자 입력란을 비우고 저장하면 null이 됩니다. 기존 JSON을 편집 없이 가져와 내보내면 생략 상태가 그대로 유지됩니다. URL은 시설별 하나이며 언어별로 중복 저장하지 않습니다. 링크 편집은 isPublished·lastVerifiedAt·walkingMinutes를 자동 변경하지 않습니다.

가상 facilities.json 6개와 hotel.json의 STEP 07-A 승인 원고는 바이트 단위로 보존했습니다. 두 dataStatus는 demo입니다. 체크인 15:00·체크아웃 12:00·성인 조식 32,000원·반려동물 전용 객실 규정과 H33 보류를 유지합니다. 실제 JSON에는 아직 지도 URL이 없습니다.

## URL 검증 정책

JSON Schema는 선택 string/null과 URI 형식을 검사합니다. 공유 parseFacilityDataset에서 src/services/naverMapUrl.ts의 추가 검사를 수행합니다. 로딩·Admin 저장/가져오기/내보내기·공개 시설 선별·운영 검증 모두 같은 정책을 사용하며 UI도 무효 값을 링크로 만들지 않습니다.

- URL 파서의 protocol/hostname으로 HTTPS 및 정확한 map.naver.com 또는 m.map.naver.com만 허용합니다. 사용자 이름/비밀번호·비표준 포트는 거부합니다.
- HTTP·외부/위장 도메인·javascript/data/file·naver.me 단축 주소·공백·백슬래시·잘못된 인코딩은 거부합니다.
- 인증 토큰·API key·비밀번호·세션·email/phone·리다이렉트 등 명시적인 민감 쿼리 키와 해시를 거부합니다. 담당자는 전체 URL에 개인정보·인증 정보가 없는지도 확인해야 합니다.
- 일반 지도 홈·장소 상세·검색 주소는 거부하며 아래 경로 형식만 지원합니다.

| 호스트 | 지원 형식과 조건 |
| --- | --- |
| map.naver.com | /p/directions 또는 /v5/directions 뒤에 출발 좌표·도착 좌표·경유 구간·이동수단의 4개 구간. 출발/도착 '-'는 불허. 좌표 인코딩 지원. walk/car/transit/bike/bicycle 허용 |
| m.map.naver.com | /route.nhn, sX/sY/eX/eY가 모두 숫자로 설정된 경로 주소 |

주소 형식·대상 도메인의 검사이며 실제 출발지가 호텔인지·도착지가 정확한 지점인지·현재 경로가 정상 제공되는지를 자동 검증하지 않습니다. 다른 경로 형식을 받으면 검증을 우회하거나 URL을 조립하지 말고 최종 주소를 확인하고 지원 형식을 검토하세요.

## 관리자 등록·수정·삭제

시설을 선택하거나 신규 시설을 추가하면 '네이버 지도 길찾기 URL'을 편집합니다. 신규/기존 미등록 시설은 빈 입력란과 '미등록' 상태이며 기존 URL은 그대로 표시합니다. 수정 가능하고, 비우고 저장하면 삭제됩니다. 무효 URL 저장은 거부하고 편집 내용을 유지합니다. JSON 다운로드·재불러오기에서 URL이 보존됩니다. 저장은 현재 브라우저 작업 데이터에만 반영됩니다.

'등록 링크 확인'은 유효한 입력일 때만 새 탭 링크가 됩니다. 미등록/무효 입력이면 비활성입니다. 등록 전에 다음을 확인하도록 화면에 안내합니다.

1. 출발지 송도센트럴파크호텔.
2. 도착지 실제 등록 시설과 정확한 지점.
3. 도보 또는 담당자가 승인한 이동수단.
4. 실제 경로가 정상적으로 열림.
5. 다른 장소/지점이 아님, 개인정보·인증 정보가 없음.

실제 URL은 STEP 07-B-2에서 등록합니다. 관리자에서는 기존 ATM 자료 선택·필터·편집·내보내기를 유지합니다.

## 직원용 사용

시설 상세의 '네이버 지도 길찾기'를 누르면 유효한 저장 URL이 새 탭에서 열립니다. 미등록이면 비활성 버튼과 '길찾기 링크 미등록'을 표시하며 대체 검색 URL을 생성하지 않습니다. 새 탭 안내 및 '네이버 지도에서 길찾기를 연 뒤 인쇄 기능을 이용할 수 있습니다.' 문구를 제공합니다. 네이버 지도에서 공식 인쇄 기능을 사용하며 프로그램 내부에서 지도 화면을 인쇄/캡처하지 않습니다.

## 고객용 4개 언어 링크

| 언어 | 문구 |
| --- | --- |
| ko | 네이버 지도 길찾기 |
| en | Directions on Naver Map |
| zh-CN | 使用 Naver 地图查看路线 |
| ja | NAVERマップで経路を見る |

target=_blank, rel=noopener noreferrer를 적용합니다. 보이는 새 탭 안내를 aria-describedby로 연결하며 지도 언어가 안내 화면과 다를 수 있음을 설명합니다. 미등록 안내도 선택 언어로 표시합니다. 검색·시설 선택 상태는 새 탭 클릭과 언어 전환 후 유지됩니다. 링크는 키보드 포커스·44px 이상의 터치 높이·모바일 줄바꿈을 적용합니다. 페이지 로딩이나 시설 선택만으로 지도에 요청하지 않습니다.

## 공항버스 준비 상태

기존 transportation 카테고리가 선택됐을 때만 회색 별도 안내를 표시합니다. Guest 제목은 지시문 4개 언어 문구 그대로, Staff는 한국어 별도 자료 준비 안내입니다. 지도·상세 버튼은 disabled이며 링크가 없습니다. aside/role=note로 일반 시설 카드와 구분합니다.

실제 노선·시간표·승차 위치·요금·영업시간·확인일·도보시간을 만들지 않았습니다. JSON 시설 레코드를 추가하지 않고 검색 결과 수에도 포함하지 않습니다. 전체/다른 카테고리에서는 숨기며 호텔 공식 안내문을 받은 후 정식 데이터화를 검토합니다.

## ATM 표시 정책

Staff/Guest UI_CATEGORIES의 ATM 카테고리 버튼을 제외했습니다. FACILITY_CATEGORY_OPTIONS에는 10개 코드를 유지해 관리자와 기존 레코드 표시 이름에 사용합니다. 타입·Schema·다국어 사전의 atm도 유지합니다. 가상 ATM 레코드를 삭제하지 않았으며 기존 전체/키워드 검색 결과 정책을 유지합니다. 이번 변경은 카테고리 버튼 표시 정책입니다. 호텔 내부 ATM의 층·시간·위치를 임의로 작성하지 않았습니다.

## 검증 결과 (2026-10-15)

변경 기능 관련 테스트부터 실행하고 완료 시 통합 검수를 진행했습니다. 기존 220개 + 신규 48개 = **268개**, 실패·스킵 0입니다. 새 테스트는 공식 경로 형식·생략/null 호환·위험/위장/미설정/단축/민감 값 거부·Admin 등록/수정/삭제/Import/Export·공개/비공개 정책·ATM 호환·4개 언어 문구·STEP 07-A 원고 일치를 검사합니다.

| 명령 | 최종 결과 |
| --- | --- |
| node --test scripts/naver-map.test.ts | 개발 중 관련 46개 PASS, 이후 인코딩 사례 2개 추가 |
| npm run validate | PASS, 가상 6개·승인 호텔·demo·schemaVersion 1 |
| npm run validate:hotel-copy | PASS, 승인 136개 셀 일치·H33 제외 |
| npm run test | PASS, 타입 검사·268개·실패/스킵 0 |
| npm run lint | PASS |
| npm run build | PASS |
| npm run admin:build | PASS |
| npm run test:map-ui | PASS, 실제 Chromium 변경 기능 QA |
| npm run test:guest-ui | PASS, 기존 Guest 통합 회귀 |
| npm run test:staff-ui | PASS, 기존 Staff 검색·상세·실제 복사 회귀 |
| npm run test:admin-ui | PASS, 기존 관리자 통합 회귀 |
| npm run validate:production | 예상 차단·종료 코드 1 |
| npm run build:production | 예상 차단·종료 코드 1, dist-production 없음 |

이번 기능 브라우저 QA: 원본 데이터 Staff/Guest 320·390·1280px, 4개 언어 미등록 안내·공항버스 비활성·ATM 버튼 미표시·결과 수·가로 넘침. 메모리 Fixture Staff/Guest 390·1280px, 지도 새 탭 클릭·target/rel/opener·키보드·검색/선택 유지. Admin 390·1280px 등록/수정/삭제/다운로드/재불러오기/무효 URL 거부.

지도 클릭 12회는 실제 Chromium 팝업으로 검증했지만 **가상 경로 URL의 목적지를 QA에서 로컬 응답으로 가로챘습니다**. 네이버 사이트/API에는 접속하지 않았습니다. 실제 경로 정확성·네이버 페이지의 실제 동작·네이버 인쇄·모바일 기기 앱 연결은 미검증입니다. 테스트 URL은 원본 JSON에 쓰지 않았습니다. 자동 지도 요청 0·최종 JavaScript/콘솔/HTTP 오류 0입니다.

기존 Guest 320·375·390·430·768·1280px, Staff 320·390·768·1280px, Admin 390·768·1280·1440px 회귀도 통과했습니다. 실물 기기·Safari/Firefox·스크린리더·현장·실제 배포는 미검증입니다. 기존 운영 산출물 정리·비공개 고유 문자열·관리자 번들 제외 테스트도 유지했습니다.

### 현재 클라우드 QA 재실행

Node.js 24 LTS와 기존 앱 의존성을 사용합니다. Playwright는 앱 밖 QA 경로에 있으며 앱 의존성을 추가하지 않았습니다.

```bash
# 각각 별도 터미널에서 실행
npm run dev -- --host 0.0.0.0 --port 5175 --strictPort
npm run admin:dev

# 두 서버 준비 후 실행
NODE_PATH=/tmp/cph-browser-check/node_modules \
CPH_UI_BASE_URL=http://127.0.0.1:5175 \
CPH_UI_ARTIFACT_DIR=/workspace/exports/step07b-map \
npm run test:map-ui
```

## STEP 07-B-2 후속 작업과 남은 항목

**운영 배포 미실시·실제 고객 공개 금지**입니다. 가상 시설 6개·demo·실제 URL 미등록 상태이며 STEP 07-B-1 검수 후 별도 지시를 받아 다음을 진행할 수 있습니다.

1. 사용자 최종 승인 실제 시설 목록·4개 언어·공개 여부·확인일·필수 안내 입력.
2. 직원이 호텔 출발·정확한 시설 도착·이동수단을 확인한 최종 네이버 URL 등록.
3. 호텔 공식 공항버스 안내문 확인 후 정식 안내 반영.
4. 후속 호텔 개선 시 내부 ATM 정확한 위치의 승인 정보 반영.

STEP 07-A description 4개 언어와 H33 문자 수신번호/공개 승인도 별도 보완 사항입니다. 이번에는 실제 시설 입력·운영 상태 전환·QR·Cloudflare 배포를 하지 않았습니다.
