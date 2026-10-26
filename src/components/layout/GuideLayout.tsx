import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { PageContainer } from '../ui/PageContainer'
import { Icon } from '../ui/Icon'
import { StaffRequestDialog } from '../staff/StaffRequestDialog'
import { StaffAdminAccess } from '../staff/StaffAdminAccess'
import { useGuestLanguage } from '../../i18n/guestLanguageContext'
import { MESSAGES } from '../../i18n/messages'

export function GuideLayout({ audience = 'guest' }: { audience?: 'guest' | 'staff' }) {
  const isStaff = audience === 'staff'
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const requestTriggerRef = useRef<HTMLButtonElement>(null)
  const { language, setLanguage } = useGuestLanguage()
  const m = MESSAGES[language].ui
  const { pathname } = useLocation()
  const isIndex = pathname === (isStaff ? '/staff' : '/guest')

  // Prevent fragment links from changing HashRouter routes (and keep clean URLs in BrowserRouter).
  function scrollToSection(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(event.currentTarget.hash.slice(1))
    if (!target) return
    event.preventDefault()
    target.scrollIntoView({ block: 'start' })
    target.focus({ preventScroll: true })
  }

  function dismissRequest() {
    setIsRequestOpen(false)
    requestAnimationFrame(() => requestTriggerRef.current?.focus())
  }

  useEffect(() => {
    document.documentElement.lang = isStaff ? 'ko' : language
    document.title = isStaff ? 'Staff Guide | CPH' : m.documentTitle
  }, [isStaff, language, m.documentTitle])

  return (
    <div className={`app-shell app-shell--${audience}`}>
      <a className="skip-link" href="#main-content" onClick={scrollToSection}>{isStaff ? '본문으로 이동' : m.skipContent}</a>
      <header className="site-header">
        <PageContainer variant={audience} className="site-header-inner">
          <Link className="brand" to={isStaff ? '/staff' : '/guest'} aria-label={isStaff ? 'CPH 직원용 안내 홈' : m.homeLabel}>
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}hotel-logo.webp`} width="214" height="166" alt="The Central Park Hotel Songdo" />
            <span className="brand-copy"><span className="brand-name">{isStaff ? 'Information Guide' : 'SONGDO CENTRAL PARK HOTEL'}</span><span className="brand-caption">{isStaff ? 'FRONT DESK · 직원용 안내' : m.brandCaption}</span></span>
          </Link>
          {!isStaff && <div className="guest-mobile-controls">
            <details className="guest-mobile-menu">
              <summary aria-label={m.navigationLabel}><span aria-hidden="true">☰</span></summary>
              <nav aria-label={m.navigationLabel}>
                <a href="#hotel-information" onClick={event => { scrollToSection(event); event.currentTarget.closest('details')?.removeAttribute('open') }}>{m.navHotel}</a>
                <a href="#nearby-facilities" onClick={event => { scrollToSection(event); event.currentTarget.closest('details')?.removeAttribute('open') }}>{m.navNearby}</a>
                <a href="#guest-search" onClick={event => { scrollToSection(event); event.currentTarget.closest('details')?.removeAttribute('open') }}>{m.navSearch}</a>
              </nav>
            </details>
            <label className="guest-mobile-language">
              <Icon name="globe" size={17} />
              <span className="visually-hidden">{m.languageLabel}</span>
              <select aria-label={m.languageLabel} value={language} onChange={event => setLanguage(event.target.value as typeof language)}>
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="zh-CN">简体中文</option>
                <option value="ja">日本語</option>
              </select>
            </label>
          </div>}
          {isStaff ? <nav className="staff-header-actions" aria-label="직원용 내비게이션">
            <StaffAdminAccess />
            <button ref={requestTriggerRef} type="button" className="header-link staff-request-trigger"
              onClick={() => setIsRequestOpen(true)} aria-haspopup="dialog">요청사항</button>
            <Link className="header-link" to="/guest">고객 화면 미리보기<Icon name="arrow" size={17} /></Link>
          </nav> : <nav className="guest-navigation" aria-label={m.navigationLabel}>{isIndex ? <><a href="#hotel-information" onClick={scrollToSection}>{m.navHotel}</a><a href="#nearby-facilities" onClick={scrollToSection}>{m.navNearby}</a><a href="#guest-search" onClick={scrollToSection}>{m.navSearch}</a></> : <Link to="/guest">{m.brandCaption}</Link>}</nav>}
        </PageContainer>
      </header>
      {isStaff && isRequestOpen && <StaffRequestDialog onDismiss={dismissRequest} />}
      <main id="main-content" tabIndex={-1}><PageContainer variant={audience}><Outlet /></PageContainer></main>
      <footer className="site-footer"><PageContainer variant={audience}>
        {isStaff ? <><p className="footer-title">CPH Guest Information Guide · 직원용</p><p>안내 정보는 실제 사용 전 호텔 담당자의 확인이 필요합니다.</p><p>프론트 테스트용 미리보기입니다. 미확인 항목은 담당자 확인이 필요합니다.</p></> : <><p className="footer-title">{m.footerTitle}</p><p>{m.footerDescription}</p></>}
      </PageContainer></footer>
    </div>
  )
}
