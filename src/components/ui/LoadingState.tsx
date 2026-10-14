import { Icon } from './Icon'

export function LoadingState({ label = 'Loading information…' }: { label?: string }) {
  return <div className="loading-state" role="status" aria-live="polite"><Icon name="loading" className="loading-icon" /><span>{label}</span></div>
}
