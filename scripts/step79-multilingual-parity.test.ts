import assert from 'node:assert/strict'
import test from 'node:test'
import facilityRaw from '../src/data/facilities.json' with {type:'json'}
import hotelRaw from '../src/data/hotel.json' with {type:'json'}
import tenantRaw from '../src/data/timespaceTenants.json' with {type:'json'}
import scriptsRaw from '../src/data/frontdesk-scripts.json' with {type:'json'}
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { parseHotelDataset } from '../src/data/validateHotelDataset.ts'
import { parseFrontdeskScriptDataset } from '../src/data/validateFrontdeskScriptDataset.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { MESSAGES } from '../src/i18n/messages.ts'
import { specialRouteNotice } from '../src/services/routeAccuracy.ts'
import { HOURS_COPY, segmentOperatingHours } from '../src/services/operatingHoursPresentation.ts'
import { TIMESPACE_CATEGORY_ORDER, TIMESPACE_DIRECTORY_UI, timespaceCategoryLabel, timespaceLocation } from '../src/services/timespaceDirectory.ts'
import { TOURISM_MAP_UI, SONGDO_MAP_POINTS } from '../src/data/tourismMap.ts'
import { validateTimespaceTenants } from '../tools/admin/services/timespaceTenantWorkspace.ts'

const facilities=parseFacilityDataset(facilityRaw).facilities
const hotel=parseHotelDataset(hotelRaw)
const scripts=parseFrontdeskScriptDataset(scriptsRaw).scripts
const tenants=validateTimespaceTenants(tenantRaw).tenants
const digits=(s:string) => (s.match(/\d+/g)??[]).join('|')
const clocks=(s:string)=>[...s.matchAll(/(\d{1,2}):(\d{2})/g)].map(match=>String(Number(match[1]))+':'+match[2]).sort()

test('STEP 7: 27 facilities preserve floor/street/unit numbers across all four translations',()=>{
  assert.equal(facilities.length,27)
  for(const venue of facilities){
    const source=digits(venue.translations.ko.address)
    for(const language of GUIDE_LANGUAGES){
      assert.ok(venue.translations[language].name.trim(),venue.id+'/'+language+'/name')
      assert.ok(venue.translations[language].description.trim(),venue.id+'/'+language+'/description')
      assert.equal(digits(venue.translations[language].address),source,venue.id+'/'+language+'/address')
      assert.ok(venue.translations[language].openingHours.trim() || venue.id==='incheon-port-hangdong-7ga')
    }
  }
})

test('STEP 7: every facility hours string preserves all recorded clock values across languages',()=>{
  for(const venue of facilities){
    const source=clocks(venue.translations.ko.openingHours)
    for(const language of GUIDE_LANGUAGES)
      assert.deepEqual(clocks(venue.translations[language].openingHours),source,venue.id+'/'+language+'/hours')
  }
  const malt=facilities.find(x=>x.id==='malt-house-incheon-songdo')!
  assert.deepEqual(clocks(malt.translations.ko.openingHours),['10:00','15:00','17:00','22:00','23:00'])
  assert.ok(segmentOperatingHours(malt.translations.ko.openingHours).some(x=>x.kind==='break'&&x.text.includes('15:00')))
  const pharmacy=facilities.find(x=>x.id==='chaeum-pharmacy-songdo')!
  assert.deepEqual(clocks(pharmacy.translations.ko.openingHours),['13:00','14:00','14:00','19:30','9:00','9:00'])
})

test('STEP 7: immutable hotel policies retain money/time amounts in four localized versions',()=>{
  const requiredAmounts:Record<string,string[]> = {
    checkOut:['11,000'],
    breakfast:['35,000','19,000'],
    notes:['200,000','50,000','22,000'],
  }
  for(const language of GUIDE_LANGUAGES){
    const record=hotel.translations[language]
    for(const [key,values] of Object.entries(requiredAmounts)){
      const paragraph=record[key as keyof typeof record]
      for(const number of values)assert.ok(paragraph.includes(number),language+'/'+key+'/'+number)
    }
    assert.ok(record.roomUsage.includes('CPH_'),language+'/WiFi')
    assert.ok(record.notes.includes('200,000'),language+'/smoking fee')
    assert.ok(record.address.includes('193'),language+'/hotel address')
    assert.ok(record.breakfast.includes('35,000')&&record.breakfast.includes('19,000'))
  }
  assert.equal(hotel.checkInTime,'15:00')
  assert.equal(hotel.checkOutTime,'12:00')
  assert.equal(hotel.lastVerifiedAt,'2026-10-15')
})

test('STEP 7: 15 tenant menus have all four languages, identical coordinates and no archived Obake',()=>{
  assert.equal(tenants.length,15)
  for(const tenant of tenants){
    for(const language of GUIDE_LANGUAGES){
      assert.ok(tenant.menu[language].trim(),tenant.id+'/'+language)
      assert.ok(timespaceLocation(tenant,language).includes(String(tenant.floor)),tenant.id+'/'+language)
      assert.ok(timespaceLocation(tenant,language).includes(tenant.rooms),tenant.id+'/'+language)
    }
  }
  assert.ok(tenants.find(x=>x.id==='jou-gopdori')?.menu['zh-CN'].includes('牛肠鸡肉'))
  assert.ok(!JSON.stringify(tenants).includes('오바케'))
  assert.ok(tenants.find(x=>x.id==='hanmaeum')?.rooms==='205~208')
})

test('STEP 7: menu UI, tourism labels, caveats and routes exist in all four languages',()=>{
  const specialIds=['songdo-timespace-complex','incheon-port-hangdong-7ga','songdo-central-park-water-taxi','g-tower-ifez-observatory']
  for(const lang of GUIDE_LANGUAGES){
    const copy=TIMESPACE_DIRECTORY_UI[lang]
    for(const value of Object.values(copy))assert.ok(value.trim())
    for(const category of TIMESPACE_CATEGORY_ORDER)assert.ok(timespaceCategoryLabel(category,lang).trim())
    for(const value of Object.values(TOURISM_MAP_UI[lang]))assert.ok(value.trim())
    for(const place of SONGDO_MAP_POINTS)assert.ok(place.detail[lang].trim(),place.id+'/'+lang)
    for(const id of specialIds)assert.ok(specialRouteNotice(id,lang)?.trim(),id+'/'+lang)
    assert.ok(specialRouteNotice('songdo-timespace-complex',lang)?.includes('835'))
    assert.ok(HOURS_COPY[lang].unverified.trim())
    assert.deepEqual(Object.keys(MESSAGES[lang].ui),Object.keys(MESSAGES.en.ui))
  }
})

test('STEP 9: 33 hotel reply scripts are intentionally bilingual, not falsely marked four-language',()=>{
  assert.equal(scripts.length,33)
  for(const script of scripts){
    assert.ok(script.quickAnswer.ko?.trim(),script.id+'/ko')
    assert.ok(script.quickAnswer.en?.trim(),script.id+'/en')
    assert.ok(script.details.ko?.trim(),script.id+'/details/ko')
    assert.ok(script.details.en?.trim(),script.id+'/details/en')
    assert.equal(script.reviewStatus,'draft')
  }
  const smoking=scripts.find(x=>x.id==='indoor-smoking-policy')!
  for(const language of ['ko','en'] as const)assert.ok(smoking.details[language].includes('200,000'))
  const bus=scripts.find(x=>x.id==='airport-limousine-6777')!
  for(const language of ['ko','en'] as const){
    assert.ok(bus.quickAnswer[language].includes('6777'))
    assert.ok(bus.quickAnswer[language].includes('8,000'))
    assert.ok(bus.details[language].includes('05:27'))
  }
})

test('STEP 9: status is not upgraded to verified based only on translation checks',()=>{
  assert.equal(facilityRaw.dataStatus,'demo')
  assert.ok(facilities.every(x=>x.lastVerifiedAt===null))
  assert.ok(scripts.every(x=>x.reviewStatus==='draft'))
})
