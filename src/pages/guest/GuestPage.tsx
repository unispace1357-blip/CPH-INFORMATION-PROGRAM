import { PageHeader } from '../../components/ui/PageHeader'
import { SearchInput } from '../../components/ui/SearchInput'
import { CategoryCard } from '../../components/ui/CategoryCard'
import { LanguageSelector } from '../../components/ui/LanguageSelector'
import { EmptyState } from '../../components/ui/EmptyState'
import { InformationNotice } from '../../components/ui/InformationNotice'
import { UI_CATEGORIES } from '../../config/uiCategories'
import type { IconName } from '../../components/ui/Icon'

const hotelSections = [
  { label: 'Check-in', icon: 'checkIn' },
  { label: 'Check-out', icon: 'checkOut' },
  { label: 'Breakfast', icon: 'breakfast' },
  { label: 'Parking', icon: 'parking' },
  { label: 'Room information', icon: 'bed' },
] as const satisfies readonly { label: string; icon: IconName }[]

export function GuestPage() {
  return (
    <div className="guest-page">
      <LanguageSelector value="en" disabled />
      <PageHeader eyebrow="YOUR HOTEL & NEIGHBORHOOD GUIDE" title="Welcome to your stay." description="A simple place to find hotel information and explore nearby facilities." />
      <InformationNotice title="Development preview">Search, category browsing and language switching are not available yet. No operational information is displayed.</InformationNotice>
      <section className="guest-section" id="hotel-information" aria-labelledby="hotel-information-title">
        <div className="section-heading"><h2 id="hotel-information-title">Hotel information</h2><span className="status-label">Coming soon</span></div>
        <p className="section-description" id="hotel-category-hint">Essential information for your stay. These categories are not available yet.</p>
        <div className="guest-category-grid hotel-category-grid" role="group" aria-label="Hotel information preview">{hotelSections.map(section => <CategoryCard key={section.label} label={section.label} icon={section.icon} disabled aria-describedby="hotel-category-hint" />)}</div>
      </section>
      <section className="guest-section" id="nearby-facilities" aria-labelledby="nearby-facilities-title">
        <div className="section-heading"><h2 id="nearby-facilities-title">Around the hotel</h2><span className="status-label">Coming soon</span></div>
        <p className="section-description" id="nearby-category-hint">Browse by category once the guide is ready.</p>
        <div className="guest-category-grid" role="group" aria-label="Nearby facility categories preview">{UI_CATEGORIES.map(category => <CategoryCard key={category.code} label={category.guestLabel} icon={category.icon} disabled aria-describedby="nearby-category-hint" />)}</div>
      </section>
      <section className="panel guest-search-panel" id="guest-search" aria-labelledby="guest-search-title">
        <h2 id="guest-search-title">Find a facility</h2>
        <SearchInput label="Facility name or keyword" placeholder="Facility or keyword" value="" disabled hint="Search is not available in this development preview." />
        <EmptyState title="The facility guide is being prepared" description="Hotel and nearby facility information will appear here when it has been confirmed." icon="search" />
      </section>
    </div>
  )
}
