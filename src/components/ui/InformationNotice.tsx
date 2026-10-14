import { useId } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function InformationNotice({ title, children, tone = 'info' }: { title: string; children: ReactNode; tone?: 'info' | 'warning' }) {
  const titleId = useId()
  return <aside className={`information-notice information-notice--${tone}`} aria-labelledby={titleId}><Icon name="info" size={22} /><div><p className="notice-title" id={titleId}>{title}</p><div className="notice-content">{children}</div></div></aside>
}
