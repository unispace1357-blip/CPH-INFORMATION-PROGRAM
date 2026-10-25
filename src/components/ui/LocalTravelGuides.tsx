import { useState } from 'react'
import type { GuideLanguage } from '../../types/guide'
import { AIRPORT_6777_STAFF_ENGLISH, AIRPORT_LIMOUSINE_6777, LOCAL_GUIDE_COPY } from '../../data/localGuide'
import { copyText } from '../../services/clipboard'
import { InformationNotice } from './InformationNotice'
import { TourismSchematicMap } from './TourismSchematicMap'
import { Button } from './Button'

/** From the hotel's paper guide; never presents scheduled departures as live arrival times. */
export function AirportBusGuide({ language, staff = false }: { language: GuideLanguage; staff?: boolean }) {
  const copy = LOCAL_GUIDE_COPY[language]
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle')

  async function copyEnglish() {
    const result = await copyText(AIRPORT_6777_STAFF_ENGLISH)
    setCopyStatus(result === 'success' ? 'success' : 'error')
  }

  return <section className="panel local-guide airport-bus-guide" aria-labelledby={staff ? 'staff-airport-bus-title' : 'guest-airport-bus-title'}>
    <h3 id={staff ? 'staff-airport-bus-title' : 'guest-airport-bus-title'}>{copy.airportTitle}</h3>
    <dl className="local-guide-facts">
      <div><dt>{copy.routeLabel}</dt><dd>{copy.routeDescription}</dd></div>
      <div><dt>{copy.boardingLabel}</dt><dd>{copy.boarding}</dd></div>
      <div><dt>{copy.fareLabel}</dt><dd>{language === 'en' ? `KRW ${AIRPORT_LIMOUSINE_6777.adultFareKrw.toLocaleString('ko-KR')}` : `${AIRPORT_LIMOUSINE_6777.adultFareKrw.toLocaleString('ko-KR')}${language === 'ko' ? '원' : language === 'ja' ? 'ウォン' : '韩元'}`}</dd></div>
    </dl>
    <p className="local-guide-subtitle">{copy.departuresLabel}</p>
    <ol className="local-guide-departures" aria-label={copy.departuresLabel}>
      {AIRPORT_LIMOUSINE_6777.departures.map(time => <li key={time}><time dateTime={time}>{time}</time></li>)}
    </ol>
    <p className="field-hint"><strong>{copy.departurePlaceLabel}:</strong> {copy.departurePlace}</p>
    <InformationNotice title={copy.disclaimerTitle} tone="warning">{copy.disclaimer}</InformationNotice>
    <p className="field-hint">{copy.fareNote}</p>
    {staff && <div className="local-guide-staff-copy">
      <p className="local-guide-subtitle">{LOCAL_GUIDE_COPY.ko.staffEnglishLabel}</p>
      <p lang="en">{AIRPORT_6777_STAFF_ENGLISH}</p>
      <Button variant="secondary" onClick={() => void copyEnglish()}>{copyStatus === 'success' ? LOCAL_GUIDE_COPY.ko.copiedLabel : LOCAL_GUIDE_COPY.ko.copyLabel}</Button>
      {copyStatus === 'error' && <p role="alert">{LOCAL_GUIDE_COPY.ko.copyFailedLabel}</p>}
    </div>}
  </section>
}

/** Historical tourist brochure as a list of places, NOT a live operator map or coupon catalog. */
export function SongdoTourismGuide({ language }: { language: GuideLanguage }) {
  const copy = LOCAL_GUIDE_COPY[language]
  return <section className="panel local-guide tourism-guide" aria-labelledby="songdo-tourism-title">
    <h3 id="songdo-tourism-title">{copy.tourismTitle}</h3>
    <p>{copy.tourismIntro}</p>
    <TourismSchematicMap language={language} />
    <InformationNotice title={copy.disclaimerTitle} tone="warning">{copy.tourismCaution}</InformationNotice>
  </section>
}
