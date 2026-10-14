import { PageHeader } from '../../components/ui/PageHeader'
import { SearchInput } from '../../components/ui/SearchInput'
import { CategoryCard } from '../../components/ui/CategoryCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { InformationNotice } from '../../components/ui/InformationNotice'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { UI_CATEGORIES } from '../../config/uiCategories'

export function StaffPage() {
  return (
    <div className="staff-page">
      <PageHeader eyebrow="FRONT DESK CONCIERGE" title="직원용 안내" description="호텔 및 주변 시설 안내를 한곳에서 확인하는 프론트 업무 공간입니다." />
      <InformationNotice title="개발용 화면 · 기능 준비 중">검색, 카테고리 필터, 상세 정보와 영어 문구 복사는 아직 사용할 수 없습니다. 실제 시설 정보는 표시하지 않습니다.</InformationNotice>
      <section className="panel search-panel" aria-labelledby="staff-search-title">
        <h2 id="staff-search-title">시설 찾기</h2>
        <SearchInput label="시설명 또는 키워드" placeholder="시설명 또는 키워드" value="" disabled hint="검색 기능은 개발 중입니다. 사우나, 카페, ATM 등의 키워드로 찾을 수 있도록 준비합니다." />
        <div className="section-heading"><h3>카테고리</h3><span className="status-label">필터 준비 중</span></div>
        <div className="staff-category-grid" role="group" aria-label="시설 카테고리 미리보기" aria-describedby="staff-category-hint">
          <CategoryCard label="전체" icon="grid" selected compact disabled aria-describedby="staff-category-hint" />
          {UI_CATEGORIES.map(category => <CategoryCard key={category.code} label={category.staffLabel} icon={category.icon} compact disabled aria-describedby="staff-category-hint" />)}
        </div>
        <p className="field-hint" id="staff-category-hint">카테고리 선택과 필터링은 아직 연결되지 않았습니다.</p>
      </section>
      <div className="staff-workspace">
        <section className="panel results-panel" aria-labelledby="staff-results-title">
          <div className="section-heading"><h2 id="staff-results-title">시설 검색 결과</h2><span className="status-label">준비 중</span></div>
          <EmptyState title="시설 검색 기능은 개발 중입니다" description="검색 기능이 준비되면 이 영역에서 시설 목록을 확인할 수 있습니다." icon="search" />
        </section>
        <section className="panel details-panel" aria-labelledby="staff-details-title">
          <div className="section-heading"><h2 id="staff-details-title">시설 상세 정보</h2><Icon name="info" size={20} /></div>
          <EmptyState title="시설 정보 연결 전" description="시설 선택 후 상세 안내를 표시할 영역입니다. 현재는 운영 정보를 제공하지 않습니다." icon="hotel" />
          <div className="english-guide" aria-labelledby="english-guide-title"><div className="section-heading"><h3 id="english-guide-title" lang="en">English Guide</h3><Button variant="secondary" disabled icon={<Icon name="copy" size={16} />}>복사 · 준비 중</Button></div><p className="phrase-placeholder">영어 응대 문구가 표시될 영역입니다.</p><p className="field-hint">영어 문구와 복사 기능은 아직 연결되지 않았습니다.</p></div>
        </section>
      </div>
    </div>
  )
}
