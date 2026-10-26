import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'

type HelpTarget = 'search' | 'english' | 'facilities' | 'timespace' | 'quick' | 'print' | 'request'

function GuideLink({ target, children }: { target: HelpTarget; children: ReactNode }) {
  return <Link to="/staff" state={{ helpTarget: target }} className="staff-help-action">{children}<Icon name="arrow" size={16} /></Link>
}

function EmployeeGuide() {
  return <div className="staff-help-copy">
    <section className="staff-help-section">
      <h2>1. 처음 사용하신다면</h2>
      <p>사용 방법은 간단합니다.</p>
      <ol className="staff-help-steps">
        <li><strong>① 필요한 정보 검색하기</strong><p>통합 검색창에서 <code>호텔 안내</code> 또는 <code>주변 시설</code>을 선택하고 원하는 내용을 검색합니다.</p></li>
        <li><strong>② 상세 내용 확인하기</strong><p>검색 결과를 누르면 관련 안내 문구와 운영시간, 위치 등을 확인할 수 있습니다.</p></li>
        <li><strong>③ 손님께 안내하기</strong><p>영어 문장을 복사하거나 네이버 지도 길찾기를 열어 안내해 주세요. 필요한 경우 QR 안내문도 출력할 수 있습니다.</p></li>
      </ol>
    </section>
    <section className="staff-help-section">
      <h2>2. 주요 기능 안내</h2>
      <div className="staff-help-features">
        <article className="staff-help-feature">
          <h3>통합 검색</h3>
          <p>체크인, 조식, 주차부터 주변 음식점까지 필요한 정보를 빠르게 찾을 수 있습니다.</p>
          <p>예를 들어 <code>조식</code>, <code>맥주</code>, <code>타임스페이스</code> 등을 검색해 보세요.</p>
          <p>호텔 정보와 주변 시설은 검색 범위가 구분되어 있으니, 원하는 항목이 나오지 않으면 검색 범위를 먼저 확인해 주세요.</p>
          <GuideLink target="search">통합 검색으로 이동</GuideLink>
        </article>
        <article className="staff-help-feature">
          <h3>호텔 영어 응대</h3>
          <p>영어 안내가 필요할 때 활용할 수 있는 기능입니다.</p>
          <p>체크인, 체크아웃, 객실 이용 등 상황에 맞는 문장을 찾아 한국어 의미와 함께 확인할 수 있습니다.</p>
          <p>필요한 문장은 <code>복사</code> 버튼을 누르면 됩니다.</p>
          <GuideLink target="english">영어 응대 문구 보기</GuideLink>
        </article>
        <article className="staff-help-feature">
          <h3>주변 시설 안내</h3>
          <p>손님이 가까운 식당이나 편의점, 약국 등을 찾으실 때 사용해 보세요.</p>
          <p>시설별로 등록된 위치, 예상 도보 거리, 운영시간과 네이버 지도 길찾기를 확인할 수 있습니다.</p>
          <p>영업시간은 실시간 정보가 아니므로 방문 전에 확인해 주시면 좋겠습니다.</p>
          <GuideLink target="facilities">주변 시설 검색하기</GuideLink>
        </article>
        <article className="staff-help-feature">
          <h3>타임스페이스 음식점</h3>
          <p>타임스페이스에 있는 음식점들을 종류별로 살펴볼 수 있습니다.</p>
          <p>음식 이름이나 매장명을 검색하면 대표 메뉴와 등록된 동·층·호수 정보를 확인할 수 있습니다.</p>
          <p>매장 위치와 영업 여부는 변경될 수 있으니 안내 전 확인해 주세요.</p>
          <GuideLink target="timespace">타임스페이스 음식점 보기</GuideLink>
        </article>
        <article className="staff-help-feature">
          <h3>즐겨찾기와 최근 열람</h3>
          <p>자주 찾는 시설이나 영어 안내 문구는 즐겨찾기에 등록해 두면 편리합니다.</p>
          <ul><li>즐겨찾기: 최대 6개</li><li>최근 열람: 최대 5개</li></ul>
          <p>저장한 항목은 빠른 안내에서 다시 열 수 있습니다. 단, 현재 사용하는 브라우저에 저장되므로 다른 PC와 자동으로 공유되지는 않아서 추가로 시스템 수정해야하긴 합니다.</p>
          <GuideLink target="quick">빠른 안내 확인하기</GuideLink>
        </article>
        <article className="staff-help-feature">
          <h3>지도 QR 및 인쇄</h3>
          <p>손님께 길을 설명하기 어려울 때는 QR 안내문을 활용해 보세요.</p>
          <p>시설 상세 화면에서 인쇄용 안내 카드를 확인하고 출력할 수 있습니다.</p>
          <p>QR을 스캔하면 등록된 네이버 지도 길찾기로 연결됩니다. 출력하기 전에 목적지가 맞는지 확인해 주세요.</p>
          <GuideLink target="print">시설 안내 화면으로 이동</GuideLink>
        </article>
        <article className="staff-help-feature staff-help-feature--wide">
          <h3>요청사항과 관리자 화면</h3>
          <p>정보가 잘못되었거나 추가했으면 하는 시설이 있다면 <code>요청사항</code>을 이용해 주세요.</p>
          <p>가감없이 작성해주시면 제가 개발 가능 여부 확인후에 반영하겠습니다.(너무 많이는 하지 말아주세요)</p>
          <p>관리자 화면은 저만 사용 가능이라 신경 안 쓰셔도 됩니다.</p>
          <GuideLink target="request">요청사항 작성하기</GuideLink>
        </article>
      </div>
    </section>
  </div>
}

function DeveloperGuide() {
  return <div className="staff-help-copy staff-help-developer">
    <section className="staff-help-section">
      <h2>1. 프로그램 구조</h2>
      <p>송도센트럴파크호텔 QR 안내 프로그램은 직원용·고객용·관리자용 화면으로 구성되어 있습니다. React + TypeScript + Vite, React Router를 사용하고 정적 JSON을 읽는 방식입니다.</p>
      <p>고객용은 한국어·영어·중국어(간체)·일본어 안내를 제공하며, 직원용은 검색·영어 응대 문구·주변 시설·즐겨찾기·QR 인쇄에 초점을 맞춥니다. 관리자 도구는 별도 엔트리로 구성됩니다.</p>
    </section>
    <section className="staff-help-section">
      <h2>2. 폴더별 역할</h2>
      <div className="staff-help-code-list">
        <p><code>src/pages/staff/</code> 직원 화면 및 도움말</p>
        <p><code>src/pages/guest/</code> 고객 화면</p>
        <p><code>src/components/</code> 공용 UI와 화면별 구성요소</p>
        <p><code>src/data/</code> 호텔·시설·영어 응대 JSON, 스키마 및 검증</p>
        <p><code>src/services/</code> 검색, 지도 URL 검증, 복사, 저장 기능</p>
        <p><code>src/i18n/</code> 고객용 다국어 UI</p>
        <p><code>tools/<span>admin/</span></code> 독립 관리자 엔트리</p>
        <p><code>scripts/</code> 데이터·회귀 테스트와 빌드</p>
      </div>
    </section>
    <section className="staff-help-section">
      <h2>3. 데이터 흐름과 주요 기능</h2>
      <p>시설은 <code>src/data/facilities.json</code>, 호텔은 <code>hotel.json</code>, 영어 문구는 <code>frontdesk-scripts.json</code>을 기준으로 관리합니다. 직원·고객 화면은 같은 공개 시설 데이터를 사용하지만 검색·표시 방식과 접근 가능한 기능이 다릅니다.</p>
      <ul>
        <li><strong>통합 검색</strong> — 호텔 영어 응대와 주변 시설을 분리 검색합니다.</li>
        <li><strong>영어 응대</strong> — 영어 문장·한국어 의미·클립보드 복사를 제공합니다.</li>
        <li><strong>타임스페이스</strong> — 음식점 디렉터리를 시설 상세의 하위 목록으로 렌더링합니다.</li>
        <li><strong>빠른 안내</strong> — 즐겨찾기 6개, 최근 열람 5개를 브라우저 로컬 저장소에 보관합니다. PC 간 공유하지 않습니다.</li>
        <li><strong>지도·QR</strong> — 검증된 네이버 지도 길찾기 URL을 사용하며 유료 지도 API를 호출하지 않습니다.</li>
        <li><strong>요청사항</strong> — 직원용에서만 열리고 외부 폼 최종 제출은 사용자 작업입니다.</li>
        <li><strong>관리자</strong> — JSON 수정 후 내보내기·검수·코드 반영·재배포가 필요합니다.</li>
      </ul>
    </section>
    <section className="staff-help-section">
      <h2>4. 개발·수정 순서</h2>
      <p>데이터를 수정할 때는 JSON 타입·스키마·검색·번역·지도 주소의 무결성을 함께 확인합니다. 공통 데이터를 고칠 때 직원용과 고객용 표시를 모두 확인하고, 미확인 운영시간을 임의로 확정하지 않습니다.</p>
      <p>변경은 기능 단위로 커밋하고 PR 검증을 거쳐 <code>main</code>에 반영합니다. 관리자 수정은 공개 서버에 자동 반영되지 않습니다.</p>
    </section>
    <section className="staff-help-section">
      <h2>5. 테스트 및 배포</h2>
      <p>Node.js 24 LTS에서 아래 순서로 검증합니다.</p>
      <pre><code>{'npm ci\nnpm run validate\nnpm run validate:hotel-copy\nnpm run test\nnpm run lint\nnpm run build\nnpm run admin:build\nnpm run build:public-test'}</code></pre>
      <p>GitHub Pages는 별도 공개 테스트 빌드입니다. <code>main</code> 푸시 후 Actions에서 웹 빌드와 Pages 배포를 실행합니다. <code>build:production</code>은 미승인 DEMO 데이터에 대해 실패해야 정상이며 우회하지 않습니다.</p>
    </section>
    <section className="staff-help-section">
      <h2>6. 유지보수 시 주의사항</h2>
      <p>고객 개인정보는 수집하지 않습니다. 정적 웹의 공개 관리자 비밀번호는 실질적인 보안 인증이 아니므로 공개 코드에 기밀 정보를 넣지 않습니다. 고객용에는 직원 전용 메뉴·요청 입력 UI를 노출하지 않습니다.</p>
      <p>상세 데이터 계약은 <code>docs/data-model.md</code>, 요청 접수 운영은 <code>docs/staff-requests.md</code>, 설치·빌드는 <code>README.md</code>를 참고합니다.</p>
    </section>
  </div>
}

export function StaffHelpPage() {
  const [guide, setGuide] = useState<'employee' | 'developer'>('employee')
  return <div className="staff-help-page">
    <div className="staff-help-back"><Link to="/staff">← 직원용 프로그램으로 돌아가기</Link></div>
    <header className="staff-help-hero">
      <span className="staff-help-eyebrow">HELP CENTER · STAFF CONCIERGE</span>
      <h1>직원용 프로그램 이용 안내</h1>
      <p className="staff-help-tagline">프론트 업무에 필요한 정보를 한곳에서</p>
      <p>이 프로그램은 순수하게 저 편하자고 만든 프로그램입니다. 손님응대를 1분이라도 줄이면<br />1분만큼 제가 쉴 수 있겠죠?</p>
    </header>
    <div className="staff-help-switcher" role="group" aria-label="도움말 종류">
      <button type="button" className={guide === 'employee' ? 'is-selected' : ''} aria-pressed={guide === 'employee'} onClick={() => setGuide('employee')}>직원용 가이드</button>
      <button type="button" className={guide === 'developer' ? 'is-selected' : ''} aria-pressed={guide === 'developer'} onClick={() => setGuide('developer')}>개발자용 가이드</button>
    </div>
    {guide === 'employee' ? <EmployeeGuide /> : <DeveloperGuide />}
    <div className="staff-help-footer"><Link to="/staff">직원용 프로그램으로 돌아가기 <Icon name="arrow" size={16} /></Link></div>
  </div>
}
