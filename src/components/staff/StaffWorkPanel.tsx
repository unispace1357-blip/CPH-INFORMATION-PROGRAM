import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import {
  OPERATION_ARTICLES,
  OPERATION_CATEGORIES,
  searchOperations,
} from '../../data/staffOperations'
import type { OperationArticle, OperationCategory } from '../../data/staffOperations'

type Filter = OperationCategory | 'all'

function ArticleDetail({ article }: { article: OperationArticle }) {
  const category = OPERATION_CATEGORIES.find(item => item.id === article.category)
  return <article className="staff-work-detail" aria-labelledby="staff-work-detail-title">
    <div className="staff-work-detail-top">
      <span className="staff-work-eyebrow">{category?.label}</span>
      <span className="staff-work-source">{article.source}</span>
    </div>
    <h2 id="staff-work-detail-title">{article.title}</h2>
    {article.summary && <p className="staff-work-summary">{article.summary}</p>}
    {article.caution && <div className="staff-work-caution" role="note">
      <Icon name="info" size={19} />
      <p><strong>안전 주의</strong> {article.caution}</p>
    </div>}
    <h3>확인 및 처리 순서</h3>
    <ol className="staff-work-steps">
      {article.steps.map((step, index) => <li key={index}><span className="staff-work-step-number" aria-hidden="true">{index + 1}</span><p>{step}</p></li>)}
    </ol>
    {article.followUp && <section className="staff-work-followup" aria-labelledby="staff-work-followup-title">
      <h3 id="staff-work-followup-title">해결되지 않을 때</h3>
      <p>{article.followUp}</p>
    </section>}
    {!!article.notes?.length && <section className="staff-work-notes" aria-labelledby="staff-work-notes-title">
      <h3 id="staff-work-notes-title">참고사항</h3>
      <ul>{article.notes.map((note,index)=><li key={index}>{note}</li>)}</ul>
    </section>}
    {article.review && <p className="staff-work-review">사진 자료 기준 항목입니다. 요금·기간·객실 배정 기준은 안내 전 현재 운영 기준을 확인해 주세요.</p>}
    <p className="staff-work-data-note">내부 업무 참고용 · 자료 출처: {article.source === '사진 매뉴얼' ? '제공된 인쇄 매뉴얼' : article.source === '최신 정정' ? '직접 전달한 최신 정정사항 및 기존 자료' : '프론트 업무 메모'}</p>
  </article>
}

/** Searchable, read-only operations manual; never added to guest dataset or public search. */
export function StaffWorkPanel() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const results = useMemo(() => searchOperations(OPERATION_ARTICLES, query, category), [query, category])
  const selected = results.find(item => item.id === selectedId) ?? results[0] ?? null

  function selectArticle(id: string) {
    setSelectedId(id)
    if (window.matchMedia('(max-width: 850px)').matches) {
      requestAnimationFrame(() => document.getElementById('staff-work-detail-title')?.scrollIntoView({ block: 'start' }))
    }
  }

  return <section className="staff-work-panel" aria-labelledby="staff-work-title">
    <div className="staff-work-header">
      <div>
        <p className="staff-section-kicker">STAFF OPERATIONS · FRONT DESK</p>
        <h1 id="staff-work-title" tabIndex={-1}>업무용 매뉴얼</h1>
        <p>객실 문제 해결부터 객실 배정, 숙박권, 부가서비스까지 필요한 내용을 빠르게 찾아보세요.</p>
      </div>
      <span className="staff-work-total">{OPERATION_ARTICLES.length}개 업무 안내</span>
    </div>
    <div className="staff-work-search">
      <label htmlFor="staff-work-query"><Icon name="search" size={20}/> 업무 매뉴얼 검색</label>
      <input id="staff-work-query" type="search" autoComplete="off" placeholder="예: 와이파이, 배연창, DBP, 스마트 TV, 보증금, 5030" value={query} onChange={event => setQuery(event.target.value)} />
      {query && <button type="button" onClick={() => setQuery('')}>검색어 지우기</button>}
    </div>
    <div className="staff-work-category-list" role="group" aria-label="업무 분류">
      <button type="button" aria-pressed={category === 'all'} className={category === 'all' ? 'is-selected' : ''} onClick={() => { setCategory('all'); setSelectedId(null) }}>
        전체 <span>{OPERATION_ARTICLES.length}</span>
      </button>
      {OPERATION_CATEGORIES.map(item => <button key={item.id} type="button" aria-pressed={category === item.id}
        className={category === item.id ? 'is-selected' : ''} title={item.hint}
        onClick={() => { setCategory(item.id); setSelectedId(null) }}>
        {item.label} <span>{OPERATION_ARTICLES.filter(article => article.category === item.id).length}</span>
      </button>)}
    </div>
    <div className="staff-work-content">
      <section className="staff-work-results" aria-labelledby="staff-work-results-title">
        <div className="staff-work-list-header">
          <h2 id="staff-work-results-title">업무 목록</h2>
          <span role="status" aria-live="polite">검색 결과 {results.length}개</span>
        </div>
        {results.length ? <ul className="staff-work-list">
          {results.map(article => <li key={article.id}>
            <button type="button" aria-pressed={selected?.id === article.id} className={selected?.id === article.id ? 'is-selected' : ''}
              onClick={() => selectArticle(article.id)}>
              <span className="staff-work-list-category">{OPERATION_CATEGORIES.find(c => c.id === article.category)?.label}</span>
              <strong>{article.title}</strong>
              <span className="staff-work-list-action">내용 보기 <Icon name="arrow" size={15}/></span>
            </button>
          </li>)}
        </ul> : <p className="staff-work-empty-message">검색 결과가 없습니다. 다른 단어나 분류로 다시 검색해 보세요.</p>}
      </section>
      <div className="staff-work-detail-container">
        {selected ? <ArticleDetail key={selected.id} article={selected} /> :
          <p className="staff-work-empty-message">표시할 업무 안내가 없습니다.</p>}
      </div>
    </div>
  </section>
}
