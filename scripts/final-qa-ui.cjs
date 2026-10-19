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
  const dims = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(dims.scroll <= dims.width + 2, 'horizontal overflow: ' + JSON.stringify(dims));
};
const names = (items, lang = 'ko') => items.map(x => x.translations[lang].name);
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, reducedMotion: 'reduce' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(base).origin });
  context.on('page', p => {
    p.on('pageerror', e => errors.push(e.message));
    p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  });
  await context.route(/https:\/\/(?:m\.)?map\.naver\.com\//, r => r.fulfill({ contentType: 'text/html', body: '<p>Intercepted: no live route checked</p>' }));
  let staff, guest, admin;
  try {
    assert.equal(dataset.facilities.length, 26);
    assert.equal(scripts.length, 31);
    staff = await context.newPage();
    await staff.goto(base + '/staff');
    await staff.waitForSelector('#frontdesk-search-title');
    assert.equal(await staff.getByRole('tab', { name: '호텔 업무 영어 응대' }).getAttribute('aria-selected'), 'true');
    await waitCards(staff, 31, '.frontdesk-script-card');
    assert.deepEqual((await staff.locator('.frontdesk-script-title').allTextContents()).slice(0, 2), scripts.slice(0, 2).map(s => s.title));
    assert.ok((await staff.locator('.information-notice').allTextContents()).some(t => t.includes('금연')));
    const hotel = staff.locator('#staff-hotel-panel');
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
    await scriptSearch.fill('');
    await waitCards(staff, 31, '.frontdesk-script-card');
    log('Staff: 31 scripts, smoking priority, parking, delivery, airport bus and untouched English clipboard');

    await staff.getByRole('tab', { name: '주변 시설 안내' }).click();
    await waitCards(staff, 26);
    const staffPanel = staff.locator('#staff-facilities-panel');
    assert.deepEqual(await staffPanel.locator('.facility-card h3').allTextContents(), names(dataset.facilities));
    assert.equal(await staffPanel.locator('.facility-menu-summary').count(), 14);
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
    await fSearch.fill('맥주 약국');
    await waitCards(staff, 0);
    await fSearch.fill('더몰트하우스');
    await waitCards(staff, 1);
    await staffPanel.locator('.facility-card button').click();
    assert.ok((await staffPanel.locator('.staff-detail-intro').innerText()).includes('더몰트하우스'));
    assert.ok((await staffPanel.locator('.english-phrase-text').first().innerText()).includes('Typical menu items'));
    const malt = dataset.facilities.find(f => f.id === 'malt-house-incheon-songdo');
    await staffPanel.getByRole('button', { name: '영어 문구 1 복사' }).click();
    await staff.waitForFunction(t => navigator.clipboard.readText().then(x => x === t), malt.englishPhrases[0]);
    await staffPanel.getByRole('button', { name: '전체 문구 복사' }).click();
    await staff.waitForFunction(t => navigator.clipboard.readText().then(x => x === t), malt.englishPhrases.join('\n'));
    log('Staff: all 26 names, 14 menu summaries, aliases, AND search, phonetics excluded from copy');

    guest = await context.newPage();
    guest.on('response', response => { if (response.status() >= 400) errors.push('Guest HTTP ' + response.status() + ' ' + response.url()); });
    await guest.goto(base + '/guest');
    await waitCards(guest, 26);
    assert.equal(await guest.locator('.english-guide').count(), 0);
    assert.ok((await guest.locator('#hotel-information .information-notice').allTextContents()).some(t => /smoking|금연/i.test(t)));
    const guestSearch = guest.locator('#guest-search input[type="search"]');
    for (const [language, label] of Object.entries(languages)) {
      await guest.locator('.language-options').getByRole('button', { name: label, exact: true }).click();
      assert.equal(await guest.locator('html').getAttribute('lang'), language);
      assert.deepEqual(await guest.locator('.facility-card h3').allTextContents(), names(dataset.facilities, language));
      assert.equal(await guest.locator('.facility-menu-summary').count(), 14);
      const expectedDescriptions = dataset.facilities.filter(f => f.category === 'dining' || f.category === 'cafe').map(f => f.translations[language].description);
      assert.deepEqual(await guest.locator('.facility-menu-summary').allTextContents(), expectedDescriptions);
      await guestSearch.fill(language === 'ko' ? '커피숍' : 'coffee');
      await guest.waitForTimeout(100);
      assert.ok(await guest.locator('.facility-card h3').count() >= 3);
      await guestSearch.fill('');
      await waitCards(guest, 26);
      await guest.locator('#guest-facility-results .facility-card button').first().click();
      assert.ok(await guest.locator('#guest-detail-title').isVisible());
      await guest.locator('#guest-facility-detail button').first().click();
      assert.equal(await guest.locator('#guest-detail-title').count(), 0);
      if (await guest.locator('.facility-card').count() === 26) { await guest.setViewportSize({ width: 390, height: 844 }); await guest.evaluate(() => window.scrollTo(0, 0)); await guest.screenshot({ path: path.join(output, 'guest-language-' + language + '.png'), fullPage: false }); }
      log('Guest: ' + language + ' 26 localized facility names, all 14 menus, search, detail and close');
    }
    await guest.locator('.language-options').getByRole('button', { name: '한국어', exact: true }).click();
    await guest.locator('.guest-category-grid').getByRole('button', { name: '교통', exact: true }).click();
    assert.equal(await guest.locator('.airport-bus-guide .local-guide-departures time').count(), 12);
    assert.ok((await guest.locator('.airport-bus-guide').innerText()).includes('운행정보 변경 가능'));
    await guest.locator('.guest-category-grid').getByRole('button', { name: '관광', exact: true }).click();
    assert.equal(await guest.locator('.tourism-guide .tourism-map-location').count(), 6);
    assert.equal(await guest.locator('.tourism-guide .tourism-map-pin').count(), 6);
    assert.equal(await guest.locator('.tourism-guide [data-map-kind="original-schematic"]').count(), 1);
    await guest.locator('.tourism-map-location').filter({ hasText: 'G타워' }).click();
    assert.match((await guest.locator('.tourism-map-detail').innerText()), /33층/);
    assert.ok((await guest.locator('.tourism-map-detail a').getAttribute('href')).includes('/p/directions/'));
    await guest.locator('.tourism-map-location').filter({ hasText: '트라이볼' }).click();
    assert.ok((await guest.locator('.tourism-map-detail a').getAttribute('href')).includes('/p/search/'));
    assert.ok((await guest.locator('.tourism-map-credit').innerText()).includes('OpenStreetMap'));
    // Regression: markers 1/2/3 must be separate at narrow, mobile and desktop widths.
    // The language selector must not float over the map after scrolling into view.
    for (const width of [320, 390, 768, 1280]) {
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
    await waitCards(guest, 26);
    log('Guest: tourism landmarks and 6777 route, twelve departures and schedule-change warning');
    const hotelCategories = guest.locator('#hotel-information .hotel-category-grid');
    await hotelCategories.getByRole('button', { name: '조식' }).click();
    assert.equal(await guest.locator('#guest-hotel-detail dt').filter({ hasText: '참고' }).count(), 0, 'Unrelated policy notes should not be repeated on breakfast');
    await hotelCategories.getByRole('button', { name: '객실 이용' }).click();
    assert.ok((await guest.locator('#guest-hotel-detail').innerText()).includes('선반'));
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
    log('Responsive: Guest and Staff no horizontal overflow at 320, 390, 768 and 1280px');

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

    admin = await context.newPage();
    await admin.goto(adminBase + '/');
    await admin.waitForSelector('.admin-records');
    assert.equal(await admin.locator('.admin-records li').count(), 26);
    log('Admin: all 26 records accessible on the independent management screen');
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
