# GitHub Pages 직원용 관리자 (정적 DEMO)

현재 공개 테스트 페이지 주소:
- 직원용: https://unispace1357-blip.github.io/CPH-INFORMATION-PROGRAM/#/staff
- 관리자: https://unispace1357-blip.github.io/CPH-INFORMATION-PROGRAM/admin/

## 사용
1. 직원용 화면에서 **관리자 화면**을 선택합니다.
2. 비밀번호 입력 후 **관리자 화면 열기**를 누릅니다. 기본 비밀번호: `sjy@123456`
3. 기존 시설 27곳, 타임스페이스 음식점 15곳, 호텔 기본정보 및 JSON 검증/가져오기/내보내기를 이용합니다.
4. 편집된 데이터는 현재 브라우저 메모리에만 남습니다. **JSON 다운로드 후 원본 검수·코드 반영·배포**가 필요합니다. 자동 저장 또는 GitHub 원본 업데이트가 아닙니다.
5. **관리자 종료 · 직원 화면 복귀**를 누르면 직원용 페이지로 이동합니다.

## 중요한 제한

**이 비밀번호는 실제 접근통제 수단이 아닙니다.** GitHub Pages는 정적 호스팅이므로 소스와 비밀번호를 방문자가 확인할 수 있으며 잠금 화면도 우회할 수 있습니다. 비공개 정보, 고객 개인정보, 내부 운영자료, 계정·접속키는 입력하거나 배포하면 안 됩니다.

- 기존 고객용에는 관리자 버튼이 없습니다.
- 관리자 번들은 공개 테스트용 `/admin/`에서만 별도로 빌드하며, 직원용 페이지 JS에서 직접 관리 컴포넌트를 불러오지 않습니다.
- 공개 테스트용 관리자 초기 데이터는 `createPublicDataset`으로 **공개 승인된 DEMO 시설만 선별**한 스냅샷입니다. 추후 비공개 시설은 관리자 웹 번들에 넣지 않습니다.
- 실제 운영용 `build:production`은 기존 관리자 포함 방지 검사와 DEMO 운영 배포 차단을 유지합니다.
- Windows 전용 관리자는 이전과 같은 로컬 비밀번호 해시 및 Electron 인증 창을 계속 사용합니다. 웹용 간단 비밀번호와 혼동하지 마세요.
- 이 정적 사이트의 비밀번호를 바꾸려면 `src/services/demoAdminGate.ts`의 `DEMO_ADMIN_PASSWORD` 값을 수정한 후 다시 배포해야 합니다. 변경 전후 모두 공개 코드에서 확인 가능합니다.

## 테스트

- `scripts/public-build.test.ts`: 공개 테스트 번들 내 `admin/index.html` 확인, 경로·기본 문구, 비공개 fixture 토큰 미노출, 정식 운영 빌드 관리자 제외
- `scripts/final-qa-ui.cjs`: 직원용 관리자 버튼 및 로컬 개발 모드의 안내, 고객·직원·로컬 관리자 기존 기능 회귀
- `.github/workflows/public-test.yml`: GitHub Pages 배포 및 공개 자산 응답 확인
