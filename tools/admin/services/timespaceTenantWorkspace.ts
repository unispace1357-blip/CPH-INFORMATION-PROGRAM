import raw from '../../../src/data/timespaceTenants.json' with { type: 'json' }
import { GUIDE_LANGUAGES } from '../../../src/types/guide.ts'
import { TIMESPACE_CATEGORY_ORDER } from '../../../src/services/timespaceDirectory.ts'
import type { TimespaceTenant } from '../../../src/services/timespaceDirectory.ts'

export type TimespaceTenantDataset = { complexId: string; researchedOn: string; address: string; tenants: TimespaceTenant[] }
export const INITIAL_TIMESPACE_TENANTS = validateTimespaceTenants(raw)

const categories = new Set<string>(TIMESPACE_CATEGORY_ORDER.filter(category => category !== 'all'))
const names = ['id', 'name', 'category', 'building', 'floor', 'rooms', 'menu'] as const

/** Runtime checks for manually imported JSON, not just compile-time TypeScript. */
export function validateTimespaceTenants(value: unknown): TimespaceTenantDataset {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('입점 업체 JSON 객체 형식이 아닙니다.')
  const data = value as Record<string, unknown>
  if (data.complexId !== 'songdo-timespace-complex' || typeof data.address !== 'string' || !data.address.trim()) {
    throw new Error('타임스페이스 시설 ID 또는 주소가 올바르지 않습니다.')
  }
  if (typeof data.researchedOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.researchedOn)) throw new Error('확인일 형식은 YYYY-MM-DD여야 합니다.')
  if (!Array.isArray(data.tenants) || data.tenants.length > 100) throw new Error('입점 업체 목록은 100곳 이하여야 합니다.')
  const seen = new Set<string>()
  const tenants = data.tenants.map((input, index) => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error(`${index + 1}번 매장 데이터가 올바르지 않습니다.`)
    const item = input as Record<string, unknown>
    if (Object.keys(item).some(k => !names.includes(k as typeof names[number]))) throw new Error(`${index + 1}번 매장에 지원하지 않는 항목이 있습니다.`)
    if (typeof item.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || item.id.length > 60 || seen.has(item.id)) throw new Error(`${index + 1}번 매장 ID 형식 또는 중복 오류`)
    seen.add(item.id)
    if (typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120) throw new Error(`${item.id}: 매장 이름을 확인하세요.`)
    if (typeof item.category !== 'string' || !categories.has(item.category)) throw new Error(`${item.id}: 음식 카테고리를 선택하세요.`)
    if (!['A', 'B', 'C', 'D'].includes(String(item.building))) throw new Error(`${item.id}: A~D동 중 선택하세요.`)
    if (!Number.isInteger(item.floor) || (item.floor as number) < 1 || (item.floor as number) > 60) throw new Error(`${item.id}: 층은 1~60의 정수여야 합니다.`)
    if (typeof item.rooms !== 'string' || !/^\d{1,4}(?:~\d{1,4})?$/.test(item.rooms)) throw new Error(`${item.id}: 호수는 205 또는 205~208 형식이어야 합니다.`)
    if (!item.menu || typeof item.menu !== 'object' || Array.isArray(item.menu)) throw new Error(`${item.id}: 4개 국어 메뉴가 필요합니다.`)
    for (const language of GUIDE_LANGUAGES) {
      const menu = (item.menu as Record<string,unknown>)[language]
      if (typeof menu !== 'string' || !menu.trim() || menu.length > 250) throw new Error(`${item.id}: ${language} 메뉴를 입력하세요.`)
    }
    return structuredClone(item) as unknown as TimespaceTenant
  })
  return { complexId:data.complexId, researchedOn:data.researchedOn, address:data.address as string, tenants }
}
export function tenantDraft(): TimespaceTenant {
  return { id:'', name:'', category:'korean', building:'A', floor:1, rooms:'101', menu:{ko:'',en:'','zh-CN':'',ja:''} }
}
export function saveTimespaceTenant(data: TimespaceTenantDataset, draft: TimespaceTenant, originalId: string | null): TimespaceTenantDataset {
  if (originalId !== null && draft.id !== originalId) throw new Error('기존 매장 ID는 변경할 수 없습니다.')
  if (originalId && !data.tenants.some(t => t.id === originalId)) throw new Error('수정할 매장을 찾지 못했습니다.')
  if (data.tenants.some(t => t.id === draft.id && t.id !== originalId)) throw new Error('동일한 매장 ID가 있습니다.')
  const tenants = originalId === null ? [...data.tenants,draft] : data.tenants.map(t=>t.id===originalId?draft:t)
  return validateTimespaceTenants({...data, tenants})
}
export function removeTimespaceTenant(data: TimespaceTenantDataset, id: string): TimespaceTenantDataset {
  return validateTimespaceTenants({...data,tenants:data.tenants.filter(t=>t.id!==id)})
}
export function exportTimespaceTenants(data: TimespaceTenantDataset): string {
  return JSON.stringify(validateTimespaceTenants(data),null,2)+'\n'
}
export function importTimespaceTenants(text: string): TimespaceTenantDataset {
  if (new TextEncoder().encode(text).byteLength > 2*1024*1024) throw new Error('JSON 파일은 2MB 이하여야 합니다.')
  let value:unknown
  try { value=JSON.parse(text) } catch { throw new Error('입점 업체 JSON 구문 오류') }
  return validateTimespaceTenants(value)
}
