import { useState } from 'react'
import type { GuideLanguage } from '../../types/guide.ts'
import {
  TIMESPACE_CATEGORY_ORDER,
  TIMESPACE_DIRECTORY_UI,
  TIMESPACE_TENANTS,
  timespaceCategoryLabel,
  timespaceLocation,
  timespaceTenantsByCategory,
} from '../../services/timespaceDirectory.ts'
import type { TimespaceCategoryFilter } from '../../services/timespaceDirectory.ts'

/** Nested directory only; restaurants do not become duplicate top-level facilities. */
export function TimespaceDiningDirectory({ language, staff = false }: { language: GuideLanguage; staff?: boolean }) {
  const [category, setCategory] = useState<TimespaceCategoryFilter>('all')
  const copy = TIMESPACE_DIRECTORY_UI[language]
  const filtered = timespaceTenantsByCategory(category)
  return <section className={`timespace-directory ${staff ? 'timespace-directory--staff' : ''}`} aria-label={copy.heading}>
    <div className="timespace-directory-heading">
      <div>
        <h3>{copy.heading}</h3>
        <p>{copy.intro}</p>
      </div>
      <span className="timespace-directory-count">{filtered.length}/{TIMESPACE_TENANTS.length}</span>
    </div>
    <div className="timespace-category-filters" role="group" aria-label={copy.intro}>
      {TIMESPACE_CATEGORY_ORDER.map(code => {
        const count = timespaceTenantsByCategory(code).length
        return <button type="button" key={code} className="timespace-category-filter"
          aria-pressed={category === code} onClick={() => setCategory(code)}>
          {timespaceCategoryLabel(code, language)} <span>{count}</span>
        </button>
      })}
    </div>
    <ul className="timespace-tenant-grid" aria-live="polite">
      {filtered.map(tenant => <li key={tenant.id} className="timespace-tenant-card">
        <div className="timespace-tenant-top">
          <strong>{tenant.name}</strong>
          <span className="timespace-tenant-category">{timespaceCategoryLabel(tenant.category, language)}</span>
        </div>
        <p className="timespace-tenant-menu"><span>{copy.menuLabel}</span>{tenant.menu[language]}</p>
        <p className="timespace-tenant-location"><span>{copy.locationLabel}</span><strong>{timespaceLocation(tenant, language)}</strong></p>
      </li>)}
    </ul>
    <p className="timespace-directory-note">{copy.note}</p>
  </section>
}
