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
  assert.ok(tv.steps.some(step => step === 'DTW 14~15층: 1박·1객실당 10,000원 추가'))
  assert.equal(tv.notes?.length ?? 0, 0, 'no open DTW fee question should remain')
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

test('reference notes contain confirmed, actionable details instead of speculative caveats', () => {
  for (const article of OPERATION_ARTICLES) {
    for (const note of article.notes ?? []) {
      assert.doesNotMatch(note, /확인 필요|적용 단위|적용 방식 확인|객실별 확인|예외 호실|다를 수 있으니|기기별 확인/, article.id)
    }
  }
  for (const id of ['room-views', 'smart-tv-pricing', 'request-amenities', 'pet-fee']) {
    assert.equal(OPERATION_ARTICLES.find(article => article.id === id)?.notes?.length ?? 0, 0, id)
  }
  const pet = OPERATION_ARTICLES.find(article => article.id === 'pet-policy')!
  assert.ok(pet.notes?.some(note => note.includes('10kg')), 'keep actual pet occupancy limit')
  const voucher = OPERATION_ARTICLES.find(article => article.id === 'voucher-steps')!
  assert.ok(voucher.notes?.some(note => note.includes('사용 제한일')), 'keep voucher booking conditions')
})

test('staff action buttons and manual count badge have explicit contrast styles', async () => {
  const css = await readFile(new URL('../src/styles/staff-work.css', import.meta.url), 'utf8')
  assert.ok(css.includes('background:#d9e2d6;color:#243229'), 'readable count label')
  assert.ok(css.includes('.site-header .staff-header-actions .header-link,'), 'desktop header color override')
  assert.ok(css.includes('color:#fff;'), 'white label on dark green controls')
  assert.ok(css.includes('.header-link:focus-visible'), 'visible focus outline')
})

test('latest TV troubleshooting procedures update five existing facility articles without duplicates', () => {
  const find = (id: string) => {
    const matches = OPERATION_ARTICLES.filter(article => article.id === id)
    assert.equal(matches.length, 1, id)
    assert.equal(matches[0]!.category, 'facilities')
    assert.equal(matches[0]!.source, '최신 정정')
    return matches[0]!
  }
  const general = find('tv-general-reset')
  assert.match(general.steps.join(' → '), /DTV 채널 선택.*유선방송.*자동 채널 설정.*100%가 되자마자 확인.*중지하시겠습니까.*예.*확인 버튼/)
  const smart = find('tv-smart-reset')
  assert.match(smart.steps.join(' → '), /홈 메뉴.*설정.*채널\/방송.*자동 채널 설정.*시작.*100% 완료 시 자동/)
  assert.ok(smart.notes?.some(note => note.includes('중지 버튼을 누를 필요 없음')))
  const remote = find('tv-remote')
  assert.match(remote.steps.join(' → '), /일반 TV.*빨간색 불빛.*보이면.*전원 버튼을 여러 번.*보이지 않으면.*메인보드.*시설팀/)
  assert.match(find('tv-optical').steps.join(' → '), /홈 메뉴.*설정.*음향.*옵티컬.*TV 스피커/)
  assert.match(find('tv-network').steps.join(' → '), /집 모양 홈 버튼.*왼쪽 이동.*설정.*네트워크 선택.*초기화 후 재설정.*확인.*무선 연결.*해당 객실 층/)
  for (const [query, id] of [['DTV채널선택','tv-general-reset'],['스마트티비','tv-smart-reset'],['리모콘','tv-remote'],['옵티컬','tv-optical'],['네트워크 초기화','tv-network']]) {
    assert.ok(searchOperations(OPERATION_ARTICLES, query!, 'facilities').some(article => article.id === id), query)
  }
})

test('room assignment and type-change procedures preserve the supplied workflow and free amenities', () => {
  const get = (id: string) => OPERATION_ARTICLES.find(a => a.id === id)!
  const elevator = get('elevator-room-assignment')
  assert.equal(elevator.category,'rooms')
  for (const q of ['엘리베이터','엘베','승강기']) assert.ok(searchOperations(OPERATION_ARTICLES,q,'rooms').some(a => a.id === elevator.id))
  assert.match(elevator.steps.join(' '), /22~25호.*04~07호.*1604·1605호.*23~25호.*06호·24호/)
  const change = get('room-type-change')
  assert.equal(change.category,'rooms')
  assert.match(change.steps.join(' '), /사용 가능 객실.*인차지.*객실료 고정.*리마크.*객실료 고정 금지.*일별요금.*폴리오.*LS 룸터치.*H\/K.*예약실.*일별요금/)
  assert.match(change.caution!, /절대 객실료 고정 금지/)
  assert.equal(OPERATION_ARTICLES.filter(a => a.id === 'request-amenities').length,1)
  assert.match(get('request-amenities').summary!,/모두 무료/)
  assert.match(get('request-amenities').steps.join(' '),/빗.*가운.*생수 3병.*샴푸.*수건/)
})

test('all selected visual guides map to existing staff articles and leave simple manuals text-only', async () => {
  const { VISUAL_GUIDE_IDS, hasVisualGuide } = await import('../src/data/staffVisualGuideIds.ts')
  assert.equal(VISUAL_GUIDE_IDS.length,22)
  assert.equal(new Set(VISUAL_GUIDE_IDS).size,22)
  const component=await readFile(new URL('../src/components/staff/StaffVisualGuide.tsx',import.meta.url),'utf8')
  for(const id of VISUAL_GUIDE_IDS){
    assert.ok(OPERATION_ARTICLES.some(a=>a.id===id),id)
    assert.ok(component.includes("case '"+id+"'"),id)
    assert.ok(hasVisualGuide(id))
  }
  assert.equal(hasVisualGuide('departments'),false)
  assert.equal(hasVisualGuide('lost-key'),false)
  const panel=await readFile(new URL('../src/components/staff/StaffWorkPanel.tsx',import.meta.url),'utf8')
  assert.match(panel, /<StaffVisualGuide article=\{article\}/)
  assert.match(panel, /article.steps.map/)
  const heating=OPERATION_ARTICLES.find(a=>a.id==='room-heating')!
  assert.match(heating.steps.join(' '), /전화기 위.*26°C.*온돌/)
  assert.match(OPERATION_ARTICLES.find(a=>a.id==='room-lights')!.steps[0]!, /동일한 카드키/)
})
