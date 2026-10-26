import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('staff-only operations menu is visible and switches to a dedicated empty panel', async () => {
  const staff = await readFile(new URL('../src/pages/staff/StaffPage.tsx', import.meta.url), 'utf8')
  const panel = await readFile(new URL('../src/components/staff/StaffWorkPanel.tsx', import.meta.url), 'utf8')
  const guest = await readFile(new URL('../src/pages/guest/GuestPage.tsx', import.meta.url), 'utf8')
  assert.match(staff, /const \[showWork, setShowWork\] = useState\(false\)/)
  assert.match(staff, /aria-pressed=\{showWork\}/)
  assert.match(staff, /업무용<\/button>/)
  assert.match(staff, /showWork \? <StaffWorkPanel \/> : <>/)
  assert.match(staff, /function navigateStaffTab\(target: StaffTab\) \{\s*setShowWork\(false\)/)
  assert.match(staff, /staff-rail-search[^\n]*onClick=\{focusSidebarSearch\}/)
  assert.match(staff, /if \(showWork\) \{\s*setShowWork\(false\)\s*requestAnimationFrame\(focus\)/)
  assert.match(panel, /아직 등록된 업무 안내가 없습니다/)
  assert.doesNotMatch(panel, /시설 정비 방법|객실 배정시 주의사항/)
  assert.doesNotMatch(guest, /StaffWorkPanel|showWork/)
})
