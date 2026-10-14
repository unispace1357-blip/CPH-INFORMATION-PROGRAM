import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { Icon } from '../components/ui/Icon'

export function NotFoundPage() {
  return (
    <section className="panel not-found-page" lang="ko">
      <PageHeader eyebrow="404" title="페이지를 찾을 수 없습니다" description="주소를 확인하거나 고객용 안내 화면으로 이동해 주세요." />
      <Link className="button button--primary" to="/guest">고객용 안내로 이동<Icon name="arrow" size={18} /></Link>
    </section>
  )
}
