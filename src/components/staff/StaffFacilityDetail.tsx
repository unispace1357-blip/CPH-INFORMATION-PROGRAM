import type { Ref } from 'react'
import type { Facility } from '../../types/facility'
import { EmptyState } from '../ui/EmptyState'
import { EnglishGuidePanel } from './EnglishGuidePanel'
import { FACILITY_CATEGORY_OPTIONS } from '../../config/uiCategories'
import { NaverDirectionsLink } from '../ui/NaverDirectionsLink'
import { confirmedText, formatWalkingMinutes, formatVerificationDate } from '../../services/facilityPresentation'

export function StaffFacilityDetail({ facility, headingRef }: { facility: Facility | null; headingRef: Ref<HTMLHeadingElement> }) {
  if (!facility || !facility.isPublished) return <><EmptyState title="시설을 선택해 주세요" description="검색 결과에서 상세 보기를 선택하면 시설 안내와 영어 문구를 확인할 수 있습니다." icon="hotel" /><EnglishGuidePanel phrases={[]} /></>
  const ko = facility.translations.ko
  const en = facility.translations.en
  return (
    <div className="staff-detail-content">
      <p className="eyebrow">{FACILITY_CATEGORY_OPTIONS.find(category => category.code === facility.category)?.staffLabel}</p>
      <h3 id="staff-detail-title" className="detail-title" tabIndex={-1} ref={headingRef}>{ko.name}</h3>
      <p className="facility-english-name" lang="en">{en.name}</p>
      <p className="detail-description">{confirmedText(ko.description, '시설 설명 미확인')}</p>
      <dl className="detail-facts">
        <div><dt>주소</dt><dd>{confirmedText(ko.address, '주소 미확인')}</dd></div>
        <div><dt>영업시간</dt><dd>{confirmedText(ko.openingHours, '영업시간 미확인')}</dd></div>
        <div><dt>휴무일</dt><dd>{confirmedText(facility.closedDays.ko, '휴무일 미확인')}</dd></div>
        <div><dt>예상 도보시간</dt><dd>{formatWalkingMinutes(facility.walkingMinutes)}</dd></div>
        <div><dt>이동 안내</dt><dd>{confirmedText(ko.directions, '이동 안내 미확인')}</dd></div>
        <div><dt>참고 사항</dt><dd>{confirmedText(ko.notes, '등록된 참고 사항 없음')}</dd></div>
      </dl>
      <NaverDirectionsLink url={facility.naverMapUrl} label="네이버 지도 길찾기" unavailable="길찾기 링크 미등록" newTabNotice="네이버 지도가 새 탭에서 열립니다." />
      <p className="field-hint">네이버 지도에서 길찾기를 연 뒤 인쇄 기능을 이용할 수 있습니다.</p>
      <section className="english-directions" aria-labelledby="english-directions-title"><h4 id="english-directions-title" lang="en">Directions in English</h4><p lang={en.directions.trim() ? 'en' : 'ko'}>{confirmedText(en.directions, '영어 이동 안내 미확인')}</p></section>
      <p className="verification-date">{formatVerificationDate(facility.lastVerifiedAt)}</p>
      <p className="field-hint">확인일은 현재 영업 상태를 보장하지 않습니다. 방문 전 변동 사항을 확인해 주세요.</p>
      <EnglishGuidePanel key={facility.id} phrases={facility.englishPhrases} />
    </div>
  )
}
