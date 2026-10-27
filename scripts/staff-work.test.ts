import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { OPERATION_ARTICLES, OPERATION_CATEGORIES, searchOperations } from '../src/data/staffOperations.ts'

test('staff-only operations menu retains all original staff navigation', async () => {
  const staff = await readFile(new URL('../src/pages/staff/StaffPage.tsx', import.meta.url), 'utf8')
  const panel = await readFile(new URL('../src/components/staff/StaffWorkPanel.tsx', import.meta.url), 'utf8')
  const guest = await readFile(new URL('../src/pages/guest/GuestPage.tsx', import.meta.url), 'utf8')
  assert.match(staff, /const \[showWork, setShowWork\] = useState\(false\)/)
  assert.match(staff, /aria-pressed=\{showWork\}/)
  assert.match(staff, /업무용<\/button>/)
  assert.match(staff, /showWork \? <StaffWorkPanel \/> : <>/)
  assert.match(staff, /function navigateStaffTab\(target: StaffTab\) \{\s*setShowWork\(false\)/)
  assert.match(staff, /staff-rail-search[^\n]*onClick=\{focusSidebarSearch\}/)
  assert.match(panel, /OPERATION_ARTICLES/)
  assert.match(panel, /staff-work-query/)
  assert.match(panel, /업무용 매뉴얼/)
  assert.doesNotMatch(guest, /StaffWorkPanel|showWork/)
})

test('the seven operational categories contain all supplied manuals', () => {
  assert.equal(OPERATION_CATEGORIES.length, 7)
  assert.equal(new Set(OPERATION_ARTICLES.map(x => x.id)).size, OPERATION_ARTICLES.length)
  assert.ok(OPERATION_ARTICLES.length >= 38)
  for (const category of OPERATION_CATEGORIES) {
    assert.ok(OPERATION_ARTICLES.some(x => x.category === category.id), category.id)
  }
  for (const article of OPERATION_ARTICLES) {
    assert.ok(article.steps.length > 0, article.id)
    assert.ok(article.title && article.keywords.length > 0)
  }
})

test('direct corrections replace old smart TV locations and 200,000-won pet deposit', () => {
  const tv = OPERATION_ARTICLES.find(x => x.id === 'smart-tv-pricing')!
  assert.equal(tv.source, '최신 정정')
  const text = tv.steps.join(' ')
  for (const expected of ['DBP','11~14층','10,000원','15층','20,000원','DTW','14~15층','SDL','DBC','스마트 TV 없음']) {
    assert.ok(text.includes(expected), expected)
  }
  const pet = OPERATION_ARTICLES.find(x => x.id === 'pet-fee')!
  assert.equal(pet.source, '최신 정정')
  assert.ok(pet.steps[0]?.includes('받지 않습니다'))
  assert.ok(searchOperations(OPERATION_ARTICLES,'20만원','pets').some(a => a.id === 'pet-fee'))
})

test('search handles spacing, aliases, full-width Unicode and category filters', () => {
  const wifi = searchOperations(OPERATION_ARTICLES,'Wi-Fi','facilities')
  assert.ok(wifi.some(item => item.id === 'wifi-router'))
  const smart = searchOperations(OPERATION_ARTICLES,'스마트TV','rooms')
  assert.ok(smart.some(item => item.id === 'smart-tv-pricing'))
  const fullwidth = searchOperations(OPERATION_ARTICLES,'ＤＢＰ','rooms')
  assert.ok(fullwidth.some(item => item.id === 'smart-tv-pricing'))
  assert.ok(searchOperations(OPERATION_ARTICLES,'5030','contacts').some(a => a.id === 'departments'))
  assert.equal(searchOperations(OPERATION_ARTICLES,'zzzz-no-such-manual','all').length, 0)
  assert.ok(searchOperations(OPERATION_ARTICLES,'','all').length === OPERATION_ARTICLES.length)
})

test('electrical interventions retain explicit safety ownership and source caveats', () => {
  for (const id of ['smoke-window','whirlpool-noise','door-lock','room-lights','skylight-lights']) {
    const item = OPERATION_ARTICLES.find(a => a.id === id)
    assert.ok(item?.caution && /시설|감전|차단기/.test(item.caution), id)
  }
  assert.ok(OPERATION_ARTICLES.find(a => a.id === 'voucher-steps')?.review)
})

test('employee-facing manual uses short task instructions, not image-source commentary', async () => {
  const panel = await readFile(new URL('../src/components/staff/StaffWorkPanel.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(panel, /자료 출처|사진 자료 기준|최신 정정사항|staff-work-source|staff-work-data-note|staff-work-review/)
  const editorial = /기재되어|기재됨|기록되어|사진 기준|사진 매뉴얼|기존 메모|원문 매뉴얼|최신 정정|사용자 전달 내용|제공된 인쇄 매뉴얼/
  for (const article of OPERATION_ARTICLES) {
    const visible = [article.title, article.summary ?? '', ...article.steps, ...(article.notes ?? []), article.caution ?? '', article.followUp ?? ''].join('\n')
    assert.doesNotMatch(visible, editorial, article.id)
  }
  const voucher = OPERATION_ARTICLES.find(article => article.id === 'voucher-steps')!
  assert.ok(voucher.notes?.some(note => note.includes('사용 제한일 확인')), 'keep actionable restrictions')
  assert.ok(!voucher.notes?.some(note => note.includes('기재')), 'remove meta commentary')
})
