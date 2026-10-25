import assert from 'node:assert/strict'
import test from 'node:test'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { activeTimespaceTenants, TIMESPACE_TENANTS } from '../src/services/timespaceDirectory.ts'
import { resolveExactTimespaceTenant, findTimespaceTenantCandidates } from '../src/services/timespaceTenantNavigation.ts'
import {
  INITIAL_TIMESPACE_TENANTS, validateTimespaceTenants, tenantDraft, saveTimespaceTenant,
  setTimespaceTenantClosed, exportTimespaceTenants, importTimespaceTenants
} from '../tools/admin/services/timespaceTenantWorkspace.ts'

test('initial Timespace admin dataset is valid and retains 15 shops', () => {
  const data = validateTimespaceTenants(INITIAL_TIMESPACE_TENANTS)
  assert.equal(data.tenants.length, 15)
  assert.equal(data.tenants.find(t=>t.id === 'hanmaeum')?.rooms, '205~208')
  assert.equal(activeTimespaceTenants(data.tenants).length, 15)
})

test('new shop registration validates all four languages and never mutates input', () => {
  const original=structuredClone(INITIAL_TIMESPACE_TENANTS)
  const draft=tenantDraft()
  draft.id='test-restaurant';draft.name='QA 테스트 식당'
  draft.building='B';draft.floor=2;draft.rooms='205~208'
  for (const lng of GUIDE_LANGUAGES) draft.menu[lng]='Sample menu / 확인용'
  const next=saveTimespaceTenant(original,draft,null)
  assert.equal(next.tenants.length,16)
  assert.equal(next.tenants.find(t=>t.id==='test-restaurant')?.rooms,'205~208')
  assert.equal(original.tenants.length,15)
  assert.equal(importTimespaceTenants(exportTimespaceTenants(next)).tenants.length,16)
})

test('editing a shop preserves its ID; duplicate/new invalid entries are blocked', () => {
  const original=structuredClone(INITIAL_TIMESPACE_TENANTS)
  const item=structuredClone(original.tenants.find(t=>t.id==='hanmaeum')!)
  item.rooms='209~210'
  assert.equal(saveTimespaceTenant(original,item,'hanmaeum').tenants.find(t=>t.id==='hanmaeum')?.rooms,'209~210')
  assert.equal(original.tenants.find(t=>t.id==='hanmaeum')?.rooms,'205~208')
  assert.throws(()=>saveTimespaceTenant(original,{...item,id:'renamed'},'hanmaeum'))
  assert.throws(()=>saveTimespaceTenant(original,{...item,id:'oily'},null))
  assert.throws(()=>saveTimespaceTenant(original,{...item,rooms:'2층'},'hanmaeum'))
  assert.throws(()=>saveTimespaceTenant(original,{...item,category:'invalid' as typeof item.category},'hanmaeum'))
  assert.throws(()=>saveTimespaceTenant(original,{...item,menu:{...item.menu,en:''}},'hanmaeum'))
})

test('closed tenants are archived not deleted and excluded from public list', () => {
  const original=structuredClone(INITIAL_TIMESPACE_TENANTS)
  const closed=setTimespaceTenantClosed(original,'hanmaeum',true)
  assert.equal(closed.tenants.length,15)
  assert.equal(closed.tenants.find(t=>t.id==='hanmaeum')?.status,'closed')
  assert.equal(activeTimespaceTenants(closed.tenants).length,14)
  assert.equal(TIMESPACE_TENANTS.length,15,'source remains unchanged until manual deployment')
  assert.equal(original.tenants.find(t=>t.id==='hanmaeum')?.status,undefined)
  const reopened=setTimespaceTenantClosed(closed,'hanmaeum',false)
  assert.equal(activeTimespaceTenants(reopened.tenants).length,15)
  assert.equal(importTimespaceTenants(exportTimespaceTenants(closed)).tenants.find(t=>t.id==='hanmaeum')?.status,'closed')
})

test('untrusted imported files are rejected without changing the initial data', () => {
  const original=structuredClone(INITIAL_TIMESPACE_TENANTS)
  assert.throws(()=>importTimespaceTenants('not json'))
  assert.throws(()=>importTimespaceTenants('{}'))
  assert.throws(()=>validateTimespaceTenants({...original,tenants:[...original.tenants,original.tenants[0]]}))
  assert.throws(()=>validateTimespaceTenants({...original,tenants:[{...original.tenants[0],status:'unknown'},...original.tenants.slice(1)]}))
  assert.equal(INITIAL_TIMESPACE_TENANTS.tenants.length,15)
})

test('partial-name and food searches list candidates without guessing a single destination', () => {
  const name=findTimespaceTenantCandidates('한마음')
  assert.equal(name.length,1)
  assert.equal(name[0]?.id,'hanmaeum')
  assert.equal(resolveExactTimespaceTenant('한마음'),null)
  const food=findTimespaceTenantCandidates('삼겹살')
  assert.ok(food.length>=2)
  assert.ok(food.some(t=>t.id==='hanmaeum'))
  assert.ok(food.some(t=>t.id==='sutmeong'))
  assert.deepEqual(findTimespaceTenantCandidates('오바케'),[])
  assert.deepEqual(findTimespaceTenantCandidates('송도'),[])
  assert.equal(resolveExactTimespaceTenant('한마음정육식당')?.id,'hanmaeum')
})
