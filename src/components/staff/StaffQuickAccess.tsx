import type { Facility } from '../../types/facility.ts'
import { frontdeskScriptDataset } from '../../data/frontdeskScriptDataset.ts'
import { TIMESPACE_TENANTS } from '../../services/timespaceDirectory.ts'
import type { Shortcut, StaffShortcutsData } from '../../services/staffShortcuts.ts'
import { shortcutKey } from '../../services/staffShortcuts.ts'
import { Icon } from '../ui/Icon.tsx'

export function labelForShortcut(item: Shortcut, facilities: readonly Facility[]): string | null {
  if(item.kind==='facility') return facilities.find(x=>x.id===item.id && x.isPublished)?.translations.ko.name ?? null
  if(item.kind==='tenant') return TIMESPACE_TENANTS.find(x=>x.id===item.id)?.name ?? null
  return frontdeskScriptDataset.scripts.find(x=>x.id===item.id)?.title ?? null
}
export function StaffQuickAccess({data,facilities,onOpen,onClear,storageAvailable}:{
  data:StaffShortcutsData
  facilities:readonly Facility[]
  onOpen:(item:Shortcut)=>void
  onClear:()=>void
  storageAvailable:boolean
}) {
  const renderItems=(items:Shortcut[],kind:'favorites'|'recent')=>{
    const available=items.map(item=>({item,label:labelForShortcut(item,facilities)})).filter((row):row is {item:Shortcut,label:string}=>!!row.label)
    return available.length ? <ul className="staff-shortcut-list">{available.map(({item,label})=>
      <li key={shortcutKey(item)}><button type="button" onClick={()=>onOpen(item)}
        data-shortcut={shortcutKey(item)} aria-label={(kind==='favorites'?'즐겨찾기':'최근 검색')+' '+label}>
          <Icon name={item.kind==='script'?'copy':'search'} size={15}/>
          <span>{label}</span>
          <small>{item.kind==='script'?'호텔 안내':item.kind==='tenant'?'입점 음식점':'주변 시설'}</small>
      </button></li>)}</ul> : <p className="staff-shortcut-empty">{kind==='favorites'?'시설이나 응대 문구 상세에서 ☆ 즐겨찾기를 누르세요.':'검색 결과를 열면 최근 항목에 나타납니다.'}</p>
  }
  return <section className="staff-quick-access panel" aria-label="즐겨찾기 및 최근 검색">
    <div className="staff-quick-access-heading">
      <div><h2>빠른 안내</h2><p>이 PC에서만 저장 · 이름이나 시설 ID 외의 검색어는 저장하지 않음</p></div>
      <button type="button" className="button button--quiet staff-shortcut-clear"
        disabled={!data.favorites.length && !data.recent.length} onClick={onClear}>전체 초기화</button>
    </div>
    {!storageAvailable && <p role="status" className="field-hint">이 브라우저에서는 저장이 제한됩니다. 새로고침 후 초기화될 수 있습니다.</p>}
    <div className="staff-quick-access-grid">
      <div><h3>즐겨찾기 <span>{data.favorites.length}/6</span></h3>{renderItems(data.favorites,'favorites')}</div>
      <div><h3>최근 검색·열람 <span>{data.recent.length}/5</span></h3>{renderItems(data.recent,'recent')}</div>
    </div>
  </section>
}
