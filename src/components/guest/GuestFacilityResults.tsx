import type { Facility } from '../../types/facility'
import type { GuideLanguage } from '../../types/guide'
import { MESSAGES } from '../../i18n/messages'
import { guestWalkingTime, localizedValue } from '../../i18n/formatters'
import { FacilityCard } from '../ui/FacilityCard'
import { FACILITY_CATEGORY_OPTIONS } from '../../config/uiCategories'
import { TOURISM_PHOTOS, TOURISM_PHOTO_UI } from '../../data/tourismPhotos'

function licensedFacilityVisual(id: string, language: GuideLanguage) {
  const photoId = id === 'songdo-central-park' ? 'central-park' : id === 'g-tower-ifez-observatory' ? 'g-tower' : null
  if (!photoId) return undefined
  const photo = TOURISM_PHOTOS[photoId]!
  return { photoUrl: `${import.meta.env.BASE_URL}tourism-photos/${photoId}.webp`, alt: photo.alt[language], sourceUrl: photo.sourceUrl, sourceLabel: TOURISM_PHOTO_UI[language].sourceLabel }
}
import { FEATURED_DINING_FACILITY_ID } from '../../services/facilitySearch'
import type { StaffCategoryFilter } from '../../services/facilitySearch'
import { EmptyState } from '../ui/EmptyState'
import { GUEST_FACILITY_COPY, TIMESPACE_FACILITY_ID, guestFacilityCardTeaser } from '../../services/guestFacilityPresentation'

const FEATURED_TEXT: Record<GuideLanguage, string> = {
  ko: '추천', en: 'Featured', 'zh-CN': '推荐', ja: 'おすすめ', ru: 'Рекомендуем',
}

export function GuestFacilityResults({ results, publicCount, language, category, selectedId, onSelect }: { results: readonly Facility[]; publicCount: number; language: GuideLanguage; category: StaffCategoryFilter; selectedId: string | null; onSelect: (id: string) => void }) {
  const m = MESSAGES[language]
  if (!publicCount) return <EmptyState title={m.ui.noFacilitiesTitle} description={m.ui.noFacilitiesDescription} />
  if (!results.length) return <EmptyState title={m.ui.resultNoneTitle} description={m.ui.resultNoneDescription} icon="search" />
  return <div className="guest-result-list">{results.filter(facility => facility.isPublished).map(facility => <FacilityCard key={facility.id} name={facility.translations[language].name} categoryIcon={FACILITY_CATEGORY_OPTIONS.find(item => item.code === facility.category)?.icon ?? 'hotel'} guestVisual={licensedFacilityVisual(facility.id, language)} featuredLabel={category === 'dining' && facility.id === FEATURED_DINING_FACILITY_ID ? FEATURED_TEXT[language] : undefined} categoryLabel={[facility.category, ...(facility.additionalCategories ?? [])].map(code => m.categories[code]).join(' · ')} menuSummary={facility.category === 'dining' || facility.category === 'cafe' || facility.id === TIMESPACE_FACILITY_ID ? guestFacilityCardTeaser(facility, language) : undefined} openingHours={localizedValue(facility.translations[language].openingHours, language)} walkingText={guestWalkingTime(facility.walkingMinutes, language, facility.walkingDistanceMeters)} hoursLabel={m.ui.openingHours} walkingLabel={facility.id === TIMESPACE_FACILITY_ID ? GUEST_FACILITY_COPY[language].nearbyLandmark : m.ui.walkingTime} detailLabel={selectedId === facility.id ? m.ui.selectedDetails : m.ui.viewDetails} detailButtonId={`guest-result-${facility.id}`} detailControls="guest-facility-detail" selected={selectedId === facility.id} disabled={false} onDetails={() => onSelect(facility.id)} />)}</div>
}
