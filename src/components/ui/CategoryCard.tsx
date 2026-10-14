import type { ButtonHTMLAttributes } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface CategoryCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string
  icon: IconName
  selected?: boolean
  compact?: boolean
}

export function CategoryCard({ label, icon, selected = false, compact = false, className = '', ...props }: CategoryCardProps) {
  return (
    <button type="button" aria-pressed={selected} className={`category-card ${selected ? 'is-selected' : ''} ${compact ? 'category-card--compact' : ''} ${className}`} {...props}>
      <span className="category-icon"><Icon name={icon} /></span><span>{label}</span>
    </button>
  )
}
