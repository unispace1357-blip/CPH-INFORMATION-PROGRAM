import { TIMESPACE_TENANTS } from './timespaceDirectory.ts'
import type { TimespaceTenant } from './timespaceDirectory.ts'

/** Navigation is an explicit event, so searching for the same shop twice refocuses it. */
export type TenantFocusRequest = { tenantId: string; requestId: number } | null

/** These are names guests actually use, not loose cuisine/matching keywords. */
const TENANT_ALIASES: Readonly<Record<string, readonly string[]>> = {
  'dora-bowl': ['도라보울'],
  'oily': [],
  'lucas-pizza': ['루카스피자'],
  'guldari-chicken': ['굴다리 계고기', '굴다리계고기'],
  'boniboni': ['보니보니즉석떡볶이', '보니보니'],
  'hanmaeum': ['한마음정육식당'],
  'daepan-1985': [],
  'yangmokjang-1274': ['양목장1274'],
  'jou-gopdori': ['조우곱도리탕'],
  'two-find-peter': ['투파인드피터'],
  'sutmeong': ['숯멍'],
  'slow-cali': ['슬로우캘리'],
  'bondaega': ['본대가'],
  'samsan': ['삼산회관'],
  'donforest': ['돈포레스트'],
}

function exactNameKey(term: string): string {
  return term.normalize('NFKC').trim().toLocaleLowerCase().replace(/[\s·・.,()'’&/\-_]+/g, '')
}

/** Only navigate if a full registered tenant name or explicit alias identifies ONE shop. */
export function resolveExactTimespaceTenant(query: string): TimespaceTenant | null {
  const term = exactNameKey(query)
  if (!term || term.length < 2) return null
  const matches = TIMESPACE_TENANTS.filter(tenant =>
    [tenant.name, ...(TENANT_ALIASES[tenant.id] ?? [])].some(label => exactNameKey(label) === term))
  return matches.length === 1 ? matches[0]! : null
}

/** A matching tenant must still belong to a published Timespace facility; callers check that separately. */
export function isExactTimespaceTenantName(query: string): boolean {
  return resolveExactTimespaceTenant(query) !== null
}
