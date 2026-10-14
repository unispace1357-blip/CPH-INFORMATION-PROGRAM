import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { PageContainer } from '../ui/PageContainer'
import { Icon } from '../ui/Icon'
import { useGuestLanguage } from '../../i18n/guestLanguageContext'
import { MESSAGES } from '../../i18n/messages'

export function GuideLayout({ audience = 'guest' }: { audience?: 'guest' | 'staff' }) {
  const isStaff = audience === 'staff'
  const { language } = useGuestLanguage()
  const m = MESSAGES[language].ui
  const { pathname } = useLocation()
  const isIndex = pathname === (isStaff ? '/staff' : '/guest')

  useEffect(() => {
    document.documentElement.lang = isStaff ? 'ko' : language
    document.title = isStaff ? 'Staff Guide | CPH' : m.documentTitle
  }, [isStaff, language, m.documentTitle])

  return (
    <div className={`app-shell app-shell--${audience}`}>
      <a className="skip-link" href="#main-content">{isStaff ? '본문으로 이동' : m.skipContent}</a>
      <header className="site-header">
        <PageContainer variant={audience} className="site-header-inner">
          <Link className="brand" to={isStaff ? '/staff' : '/guest'} aria-label={isStaff ? 'CPH 직원용 안내 홈' : m.homeLabel}>
            <span className="brand-mark" aria-hidden="true">CPH</span>
            <span className="brand-copy"><span className="brand-name">{isStaff ? 'CPH Information Guide' : 'SONGDO CENTRAL PARK HOTEL'}</span><span className="brand-caption">{isStaff ? 'STAFF GUIDE · 프론트 안내' : m.brandCaption}</span></span>
          </Link>
          {isStaff ? <nav aria-label="직원용 내비게이션"><Link className="header-link" to="/guest">고객 화면 미리보기<Icon name="arrow" size={17} /></Link></nav> : <nav className="guest-navigation" aria-label={m.navigationLabel}>{isIndex ? <><a href="#hotel-information">{m.navHotel}</a><a href="#nearby-facilities">{m.navNearby}</a><a href="#guest-search">{m.navSearch}</a></> : <Link to="/guest">{m.brandCaption}</Link>}</nav>}
        </PageContainer>
      </header>
      <main id="main-content" tabIndex={-1}><PageContainer variant={audience}><Outlet /></PageContainer></main>
      <footer className="site-footer"><PageContainer variant={audience}>
        {isStaff ? <><p className="footer-title">CPH Guest Information Guide · 직원용</p><p>안내 정보는 실제 사용 전 호텔 담당자의 확인이 필요합니다.</p><p>가상 데이터는 실제 고객 안내에 사용하지 마세요. 미확인 항목은 담당자 확인이 필요합니다.</p></> : <><p className="footer-title">{m.footerTitle}</p><p>{m.footerDescription}</p></>}
      </PageContainer></footer>
    </div>
  )
}
