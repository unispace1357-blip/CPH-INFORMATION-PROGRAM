import type { GuideLanguage } from '../../types/guide.ts'
import { HOURS_COPY, segmentOperatingHours } from '../../services/operatingHoursPresentation.ts'

/** Separates recorded break/order notes without assuming realtime open status. */
export function OperatingHoursGuide({value,language='ko',closedDays=''}:{
  value:string;language?:GuideLanguage;closedDays?:string
}){
  const copy=HOURS_COPY[language]
  const sections=segmentOperatingHours(value)
  return <div className="operating-hours-guide" aria-label={copy.schedule}>
    <dl className="operating-hours-grid">
      {sections.length ? sections.map((part,index)=><div key={index} className={'operating-hours-row operating-hours-row--'+part.kind}>
        <dt>{copy[part.kind]}</dt><dd>{part.text}</dd>
      </div>) : <div className="operating-hours-row"><dt>{copy.schedule}</dt><dd>{copy.empty}</dd></div>}
      {closedDays.trim() && <div className="operating-hours-row operating-hours-row--closed"><dt>{language==='ko'?'휴무일':language==='en'?'Closed days':language==='zh-CN'?'休息日':'休業日'}</dt><dd>{closedDays}</dd></div>}
    </dl>
    <p className="operating-hours-disclaimer">{copy.unverified}</p>
  </div>
}
