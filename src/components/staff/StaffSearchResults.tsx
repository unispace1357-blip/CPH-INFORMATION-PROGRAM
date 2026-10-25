import type { Facility } from '../../types/facility'
import { FacilityCard } from '../ui/FacilityCard'
import { EmptyState } from '../ui/EmptyState'
import { FACILITY_CATEGORY_OPTIONS } from '../../config/uiCategories'
import { confirmedText, formatWalkingMinutes } from '../../services/facilityPresentation'

export function StaffSearchResults({ results, publicFacilityCount, selectedId, onSelect }: { results: readonly Facility[]; publicFacilityCount: number; selectedId: string | null; onSelect: (id: string) => void }) {
  if (publicFacilityCount === 0) return <EmptyState title="등록된 시설 정보가 없습니다." description="공개된 시설 정보를 등록한 후 이용해 주세요." icon="hotel" />
  if (!results.length) return <EmptyState title="검색 결과가 없습니다." description="다른 검색어 또는 카테고리를 선택해 주세요." icon="search" />
  return <div className="staff-result-list">{results.filter(facility => facility.isPublished).map(facility => <FacilityCard
    key={facility.id} name={facility.translations.ko.name} englishName={facility.translations.en.name.replace(` (${facility.translations.ko.name})`, '')}
    categoryLabel={FACILITY_CATEGORY_OPTIONS.find(category => category.code === facility.category)?.staffLabel ?? facility.category}
    menuSummary={facility.category === 'dining' || facility.category === 'cafe' || facility.id === 'songdo-timespace-complex' ? facility.translations.ko.description : undefined}
    openingHours={confirmedText(facility.translations.ko.openingHours, '영업시간 미확인')}
    walkingText={formatWalkingMinutes(facility.walkingMinutes)}
    hoursLabel="영업시간" walkingLabel="예상 도보시간" detailLabel={selectedId === facility.id ? '선택됨 · 상세 정보' : '상세 보기'}
    selected={selectedId === facility.id} disabled={false} onDetails={() => onSelect(facility.id)}
    detailControls="staff-facility-detail"
  />)}</div>
}
