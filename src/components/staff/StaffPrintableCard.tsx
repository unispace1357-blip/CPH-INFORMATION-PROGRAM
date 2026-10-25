import { useMemo } from 'react'
import type { Facility } from '../../types/facility.ts'
import { formatWalkingMinutes } from '../../services/facilityPresentation.ts'
import { guestFacilityPresentation } from '../../services/guestFacilityPresentation.ts'
import { makeRouteQr } from '../../services/routeQr.ts'

/** All QR bytes are generated on-device; no map screenshots or outside QR server. */
export function StaffPrintableCard({facility}:{facility:Facility}){
  const qr=useMemo(()=>makeRouteQr(facility.naverMapUrl),[facility.naverMapUrl])
  const ko=facility.translations.ko
  const content=guestFacilityPresentation(facility,'ko')
  const timespace=facility.id==='songdo-timespace-complex'
  return <section className="staff-printable-card" aria-label="고객에게 전달할 인쇄용 시설 안내">
    <div className="print-card-header">
      <span className="print-hotel-name">THE CENTRAL PARK HOTEL SONGDO</span>
      <span className="print-card-eyebrow">NEARBY PLACE GUIDE · 주변 시설 안내</span>
    </div>
    <h2>{ko.name}</h2>
    <p className="print-card-en" lang="en">{facility.translations.en.name}</p>
    <p className="print-card-description">{content.summary}</p>
    {content.menuExamples.length>0 && <div className="print-card-menu"><strong>음식·주요 메뉴</strong><p>{content.menuExamples.slice(0,8).join(' · ')}</p></div>}
    <dl className="print-card-facts">
      <div><dt>주소</dt><dd>{ko.address || '주소 확인 필요'}</dd></div>
      <div><dt>{timespace?'인근 기준점까지':'도보'}</dt><dd>{formatWalkingMinutes(facility.walkingMinutes,facility.walkingDistanceMeters)}</dd></div>
      <div><dt>영업시간</dt><dd>{ko.openingHours || '매장별 확인 필요'}</dd></div>
    </dl>
    <div className="print-card-route">
      {qr ? <>
        <svg className="print-card-qr" role="img" aria-label="네이버 지도 길찾기 QR 코드"
          xmlns="http://www.w3.org/2000/svg" viewBox={qr.viewBox} shapeRendering="crispEdges">
          <rect x="0" y="0" width="100%" height="100%" fill="#fff"/>
          <path d={qr.path} fill="#111"/>
        </svg>
        <div><strong>길찾기 QR</strong><p>휴대폰 카메라로 스캔해 네이버 지도 길찾기를 확인하세요.</p><small>출발: 송도센트럴파크호텔</small></div>
      </> : <div><strong>길찾기 QR 미등록</strong><p>확인된 지도 경로가 없습니다. 호텔 프론트에서 문의해 주세요.</p></div>}
    </div>
    {timespace && <p className="print-card-warning">주의: 안내된 도보 15분(835m)은 인근 스타벅스 송도캐슬파크점까지의 경로입니다. 타임스페이스로 추가 이동이 필요합니다.</p>}
    <p className="print-card-footer">방문 전 위치·운영시간·휴무 여부를 확인해 주세요. 본 안내는 변경될 수 있습니다.</p>
    <p className="print-card-demo">현장 안내 전 직원 확인 필수 · 테스트 정보</p>
  </section>
}
