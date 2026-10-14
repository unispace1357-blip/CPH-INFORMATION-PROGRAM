import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Icon } from './Icon'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  label: string
  value?: string
  hint?: string
}

export function SearchInput({ label, value = '', hint, id, className = '', onChange, ...props }: SearchInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className={`search-field ${className}`}>
      <label className="field-label" htmlFor={inputId}>{label}</label>
      <div className="search-control"><Icon name="search" size={22} /><input id={inputId} type="search" value={value} onChange={onChange} readOnly={!onChange} aria-describedby={hint ? `${inputId}-hint` : undefined} {...props} /></div>
      {hint && <p className="field-hint" id={`${inputId}-hint`}>{hint}</p>}
    </div>
  )
}
