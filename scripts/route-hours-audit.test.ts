import assert from 'node:assert/strict'
import test from 'node:test'
import raw from '../src/data/facilities.json' with {type:'json'}
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { auditFacilityRoute, parseRegisteredRoute, specialRouteNotice } from '../src/services/routeAccuracy.ts'
import { HOURS_COPY, segmentOperatingHours } from '../src/services/operatingHoursPresentation.ts'

const facilities=parseFacilityDataset(raw).facilities

test('27 registered route endpoints use the hotel POI; nonwalking destinations have no invented walking minutes',()=>{
  assert.equal(facilities.length,27)
  const routes=facilities.map(auditFacilityRoute)
  assert.equal(routes.filter(r=>r.routeRegistered).length,27)
  assert.equal(routes.filter(r=>r.originMatches).length,27)
  assert.equal(routes.filter(r=>r.routeMode==='walk').length,25)
  assert.equal(routes.filter(r=>r.routeMode==='transit').length,2)
  for(const f of facilities){
    assert.equal(f.lastVerifiedAt,null,'verification date is not automatically fabricated for '+f.id)
    const route=parseRegisteredRoute(f.naverMapUrl)
    assert.ok(route?.destinationPoiId)
    if(route?.mode!=='walk')assert.equal(f.walkingMinutes,null)
  }
})

test('known destination differences are named explicitly in four languages',()=>{
  const special=[
    ['songdo-timespace-complex','스타벅스'],
    ['incheon-port-hangdong-7ga','연안여객터미널'],
    ['g-tower-ifez-observatory','33층'],
    ['songdo-central-park-water-taxi','웨스트보트하우스'],
  ] as const
  for(const [id,koWord] of special){
    assert.ok(specialRouteNotice(id,'ko')?.includes(koWord))
    for(const language of GUIDE_LANGUAGES)assert.ok((specialRouteNotice(id,language)??'').length>30,id+'/'+language)
  }
  assert.equal(specialRouteNotice('malt-house-incheon-songdo','ko'),null)
  assert.equal(parseRegisteredRoute('https://example.com'),null)
  assert.equal(parseRegisteredRoute(null),null)
  assert.equal(parseRegisteredRoute(''),null)
})

test('restaurant breaks, last orders and special hours are separated but never calculate open now',()=>{
  const malt=segmentOperatingHours('10:00~23:00(브레이크 타임 15~17시) 라스트 오더 22:00')
  assert.ok(malt.some(x=>x.kind==='schedule'&&x.text.includes('10:00')))
  assert.ok(malt.some(x=>x.kind==='break'&&x.text.includes('15~17')))
  assert.ok(malt.some(x=>x.kind==='lastOrder'&&x.text.includes('22:00')))
  const burger=segmentOperatingHours('11:00~21:30 (브레이크 타임 16:00~17:00, 라스트 오더 21:00)')
  assert.equal(burger.filter(x=>x.kind==='break').length,1)
  assert.equal(burger.filter(x=>x.kind==='lastOrder').length,1)
  const gtower=facilities.find(x=>x.id==='g-tower-ifez-observatory')!
  for(const language of GUIDE_LANGUAGES){
    const hours=segmentOperatingHours(gtower.translations[language].openingHours)
    assert.ok(hours.some(x=>x.kind==='lastEntry'),language)
    assert.ok(hours.some(x=>x.kind==='schedule'),language)
    assert.ok(HOURS_COPY[language].unverified)
    assert.ok(HOURS_COPY[language].unverified.length>15)
    assert.ok(gtower.translations[language].notes.length>20)
  }
  assert.deepEqual(segmentOperatingHours(''),[])
  assert.equal(segmentOperatingHours('24시간')[0]?.kind,'schedule')
  assert.equal(segmentOperatingHours('매장별 운영시간·휴무일이 다릅니다.')[0]?.kind,'schedule')
})
