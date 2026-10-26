import type { GuideLanguage } from '../../types/guide.ts'

const TILE_COPY: Record<GuideLanguage, { hotel:string; hotelEn:string; nearby:string; nearbyEn:string; label:string }> = {
  ko: {hotel:'호텔 안내',hotelEn:'Hotel Information',nearby:'주변 시설',nearbyEn:'Nearby Places',label:'호텔과 주변 시설 바로가기'},
  en: {hotel:'Hotel Information',hotelEn:'Your Stay',nearby:'Nearby Places',nearbyEn:'Explore Songdo',label:'Browse hotel and nearby places'},
  'zh-CN': {hotel:'酒店指南',hotelEn:'Hotel Information',nearby:'周边设施',nearbyEn:'Nearby Places',label:'酒店及周边设施快捷导航'},
  ja: {hotel:'ホテル案内',hotelEn:'Hotel Information',nearby:'周辺施設',nearbyEn:'Nearby Places',label:'ホテルと周辺施設へのショートカット'},
}

/** Two working photographic entry points, using only images already shipped by the project. */
export function BoutiqueEditorialTiles({language,onHotelTopic}:{
  language:GuideLanguage
  onHotelTopic:()=>void
}){
  const copy=TILE_COPY[language]
  function openNearby(){
    const target=document.getElementById('nearby-facilities')
    target?.scrollIntoView({block:'start',behavior:'auto'})
    target?.querySelector<HTMLElement>('h2')?.setAttribute('tabindex','-1')
    target?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true})
  }
  return <section className="boutique-entry" aria-label={copy.label}>
    <button type="button" className="boutique-entry-card boutique-entry-card--hotel" onClick={onHotelTopic}>
      <img src={`${import.meta.env.BASE_URL}concierge/frontdesk-concept.webp`} alt="" loading="lazy" decoding="async" />
      <span className="boutique-entry-copy"><strong>{copy.hotel}</strong><small>{copy.hotelEn}</small></span>
      <span className="boutique-entry-arrow" aria-hidden="true">↗</span>
    </button>
    <button type="button" className="boutique-entry-card boutique-entry-card--nearby" onClick={openNearby}>
      <img src={`${import.meta.env.BASE_URL}tourism-photos/central-park.webp`} alt="" loading="lazy" decoding="async" />
      <span className="boutique-entry-copy"><strong>{copy.nearby}</strong><small>{copy.nearbyEn}</small></span>
      <span className="boutique-entry-arrow" aria-hidden="true">↗</span>
    </button>
  </section>
}
