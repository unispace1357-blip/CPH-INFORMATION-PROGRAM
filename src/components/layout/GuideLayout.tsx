import { NavLink, Outlet } from 'react-router-dom'

export function GuideLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">본문으로 이동</a>
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">CPH</span>
          <div><p className="brand-name">CPH Guest Information Guide</p><p className="brand-caption">송도 센트럴파크호텔 안내</p></div>
        </div>
        <nav aria-label="안내 화면 선택">
          <NavLink to="/guest">고객용 · Guest</NavLink>
          <NavLink to="/staff">직원용 · Staff</NavLink>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}><Outlet /></main>
      <footer className="site-footer">개발 준비 화면 · 실제 운영 정보는 아직 등록되지 않았습니다.</footer>
    </div>
  )
}
