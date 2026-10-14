import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { Icon } from '../components/ui/Icon'
import { useGuestLanguage } from '../i18n/guestLanguageContext'
import { MESSAGES } from '../i18n/messages'

export function NotFoundPage() {
  const { pathname } = useLocation()
  const { language } = useGuestLanguage()
  const pageLanguage = pathname === '/staff' || pathname.startsWith('/staff/') ? 'ko' : language
  const m = MESSAGES[pageLanguage].ui
  return (
    <section className="panel not-found-page" lang={pageLanguage}>
      <PageHeader eyebrow="404" title={m.notFoundTitle} description={m.notFoundDescription} />
      <Link className="button button--primary" to="/guest">{m.returnGuest}<Icon name="arrow" size={18} /></Link>
    </section>
  )
}
