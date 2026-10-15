# 호텔 승인 원고 보호 기준

사용자가 그대로 사용하도록 승인한 원본은 `CPH_STEP07A_4languages_translation_review_POLICY_CONFIRMED_DRAFT.xlsx`입니다. 확인일은 사용자가 지정한 **2026-10-15**, SHA-256은 `9f76d4a932298548d2ab997fc1a5adebce6ce66b1dfb1b86a463b5df05116261`입니다. 파일명의 DRAFT를 이유로 승인을 취소하거나 문구를 재번역하지 않습니다.

`docs/reference/step07a-approved-copy.json`은 원본 35개 ID와 4개 언어 셀·해시를 보존하는 독립 검증 기준입니다. 앱 JSON과 별개로 승인 원고 훼손을 감지하기 위해 유지합니다. `npm run validate:hotel-copy`가 34개 반영 항목 ×4개 언어=136개 셀과 H33 보류를 검사합니다. 여러 항목은 원문을 유지하며 빈 줄로 결합합니다. 번역기 대조표의 105행 결과는 비어 있으므로 외부 번역기 검증 완료로 보고하지 않습니다.

| 호텔 필드 | 승인 ID 순서 |
| --- | --- |
| name | H01 |
| address | H02 |
| checkIn | H04, H05 |
| checkOut | H06, H30, H31, H32 |
| breakfast | H07–H12 |
| parking | H13 |
| roomUsage | H14–H22, H24, H25 |
| notes | H03, H23, H26–H29, H34, H35 |

H27–H29도 최신 승인에 따라 반영된 정책입니다. 공통 checkInTime=15:00, checkOutTime=12:00이며 승인 금액·반려동물 조건·전화 표기 등을 임의 변경하지 않습니다.

**H33은 공개 보류**입니다. 승인 참고 자료에만 원문을 보관하고 고객 JSON·화면에는 넣지 않습니다. 문자 수신번호/공개 승인 보완 전 H03 대표번호로 대신하거나 추정 번호를 작성하지 않습니다.

호텔 description은 4개 언어 모두 승인 원고가 없어 빈 문자열입니다. 설명을 임의 생성해 운영 검증을 통과시키지 않습니다. 호텔 dataStatus=demo와 운영 배포 차단을 유지합니다. 과거 구현·검증 이력은 Git 히스토리로 확인합니다.
