import type { Facility } from '../../types/facility'
import type { GuideLanguage } from '../../types/guide'
import { MESSAGES } from '../../i18n/messages'
import { guestWalkingTime, localizedValue } from '../../i18n/formatters'
import { FacilityCard } from '../ui/FacilityCard'
import { EmptyState } from '../ui/EmptyState'

export function GuestFacilityResults({ results, publicCount, language, selectedId, onSelect }: { results: readonly Facility[]; publicCount: number; language: GuideLanguage; selectedId: string | null; onSelect: (id: string) => void }) {
  const m = MESSAGES[language]
  if (!publicCount) return <EmptyState title={m.ui.noFacilitiesTitle} description={m.ui.noFacilitiesDescription} />
  if (!results.length) return <EmptyState title={m.ui.resultNoneTitle} description={m.ui.resultNoneDescription} icon="search" />
  return <div className="guest-result-list">{results.filter(facility => facility.isPublished).map(facility => <FacilityCard key={facility.id} name={facility.translations[language].name} categoryLabel={m.categories[facility.category]} openingHours={localizedValue(facility.translations[language].openingHours, language)} walkingText={guestWalkingTime(facility.walkingMinutes, language)} hoursLabel={m.ui.openingHours} walkingLabel={m.ui.walkingTime} detailLabel={selectedId === facility.id ? m.ui.selectedDetails : m.ui.viewDetails} detailButtonId={`guest-result-${facility.id}`} detailControls="guest-facility-detail" selected={selectedId === facility.id} disabled={false} onDetails={() => onSelect(facility.id)} />)}</div>
}
