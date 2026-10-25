import assert from 'node:assert/strict'
import test from 'node:test'
import raw from '../src/data/facilities.json' with { type:'json' }
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { searchFacilities } from '../src/services/facilitySearch.ts'
import { searchGuestFacilities } from '../src/services/guestFacilitySearch.ts'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { resolveExactTimespaceTenant } from '../src/services/timespaceTenantNavigation.ts'
import { TIMESPACE_TENANTS, timespaceTenantsByCategory } from '../src/services/timespaceDirectory.ts'

const facilities = parseFacilityDataset(raw).facilities

test('each Timespace tenant full registered name resolves uniquely', () => {
  for (const tenant of TIMESPACE_TENANTS) {
    assert.equal(resolveExactTimespaceTenant(tenant.name)?.id, tenant.id, tenant.name)
    assert.equal(resolveExactTimespaceTenant(` ${tenant.name} `)?.id, tenant.id, tenant.name + ' trimmed')
    assert.ok(timespaceTenantsByCategory(tenant.category).some(item => item.id === tenant.id))
  }
})

test('explicit short names and normalized spacing lead to the correct shop', () => {
  const cases: [string, string][] = [
    ['한마음정육식당', 'hanmaeum'],
    ['한마음정육식당 송도타임스페이스점', 'hanmaeum'],
    ['한 마음 정육 식당', 'hanmaeum'],
    ['도라보울', 'dora-bowl'],
    ['보니보니', 'boniboni'],
    ['투파인드피터', 'two-find-peter'],
    ['양목장1274', 'yangmokjang-1274'],
    ['슬로우캘리', 'slow-cali'],
    ['숯멍', 'sutmeong'],
  ]
  for (const [query, id] of cases) {
    assert.equal(resolveExactTimespaceTenant(query)?.id, id, query)
    for (const language of GUIDE_LANGUAGES) {
      const search = searchGuestFacilities(facilities, query, 'all', language)
      assert.ok(search.some(item => item.id === 'songdo-timespace-complex'), query + '/' + language)
    }
    assert.ok(searchFacilities(facilities, query).some(item => item.id === 'songdo-timespace-complex'), query)
  }
})

test('generic food terms, partial names, empty values and closed Obake do not trigger navigation', () => {
  for (const query of ['한마음', '고기', '고기구이', '파스타', '삼겹살', '타임스페이스', '송도', '도라', '오바케', 'Obake', '', '  ']) {
    assert.equal(resolveExactTimespaceTenant(query), null, query)
  }
  assert.ok(searchFacilities(facilities, '고기').length > 1, 'broad searches still show other facilities')
  assert.ok(!searchFacilities(facilities, '오바케').some(item => item.id === 'songdo-timespace-complex'))
})
