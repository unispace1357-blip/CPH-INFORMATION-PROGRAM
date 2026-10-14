# STEP 02 시설·호텔 데이터 명세

STEP 07-B-1에서 선택 필드 naverMapUrl을 추가했습니다. 기존 호텔 승인 원고·가상 시설 6개와 schemaVersion 1을 유지합니다. URL 검증·지도 링크·ATM 표시 정책·공항버스 준비 상태의 현행 내용은 [STEP 07-B-1 기록](step07b-map-link-foundation.md)을 참고하세요. 아래의 빈 호텔·미연결 화면·초기 게시 절차는 STEP 02 당시 기록이며 호텔 JSON은 STEP 07-A에서 승인 원고로 채워졌습니다.

이 문서는 STEP 02 데이터 계약과 당시 기록을 유지합니다. 이후 Staff/Guest가 같은 JSON에 연결됐으며 STEP 06 로컬 관리자도 기존 타입·스키마·검증기를 재사용합니다. 운영 빌드는 전체 원본을 검증한 뒤 공개 시설만 스냅샷으로 만들어 번들에 사용합니다. 비공개 시설의 실제 산출물 제외, 관리자 분리와 수동 반영 절차는 [관리자 사용 안내](admin-manager.md)를 참고하세요. 개발 빌드와 공개 GitHub의 원본에는 전체 데이터가 있으므로 비밀 정보는 저장하지 않습니다.

Staff와 Guest는 공통 타입과 같은 JSON을 사용하도록 준비했습니다. 주변 시설은 `facilities.json`, 호텔 기본 안내는 `hotel.json`에서 별도로 관리합니다. 현재 데이터 계층만 구현했으며 화면에는 아직 연결하지 않았습니다. 검증은 Ajv와 ajv-formats로 로컬에서 수행하며 외부 API, 서버 DB, 고객 개인정보를 사용하지 않습니다.

## 주변 시설 데이터

`src/data/facilities.json`의 최상위 구조는 유지합니다.

```json
{
  "schemaVersion": 1,
  "dataStatus": "demo",
  "facilities": []
}
```

`schemaVersion`은 현재 숫자 1입니다. `dataStatus`는 `demo` 또는 `production`입니다. 빈 시설 배열도 유효합니다. 호텔 기본 정보만 제공하고 주변 시설을 아직 등록하지 않은 상태를 허용하기 위해 배포 검증에서도 빈 시설 배열은 허용합니다.

| 시설 필드 | 규칙 |
| --- | --- |
| id | 영문 소문자·숫자·하이픈의 고유 ID, 최대 80자 |
| category | 아래 카테고리 코드 중 하나 |
| isPublished | 화면 노출 여부, boolean |
| lastVerifiedAt | 실제 확인일 `YYYY-MM-DD`, 미확인 시 `null` |
| walkingMinutes | 공통 예상 도보시간, 0 이상 유한 숫자 또는 미확인 시 `null` |
| closedDays | `ko`, `en`, `zh-CN`, `ja` 휴무일 안내 문자열 |
| translations | 4개 언어의 시설 안내 객체 |
| keywords | 4개 언어별 검색 키워드 배열 |
| englishPhrases | 직원 응대용 영어 문구 배열 |
| naverMapUrl | 선택 string 또는 null. 생략/null은 미등록. URI 형식 + 공유 파서의 HTTPS·공식 호스트·설정된 경로·민감 값 검사 |

카테고리는 기존 8개를 유지하고 2개를 추가했습니다.

| 코드 | 내용 |
| --- | --- |
| hotel | 호텔 관련 시설 (호텔 기본 정보와 별개) |
| dining | 음식점 |
| cafe | 카페 |
| convenience | 편의점 |
| pharmacy | 약국 |
| shopping | 쇼핑 |
| attraction | 관광 |
| transportation | 교통 |
| sauna_spa | 사우나·스파 |
| atm | ATM |

STEP 07-B-1에서 Staff/Guest 카테고리 버튼은 ATM을 제외합니다. 데이터 코드·관리자 선택/필터·기존 레코드는 유지하며 카테고리 버튼 표시 정책과 데이터 호환성을 분리합니다.

각 `translations` 객체는 `name`, `description`, `address`, `openingHours`, `directions`, `notes`를 포함합니다. 모든 키가 필요합니다. 이름은 공백뿐인 문자열을 허용하지 않으며 개발 데이터의 나머지 문자열은 비어 있어도 됩니다. 키워드·응대 문구 배열은 비어 있어도 됩니다.

도보시간은 언어별 객체에 넣지 않고 시설 최상위 `walkingMinutes` 한 곳에만 저장합니다. 알 수 없는 시간을 0으로 만들지 않고 `null`로 유지합니다. 휴무일이 없는 경우도 실제 확인 후 각 언어로 “연중무휴” 등의 안내를 작성합니다. 미확인 휴무일은 개발 데이터에서 빈 문자열로 둡니다.

### 기존 STEP 02 파일 호환성

새 필드는 추가 형태로 도입하여 기존 `schemaVersion: 1` 파일을 읽을 수 있습니다. `parseFacilityDataset`이 입력의 복사본을 검증하면서 다음 기본값을 채웁니다.

- 누락된 `walkingMinutes`: `null`
- 누락된 `closedDays`: 4개 언어의 빈 문자열
- 누락된 `keywords.zh-CN`, `keywords.ja`: 빈 배열

기존 `keywords.ko`, `keywords.en` 필수 조건은 유지합니다. `closedDays` 객체를 명시한 경우에는 4개 언어를 모두 포함해야 합니다. 원본 객체나 JSON 파일을 자동 덮어쓰지 않습니다. 현재 저장된 샘플 파일은 새 필드를 모두 명시합니다. 기본값은 미확인을 표현할 뿐, 운영 필수 안내를 대신하지 않습니다.

## 호텔 기본 정보

`src/data/hotel.json`은 별도 버전과 데이터 상태를 가집니다.

```json
{
  "schemaVersion": 1,
  "dataStatus": "demo",
  "lastVerifiedAt": null,
  "checkInTime": null,
  "checkOutTime": null,
  "translations": {
    "ko": { "name": "", "description": "", "address": "", "checkIn": "", "checkOut": "", "breakfast": "", "parking": "", "roomUsage": "", "notes": "" },
    "en": { "name": "", "description": "", "address": "", "checkIn": "", "checkOut": "", "breakfast": "", "parking": "", "roomUsage": "", "notes": "" },
    "zh-CN": { "name": "", "description": "", "address": "", "checkIn": "", "checkOut": "", "breakfast": "", "parking": "", "roomUsage": "", "notes": "" },
    "ja": { "name": "", "description": "", "address": "", "checkIn": "", "checkOut": "", "breakfast": "", "parking": "", "roomUsage": "", "notes": "" }
  }
}
```

현재 모든 호텔 안내는 빈 값입니다. 실제 송도 센트럴파크호텔의 체크인·체크아웃 시간이나 조식·주차 정책을 입력하지 않았습니다.

`checkInTime`, `checkOutTime`은 호텔 현지 시각 `HH:mm` 형식(00:00~23:59) 또는 `null`입니다. 시간 값은 언어마다 중복 저장하지 않습니다. 언어별 `checkIn`, `checkOut`은 절차·이용 조건 등의 안내를 담습니다. `breakfast`, `parking`, `roomUsage`에는 각각 조식, 주차, 객실 이용 안내를 등록할 수 있습니다. 호텔의 `lastVerifiedAt`은 전체 기본 안내를 마지막으로 확인한 날짜입니다.

## 개발 검증과 배포 검증

| 명령 | 검증 범위 | 출력 |
| --- | --- | --- |
| `npm run validate` | 시설·호텔 스키마, 날짜 형식, 중복 시설 ID, 기본값 보완; demo 허용 | 파일 생성 없음 |
| `npm run test` | 엄격한 데이터·테스트 타입 검사와 자동 테스트 | 파일 생성 없음 |
| `npm run build` | 개발용 데이터 검증 + 앱 타입 검사 + Vite 빌드; demo 허용 | `dist/` |
| `npm run validate:production` | 개발 검증 + 아래 운영 필수 조건 | 파일 생성 없음 |
| `npm run build:production` | 운영 검증 성공 후 앱 타입 검사 + Vite 빌드 | `dist-production/` |

기존 `validate:data`, `test:data`는 각각 `validate`, `test`의 별칭으로 유지합니다. 모든 검증 실패는 0이 아닌 종료 코드로 보고합니다. 고객 배포용 명령은 `npm run build:production`이며 Cloudflare Pages의 출력 디렉터리는 **`dist-production`**으로 설정합니다. 개발 빌드의 `dist`와 분리하여 개발 결과물을 고객 배포 출력으로 사용하지 않도록 합니다. 현재 demo 데이터에서는 고객 배포 빌드가 검증 단계에서 종료 코드 1로 실패합니다.

### 운영 필수 조건

- 시설·호텔 데이터 모두 `dataStatus: "production"`이어야 합니다.
- 공개 시설마다 확인일이 필요하며 미래 날짜는 허용하지 않습니다.
- 공개 시설마다 4개 언어의 이름, 설명, 주소, 영업시간, 이동 안내, 휴무일 안내가 공백 없이 있어야 합니다.
- 호텔 확인일과 공통 체크인·체크아웃 시간이 필요합니다.
- 호텔의 4개 언어 이름, 설명, 주소, 체크인·체크아웃 안내, 조식, 주차, 객실 이용 안내가 공백 없이 있어야 합니다.
- 확인일 비교는 호텔 시간대인 `Asia/Seoul`의 당일을 기준으로 합니다. 날짜 형식과 실제 달력 날짜도 기존 검증으로 확인합니다.

도보시간이 미확인인 `null`, 빈 키워드 배열, 빈 응대 문구·메모는 허용합니다. 비공개 시설은 운영 안내의 완성도 검사를 생략하지만 구조·타입·날짜 형식·중복 ID 검사는 동일하게 수행합니다. 기존 파일에서 보완된 빈 휴무일 안내는 공개 시설의 운영 검증을 통과하지 못합니다. `dataStatus`만 바꾸어도 현재 빈 호텔 안내와 미확인 시설 정보 때문에 배포 검증이 실패합니다.

운영 검증은 필수 값의 형식과 존재 여부를 검사합니다. 실제 정보의 정확성과 번역 품질은 호텔 담당자가 확인해야 합니다. 실제 운영 데이터로 전환할 때는 가상 시설을 제거하고 확인한 정보만 입력합니다.

## 샘플과 공개 정보

가상 호텔 관련 시설·카페·약국·편의점·사우나·ATM 6개를 준비했습니다. 실제 주소·도보시간·영업시간·휴무일을 만들지 않았으며 확인일은 모두 `null`입니다. 비공개 편의점 사례를 유지했고 모든 시설의 이름·설명·메모에 가상 정보라고 표시했습니다. 테스트 내부의 production 형식 입력은 검증용 메모리 객체이며 JSON 파일에 저장하지 않습니다.

`isPublished`는 표시 제어 필드이며 접근 제어가 아닙니다. 정적 JSON은 직접 읽을 수 있으므로 비공개 시설에도 비밀 정보나 고객 개인정보를 넣지 않습니다. 운영용 공개 파일에서 비공개 항목을 제외하는 게시 절차는 관리자 단계에서 설계합니다.

## STEP 02 보완 검증 결과 (2026-10-14)

- `npm run validate`: PASS (가상 시설 6개와 빈 호텔 데이터 검증)
- `npm run test`: PASS (엄격한 데이터·테스트 타입 검사 및 56개 테스트 통과, 실패·스킵 0개)
- `npm run lint`: PASS
- `npm run build`: PASS (개발 빌드)
- `npm run validate:production`: 예상대로 종료 코드 1, demo 시설·호텔 데이터 차단
- `npm run build:production`: 예상대로 종료 코드 1, Vite 실행 전 차단, `dist-production/` 생성 없음
- Staff/Guest 화면·라우트·레이아웃·스타일 변경 없음
- 이번 보완에서는 브라우저와 실제 호스팅 배포를 재검증하지 않았습니다. 기존 favicon 404는 남아 있습니다.
