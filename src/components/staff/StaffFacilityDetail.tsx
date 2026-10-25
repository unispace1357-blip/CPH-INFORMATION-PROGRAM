import type { Ref } from 'react'
import type { Facility } from '../../types/facility'
import { EmptyState } from '../ui/EmptyState'
import { EnglishGuidePanel } from './EnglishGuidePanel'
import { FACILITY_CATEGORY_OPTIONS } from '../../config/uiCategories'
import { NaverDirectionsLink } from '../ui/NaverDirectionsLink'
import { OperatingHoursGuide } from '../ui/OperatingHoursGuide'
import { specialRouteNotice } from '../../services/routeAccuracy.ts'
import { Icon } from '../ui/Icon'
import { Button } from '../ui/Button'
import { StaffPrintableCard } from './StaffPrintableCard'
import { TimespaceDiningDirectory } from '../ui/TimespaceDiningDirectory'
import type { TenantFocusRequest } from '../../services/timespaceTenantNavigation'
import { confirmedText, formatWalkingMinutes, formatVerificationDate } from '../../services/facilityPresentation'

export function StaffFacilityDetail({ facility, headingRef, tenantFocus = null, favorite = false, canFavorite = true, onToggleFavorite }: { facility: Facility | null; headingRef: Ref<HTMLHeadingElement>; tenantFocus?: TenantFocusRequest; favorite?: boolean; canFavorite?: boolean; onToggleFavorite?: () => void }) {
  if (!facility || !facility.isPublished) return <><EmptyState title="시설을 선택해 주세요" description="검색 결과에서 상세 보기를 선택하면 시설 안내와 영어 문구를 확인할 수 있습니다." icon="hotel" /><EnglishGuidePanel phrases={[]} /></>
  const ko = facility.translations.ko
  const en = facility.translations.en
  return (
    <div className="staff-detail-content">
      <div className="staff-detail-intro">
        <p className="eyebrow">{[facility.category, ...(facility.additionalCategories ?? [])].map(code => FACILITY_CATEGORY_OPTIONS.find(category => category.code === code)?.staffLabel ?? code).join(' · ')}</p>
        <h3 id="staff-detail-title" className="detail-title" tabIndex={-1} ref={headingRef}>{ko.name}</h3>
        <p className="facility-english-name" lang="en">{en.name}</p>
        <p className="detail-description">{confirmedText(ko.description, '시설 설명 미확인')}</p>
        <div className="staff-detail-shortcuts">
          <div className="staff-walking-summary"><Icon name="clock" size={22} /><span><span className="staff-walking-caption">예상 도보시간</span><strong>{formatWalkingMinutes(facility.walkingMinutes, facility.walkingDistanceMeters)}</strong></span></div>
          <NaverDirectionsLink url={facility.naverMapUrl} label="네이버 지도 길찾기" unavailable="길찾기 링크 미등록" newTabNotice="네이버 지도가 새 탭에서 열립니다." />
        </div>
        {specialRouteNotice(facility.id,'ko') && <p className="staff-route-accuracy-note" role="note">{specialRouteNotice(facility.id,'ko')}</p>}
        <div className="staff-detail-actions">
          <Button variant="secondary" disabled={!onToggleFavorite || (!favorite && !canFavorite)}
            onClick={onToggleFavorite}>{favorite ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기 추가'}</Button>
          <Button variant="secondary" onClick={() => window.print()}>인쇄용 안내 카드 출력</Button>
        </div>
        {!favorite && !canFavorite && <p className="field-hint">즐겨찾기는 최대 6개입니다. 기존 항목을 해제한 후 추가해 주세요.</p>}
        <p className="field-hint">인쇄용 안내 카드는 호텔에서 직접 작성한 텍스트와 로컬 생성 길찾기 QR로 구성됩니다. 인쇄 전에 목적지와 영업시간을 확인해 주세요.</p>
      </div>
      <StaffPrintableCard facility={facility} />
      <EnglishGuidePanel key={facility.id} phrases={facility.englishPhrases} meanings={facility.englishPhraseMeanings} />
      {facility.id === 'songdo-timespace-complex' && <TimespaceDiningDirectory language="ko" staff focusRequest={tenantFocus} />}
      <section className="staff-facility-metadata" aria-labelledby="staff-metadata-title">
        <h4 id="staff-metadata-title">시설 기본 정보</h4>
        <OperatingHoursGuide value={ko.openingHours} closedDays={facility.closedDays.ko} language="ko" />
        <dl className="detail-facts">
          <div><dt>주소</dt><dd>{confirmedText(ko.address, '주소 미확인')}</dd></div>
          <div><dt>영업시간</dt><dd>{confirmedText(ko.openingHours, '영업시간 미확인')}</dd></div>
          <div><dt>휴무일</dt><dd>{confirmedText(facility.closedDays.ko, '휴무일 미확인')}</dd></div>
          <div><dt>예상 도보시간</dt><dd>{formatWalkingMinutes(facility.walkingMinutes, facility.walkingDistanceMeters)}</dd></div>
          <div><dt>이동 안내</dt><dd>{confirmedText(ko.directions, '이동 안내 미확인')}</dd></div>
          <div><dt>참고 사항</dt><dd>{confirmedText(ko.notes, '등록된 참고 사항 없음')}</dd></div>
        </dl>
        <section className="english-directions" aria-labelledby="english-directions-title"><h4 id="english-directions-title" lang="en">Directions in English</h4><p lang={en.directions.trim() ? 'en' : 'ko'}>{confirmedText(en.directions, '영어 이동 안내 미확인')}</p></section>
        <p className="verification-date">{formatVerificationDate(facility.lastVerifiedAt)}</p>
        <p className="field-hint">확인일은 현재 영업 상태를 보장하지 않습니다. 방문 전 변동 사항을 확인해 주세요.</p>
      </section>
    </div>
  )
}
