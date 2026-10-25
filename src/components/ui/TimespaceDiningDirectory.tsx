import { useEffect, useRef, useState } from 'react'
import type { GuideLanguage } from '../../types/guide.ts'
import type { TenantFocusRequest } from '../../services/timespaceTenantNavigation.ts'
import {
  TIMESPACE_CATEGORY_ORDER,
  TIMESPACE_DIRECTORY_UI,
  TIMESPACE_TENANTS,
  timespaceCategoryLabel,
  timespaceLocation,
  timespaceTenantsByCategory,
} from '../../services/timespaceDirectory.ts'
import type { TimespaceCategoryFilter } from '../../services/timespaceDirectory.ts'

const MATCHED_LABEL: Record<GuideLanguage, string> = {
  ko: '검색한 매장',
  en: 'Matching restaurant',
  'zh-CN': '搜索到的餐厅',
  ja: '検索した店舗',
}

/** Nested directory only; restaurants never become duplicate top-level facilities. */
export function TimespaceDiningDirectory({ language, staff = false, focusRequest = null }: {
  language: GuideLanguage
  staff?: boolean
  focusRequest?: TenantFocusRequest
}) {
  const [category, setCategory] = useState<TimespaceCategoryFilter>('all')
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const focusedCard = useRef<HTMLLIElement>(null)
  const copy = TIMESPACE_DIRECTORY_UI[language]
  const filtered = timespaceTenantsByCategory(category)
  const requestedId = focusRequest?.tenantId ?? null
  const requestedSequence = focusRequest?.requestId

  useEffect(() => {
    if (!requestedId) {
      setFocusedId(null)
      return
    }
    const tenant = TIMESPACE_TENANTS.find(item => item.id === requestedId)
    if (!tenant) { setFocusedId(null); return }
    setCategory(tenant.category)
    setFocusedId(tenant.id)
  }, [requestedId, requestedSequence])

  useEffect(() => {
    if (!focusedId || !focusRequest || focusRequest.tenantId !== focusedId) return
    const frame = requestAnimationFrame(() => {
      const card = focusedCard.current
      if (!card) return
      card.focus({ preventScroll: true })
      card.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' })
    })
    return () => cancelAnimationFrame(frame)
  }, [focusedId, requestedSequence, category])

  function chooseCategory(code: TimespaceCategoryFilter) {
    setCategory(code)
    setFocusedId(null)
  }

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
          aria-pressed={category === code} onClick={() => chooseCategory(code)}>
          {timespaceCategoryLabel(code, language)} <span>{count}</span>
        </button>
      })}
    </div>
    <ul className="timespace-tenant-grid" aria-live="polite">
      {filtered.map(tenant => <li key={tenant.id} ref={focusedId === tenant.id ? focusedCard : undefined}
        tabIndex={focusedId === tenant.id ? -1 : undefined}
        className={`timespace-tenant-card${focusedId === tenant.id ? ' is-search-match' : ''}`}
        data-tenant-id={tenant.id}
        aria-label={focusedId === tenant.id ? `${MATCHED_LABEL[language]}: ${tenant.name}` : undefined}>
        <div className="timespace-tenant-top">
          <strong>{tenant.name}</strong>
          {focusedId === tenant.id && <span className="timespace-match-label">{MATCHED_LABEL[language]}</span>}
          <span className="timespace-tenant-category">{timespaceCategoryLabel(tenant.category, language)}</span>
        </div>
        <p className="timespace-tenant-menu"><span>{copy.menuLabel}</span>{tenant.menu[language]}</p>
        <p className="timespace-tenant-location"><span>{copy.locationLabel}</span><strong>{timespaceLocation(tenant, language)}</strong></p>
      </li>)}
    </ul>
    <p className="timespace-directory-note">{copy.note}</p>
  </section>
}
