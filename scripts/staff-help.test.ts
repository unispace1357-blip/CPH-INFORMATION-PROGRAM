import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('help center is staff-only, contains approved text and links to live UI', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const help = await readFile(new URL('../src/pages/staff/StaffHelpPage.tsx', import.meta.url), 'utf8')
  const staff = await readFile(new URL('../src/pages/staff/StaffPage.tsx', import.meta.url), 'utf8')
  const layout = await readFile(new URL('../src/components/layout/GuideLayout.tsx', import.meta.url), 'utf8')
  assert.ok(app.includes('path="help" element={<StaffHelpPage />} />'))
  assert.ok(!app.includes('path="guest/help"'))
  for (const phrase of ['직원용 가이드', '개발자용 가이드', '손님응대를 1분이라도 줄이면', '너무 많이는 하지 말아주세요']) {
    assert.ok(help.includes(phrase), phrase)
  }
  for (const destination of ['search','english','facilities','timespace','quick','print','request']) {
    assert.ok(help.includes('target="'+destination+'"'), destination)
  }
  assert.ok(staff.includes('handledHelpNavigation'))
  assert.ok(staff.includes("navigate('/staff/help')"))
  assert.ok(layout.includes('to="/staff/help"'))
})
