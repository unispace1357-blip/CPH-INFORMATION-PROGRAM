import type { HTMLAttributes } from 'react'

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'guest' | 'staff'
}

export function PageContainer({ children, variant = 'guest', className = '', ...props }: PageContainerProps) {
  return <div className={`page-container page-container--${variant} ${className}`} {...props}>{children}</div>
}
