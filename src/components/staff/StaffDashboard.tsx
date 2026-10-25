import { useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '../ui/Icon'
import { frontdeskScriptDataset } from '../../data/frontdeskScriptDataset'
import { copyText } from '../../services/clipboard'

type SearchScope = 'hotel' | 'facilities'

const quickTerms: { term: string; scope: SearchScope }[] = [
  { term: '체크인', scope: 'hotel' },
  { term: '조식', scope: 'hotel' },
  { term: '주차', scope: 'hotel' },
  { term: 'Wi-Fi', scope: 'hotel' },
  { term: '타임스페이스', scope: 'facilities' },
  { term: '공항버스', scope: 'facilities' },
]

/** Functional landing search, with explicit scope to avoid inventing cross-dataset results. */
export function StaffSearchHub({ onSearch }: { onSearch: (term: string, scope: SearchScope) => void }) {
  const [scope, setScope] = useState<SearchScope>('hotel')
  const [term, setTerm] = useState('')

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (term.trim()) onSearch(term.trim(), scope)
  }

  return <section className="staff-search-hub" aria-labelledby="staff-dashboard-search-title">
    <div className="staff-hub-topline">
      <div>
        <h2 id="staff-dashboard-search-title">통합 검색</h2>
        <p className="staff-search-hub-description">호텔 정보와 주변 시설, 영어 응대 문구를 빠르게 검색하세요.</p>
      </div>
      <label className="staff-hub-scope-chooser" htmlFor="staff-hub-scope">
        <span>검색 범위</span>
        <select id="staff-hub-scope" value={scope} onChange={e => setScope(e.target.value as SearchScope)}>
          <option value="hotel">호텔 영어 응대</option><option value="facilities">주변 시설</option>
        </select>
      </label>
    </div>
    <form className="staff-search-hub-form" onSubmit={submit}>
      <label className="staff-search-hub-input-label" htmlFor="staff-hub-input"><Icon name="search" size={21} /><span className="visually-hidden">검색어 입력</span></label>
      <input id="staff-hub-input" type="search" value={term} onChange={e => setTerm(e.target.value)} placeholder="체크인, 조식, Wi-Fi, 타임스페이스 등 검색" autoComplete="off" />
      <button type="submit" className="button button--primary" disabled={!term.trim()} aria-label="검색">검색</button>
    </form>
    <div className="staff-search-suggestions" aria-label="자주 검색하는 항목">
      <span>주요 검색어</span>
      {quickTerms.map(t => <button key={t.scope + t.term} type="button" onClick={() => { setTerm(t.term); setScope(t.scope); onSearch(t.term, t.scope) }}>{t.term}</button>)}
    </div>
  </section>
}

const staffTopicTiles: { label: string; term: string; icon: 'bed' | 'hotel' | 'info' | 'parking' }[] = [
  { label: '객실 이용', term: 'Wi-Fi', icon: 'bed' },
  { label: '공용 비품', term: '전자레인지', icon: 'hotel' },
  { label: '반려동물', term: '반려동물', icon: 'info' },
  { label: '교통·주차', term: '주차', icon: 'parking' },
]

/** Compact topic shortcuts run real script searches; they are not dead presentation tiles. */
export function StaffTopicShortcuts({ onSearch }: { onSearch: (term: string, scope: SearchScope) => void }) {
  return <div className="staff-topic-shortcuts" role="group" aria-label="호텔 안내 바로가기">
    {staffTopicTiles.map(tile =>
      <button key={tile.label} type="button" onClick={() => onSearch(tile.term, 'hotel')}>
        <Icon name={tile.icon} size={21} /><span>{tile.label}</span>
      </button>)}
  </div>
}

const featureIds = ['check-in-time', 'breakfast-adult-price', 'room-wifi', 'check-out-time']

/** All displayed scripts come from the existing dataset, never sample screenshot copy. */
export function StaffQuickPhrases() {
  const [copyState, setCopyState] = useState<string | null>(null)
  const phrases = featureIds.map(id => frontdeskScriptDataset.scripts.find(s => s.id === id)).filter(s => s !== undefined)

  async function copy(id: string, phrase: string) {
    const result = await copyText(phrase)
    setCopyState(result === 'success' ? id : 'error')
  }

  return <section className="staff-quick-phrases" aria-labelledby="staff-quick-phrases-title">
    <div className="concierge-section-heading"><h2 id="staff-quick-phrases-title">자주 쓰는 영어 응대 문구</h2></div>
    <div className="staff-quick-phrases-list">
      {phrases.map(s => <article key={s.id} className="staff-quick-phrase">
        <div><h3>{s.title}</h3><p lang="en">{s.quickAnswer.en}</p><p className="staff-quick-phrase-ko" lang="ko">{s.quickAnswer.ko}</p></div>
        <button type="button" aria-label={`${s.title} 영어 문구 복사`} onClick={() => void copy(s.id, s.quickAnswer.en)}><Icon name="copy" size={20}/></button>
      </article>)}
    </div>
    <p className="staff-quick-copy-status" role="status" aria-live="polite">{copyState === 'error' ? '복사에 실패했습니다. 문구를 직접 선택해 복사해 주세요.' : copyState ? '영어 문장 복사 완료' : ''}</p>
  </section>
}

export function StaffRequestShortcut() {
  return <section className="staff-request-shortcut" aria-labelledby="staff-shortcut-request-title">
    <h2 id="staff-shortcut-request-title">직원 요청사항</h2>
    <p>시설 정보 추가, 안내 문구 수정, 오류 및 기능 개선을 요청할 수 있습니다.</p>
    <button type="button" className="button button--secondary" onClick={() => document.querySelector<HTMLButtonElement>('.staff-request-trigger')?.click()}>요청사항 작성하기</button>
  </section>
}
