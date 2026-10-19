import { useState } from 'react'
import type { GuideLanguage } from '../../types/guide'
import { SONGDO_TOURISM_SPOTS } from '../../data/localGuide'
import rawFacilities from '../../data/facilities.json'
import { HOTEL_MAP_POINT, SONGDO_MAP_POINTS, TOURISM_MAP_UI, approximateMapPosition } from '../../data/tourismMap'

/** Custom SVG illustration + geographic reference markers; no copied map imagery, tiles or router. */
export function TourismSchematicMap({ language }: { language: GuideLanguage }) {
  const [selectedId, setSelectedId] = useState('central-park')
  const ui = TOURISM_MAP_UI[language]
  const selected = SONGDO_MAP_POINTS.find(point => point.id === selectedId) ?? SONGDO_MAP_POINTS[0]!
  const selectedName = SONGDO_TOURISM_SPOTS.find(spot => spot.id === selected.id)?.name[language] ?? selected.id
  const linkedFacility = selected.linkedFacilityId
    ? rawFacilities.facilities.find(facility => facility.id === selected.linkedFacilityId)
    : undefined
  const verifiedRoute = linkedFacility?.naverMapUrl || null
  const selectedUrl = verifiedRoute || `https://map.naver.com/p/search/${encodeURIComponent(selected.naverSearch)}`
  const hotelPosition = approximateMapPosition(HOTEL_MAP_POINT.lat, HOTEL_MAP_POINT.lon)
  // Slight offset only for the hotel drawing, to keep its marker clear of Hanok Village.
  const hotelMarkerPosition = { x: hotelPosition.x - 2, y: hotelPosition.y + 5 }

  return <div className="tourism-map" data-map-kind="original-schematic">
    <h4 className="tourism-map-title">{ui.diagramTitle}</h4>
    <p className="tourism-map-subtitle">{ui.diagramSubtitle}</p>
    <div className="tourism-map-drawing" role="group" aria-label={ui.diagramTitle}>
      <svg className="tourism-map-art" viewBox="0 0 900 540" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="tourism-land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f7faf7"/><stop offset="1" stopColor="#e8f2f1"/></linearGradient>
        </defs>
        <rect x="0" y="0" width="900" height="540" fill="url(#tourism-land)"/>
        <path d="M18 165 C135 104, 178 156, 269 122 S422 150, 520 112 S730 142, 875 66" fill="none" stroke="#c5e8c7" strokeWidth="92" opacity=".68"/>
        <path d="M14 170 C140 111, 181 160, 275 132 S425 158, 526 122 S733 153, 875 76" fill="none" stroke="#93d5e5" strokeWidth="35" strokeLinecap="round" opacity=".85"/>
        <path d="M70 334 Q230 270 380 325 T765 303" fill="none" stroke="#ffffff" strokeWidth="16" opacity=".63"/>
        <path d="M122 440 C284 377 490 447 810 389" fill="none" stroke="#ffffff" strokeWidth="12" opacity=".52"/>
        <path d="M584 70 C623 175 644 232 650 500" fill="none" stroke="#ffffff" strokeWidth="12" opacity=".55"/>
        <path d="M288 65 L468 520" fill="none" stroke="#ffffff" strokeWidth="12" opacity=".42"/>
        <ellipse cx="746" cy="325" rx="114" ry="68" fill="#b7dfbc" opacity=".46"/>
        <ellipse cx="690" cy="462" rx="102" ry="64" fill="#b7dfbc" opacity=".5"/>
        <circle cx="785" cy="105" r="3" fill="#83a9a0"/><circle cx="799" cy="107" r="3" fill="#83a9a0"/>
      </svg>
      <span className="tourism-map-north" aria-hidden="true">↑ {ui.north}</span>
      <span className="tourism-map-hotel" style={{ left: `${hotelMarkerPosition.x}%`, top: `${hotelMarkerPosition.y}%` }} title={ui.hotelLabel} aria-label={ui.hotelLabel}>H</span>
      {SONGDO_MAP_POINTS.map((point, index) => {
        const position = approximateMapPosition(point.lat, point.lon)
        const name = SONGDO_TOURISM_SPOTS.find(spot => spot.id === point.id)?.name[language] ?? point.id
        return <button
          key={point.id}
          type="button"
          className={`tourism-map-pin ${selectedId === point.id ? 'is-selected' : ''}`}
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
          title={name}
          aria-label={`${index + 1}. ${name}`}
          aria-pressed={selectedId === point.id}
          onClick={() => setSelectedId(point.id)}
        >{index + 1}</button>
      })}
    </div>
    <div className="tourism-map-legend"><span className="tourism-map-legend-hotel">H</span>{ui.hotelLabel}</div>
    <h5 className="tourism-map-places-heading">{ui.placesTitle}</h5>
    <div className="tourism-map-place-list" role="group" aria-label={ui.placesTitle}>
      {SONGDO_MAP_POINTS.map((point, index) => {
        const name = SONGDO_TOURISM_SPOTS.find(spot => spot.id === point.id)?.name[language] ?? point.id
        return <button className={`tourism-map-location ${selectedId === point.id ? 'is-selected' : ''}`} type="button" key={point.id} aria-pressed={selectedId === point.id} onClick={() => setSelectedId(point.id)}>
          <span className="tourism-map-number">{index + 1}</span>{name}
        </button>
      })}
    </div>
    <div className="tourism-map-detail" role="region" aria-live="polite" aria-label={ui.selectedLabel}>
      <p className="tourism-map-selected-kicker">{ui.selectedLabel}</p>
      <h5>{selectedName}</h5>
      <p>{selected.detail[language]}</p>
      <a className="tourism-map-external-link" href={selectedUrl} target="_blank" rel="noopener noreferrer">
        {verifiedRoute ? ui.directionsLink : ui.searchLink} <span aria-hidden="true">↗</span>
      </a>
    </div>
    <p className="tourism-map-footnote">{ui.uncertainty}</p>
    <p className="tourism-map-credit">{ui.mapCredit}</p>
  </div>
}
