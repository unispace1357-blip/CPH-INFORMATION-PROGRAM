/** Compact staff-PC shortcut metadata. Never store guest names or free-text searches. */
export type ShortcutKind = 'facility' | 'script' | 'tenant'
export type Shortcut = { kind: ShortcutKind; id: string }
export type StaffShortcutsData = { favorites: Shortcut[]; recent: Shortcut[] }
export const STAFF_SHORTCUTS_KEY = 'cph:staff:shortcuts:v1'
export const MAX_FAVORITES = 6
export const MAX_RECENT = 5
const allowedKinds = new Set<ShortcutKind>(['facility','script','tenant'])
const empty = (): StaffShortcutsData => ({ favorites: [], recent: [] })
export function shortcutKey(item: Shortcut): string { return item.kind + ':' + item.id }
function isShortcut(value: unknown): value is Shortcut {
  if (!value || typeof value !== 'object') return false
  const x = value as Partial<Shortcut>
  return !!x.kind && allowedKinds.has(x.kind) && typeof x.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.id) && x.id.length <= 85
}
function clean(values: unknown, limit: number): Shortcut[] {
  if (!Array.isArray(values)) return []
  const seen = new Set<string>()
  return values.filter((value): value is Shortcut => {
    if (!isShortcut(value)) return false
    const key = shortcutKey(value)
    if (seen.has(key)) return false
    seen.add(key); return true
  }).slice(0,limit).map(value=>({kind:value.kind,id:value.id}))
}
export function parseStaffShortcuts(value: unknown): StaffShortcutsData {
  if (!value || typeof value !== 'object') return empty()
  const obj = value as Partial<StaffShortcutsData>
  return {favorites:clean(obj.favorites,MAX_FAVORITES),recent:clean(obj.recent,MAX_RECENT)}
}
export function readStaffShortcuts(storage?: Pick<Storage,'getItem'>): StaffShortcutsData {
  try {
    const source = storage ?? (typeof window === 'undefined' ? undefined : window.localStorage)
    const str = source?.getItem(STAFF_SHORTCUTS_KEY)
    return str ? parseStaffShortcuts(JSON.parse(str)) : empty()
  } catch { return empty() }
}
export function writeStaffShortcuts(value: StaffShortcutsData, storage?: Pick<Storage,'setItem'>): boolean {
  try {
    const target = storage ?? (typeof window === 'undefined' ? undefined : window.localStorage)
    if (!target) return false
    target.setItem(STAFF_SHORTCUTS_KEY,JSON.stringify(parseStaffShortcuts(value)))
    return true
  } catch { return false }
}
export function isFavorite(value: StaffShortcutsData, item: Shortcut): boolean {
  return value.favorites.some(x=>shortcutKey(x)===shortcutKey(item))
}
export function toggleFavorite(value: StaffShortcutsData, item: Shortcut): StaffShortcutsData {
  if (!isShortcut(item)) return value
  if (isFavorite(value,item)) return {...value,favorites:value.favorites.filter(x=>shortcutKey(x)!==shortcutKey(item))}
  if (value.favorites.length >= MAX_FAVORITES) return value
  return {...value,favorites:[item,...value.favorites]}
}
export function recordRecent(value: StaffShortcutsData, item: Shortcut): StaffShortcutsData {
  if (!isShortcut(item)) return value
  return {...value,recent:[item,...value.recent.filter(x=>shortcutKey(x)!==shortcutKey(item))].slice(0,MAX_RECENT)}
}
