import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="guide-panel">
      <p className="eyebrow">404</p>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p className="intro">주소를 확인하거나 고객용 안내 화면으로 이동해 주세요.</p>
      <Link to="/guest">고객용 안내로 이동</Link>
    </section>
  )
}
