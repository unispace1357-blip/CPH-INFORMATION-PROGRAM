# STEP 02 공통 시설 데이터 명세

Staff와 Guest는 같은 JSON과 공통 타입을 사용합니다. 현재는 데이터 계층만 준비했으며 화면에는 아직 연결하지 않았습니다. 스키마 검증은 Ajv와 ajv-formats로 로컬에서 실행하고 외부 API를 호출하지 않습니다.

## 데이터 파일

`src/data/facilities.json`은 다음 구조입니다. STEP 01의 빈 배열에서 버전이 있는 객체로 변경했습니다.

```json
{
  "schemaVersion": 1,
  "dataStatus": "demo",
  "facilities": []
}
```

| 필드 | 규칙 |
| --- | --- |
| schemaVersion | 현재는 숫자 1만 허용 |
| dataStatus | `demo`: 가상 데이터 / `production`: 실제 운영 데이터 |
| facilities | 시설 배열, 빈 배열 허용 |

운영 데이터로 전환할 때는 가상 시설을 모두 제거하고 실제로 확인한 내용만 입력합니다. `dataStatus`는 구분용 메타데이터이며 게시 승인이나 보안 기능은 아닙니다.

## 시설 필드

| 필드 | 내용 |
| --- | --- |
| id | 영문 소문자·숫자·하이픈으로 구성된 고유 ID, 최대 80자 |
| category | 아래 카테고리 코드 중 하나 |
| isPublished | 화면 노출 여부, boolean |
| lastVerifiedAt | 마지막 확인일 `YYYY-MM-DD`, 미확인 시 `null` |
| translations | `ko`, `en`, `zh-CN`, `ja` 4개 언어별 안내 정보 |
| keywords | `ko`, `en` 검색 키워드 배열 |
| englishPhrases | 직원 응대용 영어 문구 배열 |

카테고리: `hotel`(호텔), `dining`(음식점), `cafe`(카페), `convenience`(편의점), `pharmacy`(약국), `shopping`(쇼핑), `attraction`(관광), `transportation`(교통).

각 언어 객체는 `name`, `description`, `address`, `openingHours`, `directions`, `notes`를 포함합니다. 모든 키가 필요하며 `name`은 공백뿐인 이름을 허용하지 않습니다. 나머지 필드는 미확인 시 빈 문자열을 사용합니다. 키워드·응대 문구 배열은 비어 있어도 됩니다. 마지막 확인일은 실제 달력 날짜여야 합니다. 예를 들어 `2026-02-29`는 거부합니다.

정의되지 않은 필드, 누락된 언어·필수 필드, 잘못된 데이터 타입, 중복 ID는 검증 오류입니다. 새 필드는 스키마·타입·테스트를 함께 수정해 도입합니다. `src/data/facilities.schema.json`과 `src/types/facility.ts`를 함께 유지합니다.

## 가상 테스트 데이터

가상 호텔·카페·약국·편의점 4개를 넣었습니다. 3개는 공개 상태, 편의점은 비공개 상태입니다. 실제 주소·전화·영업시간을 만들지 않았으며 마지막 확인일은 모두 `null`입니다. 이름·설명·메모에도 가상 정보라고 표시했습니다. 실제 고객 안내에 사용하지 마세요.

## 공개 데이터 취급

`isPublished: false`는 후속 화면의 표시 제어를 위한 필드입니다. 정적 JSON에 들어 있는 정보는 파일을 직접 읽으면 확인할 수 있습니다. 비공개 시설에도 비밀 정보나 고객 개인정보를 넣지 않습니다. 운영용 공개 파일에서 비공개 항목을 제외하는 게시 절차는 관리자 단계에서 설계합니다.

## 검증

```bash
npm run validate:data
npm run test:data
npm run lint
npm run build
```

`build`에서도 데이터 검증을 실행하여 잘못된 JSON이 빌드되는 것을 막습니다. 자동 테스트는 가상 데이터, 빈 목록, 날짜, 중복 ID, 언어·필수 필드 누락, 타입 오류, 허용하지 않는 필드와 버전을 검사합니다. 테스트 실행은 JSON을 수정하거나 저장하지 않습니다.

## STEP 02 검증 결과 (2026-10-14)

- `npm ci --cache /tmp/cph-npm-cache`: PASS
- `npm run test:data`: PASS, 엄격한 데이터·테스트 타입 검사 및 15개 테스트 통과, 실패·스킵 0개
- `npm run lint`: PASS
- `npm run build`: PASS, 데이터 검증·앱 타입 검사·정적 빌드 완료
- 이번 단계에서는 실제 브라우저를 다시 검증하지 않았습니다. STEP 01에서 확인한 favicon 404는 남아 있습니다.
