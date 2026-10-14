import { Button } from './Button'

/** Static notice, never a Facility or a counted search result. */
export function PendingTransitNotice({ title, description, directionsLabel, detailsLabel }: { title: string; description: string; directionsLabel: string; detailsLabel: string }) {
  return <aside className="pending-transit-notice" role="note" aria-label={title}>
    <p className="pending-transit-title">{title}</p><p>{description}</p>
    <div className="pending-transit-actions"><Button variant="secondary" disabled>{directionsLabel}</Button><Button variant="secondary" disabled>{detailsLabel}</Button></div>
  </aside>
}
