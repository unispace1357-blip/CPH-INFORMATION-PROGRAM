import type { ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface EmptyStateProps {
  title: string
  description: string
  icon?: IconName
  actions?: ReactNode
}

export function EmptyState({ title, description, icon = 'empty', actions }: EmptyStateProps) {
  return <div className="empty-state"><span className="state-icon"><Icon name={icon} size={28} /></span><h3>{title}</h3><p>{description}</p>{actions}</div>
}
