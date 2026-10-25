import type { Facility } from '../../types/facility'
import type { GuideLanguage } from '../../types/guide'
import { MESSAGES } from '../../i18n/messages'
import { guestWalkingTime, localizedValue } from '../../i18n/formatters'
import { FacilityCard } from '../ui/FacilityCard'
import { FEATURED_DINING_FACILITY_ID } from '../../services/facilitySearch'
import type { StaffCategoryFilter } from '../../services/facilitySearch'
import { EmptyState } from '../ui/EmptyState'

const FEATURED_TEXT: Record<GuideLanguage, string> = {
  ko: '추천', en: 'Featured', 'zh-CN': '推荐', ja: 'おすすめ',
}

export function GuestFacilityResults({ results, publicCount, language, category, selectedId, onSelect }: { results: readonly Facility[]; publicCount: number; language: GuideLanguage; category: StaffCategoryFilter; selectedId: string | null; onSelect: (id: string) => void }) {
  const m = MESSAGES[language]
  if (!publicCount) return <EmptyState title={m.ui.noFacilitiesTitle} description={m.ui.noFacilitiesDescription} />
  if (!results.length) return <EmptyState title={m.ui.resultNoneTitle} description={m.ui.resultNoneDescription} icon="search" />
  return <div className="guest-result-list">{results.filter(facility => facility.isPublished).map(facility => <FacilityCard key={facility.id} name={facility.translations[language].name} featuredLabel={category === 'dining' && facility.id === FEATURED_DINING_FACILITY_ID ? FEATURED_TEXT[language] : undefined} categoryLabel={[facility.category, ...(facility.additionalCategories ?? [])].map(code => m.categories[code]).join(' · ')} menuSummary={facility.category === 'dining' || facility.category === 'cafe' || facility.id === 'songdo-timespace-complex' ? facility.translations[language].description : undefined} openingHours={localizedValue(facility.translations[language].openingHours, language)} walkingText={guestWalkingTime(facility.walkingMinutes, language, facility.walkingDistanceMeters)} hoursLabel={m.ui.openingHours} walkingLabel={m.ui.walkingTime} detailLabel={selectedId === facility.id ? m.ui.selectedDetails : m.ui.viewDetails} detailButtonId={`guest-result-${facility.id}`} detailControls="guest-facility-detail" selected={selectedId === facility.id} disabled={false} onDetails={() => onSelect(facility.id)} />)}</div>
}
