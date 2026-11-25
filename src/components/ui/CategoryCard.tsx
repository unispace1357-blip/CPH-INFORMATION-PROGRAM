import type { ButtonHTMLAttributes } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface CategoryCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string
  icon: IconName
  selected?: boolean
  compact?: boolean
  description?: string
}

export function CategoryCard({ label, icon, selected = false, compact = false, description, className = '', ...props }: CategoryCardProps) {
  return (
    <button type="button" aria-pressed={selected} className={`category-card ${selected ? 'is-selected' : ''} ${compact ? 'category-card--compact' : ''} ${className}`} {...props}>
      <span className="category-icon"><Icon name={icon} /></span>{description ? <><span className="category-card-copy"><strong>{label}</strong><span className="category-card-description">{description}</span></span><Icon name="chevronRight" size={18} className="category-card-chevron" /></> : <span>{label}</span>}
    </button>
  )
}
