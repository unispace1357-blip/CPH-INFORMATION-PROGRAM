/* Final cross-screen browser QA. No live Naver request and no publication. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const base = process.env.CPH_UI_BASE_URL || 'http://127.0.0.1:5173';
const adminBase = process.env.CPH_ADMIN_BASE_URL || 'http://127.0.0.1:5190';
const output = process.env.CPH_UI_ARTIFACT_DIR || '/tmp/cph-final-qa';
const dataset = require('../src/data/facilities.json');
const scripts = require('../src/data/frontdesk-scripts.json').scripts;
const languages = { en: 'English', ko: '한국어', 'zh-CN': '简体中文', ja: '日本語' };
const errors = [];
const passed = [];
const log = (message) => { passed.push(message); console.log('PASS:', message); };
const waitCards = async (page, size, selector = '.facility-card') => {
  await page.waitForFunction(([s, n]) => document.querySelectorAll(s).length === n, [selector, size], { timeout: 15000 });
};
const noOverflow = async page => {
  const dims = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll('body *')].filter(el => {
      const r = el.getBoundingClientRect(); const st = getComputedStyle(el);
      return (r.right > innerWidth + 2 || r.left < -2) && st.position !== 'fixed' && r.width > 0;
    }).slice(0, 12).map(el => ({ tag: el.tagName, class: String(el.className).slice(0,90),
      text: el.textContent?.trim().slice(0,35), x: Math.round(el.getBoundingClientRect().x),
      right: Math.round(el.getBoundingClientRect().right), width: Math.round(el.getBoundingClientRect().width) }))
  }));
  assert.ok(dims.scroll <= dims.width + 2, 'horizontal overflow: ' + JSON.stringify(dims));
};
const names = (items, lang = 'ko') => items.map(x => x.translations[lang].name);
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.CPH_BROWSER_CHANNEL || undefined, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, reducedMotion: 'reduce' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(base).origin });
  context.on('page', p => {
    p.on('pageerror', e => errors.push(e.message));
    p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  });
  await context.route(/https:\/\/(?:m\.)?map\.naver\.com\//, r => r.fulfill({ contentType: 'text/html', body: '<p>Intercepted: no live route checked</p>' }));
  let staff, guest, admin;
  try {
    assert.equal(dataset.facilities.length, 27);
    assert.equal(scripts.length, 33);
    staff = await context.newPage();
    await staff.goto(base + '/staff');
    await staff.waitForFunction(() => [...document.querySelectorAll('.concierge-hero-image,.concierge-featured-image')].length === 2 &&
      [...document.querySelectorAll('.concierge-hero-image,.concierge-featured-image')].every(img => img.complete && img.naturalWidth >= 1600 && img.naturalHeight >= 900));
    assert.ok((await staff.locator('#staff-essentials').innerText()).includes('35,000'));
    assert.equal(await staff.locator('.staff-board-rail').count(), 1);
    assert.equal(await staff.locator('.staff-admin-trigger').count(),1);
    assert.equal(await staff.locator('.staff-board-rail button').filter({hasText:'관리자 화면'}).count(),1);
    await staff.locator('.staff-admin-trigger').click();
    const adminGate = staff.getByRole('dialog',{name:'관리자 인증'});
    assert.equal(await adminGate.count(),1);
    assert.ok((await adminGate.innerText()).includes('공개 테스트 빌드'));
    assert.equal(await adminGate.locator('input[type="password"]').count(),0,
      'Local development mode has no shared web password gate');
    assert.equal(await staff.locator('[data-admin-boundary]').count(),0,
      'Private editor must not render in public staff app');
    await adminGate.getByRole('button',{name:'직원 화면으로 돌아가기'}).click();
    assert.equal(await staff.getByRole('dialog',{name:'관리자 인증'}).count(),0);
    log('Staff admin: dev-only gate does not request credentials; static DEMO is checked separately');
    // The local development server intentionally shows a different draft warning
    // from the publicly built DEMO. Public text is checked in public-build.test.ts.
    const staffRelease = staff.locator('.staff-release-notice');
    assert.ok((await staffRelease.innerText()).includes('프론트 테스트용 미리보기'));
    assert.ok((await staffRelease.innerText()).includes('검수 전 초안'));
    log('Staff copy: development-only draft warning retained; public wording checked in bundle test');
    await staff.waitForSelector('#staff-hub-input');
    const pcGeometry = await staff.evaluate(() => {
      const box = s => { const r = document.querySelector(s).getBoundingClientRect(); return { x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right }; };
      return {header:box('.site-header'),rail:box('.staff-board-rail'),hero:box('.staff-intro .concierge-hero'),
        hub:box('.staff-search-hub'),overview:box('.staff-overview-grid'),
        left:box('.staff-overview-column:first-child'),right:box('.staff-overview-column:last-child'),
        facts:box('.staff-essential-panel'),featured:box('.staff-overview-column:first-child .concierge-featured'),
        scripts:box('.staff-quick-phrases')};
    });
    assert.ok(pcGeometry.rail.width >= 150 && pcGeometry.hero.x > pcGeometry.rail.right,
      'Desktop sidebar must sit beside—not overlap—the hero: ' + JSON.stringify(pcGeometry));
    assert.ok(pcGeometry.hero.y < 90 && pcGeometry.hub.y > pcGeometry.hero.y &&
      pcGeometry.overview.y > pcGeometry.hub.y,
      'Hero, search and two-column overview must be in the correct order: ' + JSON.stringify(pcGeometry));
    assert.ok(Math.abs(pcGeometry.left.y-pcGeometry.right.y) < 3 &&
      pcGeometry.left.width > 340 && pcGeometry.right.width > 340,
      'Staff dashboard must use readable two-column cards: ' + JSON.stringify(pcGeometry));
    assert.equal(await staff.locator('.staff-essential-panel .concierge-fact').count(), 4);
    assert.equal(await staff.locator('.staff-topic-shortcuts button').count(), 4);
    assert.equal(await staff.locator('.staff-quick-phrase button').count(), 4);
    await noOverflow(staff);
    await staff.evaluate(() => scrollTo(0, 0));
    await staff.screenshot({path:path.join(output,'staff-stage4-first-fold-1280.png'),fullPage:false});
    await staff.locator('.staff-overview-grid').screenshot({path:path.join(output,'staff-stage4-dashboard-cards-1280.png')});
    assert.ok((await staff.locator('.staff-intro .concierge-hero').innerText()).includes('Staff Concierge'));
    const boutiqueStaff = await staff.evaluate(() => ({
      theme: getComputedStyle(document.querySelector('.app-shell')).getPropertyValue('--color-primary').trim(),
      serif: getComputedStyle(document.querySelector('.staff-intro .concierge-hero h1')).fontFamily,
    }));
    assert.equal(boutiqueStaff.theme, '#3f4f46');
    assert.ok(boutiqueStaff.serif.includes('Georgia'));
    log('Design C staff: deep-green sidebar, editorial serif hero, intact two-column dashboard');
    log('Staff stage 4 geometry: compact side rail, photo hero, scoped search, four hotel facts, functional topic tiles and 2-column dashboard');
    // Stage 5: check the previously untested desktop breakpoints, not just 1280px.
    for (const width of [1024, 1440]) {
      await staff.setViewportSize({ width, height: 900 });
      await noOverflow(staff);
      const geometry = await staff.evaluate(() => {
        const rect = selector => {
          const el = document.querySelector(selector);
          const b = el.getBoundingClientRect();
          return { x: b.x, y: b.y, right: b.right, width: b.width, height: b.height };
        };
        const rail = document.querySelector('.staff-board-rail');
        const request = document.querySelector('.staff-header-actions .staff-request-trigger');
        return {
          railVisible: rail && getComputedStyle(rail).display !== 'none',
          railRight: rail?.getBoundingClientRect().right,
          requestVisible: request && getComputedStyle(request).display !== 'none' && request.getBoundingClientRect().width > 0,
          hero: rect('.staff-intro .concierge-hero'),
          hub: rect('.staff-search-hub'),
          overview: rect('.staff-overview-grid'),
          left: rect('.staff-overview-column:first-child'),
          right: rect('.staff-overview-column:last-child')
        };
      });
      assert.ok(geometry.hub.y > geometry.hero.y && geometry.overview.y > geometry.hub.y,
        'Desktop vertical hierarchy must remain ordered at ' + width + ': ' + JSON.stringify(geometry));
      assert.ok(Math.abs(geometry.left.y - geometry.right.y) < 3 &&
        geometry.left.width > 285 && geometry.right.width > 285,
        'Desktop two-column workspace must remain usable at ' + width + ': ' + JSON.stringify(geometry));
      assert.ok(geometry.requestVisible, 'Staff request entry must remain visible at ' + width);
      if (width === 1024) {
        assert.equal(geometry.railVisible, false, '1024px must use normal header without side rail');
      } else {
        assert.ok(geometry.railVisible && geometry.hero.x >= geometry.railRight - 2,
          '1440px rail and photo must not overlap: ' + JSON.stringify(geometry));
      }
      await staff.evaluate(() => scrollTo(0, 0));
      await staff.screenshot({ path: path.join(output, 'staff-stage5-desktop-' + width + '.png'), fullPage: false });
      log('Staff stage 5 ' + width + 'px: responsive geometry, visible request entry, two columns, zero horizontal overflow');
    }
    await staff.setViewportSize({ width: 1280, height: 900 });
    await staff.waitForSelector('#frontdesk-search-title');
    assert.equal(await staff.getByRole('tab', { name: '호텔 업무 영어 응대' }).getAttribute('aria-selected'), 'true');
    assert.equal(await staff.locator('.staff-search-hub').count(), 1);
    assert.ok((await staff.locator('.staff-quick-phrases').innerText()).includes('35,000'));
    const staffHashBefore = await staff.evaluate(() => location.hash);
    await staff.getByRole('navigation', { name: '직원 주요 업무 바로가기' }).getByRole('button', { name: '통합 검색' }).click();
    assert.equal(await staff.evaluate(() => location.hash), staffHashBefore, 'Staff rail must not replace HashRouter route');
    assert.equal(await staff.locator('#staff-hub-input').evaluate(el => document.activeElement === el), true);
    assert.equal(await staff.getByRole('heading', { name: 'Page not found' }).count(), 0);
    // Work category contains the staff manuals, and it must not disturb the existing dashboard.
    const sidebar = staff.getByRole('navigation', { name: '직원 주요 업무 바로가기' });
    await sidebar.getByRole('button', { name: '업무용' }).click();
    assert.equal(await staff.getByRole('heading', { name: '업무용 매뉴얼' }).count(), 1);
    assert.equal(await staff.locator('#staff-hub-input').count(), 0);
    assert.ok((await staff.locator('.staff-work-total').innerText()).includes('40개'));
    await staff.locator('#staff-work-query').fill('스마트 TV');
    await staff.getByRole('group', { name: '업무 분류' }).getByRole('button', { name: /객실 타입·배정/ }).click();
    assert.ok((await staff.locator('.staff-work-detail').innerText()).includes('15층'));
    assert.ok((await staff.locator('.staff-work-detail').innerText()).includes('20,000원'));
    await staff.getByRole('group', { name: '업무 분류' }).getByRole('button', { name: /펫캉스/ }).click();
    await staff.locator('#staff-work-query').fill('보증금');
    assert.ok((await staff.locator('.staff-work-detail').innerText()).includes('받지 않습니다'));
    await staff.locator('#staff-work-query').fill('');
    await staff.getByRole('group', { name: '업무 분류' }).getByRole('button', { name: /부서 연락처/ }).click();
    assert.ok((await staff.locator('.staff-work-detail').innerText()).includes('5030'));
    await sidebar.getByRole('button', { name: '호텔 안내' }).click();
    assert.equal(await staff.locator('#staff-hub-input').count(), 1);
    await sidebar.getByRole('button', { name: '주변 시설' }).click();
    assert.equal(await staff.getByRole('tab', { name: '주변 시설 안내' }).getAttribute('aria-selected'), 'true');
    await sidebar.getByRole('button', { name: '호텔 안내' }).click();
    assert.equal(await staff.getByRole('tab', { name: '호텔 업무 영어 응대' }).getAttribute('aria-selected'), 'true');
    log('Staff operations manual: categories, search, latest fees, no pet deposit and sidebar recovery verified');
    await staff.locator('#staff-hub-input').fill('조식');
    await staff.getByRole('region', { name: '통합 검색' }).getByRole('button', { name: '검색', exact: true }).click();
    assert.equal(await staff.locator('#staff-hotel-panel input[type="search"]').inputValue(), '조식');
    await staff.locator('#staff-hotel-panel input[type="search"]').fill('');
    await staff.getByRole('group', { name: '호텔 안내 바로가기' }).getByRole('button', { name: '교통·주차' }).click();
    await staff.waitForFunction(() => document.querySelector('#staff-hotel-panel input[type="search"]')?.value === '주차', null, { timeout: 5000 });
    assert.equal(await staff.locator('#staff-hotel-panel input[type="search"]').inputValue(), '주차');
    await staff.locator('#staff-hotel-panel input[type="search"]').fill('');
    await waitCards(staff, 33, '.frontdesk-script-card');
    await staff.getByRole('navigation', { name: '직원 주요 업무 바로가기' }).getByRole('button', { name: '요청 접수' }).click();
    assert.equal(await staff.getByRole('dialog', { name: '직원 요청사항' }).count(), 1);
    await staff.getByRole('button', { name: '요청사항 창 닫기' }).click();
    log('Staff dashboard: safe rail navigation, scoped search, functional hotel cards and request entry');
    await waitCards(staff, 33, '.frontdesk-script-card');
    assert.deepEqual((await staff.locator('.frontdesk-script-title').allTextContents()).slice(0, 2), scripts.slice(0, 2).map(s => s.title));
    assert.ok((await staff.locator('.information-notice').allTextContents()).some(t => t.includes('금연')));
    await staff.getByRole('button', { name: '요청사항', exact: true }).click();
    const requestDialog = staff.getByRole('dialog', { name: '직원 요청사항' });
    await requestDialog.waitFor({ state: 'visible' });
    assert.equal(await requestDialog.count(), 1);
    const requestDetails = requestDialog.getByLabel('요청 내용');
    const formConnectionNotice = requestDialog.locator('.staff-request-unavailable');
    assert.equal(await formConnectionNotice.innerText(), '요청 내용을 10자 이상 작성해 주세요.');
    assert.equal(await requestDialog.getByRole('link', { name: 'Google Forms에서 접수하기' }).count(), 0);
    assert.equal(await requestDialog.getByRole('button', { name: '요청 내용 복사' }).isDisabled(), true);
    await requestDetails.fill('짧은 요청');
    assert.equal(await formConnectionNotice.innerText(), '요청 내용을 10자 이상 작성해 주세요.');
    await requestDialog.getByLabel('요청 유형').selectOption('정보 수정');
    await requestDialog.getByLabel('관련 화면').selectOption('주변 시설 안내');
    await requestDialog.getByLabel('요청 내용').fill('가까운 세탁소 정보를 추가해 주세요.');
    const formLink = requestDialog.getByRole('link', { name: 'Google Forms에서 접수하기' });
    assert.equal(await formLink.count(), 1);
    const formHref = new URL(await formLink.getAttribute('href'));
    assert.equal(formHref.hostname, 'docs.google.com');
    assert.ok(formHref.searchParams.get('entry.1268471161').includes('가까운 세탁소 정보를 추가해 주세요.'));
    assert.equal(await formConnectionNotice.count(), 0, 'Configured Google Form must not appear disconnected');
    await requestDialog.getByRole('button', { name: '요청 내용 복사' }).click();
    await staff.waitForFunction(() => navigator.clipboard.readText().then(value => value.includes('가까운 세탁소 정보를 추가해 주세요.')));
    assert.ok((await requestDialog.innerText()).includes('복사만으로 접수되지는 않습니다'));
    await requestDialog.getByRole('button', { name: '요청사항 창 닫기' }).click();
    assert.equal(await staff.getByRole('dialog', { name: '직원 요청사항' }).count(), 0);
    assert.equal(await staff.locator('.frontdesk-review-badge').count(), 0, 'Draft labels must be hidden only in the UI');
    const hotel = staff.locator('#staff-hotel-panel');
    await hotel.getByRole('group', { name: '호텔 업무 카테고리' }).getByRole('button', { name: '조식' }).click();
    await hotel.getByRole('searchbox').fill('35000');
    await waitCards(staff, 1, '.frontdesk-script-card');
    assert.ok((await hotel.locator('.frontdesk-quick-answer').innerText()).includes('35,000'));
    await hotel.getByRole('searchbox').fill('');
    await hotel.getByRole('group', { name: '호텔 업무 카테고리' }).getByRole('button', { name: '주차 안내' }).click();
    await waitCards(staff, 2, '.frontdesk-script-card');
    assert.deepEqual(await hotel.locator('.frontdesk-script-title').allTextContents(), ['주차 요금', '차량 등록']);
    await hotel.getByRole('group', { name: '호텔 업무 카테고리' }).getByRole('button', { name: '전체' }).click();
    const scriptSearch = hotel.getByRole('searchbox');
    await scriptSearch.fill('shelf');
    await waitCards(staff, 2, '.frontdesk-script-card');
    assert.ok((await hotel.locator('.frontdesk-quick-answer').innerText()).includes('shelf'));
    const delivery = scripts.find(s => s.id === 'food-delivery');
    await scriptSearch.fill(delivery.title);
    await waitCards(staff, 1, '.frontdesk-script-card');
    await hotel.getByRole('button', { name: '즉시 응대 영어 복사' }).click();
    await staff.waitForFunction(t => navigator.clipboard.readText().then(x => x === t), delivery.quickAnswer.en);
    assert.ok((await hotel.locator('.frontdesk-quick-answer').innerText()).includes('(')); // inline phonetics
    await scriptSearch.fill('6777');
    await waitCards(staff, 1, '.frontdesk-script-card');
    assert.ok((await hotel.locator('.frontdesk-quick-answer').innerText()).includes('6777'));
    const quickAccess = staff.locator('.staff-quick-access');
    assert.ok((await quickAccess.innerText()).includes('즐겨찾기'));
    await hotel.getByRole('button',{name:'☆ 즐겨찾기 추가'}).click();
    assert.equal(await quickAccess.locator('.staff-quick-access-grid > div:first-child [data-shortcut="script:airport-limousine-6777"]').count(),1);
    await scriptSearch.fill('');
    await waitCards(staff, 33, '.frontdesk-script-card');
    log('Staff: 33 scripts, smoking priority, parking, delivery, airport bus and untouched English clipboard');
    log('Staff STEP 5: hotel script added to PC favorites without storing search text');

    await staff.getByRole('tab', { name: '주변 시설 안내' }).click();
    await waitCards(staff, 27);
    const staffPanel = staff.locator('#staff-facilities-panel');
    assert.deepEqual(await staffPanel.locator('.facility-card h3').allTextContents(), names(dataset.facilities));
    assert.equal(await staffPanel.locator('.facility-menu-summary').count(), 15);
    const fSearch = staffPanel.getByRole('searchbox');
    for (const [query, expected] of [
      ['맥주', ['더몰트하우스 인천송도점', '플레이그라운드 브루어리 탭룸 송도', '금별맥주 송도롯데몰점']],
      ['김밥', ['오토김밥']],
      ['burgerking', ['버거킹 인천송도센트럴파크점']],
      ['현프아', ['현대프리미엄아울렛 송도점']],
      ['수상택시', ['송도 센트럴파크 수상택시']],
    ]) {
      await fSearch.fill(query);
      await staff.waitForTimeout(100);
      const actual = await staffPanel.locator('.facility-card h3').allTextContents();
      for (const name of expected) assert.ok(actual.includes(name), query + ': ' + name);
    }
    await fSearch.fill('스프카레');
    await waitCards(staff, 1);
    assert.equal((await staffPanel.locator('.facility-card h3').allTextContents())[0], '송도 타임스페이스');
    assert.ok((await staffPanel.locator('.facility-menu-summary').innerText()).includes('15곳'));
    assert.match(await staffPanel.locator('.facility-card .facility-meta').innerText(), /15분.*835m/);
    const typeCheck = await staffPanel.locator('.facility-card h3').first().evaluate(el => ({
      fontSize: parseFloat(getComputedStyle(el).fontSize),
      fontFamily: getComputedStyle(el).fontFamily,
      fontWeight: Number(getComputedStyle(el).fontWeight)
    }));
    assert.ok(typeCheck.fontSize >= 17 && typeCheck.fontWeight >= 700 &&
      typeCheck.fontFamily.includes('Segoe UI'), 'Readable local typography: ' + JSON.stringify(typeCheck));
    await staffPanel.locator('.facility-card button').click();
    assert.ok((await staffPanel.locator('.english-phrase-text').allTextContents()).some(t => t.includes('Timespace')));
    assert.equal(await staffPanel.locator('.timespace-directory .timespace-tenant-card').count(), 15);
    assert.ok((await staffPanel.locator('.staff-detail-intro .naver-map-link').getAttribute('href')).includes('1617698245,PLACE_POI'));
    assert.match(await staffPanel.locator('.staff-walking-summary').innerText(), /15분.*835m/);
    assert.ok((await staffPanel.locator('.staff-route-accuracy-note').innerText()).includes('스타벅스 송도캐슬파크점'));
    assert.ok((await staffPanel.locator('.staff-route-accuracy-note').innerText()).includes('835m'));
    await staffPanel.getByRole('button',{name:'☆ 즐겨찾기 추가'}).click();
    assert.equal(await quickAccess.locator('.staff-quick-access-grid > div:first-child [data-shortcut="facility:songdo-timespace-complex"]').count(),1);
    assert.ok((await quickAccess.innerText()).includes('2/6'));
    const printable = staffPanel.locator('.staff-printable-card');
    assert.equal(await printable.count(),1);
    assert.ok((await printable.innerText()).includes('송도 타임스페이스'));
    assert.ok((await printable.innerText()).includes('스타벅스'));
    assert.ok((await printable.innerText()).includes('검수') || (await printable.innerText()).includes('직원 확인'));
    assert.ok((await printable.locator('svg.print-card-qr path').getAttribute('d')).length>300,
      'Offline QR must contain a populated code matrix');
    await staff.evaluate(() => { window.__cphPrintCalls=0; window.print=()=>{window.__cphPrintCalls++} });
    await staffPanel.getByRole('button',{name:'인쇄용 안내 카드 출력'}).click();
    assert.equal(await staff.evaluate(()=>window.__cphPrintCalls),1);
    await staff.emulateMedia({media:'print'});
    assert.equal(await printable.evaluate(el=>getComputedStyle(el).display),'block');
    assert.equal(await printable.evaluate(el=>getComputedStyle(el).visibility),'visible');
    await staff.emulateMedia({media:'screen'});
    assert.equal(await printable.evaluate(el=>getComputedStyle(el).display),'none');
    log('Staff STEP 6: local Naver QR, route caveat, one-page printable-only content, print action');
    await fSearch.fill('한마음정육식당');
    await staffPanel.locator('.timespace-tenant-card.is-search-match').waitFor({ state:'visible', timeout:10000 });
    assert.equal(await staffPanel.locator('.timespace-tenant-card').count(), 5);
    assert.ok((await staffPanel.locator('.timespace-tenant-card.is-search-match').innerText()).includes('B동 2층 205~208호'));
    await fSearch.fill('고기구이');
    await staff.waitForTimeout(550);
    assert.equal(await staffPanel.locator('.timespace-tenant-card.is-search-match').count(), 0);
    log('Staff tenant shortcut: exact Hanmaeum match focuses B205-208, generic grilled-meat query never auto-focuses');
    const staffChoices = staffPanel.locator('.timespace-suggestions');
    assert.ok(await staffChoices.locator('.timespace-suggestion-button').count() >= 4);
    await fSearch.fill('한마음');
    await staffChoices.locator('[data-tenant-id="hanmaeum"]').click();
    await staffPanel.locator('.timespace-tenant-card.is-search-match[data-tenant-id="hanmaeum"]').waitFor({state:'visible',timeout:10000});
    assert.ok((await staffPanel.locator('.timespace-tenant-card.is-search-match').innerText()).includes('205~208호'));
    log('Staff step4: partial-name candidate opens exact tenant without changing other facilities');
    await fSearch.fill('타임스페이스');
    await staffPanel.getByRole('group', { name: '시설 카테고리' }).getByRole('button', { name: '음식점·주점' }).click();
    await waitCards(staff, 1);
    assert.ok((await staffPanel.locator('.facility-card .eyebrow').innerText()).includes('쇼핑'));
    assert.equal(await staffPanel.locator('.facility-featured-label').innerText(), '★ 추천');
    await fSearch.fill('');
    await waitCards(staff, 12);
    assert.ok((await staffPanel.locator('.facility-card h3').first().innerText()).startsWith('송도 타임스페이스'));
    assert.equal(await staffPanel.locator('.facility-featured-label').count(), 1);
    await staffPanel.getByRole('group', { name: '시설 카테고리' }).getByRole('button', { name: '전체' }).click();
    await waitCards(staff, 27);
    assert.equal(await staffPanel.locator('.facility-featured-label').count(), 0);
    await fSearch.fill('맥주 약국');
    await waitCards(staff, 0);
    await fSearch.fill('더몰트하우스');
    await waitCards(staff, 1);
    await staffPanel.locator('.facility-card button').click();
    assert.ok((await staffPanel.locator('.staff-detail-intro').innerText()).includes('더몰트하우스'));
    assert.ok((await staffPanel.locator('.english-phrase-text').first().innerText()).includes('Typical menu items'));
    const maltHours = staffPanel.locator('.staff-facility-metadata .operating-hours-guide');
    assert.ok((await maltHours.innerText()).includes('브레이크'));
    assert.ok((await maltHours.innerText()).includes('라스트오더'));
    assert.ok((await maltHours.innerText()).includes('영업 중 여부는 확인되지'));
    log('Staff STEP 8: break time, last order and unverified-live-status visibly distinct');
    const malt = dataset.facilities.find(f => f.id === 'malt-house-incheon-songdo');
    await staffPanel.getByRole('button', { name: '영어 문구 1 복사' }).click();
    await staff.waitForFunction(t => navigator.clipboard.readText().then(x => x === t), malt.englishPhrases[0]);
    await staffPanel.getByRole('button', { name: '전체 문구 복사' }).click();
    await staff.waitForFunction(t => navigator.clipboard.readText().then(x => x === t), malt.englishPhrases.join('\n'));
    log('Staff: all 27 names, 15 menu summaries, aliases, AND search, phonetics excluded from copy');
    // Landing scoped search navigates immediately, but hotel script searches do not.
    await staff.locator('#staff-hub-scope').selectOption('facilities');
    await staff.locator('#staff-hub-input').fill('한마음정육식당 송도타임스페이스점');
    await staff.locator('.staff-search-hub-form button[type="submit"]').click();
    await staffPanel.locator('.timespace-tenant-card.is-search-match').waitFor({ state:'visible', timeout:10000 });
    assert.ok((await staffPanel.locator('.timespace-tenant-card.is-search-match').innerText()).includes('205~208호'));
    assert.equal(await staff.getByRole('tab', {name:'주변 시설 안내'}).getAttribute('aria-selected'), 'true');
    log('Staff landing search: specific tenant navigates immediately into facilities and focuses matching restaurant');

    guest = await context.newPage();
    guest.on('response', response => { if (response.status() >= 400) errors.push('Guest HTTP ' + response.status() + ' ' + response.url()); });
    await guest.goto(base + '/guest');
    await waitCards(guest, 27);
    await guest.waitForFunction(() => [...document.querySelectorAll('.concierge-hero-image,.concierge-featured-image')].length === 2 &&
      [...document.querySelectorAll('.concierge-hero-image,.concierge-featured-image')].every(img => img.complete && img.naturalWidth >= 1600 && img.naturalHeight >= 900));
    assert.ok((await guest.locator('.concierge-essentials').innerText()).includes('35,000'));
    assert.equal(await guest.locator('.concierge-featured').count(), 1);
    log('Guest layout: responsive hero, safety, quick facts and featured place photos');
    assert.equal(await guest.locator('.english-guide').count(), 0);
    assert.equal(await guest.getByRole('button', { name: '요청사항', exact: true }).count(), 0);
    assert.equal(await guest.getByRole('dialog', { name: '직원 요청사항' }).count(), 0);
    assert.ok((await guest.locator('#hotel-information .information-notice').allTextContents()).some(t => /smoking|금연/i.test(t)));
    const guestHashBefore = await guest.evaluate(() => location.hash);
    assert.equal(await guest.locator('.concierge-hero-search-link').count(), 0, 'Remove duplicated fake search button');
    assert.equal(await guest.locator('#hotel-information input[type="search"]').count(), 1, 'Keep only one functional hotel search');
    await guest.locator('#hotel-information input[type="search"]').focus();
    assert.equal(await guest.evaluate(() => location.hash), guestHashBefore, 'Hotel input focus must preserve route');
    assert.equal(await guest.locator('#hotel-information input[type="search"]').evaluate(el => document.activeElement === el), true);
    await guest.setViewportSize({ width: 390, height: 844 });
    assert.equal(await guest.locator('.guest-mobile-language select').isVisible(), true, 'Show native language picker in mobile header');
    assert.equal(await guest.locator('.guest-language-toolbar').isVisible(), false, 'Hide redundant language row on mobile');
    await guest.locator('.guest-mobile-language select').selectOption('en');
    assert.equal(await guest.locator('html').getAttribute('lang'), 'en');
    await guest.locator('.guest-mobile-language select').selectOption('ko');
    assert.equal(await guest.locator('html').getAttribute('lang'), 'ko');
    await guest.locator('.guest-mobile-menu summary').click();
    await guest.locator('.guest-mobile-menu nav a').first().click();
    assert.equal(await guest.evaluate(() => location.hash), guestHashBefore, 'Mobile hamburger anchor must not break HashRouter');
    assert.equal(await guest.getByRole('heading', { name: 'Page not found' }).count(), 0);
    const mobileLayout = await guest.evaluate(() => {
      const rect = q => document.querySelector(q).getBoundingClientRect();
      const hero = rect('.guest-page > .concierge-hero');
      const search = rect('.concierge-hotel-search .search-control');
      const smoke = rect('#hotel-information .smoking-policy-notice');
      const facts = rect('#hotel-information .concierge-essentials');
      const topics = rect('#hotel-information .hotel-category-grid');
      const featured = rect('.guest-page > .concierge-featured');
      return { hero: [hero.top, hero.bottom], search: [search.top, search.bottom],
        smoke: smoke.top, facts: facts.top, topics: topics.top, featured: featured.top };
    });
    assert.ok(mobileLayout.search[0] >= mobileLayout.hero[0] &&
      mobileLayout.search[0] < mobileLayout.hero[1] &&
      mobileLayout.search[1] <= mobileLayout.hero[1] + 18, 'Real search must overlap the photo-bottom: ' + JSON.stringify(mobileLayout));
    assert.ok(mobileLayout.smoke > mobileLayout.search[1] &&
      mobileLayout.facts > mobileLayout.smoke &&
      mobileLayout.topics > mobileLayout.facts &&
      mobileLayout.featured > mobileLayout.topics,
      'Mobile order: hero/search > smoking > facts > topic cards > Timespace: ' + JSON.stringify(mobileLayout));
    assert.ok(mobileLayout.featured < 1100, 'Feature card should not be buried under a long duplicated mobile header');
    await noOverflow(guest);
    await guest.evaluate(() => window.scrollTo(0, 0));
    await guest.screenshot({ path: path.join(output, 'guest-stage3-first-fold-390.png'), fullPage: false });
    await guest.screenshot({ path: path.join(output, 'guest-stage3-top-sections-390.png'), fullPage: true });
    await guest.setViewportSize({ width: 1280, height: 900 });
    const order = await guest.evaluate(() => {
      const selectors = ['.concierge-hero', '#hotel-information .smoking-policy-notice', '#hotel-information .concierge-essentials', '.guest-page > .concierge-featured'];
      return selectors.map(s => document.querySelector(s).getBoundingClientRect().top + scrollY);
    });
    assert.ok(order.every((v, i) => i === 0 || v > order[i-1]), 'Mobile/guest layout must match hero > safety > hotel facts > featured order: ' + order);
    assert.ok((await guest.locator('.guest-page > .concierge-hero h1').innerText()).includes('A Special Stay'));
    const editorial = guest.locator('#hotel-information .boutique-entry');
    assert.equal(await editorial.locator('button').count(), 2);
    await editorial.locator('img').first().evaluate(el => el.decode());
    await editorial.locator('img').last().evaluate(el => el.decode());
    assert.ok(await editorial.locator('img').evaluateAll(elements => elements.every(el => el.naturalWidth > 0)));
    await editorial.locator('.boutique-entry-card--nearby').click();
    assert.equal(await guest.locator('#nearby-facilities h2').evaluate(el => document.activeElement === el), true);
    assert.equal(await guest.evaluate(() => location.hash), guestHashBefore);
    await editorial.locator('.boutique-entry-card--hotel').click();
    assert.ok((await guest.locator('#guest-hotel-detail').innerText()).includes('객실'));
    await guest.locator('#guest-hotel-detail .section-heading button').click();
    assert.equal(await guest.evaluate(() => location.hash), guestHashBefore);
    await noOverflow(guest);
    log('Design C guest: two loaded photographic tiles navigate to actual hotel/nearby content without losing HashRouter');
    log('Guest stage 3: compact header, working language switch, single overlapping search, safety and featured sequence');
    const guestSearch = guest.locator('#guest-search input[type="search"]');
    for (const [language, label] of Object.entries(languages)) {
      await guest.setViewportSize({ width: 1280, height: 900 });
      await guest.locator('.language-options').getByRole('button', { name: label, exact: true }).click();
      assert.equal(await guest.locator('html').getAttribute('lang'), language);
      assert.deepEqual(await guest.locator('.facility-card h3').allTextContents(), names(dataset.facilities, language));
      assert.equal(await guest.locator('.facility-menu-summary').count(), 15);
      // Guest previews are deliberately curated; staff source descriptions remain unmodified.
      const foodRecords = dataset.facilities.filter(f => f.category === 'dining' || f.category === 'cafe' || f.id === 'songdo-timespace-complex');
      const guestPreviews = await guest.locator('.facility-menu-summary').allTextContents();
      assert.equal(guestPreviews.length, foodRecords.length);
      assert.ok(guestPreviews.every(t => t.trim() && !/개별 등록|full tenant directory|并非完整商户目录|全店舗ではなく/.test(t)),
        'No internal record-management language in guest list: ' + JSON.stringify(guestPreviews));
      const expectedTimespacePreview = guestPreviews.at(-1);
      assert.ok(expectedTimespacePreview && !expectedTimespacePreview.includes('Menu examples'),
        'Timespace card should be written for visitors, not data administrators');
      await guestSearch.fill(language === 'ko' ? '커피숍' : 'coffee');
      await guest.waitForTimeout(100);
      assert.ok(await guest.locator('.facility-card h3').count() >= 3);
      await guestSearch.fill('');
      await waitCards(guest, 27);
      await guest.locator('#guest-facility-results .facility-card button').first().click();
      assert.ok(await guest.locator('#guest-detail-title').isVisible());
      await guest.locator('#guest-facility-detail button').first().click();
      assert.equal(await guest.locator('#guest-detail-title').count(), 0);
      if (await guest.locator('.facility-card').count() === 27) { await guest.setViewportSize({ width: 390, height: 844 }); await guest.evaluate(() => window.scrollTo(0, 0)); await guest.screenshot({ path: path.join(output, 'guest-language-' + language + '.png'), fullPage: false }); }
      log('Guest: ' + language + ' 27 localized facility names, all 15 menus, search, detail and close');
    }
    await guest.setViewportSize({ width: 1280, height: 900 });
    await guest.locator('.language-options').getByRole('button', { name: '한국어', exact: true }).click();
    await guestSearch.fill('타임스페이스 스프카레');
    await waitCards(guest, 1);
    assert.equal((await guest.locator('.facility-card h3').allTextContents())[0], '송도 타임스페이스');
    assert.ok((await guest.locator('.facility-menu-summary').innerText()).includes('고기구이'));
    await guest.locator('#guest-facility-results .facility-card button').click();
    const timespaceRoute = await guest.locator('#guest-facility-detail .naver-map-link').getAttribute('href');
    assert.ok(timespaceRoute.includes('19398065,PLACE_POI') && timespaceRoute.includes('1617698245,PLACE_POI'));
    assert.ok((await guest.locator('#guest-facility-detail').innerText()).includes('스타벅스 송도캐슬파크점'));
    const diningDirectory = guest.locator('#guest-facility-detail .timespace-directory');
    assert.equal(await diningDirectory.locator('.timespace-tenant-card').count(), 15);
    assert.ok((await diningDirectory.innerText()).includes('도라보울'));
    assert.ok((await diningDirectory.innerText()).includes('한마음정육식당'));
    assert.ok((await diningDirectory.innerText()).includes('B동 2층 205~208호'));
    assert.ok(!(await diningDirectory.innerText()).includes('오바케'));
    await diningDirectory.getByRole('button', { name: /고기구이/ }).click();
    assert.equal(await diningDirectory.locator('.timespace-tenant-card').count(), 5);
    await diningDirectory.getByRole('button', { name: /전체/ }).click();
    assert.equal(await diningDirectory.locator('.timespace-tenant-card').count(), 15);
    assert.ok((await guest.locator('.guest-place-route-note').innerText()).includes('스타벅스'));
    assert.ok((await guest.locator('.guest-place-route-note').innerText()).includes('추가 이동'));
    assert.ok((await guest.locator('.guest-place-route-note').innerText()).includes('하모니로 158'));
    assert.equal(await guest.locator('#guest-facility-detail .verification-date').count(), 0);
    assert.equal(await guest.locator('#guest-facility-detail .detail-facts').count(), 0);
    assert.ok(!(await guest.locator('#guest-facility-detail').innerText()).includes('모든 음식점을 개별 등록'));
    assert.ok(!(await guest.locator('#guest-facility-detail').innerText()).includes('정보 확인 전'));
    assert.match(await guest.locator('#guest-facility-detail').innerText(), /15분.*835m/);
    await guestSearch.fill('한마음정육식당');
    await guest.locator('.timespace-tenant-card.is-search-match').waitFor({ state:'visible', timeout:10000 });
    assert.equal(await diningDirectory.locator('.timespace-tenant-card').count(), 5);
    assert.ok((await diningDirectory.locator('.timespace-tenant-card.is-search-match').innerText()).includes('B동 2층 205~208호'));
    await guest.locator('.language-options').getByRole('button', {name:'English', exact:true}).click();
    assert.ok((await diningDirectory.locator('.timespace-tenant-card.is-search-match').innerText()).includes('Block B · Floor 2 · Unit 205~208'));
    assert.ok((await diningDirectory.locator('.timespace-match-label').innerText()).includes('Matching restaurant'));
    await guest.locator('.language-options').getByRole('button', {name:'한국어', exact:true}).click();
    await diningDirectory.getByRole('button', {name:/전체/}).click();
    assert.equal(await diningDirectory.locator('.timespace-tenant-card').count(), 15);
    assert.equal(await diningDirectory.locator('.timespace-tenant-card.is-search-match').count(), 0, 'manual category choice clears highlighted tenant');
    await guestSearch.press('Enter'); // Repeat exact search without changing input text.
    await guest.locator('.timespace-tenant-card.is-search-match').waitFor({state:'visible',timeout:10000});
    await guestSearch.fill('삼겹살');
    await guest.waitForTimeout(550);
    assert.equal(await diningDirectory.locator('.timespace-tenant-card.is-search-match').count(), 0, 'generic menu keyword never auto-focuses a shop');
    assert.ok((await guestSearch.inputValue()) === '삼겹살');
    log('Guest tenant shortcut: exact match, four-language state, category override and generic keyword safety');
    const guestChoices = guest.locator('#guest-search .timespace-suggestions');
    assert.ok(await guestChoices.locator('.timespace-suggestion-button').count() >= 2);
    await guestChoices.locator('[data-tenant-id="hanmaeum"]').click();
    await guest.locator('.timespace-tenant-card.is-search-match[data-tenant-id="hanmaeum"]').waitFor({state:'visible',timeout:10000});
    assert.ok((await guest.locator('.timespace-tenant-card.is-search-match').innerText()).includes('B동 2층 205~208호'));
    await guestSearch.fill('한마음');
    assert.equal(await guestChoices.locator('.timespace-suggestion-button').count(),1);
    await guestChoices.locator('[data-tenant-id="hanmaeum"]').click();
    await guest.locator('.timespace-tenant-card.is-search-match[data-tenant-id="hanmaeum"]').waitFor({state:'visible',timeout:10000});
    await guestSearch.fill('오바케');
    assert.equal(await guestChoices.locator('.timespace-suggestion-button').count(),0);
    log('Guest step4: food and partial-name candidates open only chosen current tenant; closed Obake never appears');
    await guestSearch.fill('');
    await waitCards(guest, 27);
    // Timespace is one record in both filter categories, rather than two duplicate facility cards.
    await guest.locator('#nearby-facilities .guest-category-grid').getByRole('button', { name: '음식점·주점' }).click();
    await waitCards(guest, 12);
    for (const [language, label] of Object.entries(languages)) {
      await guest.setViewportSize({ width: 1280, height: 900 });
      await guest.locator('.language-options').getByRole('button', { name: label, exact: true }).click();
      const featuredCard = guest.locator('#guest-facility-results .facility-card').first();
      const featured = dataset.facilities.find(f => f.id === 'songdo-timespace-complex');
      assert.ok((await featuredCard.locator('h3').innerText()).startsWith(featured.translations[language].name));
      assert.equal(await featuredCard.locator('.facility-featured-label').innerText(),
        { ko: '★ 추천', en: '★ Featured', 'zh-CN': '★ 推荐', ja: '★ おすすめ' }[language]);
      assert.equal(await guest.locator('#guest-facility-results .facility-featured-label').count(), 1);
    }
    await guest.setViewportSize({ width: 1280, height: 900 });
    await guest.locator('.language-options').getByRole('button', { name: '한국어', exact: true }).click();
    await guestSearch.fill('타임스페이스');
    await waitCards(guest, 1);
    assert.ok((await guest.locator('#guest-facility-results .facility-card h3').first().innerText()).startsWith('송도 타임스페이스'));
    assert.ok((await guest.locator('#guest-facility-results .facility-card .eyebrow').innerText()).includes('쇼핑'));
    await guest.locator('#nearby-facilities .guest-category-grid').getByRole('button', { name: '쇼핑' }).click();
    await waitCards(guest, 1);
    assert.ok((await guest.locator('#guest-facility-results .facility-card .eyebrow').innerText()).includes('음식점'));
    assert.equal(await guest.locator('#guest-facility-results .facility-featured-label').count(), 0);
    await guestSearch.fill('');
    await guest.locator('#nearby-facilities').getByRole('button', { name: '전체 시설' }).click();
    await waitCards(guest, 27);
    assert.equal(await guest.locator('#guest-facility-results .facility-featured-label').count(), 0);
    log('Timespace: customer-friendly detail and menu examples, staff caveats retained, nearby landmark explicitly labeled');
    // STEP 7+9: check actual displayed notices and hour labels through all four language switches.
    await guestSearch.fill('인천항');
    await waitCards(guest, 1);
    await guest.locator('#guest-facility-results .facility-card button').click();
    for (const [language, label, phrase] of [
      ['ko','한국어','연안여객터미널'],
      ['en','English','Coastal Passenger Terminal'],
      ['zh-CN','简体中文','沿岸客运站'],
      ['ja','日本語','沿岸旅客ターミナル']
    ]) {
      await guest.locator('.language-options').getByRole('button',{name:label,exact:true}).click();
      assert.equal(await guest.locator('html').getAttribute('lang'),language);
      assert.ok((await guest.locator('.guest-place-route-note').innerText()).includes(phrase),
        'Translated Incheon Port route terminal: '+language);
      assert.ok((await guest.locator('.guest-place-summary').innerText()).trim(),
        'The port facility identity remains distinct from its route terminal: '+language);
    }
    await guest.locator('#guest-facility-detail button').first().click();
    await guest.locator('.language-options').getByRole('button',{name:'한국어',exact:true}).click();
    await guestSearch.fill('더몰트하우스');
    await waitCards(guest,1);
    await guest.locator('#guest-facility-results .facility-card button').click();
    for (const [language,label,breakTerm,orderTerm] of [
      ['ko','한국어','브레이크','라스트오더'],
      ['en','English','Break','Last order'],
      ['zh-CN','简体中文','休息时间','最后点单'],
      ['ja','日本語','休憩時間','ラストオーダー']
    ]) {
      await guest.locator('.language-options').getByRole('button',{name:label,exact:true}).click();
      const rows=await guest.locator('#guest-facility-detail .operating-hours-guide').innerText();
      assert.ok(rows.includes(breakTerm)&&rows.includes(orderTerm)&&rows.includes('15:00')&&rows.includes('17:00'), language+': break/last-order/hours');
    }
    await guest.locator('#guest-facility-detail button').first().click();
    await guest.locator('.language-options').getByRole('button',{name:'한국어',exact:true}).click();
    await guestSearch.fill('');
    log('STEP 7+9: four-language coastal terminal and restaurant break/order hours displayed in real browser');
    await guest.locator('.guest-category-grid').getByRole('button', { name: '교통', exact: true }).click();
    assert.equal(await guest.locator('.airport-bus-guide .local-guide-departures time').count(), 12);
    assert.ok((await guest.locator('.airport-bus-guide').innerText()).includes('운행정보 변경 가능'));
    assert.ok((await guest.locator('.airport-bus-guide').innerText()).includes('8,000'));
    await guest.locator('.guest-category-grid').getByRole('button', { name: '관광', exact: true }).click();
    assert.equal(await guest.locator('.tourism-guide .tourism-map-location').count(), 6);
    assert.equal(await guest.locator('.tourism-guide .tourism-map-pin').count(), 6);
    assert.equal(await guest.locator('.tourism-guide [data-map-kind="original-schematic"]').count(), 1);
    // All six numbered pins keep their map behavior and show a credited, uncropped photo.
    const photoSource = guest.locator('.tourism-photo-caption a');
    for (const [name, id, photoId, date] of [
      ['G타워', 'g-tower', '664965', '2015-04-01'],
      ['트라이볼', 'tri-bowl', '249272', '2009-08-06'],
      ['송도 센트럴파크', 'central-park', '667087', '2024-09-23'],
      ['송도 한옥마을', 'hanok-village', '664955', '2015-01-05'],
      ['해돋이공원', 'haedoji-park', '665089', '2022-05-02'],
      ['미추홀공원', 'michuhol-park', '665035', '2019-04-19'],
    ]) {
      await guest.locator('.tourism-map-location').filter({ hasText: name }).click();
      assert.equal(await guest.locator('.tourism-photo').getAttribute('data-photo-spot-id'), id);
      assert.ok((await photoSource.getAttribute('href')).includes('pst_sn=' + photoId));
      assert.ok((await guest.locator('.tourism-photo-caption').innerText()).includes(date));
      assert.ok((await guest.locator('.tourism-photo-caption').innerText()).includes('공공누리 제1유형'));
      await guest.locator('.tourism-photo-media').scrollIntoViewIfNeeded();
      await guest.waitForFunction(() => {
        const image = document.querySelector('.tourism-photo-media img');
        return (image && image.complete) || document.querySelector('.tourism-photo-unavailable');
      }, null, { timeout: 40000 });
      const localPhoto = await guest.locator('.tourism-photo-media img').getAttribute('src');
      assert.ok(localPhoto.endsWith('/tourism-photos/' + id + '.webp'), 'Photo must be served locally for ' + id);
      const photoState = await guest.locator('.tourism-photo-media img').evaluate(img => {
        const rect = img.getBoundingClientRect();
        return { loaded: img.complete && img.naturalWidth > 0, shownRatio: rect.width / rect.height, naturalRatio: img.naturalWidth / img.naturalHeight, height: rect.height };
      }).catch(() => ({ loaded: false }));
      assert.ok(photoState.loaded, 'IFEZ photo must load in Chromium for ' + id);
      assert.ok(Math.abs(photoState.shownRatio - photoState.naturalRatio) < 0.025, 'Photo must preserve intrinsic ratio for ' + id);
      assert.ok(photoState.height <= 342 && photoState.height > 20, 'Photo must fit the preview card for ' + id);
    }
    await guest.locator('.tourism-map-location').filter({ hasText: 'G타워' }).click();
    assert.match((await guest.locator('.tourism-map-detail').innerText()), /33층/);
    assert.ok((await guest.locator('.tourism-map-external-link').getAttribute('href')).includes('/p/directions/'));
    await guest.locator('.tourism-map-location').filter({ hasText: '트라이볼' }).click();
    assert.ok((await guest.locator('.tourism-map-external-link').getAttribute('href')).includes('/p/search/'));
    assert.ok((await guest.locator('.tourism-map-credit').innerText()).includes('OpenStreetMap'));
    // Regression: markers 1/2/3 must be separate at narrow, mobile and desktop widths.
    // The language selector must not float over the map after scrolling into view.
    for (const width of [320, 390, 768, 1024, 1280, 1440]) {
      await guest.setViewportSize({ width, height: 820 });
      await guest.locator('.tourism-map-drawing').scrollIntoViewIfNeeded();
      const geometry = await guest.evaluate(() => {
        const el = document.querySelector('.tourism-map-drawing');
        const toolbar = document.querySelector('.guest-language-toolbar');
        const pins = ['central-park', 'tri-bowl', 'g-tower'].map(id => {
          const pin = document.querySelector(`.tourism-map-pin[data-spot-id="${id}"]`);
          const rect = pin.getBoundingClientRect();
          return { id, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, radius: Math.max(rect.width, rect.height) / 2 };
        });
        const mapRect = el.getBoundingClientRect();
        const toolbarRect = toolbar.getBoundingClientRect();
        const overlap = toolbarRect.left < mapRect.right && toolbarRect.right > mapRect.left &&
          toolbarRect.top < mapRect.bottom && toolbarRect.bottom > mapRect.top;
        return { pins, toolbarPosition: getComputedStyle(toolbar).position, overlap };
      });
      assert.equal(geometry.toolbarPosition, 'static', 'Language toolbar must remain in document flow');
      assert.equal(geometry.overlap, false, 'Language toolbar must not cover the diagram');
      for (let i = 0; i < geometry.pins.length; i++) for (let j = i + 1; j < geometry.pins.length; j++) {
        const a = geometry.pins[i], b = geometry.pins[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        assert.ok(distance > a.radius + b.radius + 7, `Overlapping sightseeing pins ${a.id} and ${b.id} at ${width}px: ${distance.toFixed(1)}px`);
      }
    }
    // Capture the actual rendered visitor guide, not a conceptual mockup.
    await guest.setViewportSize({ width: 1280, height: 900 });
    await guest.locator('.tourism-guide').screenshot({ path: path.join(output, 'tourism-guide-desktop-1280.png') });
    await guest.setViewportSize({ width: 390, height: 844 });
    await guest.locator('.tourism-guide').screenshot({ path: path.join(output, 'tourism-guide-mobile-390.png') });
    await guest.setViewportSize({ width: 320, height: 760 });
    await guest.locator('.tourism-guide').screenshot({ path: path.join(output, 'tourism-guide-small-mobile-320.png') });
    await guest.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await guest.locator('.airport-bus-guide').count(), 0);
    await guest.locator('.guest-category-grid').getByRole('button', { name: '관광', exact: true }).click();
    await waitCards(guest, 27);
    log('Guest: tourism landmarks and 6777 route, twelve departures and schedule-change warning');
    // Phase 2: hotel search must be separate from nearby-facility search and navigate to exact room guidance.
    assert.equal(await guest.locator('#nearby-facilities .guest-category-grid').getByRole('button', { name: '호텔 관련 시설' }).count(), 0);
    const hotelSearch = guest.locator('#hotel-information input[type="search"]');
    await hotelSearch.fill('와이파이');
    assert.ok((await guest.locator('.hotel-search-results').innerText()).includes('Wi-Fi'));
    await guest.locator('.hotel-search-list button').first().click();
    assert.equal(await guest.locator('.hotel-numbered-item').count(), 12);
    assert.ok((await guest.locator('#guest-hotel-detail').innerText()).includes('침대 옆'));
    await hotelSearch.fill('조식');
    assert.ok((await guest.locator('.hotel-search-results').innerText()).includes('35,000'));
    await hotelSearch.fill('zz-unknown-guest-phrase');
    assert.ok((await guest.locator('.hotel-search-results').innerText()).includes('검색 결과가 없습니다'));
    await hotelSearch.fill('');
    log('Phase 2 Guest: hotel search, 12 numbered room sections, empty hotel category hidden');
    const hotelCategories = guest.locator('#hotel-information .hotel-category-grid');
    await hotelCategories.getByRole('button', { name: '조식' }).click();
    assert.equal(await guest.locator('#guest-hotel-detail dt').filter({ hasText: '참고' }).count(), 0, 'Unrelated policy notes should not be repeated on breakfast');
    assert.ok((await guest.locator('#guest-hotel-detail').innerText()).includes('35,000'));
    await hotelCategories.getByRole('button', { name: '객실 이용' }).click();
    assert.ok((await guest.locator('#guest-hotel-detail').innerText()).includes('선반'));
    assert.ok((await guest.locator('#guest-hotel-detail').innerText()).includes('와인잔'));
    assert.ok((await guest.locator('#guest-hotel-detail').innerText()).includes('침대 옆'))
    assert.ok((await guest.locator('#guest-hotel-detail').innerText()).includes('반려동물'));
    assert.ok((await guest.locator('#hotel-information .information-notice').innerText()).includes('200,000'));
    log('Guest: hotel policies, smoke notice, front desk delivery pickup, no unrelated notes repeated');
    for (const width of [320, 390, 768, 1280]) {
      await guest.setViewportSize({ width, height: 820 });
      await noOverflow(guest);
      await guest.evaluate(() => window.scrollTo(0, 0));
      await guest.screenshot({ path: path.join(output, 'guest-' + width + '.png'), fullPage: true });
      await staff.setViewportSize({ width, height: 820 });
      await noOverflow(staff);
      await staff.evaluate(() => window.scrollTo(0, 0));
      await staff.screenshot({ path: path.join(output, 'staff-' + width + '.png'), fullPage: true });
    }
    log('Responsive: Guest and Staff no horizontal overflow at 320, 390, 768, 1024, 1280 and 1440px');

    await guestSearch.fill('수상택시');
    await waitCards(guest, 1);
    await guest.locator('#guest-facility-results .facility-card button').first().click();
    const taxi = dataset.facilities.find(x => x.id === 'songdo-central-park-water-taxi');
    const link = guest.locator('#guest-facility-detail .naver-map-link');
    assert.equal(await link.getAttribute('href'), taxi.naverMapUrl);
    assert.ok(taxi.naverMapUrl.includes('/walk?'));
    assert.equal(await link.getAttribute('target'), '_blank');
    assert.ok((await link.getAttribute('rel')).includes('noopener'));
    log('Map: West Boathouse walking URL preserved and opens without a web opener');

    await staff.reload();
    await staff.waitForSelector('.staff-quick-access');
    await staff.locator('.staff-quick-access-grid > div:first-child [data-shortcut="facility:songdo-timespace-complex"]').waitFor({state:'visible',timeout:15000});
    assert.equal(await staff.locator('.staff-quick-access-grid > div:first-child [data-shortcut="facility:songdo-timespace-complex"]').count(),1);
    assert.equal(await staff.locator('.staff-quick-access-grid > div:first-child [data-shortcut="script:airport-limousine-6777"]').count(),1);
    const persisted = await staff.evaluate(()=>JSON.parse(localStorage.getItem('cph:staff:shortcuts:v1')));
    assert.equal(persisted.favorites.length,2);
    assert.ok(persisted.recent.length<=5);
    assert.ok(persisted.recent.every(row=>typeof row.id==='string' && !('query' in row)));
    await staff.locator('.staff-quick-access [data-shortcut="facility:songdo-timespace-complex"]').first().click();
    assert.equal(await staff.getByRole('tab',{name:'주변 시설 안내'}).getAttribute('aria-selected'),'true');
    assert.ok((await staff.locator('#staff-facility-detail').innerText()).includes('송도 타임스페이스'));
    staff.once('dialog',dialog=>dialog.accept());
    await staff.locator('.staff-quick-access').getByRole('button',{name:'전체 초기화'}).click();
    assert.equal(await staff.locator('.staff-shortcut-list li').count(),0);
    assert.deepEqual(await staff.evaluate(()=>JSON.parse(localStorage.getItem('cph:staff:shortcuts:v1'))),{favorites:[],recent:[]});
    log('Staff STEP 5: reload persistence, shortcut navigation, ID-only storage and reset');
    admin = await context.newPage();
    await admin.goto(adminBase + '/');
    await admin.waitForSelector('.admin-records');
    assert.equal(await admin.locator('.admin-facility-list .admin-records li').count(), 27);
    log('Admin: all 27 records accessible on the independent management screen');
    await admin.locator('.admin-navigation').getByRole('button',{name:'타임스페이스 음식점'}).click();
    const tenantAdmin = admin.locator('.admin-timespace-page');
    assert.equal(await tenantAdmin.locator('.admin-records li').count(),15);
    await tenantAdmin.getByRole('button',{name:'편집 hanmaeum'}).click();
    await tenantAdmin.locator('#tenant-rooms').fill('209~210');
    await tenantAdmin.getByRole('button',{name:'매장 작업 데이터 저장'}).click();
    assert.ok((await tenantAdmin.locator('.admin-records').innerText()).includes('209~210호'));
    const [download] = await Promise.all([
      admin.waitForEvent('download',{timeout:10000}),
      tenantAdmin.getByRole('button',{name:'timespaceTenants.json 다운로드'}).click()
    ]);
    assert.equal(download.suggestedFilename(),'timespaceTenants.json');
    const file = await download.path();
    const exported = JSON.parse(fs.readFileSync(file,'utf8'));
    assert.equal(exported.tenants.find(t=>t.id==='hanmaeum').rooms,'209~210');
    admin.once('dialog',dialog=>dialog.accept());
    await tenantAdmin.getByRole('button',{name:'파일 저장 확인'}).click();
    assert.ok((await tenantAdmin.locator('.admin-feedback').innerText()).includes('파일 다운로드 확인'));
    admin.once('dialog',dialog=>dialog.accept());
    await tenantAdmin.getByRole('button',{name:'영업 종료 hanmaeum'}).click();
    assert.ok((await tenantAdmin.locator('.admin-records').innerText()).includes('영업 종료'));
    await tenantAdmin.locator('#tenant-status-filter').selectOption('open');
    assert.equal(await tenantAdmin.locator('.admin-records li').count(),14);
    await admin.reload();
    await admin.waitForSelector('.admin-facility-list .admin-records');
    await admin.locator('.admin-navigation').getByRole('button',{name:'타임스페이스 음식점'}).click();
    assert.equal(await admin.locator('.admin-timespace-page .admin-records li').count(),15);
    assert.ok((await admin.locator('.admin-timespace-page .admin-records').innerText()).includes('205~208호'));
    log('Admin step3: 15-source tenant CRUD, edited JSON export, closure filtering and no changes after reload');
    assert.deepEqual(errors, [], errors.join('\n'));
    console.log('FINAL QA OK (' + passed.length + ' check groups)');
  } catch (e) {
    console.error('FINAL QA FAIL:', e.stack || e);
    for (const [name, page] of [['staff',staff], ['guest',guest], ['admin',admin]]) {
      if (page && !page.isClosed()) try { await page.screenshot({ path: path.join(output, 'FAIL-' + name + '.png'), fullPage: true }); } catch {}
    }
    process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
