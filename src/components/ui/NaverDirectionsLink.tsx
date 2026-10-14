import { useId } from 'react'
import { validatedNaverMapUrl } from '../../services/naverMapUrl'
import { Button } from './Button'

export function NaverDirectionsLink({ url, label, unavailable, newTabNotice }: { url?: string | null; label: string; unavailable: string; newTabNotice: string }) {
  const hint = useId()
  const href = validatedNaverMapUrl(url)
  return <div className="naver-directions">
    {href ? <a className="button button--primary naver-map-link" href={href} target="_blank" rel="noopener noreferrer" aria-describedby={hint}>{label}</a> : <Button className="naver-map-disabled" disabled aria-describedby={hint}>{label}</Button>}
    <p id={hint} className="field-hint">{href ? newTabNotice : unavailable}</p>
  </div>
}
