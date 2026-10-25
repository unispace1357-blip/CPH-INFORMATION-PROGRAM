import type { GuideLanguage } from '../../types/guide.ts'
import type { TimespaceTenant } from '../../services/timespaceDirectory.ts'
import { timespaceCategoryLabel, timespaceLocation } from '../../services/timespaceDirectory.ts'
import { findTimespaceTenantCandidates } from '../../services/timespaceTenantNavigation.ts'

const LABELS: Record<GuideLanguage, { title:string; hint:string; select:string }> = {
  ko:{title:'타임스페이스 입점 매장',hint:'원하는 매장을 선택하면 위치와 메뉴를 바로 안내합니다.',select:'이 매장 보기'},
  en:{title:'Restaurants at Songdo Timespace',hint:'Select a restaurant to see its location and menu.',select:'View restaurant'},
  'zh-CN':{title:'松岛 Timespace 入驻餐厅',hint:'请选择餐厅，查看位置及菜品。',select:'查看餐厅'},
  ja:{title:'松島タイムスペースの飲食店',hint:'店舗を選ぶと場所とメニューが表示されます。',select:'店舗を見る'},
}

export function TimespaceTenantCandidates({ query, language, onSelect }: {
  query: string
  language: GuideLanguage
  onSelect: (tenant: TimespaceTenant) => void
}) {
  const candidates = findTimespaceTenantCandidates(query)
  if (!candidates.length) return null
  const labels = LABELS[language]
  return <section className="timespace-suggestions" aria-label={labels.title}>
    <div className="timespace-suggestions-header">
      <h3>{labels.title}</h3>
      <span>{candidates.length}</span>
    </div>
    <p>{labels.hint}</p>
    <ul className="timespace-suggestion-list">
      {candidates.map(tenant => <li key={tenant.id}>
        <button type="button" className="timespace-suggestion-button"
          onClick={() => onSelect(tenant)} data-tenant-id={tenant.id}
          aria-label={tenant.name + ' · ' + labels.select}>
          <strong>{tenant.name}</strong>
          <span>{timespaceCategoryLabel(tenant.category,language)} · {timespaceLocation(tenant,language)}</span>
          <small>{tenant.menu[language]}</small>
        </button>
      </li>)}
    </ul>
  </section>
}
