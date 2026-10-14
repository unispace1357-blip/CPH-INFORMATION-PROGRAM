/* STEP 05 QA: real Chromium, with separate memory-only fixtures for error and policy cases. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const baseURL = process.env.CPH_UI_BASE_URL || 'http://127.0.0.1:5174';
const origin = new URL(baseURL).origin;
const artifactDir = process.env.CPH_UI_ARTIFACT_DIR || '/tmp/cph-step05-qa';
const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/facilities.json'), 'utf8'));
const sourceHotel = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/hotel.json'), 'utf8'));
const publicRecords = source.facilities.filter(item => item.isPublished);
const labels = { en: 'English', ko: '한국어', 'zh-CN': '简体中文', ja: '日本語' };
const results = [], errors = [], requests = [];
let MESSAGES, message, guestWalkingTime, guestVerificationDate;

function observe(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', text => { if (text.type() === 'error') errors.push(text.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => requests.push(request.url()));
}
async function count(page, expected) {
  await page.waitForFunction(value => document.querySelectorAll('.guest-result-list .facility-card').length === value, expected);
}
async function chooseLanguage(page, language) {
  await page.locator('.language-options').getByRole('button', { name: labels[language], exact: true }).click();
  await page.waitForFunction(language => document.documentElement.lang === language, language);
  assert.equal(await page.title(), MESSAGES[language].ui.documentTitle);
  assert.equal(await page.locator('.language-options button[aria-pressed="true"]').innerText(), labels[language]);
}
async function layout(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
  const clipped = await page.locator('h1,h2,h3,p,label,button,dd').evaluateAll(elements => elements.filter(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
  assert.deepEqual(clipped, [], 'Clipped text');
  const small = await page.locator('button, nav a, input[type="search"]').evaluateAll(elements => elements.filter(el => { const r = el.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).map(el => el.textContent));
  assert.deepEqual(small, [], 'Small targets');
}
async function selectFacility(page, record, language) {
  await page.locator(`#guest-result-${record.id}`).click();
  await page.waitForFunction(name => document.querySelector('#guest-detail-title')?.textContent === name, record.translations[language].name);
}
async function assertUi(page, language, expectedCount) {
  const m = MESSAGES[language];
  assert.ok(await page.getByRole('heading', { name: m.ui.welcomeTitle, level: 1, exact: true }).isVisible());
  for (const text of [m.ui.navHotel, m.ui.navNearby, m.ui.navSearch]) assert.ok(await page.getByRole('navigation').getByRole('link', { name: text, exact: true }).isVisible());
  assert.equal(await page.locator('.brand-caption').innerText(), m.ui.brandCaption);
  assert.equal(await page.locator('.language-selector legend').innerText(), m.ui.languageLabel);
  assert.ok(await page.getByRole('searchbox', { name: m.ui.searchLabel, exact: true }).isEditable());
  assert.equal(await page.getByRole('searchbox').getAttribute('placeholder'), m.ui.searchPlaceholder);
  assert.equal(await page.locator('#guest-facility-results .status-label').innerText(), message(language, 'resultCount', { count: expectedCount }));
  assert.equal(await page.locator('.site-footer .footer-title').innerText(), m.ui.footerTitle);
  assert.equal(await page.locator('.site-footer p').last().innerText(), m.ui.footerDescription);
  assert.ok(await page.getByText(m.ui.demoTitle, { exact: true }).isVisible());
  const hotelHasText = sourceHotel.checkInTime !== null || sourceHotel.checkOutTime !== null || Object.values(sourceHotel.translations[language]).some(value => value.trim());
  if (hotelHasText) assert.equal(await page.getByText(m.ui.hotelEmptyTitle, { exact: true }).count(), 0);
  else assert.ok(await page.getByText(m.ui.hotelEmptyTitle, { exact: true }).isVisible());
  assert.equal(await page.locator('a[href^="/staff"]').count(), 0);
  assert.deepEqual(await page.locator('#nearby-facilities .category-card').allTextContents(), Object.entries(m.categories).filter(([code]) => code !== 'atm').map(([, label]) => label));
  assert.deepEqual(await page.locator('.hotel-category-grid .category-card').allTextContents(), Object.values(m.hotelCategories));
  await layout(page);
}

async function assertHotelTopic(page, language, topic) {
  const m = MESSAGES[language];
  await page.locator(`#guest-hotel-${topic}`).click();
  await page.locator('#guest-hotel-detail h3').filter({ hasText: m.hotelCategories[topic] }).waitFor();
  const approved = sourceHotel.translations[language][topic];
  assert.deepEqual(await page.locator('.hotel-topic-text p').allTextContents(), approved.trim() ? approved.split('\n\n') : [m.ui.informationUnavailable]);
  const notes = sourceHotel.translations[language].notes;
  assert.deepEqual(await page.locator('#guest-hotel-detail .detail-facts > div:last-child dd p').allTextContents(), notes.trim() ? notes.split('\n\n') : [m.ui.informationUnavailable]);
  if (topic === 'checkIn' || topic === 'checkOut') {
    const expected = sourceHotel[topic === 'checkIn' ? 'checkInTime' : 'checkOutTime'] ?? m.ui.timeUnavailable;
    assert.equal(await page.locator('#guest-hotel-detail .detail-facts > div:first-child dd').innerText(), expected);
  }
  assert.equal(await page.locator('#guest-hotel-detail .verification-date').innerText(), guestVerificationDate(sourceHotel.lastVerifiedAt, language));
  await layout(page);
}

(async () => {
  ({ MESSAGES } = await import('../src/i18n/messages.ts'));
  ({ message, guestWalkingTime, guestVerificationDate } = await import('../src/i18n/formatters.ts'));
  const { guestFacilityDataset, emptyGuestHotel } = await import('./guest-test-fixtures.ts');
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CPH_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    for (const width of [320, 375, 390, 430, 768, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage(); observe(page);
      assert.equal((await page.goto(`${baseURL}/guest`)).status(), 200);
      await page.locator('.hotel-category-grid button:not([disabled])').first().waitFor();
      await count(page, publicRecords.length);
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      for (const language of ['en', 'ko', 'zh-CN', 'ja', 'en']) {
        await chooseLanguage(page, language);
        await assertUi(page, language, publicRecords.length);
        for (const topic of ['checkIn', 'checkOut', 'breakfast', 'parking', 'roomUsage']) await assertHotelTopic(page, language, topic);
        const record = publicRecords[0];
        assert.ok(await page.getByRole('article', { name: record.translations[language].name, exact: true }).isVisible());
        if (width === 390) {
          await page.evaluate(async () => { document.activeElement?.blur(); scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); scrollTo(0, 0); });
          await page.waitForFunction(() => scrollY === 0);
          await page.screenshot({ path: path.join(artifactDir, `guest-${language}-390.png`) });
        }
      }
      for (const topic of ['checkIn', 'checkOut', 'breakfast', 'parking', 'roomUsage']) {
        await page.locator(`#guest-hotel-${topic}`).click();
        await page.locator('#guest-hotel-detail h3').filter({ hasText: MESSAGES.en.hotelCategories[topic] }).waitFor();
        await assertHotelTopic(page, 'en', topic);
      }
      await chooseLanguage(page, 'ja');
      assert.equal(await page.locator('.hotel-category-grid button[aria-pressed="true"]').innerText(), MESSAGES.ja.hotelCategories.roomUsage);
      assert.equal(await page.locator('#guest-hotel-detail h3').innerText(), MESSAGES.ja.hotelCategories.roomUsage);
      await page.locator('#guest-hotel-detail').getByRole('button', { name: MESSAGES.ja.ui.closeDetails, exact: true }).click();
      assert.equal(await page.locator('#guest-hotel-detail h3').count(), 0);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'guest-hotel-roomUsage');
      const search = page.getByRole('searchbox');
      await search.fill('cafe'); await count(page, 1);
      const cafe = publicRecords.find(record => record.category === 'cafe');
      assert.ok(await page.getByRole('article', { name: cafe.translations.ja.name, exact: true }).isVisible());
      await page.locator('#nearby-facilities').getByRole('button', { name: MESSAGES.ja.categories.pharmacy, exact: true }).click();
      await count(page, 0);
      assert.ok(await page.getByRole('heading', { name: MESSAGES.ja.ui.resultNoneTitle, exact: true }).isVisible());
      await page.locator('#nearby-facilities').getByRole('button', { name: MESSAGES.ja.ui.allFacilities, exact: true }).click();
      await count(page, 1); await selectFacility(page, cafe, 'ja');
      for (const language of ['ko', 'en', 'zh-CN', 'ja']) {
        await chooseLanguage(page, language);
        assert.equal(await search.inputValue(), 'cafe');
        await page.waitForFunction(name => document.querySelector('#guest-detail-title')?.textContent === name, cafe.translations[language].name);
        assert.ok(await page.locator('.guest-detail-panel').getByText(guestWalkingTime(null, language), { exact: true }).isVisible());
        assert.equal(await page.locator('.guest-detail-panel .verification-date').innerText(), guestVerificationDate(null, language));
        assert.ok(await page.locator('.guest-detail-panel').getByText(MESSAGES[language].ui.informationUnavailable, { exact: true }).first().isVisible());
        assert.equal(await page.locator(`#guest-result-${cafe.id}`).getAttribute('aria-pressed'), 'true');
        await layout(page);
      }
      if (width === 390) { await page.locator('#guest-detail-title').scrollIntoViewIfNeeded(); await page.screenshot({ path: path.join(artifactDir, 'guest-detail-ja-390.png') }); }
      await page.locator('.guest-detail-panel').getByRole('button', { name: MESSAGES.ja.ui.closeDetails, exact: true }).click();
      assert.equal(await page.locator('#guest-detail-title').count(), 0);
      assert.equal(await page.evaluate(() => document.activeElement.id), `guest-result-${cafe.id}`);
      await search.fill('.*'); await count(page, 0);
      await page.getByRole('button', { name: MESSAGES.ja.ui.clearSearch, exact: true }).click();
      assert.equal(await search.inputValue(), ''); await count(page, publicRecords.length);
      for (const hidden of source.facilities.filter(record => !record.isPublished)) assert.equal(await page.getByText(hidden.translations.ja.name, { exact: true }).count(), 0);
      await page.getByRole('link', { name: MESSAGES.ja.ui.homeLabel, exact: true }).click();
      assert.equal(await page.locator('html').getAttribute('lang'), 'ja');
      await page.getByRole('button', { name: MESSAGES.ja.categories.cafe, exact: true }).focus();
      assert.equal(await page.getByRole('button', { name: MESSAGES.ja.categories.cafe, exact: true }).evaluate(el => getComputedStyle(el).outlineWidth), '3px');
      await page.keyboard.press('Enter'); await count(page, 1);
      await page.evaluate(() => { history.pushState({}, '', '/guest-qa-missing'); dispatchEvent(new PopStateEvent('popstate')); });
      await page.getByRole('heading', { name: MESSAGES.ja.ui.notFoundTitle, exact: true }).waitFor();
      await page.getByRole('link', { name: MESSAGES.ja.ui.returnGuest, exact: true }).click();
      await count(page, publicRecords.length);
      assert.equal(await page.locator('html').getAttribute('lang'), 'ja');
      assert.ok(await page.getByRole('heading', { name: MESSAGES.ja.ui.welcomeTitle, exact: true }).isVisible());
      const svg = await context.request.get(`${baseURL}/favicon.svg`), ico = await context.request.get(`${baseURL}/favicon.ico`);
      assert.equal(svg.status(), 200); assert.equal(ico.status(), 200);
      results.push(`PASS ${width}px: all 4 UI/data languages, 5 hotel topics, search/filter, selection retention, close/focus, unknown values, targets/overflow, hidden exclusion and favicon`);
      await context.close();
    }
    async function fixtureCase(label, { facilities, hotel, moduleFailure }, action) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
      if (facilities) await context.route(url => url.pathname === '/src/data/facilities.json', route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(facilities)};` }));
      if (hotel) await context.route(url => url.pathname === '/src/data/hotel.json', route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(hotel)};` }));
      if (moduleFailure) await context.route(url => url.pathname === '/src/data/hotelDataset.ts', route => route.fulfill({ contentType: 'application/javascript', body: "throw new Error('QA loading failure');" }));
      const page = await context.newPage(); observe(page);
      try { await page.goto(`${baseURL}/guest`); await action(page, context); results.push(`PASS ${label}`); }
      finally { await context.close(); }
    }
    await fixtureCase('bad hotel is isolated from Guest facilities and Staff search/copy', { hotel: { schemaVersion: 99 } }, async (page, context) => {
      await count(page, publicRecords.length);
      for (const language of ['en', 'ko', 'zh-CN', 'ja']) { await chooseLanguage(page, language); await page.getByText(MESSAGES[language].ui.hotelDataErrorTitle, { exact: true }).waitFor(); assert.ok(await page.getByRole('searchbox').isEditable()); }
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
      await page.evaluate(() => { history.pushState({}, '', '/staff'); dispatchEvent(new PopStateEvent('popstate')); }); await page.locator('.staff-result-list .facility-card').first().waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), 'ko');
      await page.getByRole('searchbox').fill('cafe');
      await page.waitForFunction(() => document.querySelectorAll('.facility-card').length === 1);
      await page.locator('.facility-card button').click();
      await page.getByRole('button', { name: '영어 문구 1 복사', exact: true }).click();
      await page.locator('.copy-status').getByText('복사 완료', { exact: true }).waitFor();
      await page.screenshot({ path: path.join(artifactDir, 'staff-regression-1280.png'), fullPage: true });
    });
    await fixtureCase('bad facilities are isolated from hotel; error messages localize', { facilities: { schemaVersion: 99 } }, async page => {
      await page.locator('.hotel-category-grid button:not([disabled])').first().waitFor();
      for (const language of ['en', 'ko', 'zh-CN', 'ja']) { await chooseLanguage(page, language); await page.getByText(MESSAGES[language].ui.facilityDataErrorTitle, { exact: true }).waitFor(); assert.ok(await page.getByRole('searchbox').isDisabled()); }
      await page.locator('#guest-hotel-checkIn').click();
      await page.locator('#guest-hotel-detail h3').filter({ hasText: MESSAGES.ja.hotelCategories.checkIn }).waitFor();
    });
    await fixtureCase('module loading failure does not replace hotel with fake data or block facilities', { moduleFailure: true }, async page => {
      await count(page, publicRecords.length); await page.getByText(MESSAGES.en.ui.hotelDataErrorTitle, { exact: true }).waitFor();
    });
    await fixtureCase('empty public facility dataset localizes', { facilities: { schemaVersion: 1, dataStatus: 'demo', facilities: [] } }, async page => {
      for (const language of ['en', 'ko', 'zh-CN', 'ja']) { await chooseLanguage(page, language); await page.getByRole('heading', { name: MESSAGES[language].ui.noFacilitiesTitle, exact: true }).waitFor(); }
    });
    await fixtureCase('empty hotel still localizes unknown information/times without inventing values', { hotel: emptyGuestHotel() }, async page => {
      await page.locator('.hotel-category-grid button:not([disabled])').first().waitFor();
      for (const language of ['en', 'ko', 'zh-CN', 'ja']) {
        await chooseLanguage(page, language); await page.getByText(MESSAGES[language].ui.hotelEmptyTitle, { exact: true }).waitFor();
        await page.locator('#guest-hotel-checkIn').click();
        assert.deepEqual(await page.locator('.hotel-topic-text p').allTextContents(), [MESSAGES[language].ui.informationUnavailable]);
        assert.equal(await page.locator('#guest-hotel-detail .detail-facts > div:first-child dd').innerText(), MESSAGES[language].ui.timeUnavailable);
      }
    });
    const qaFacilities = guestFacilityDataset(), qaHotel = emptyGuestHotel();
    for (const language of ['en', 'ko', 'zh-CN', 'ja']) {
      for (const field of Object.keys(qaHotel.translations[language])) qaHotel.translations[language][field] = `Fictional QA ${field} ${language}`;
      for (const field of ['description', 'address', 'openingHours', 'directions', 'notes']) qaFacilities.facilities[0].translations[language][field] = `Fictional QA ${field} ${language}`;
      qaFacilities.facilities[0].closedDays[language] = `Fictional QA closed days ${language}`;
    }
    qaHotel.checkInTime = '04:32'; qaHotel.checkOutTime = '05:43'; qaHotel.lastVerifiedAt = '2026-10-15';
    qaFacilities.facilities[0].walkingMinutes = 5; qaFacilities.facilities[0].lastVerifiedAt = '2026-10-15';
    await fixtureCase('registered hotel/facility text and shared values use selected language without fallbacks', { facilities: qaFacilities, hotel: qaHotel }, async page => {
      await count(page, 2);
      for (const language of ['en', 'ko', 'zh-CN', 'ja']) {
        await chooseLanguage(page, language);
        for (const topic of ['checkIn', 'checkOut', 'breakfast', 'parking', 'roomUsage']) { await page.locator(`#guest-hotel-${topic}`).click(); await page.getByText(`Fictional QA ${topic} ${language}`, { exact: true }).waitFor(); }
        await page.getByRole('searchbox').fill('Garden'); await count(page, 1);
        await selectFacility(page, qaFacilities.facilities[0], language);
        assert.ok(await page.locator('.guest-detail-panel').getByText(`Fictional QA address ${language}`, { exact: true }).isVisible());
        assert.ok(await page.locator('.guest-detail-panel').getByText(guestWalkingTime(5, language), { exact: true }).isVisible());
        assert.equal(await page.locator('.guest-detail-panel .verification-date').innerText(), guestVerificationDate('2026-10-15', language));
      }
    });
    await fixtureCase('production flags show confirmation notice, not a demo warning', { facilities: { ...qaFacilities, dataStatus: 'production' }, hotel: { ...qaHotel, dataStatus: 'production' } }, async page => {
      await count(page, 2); await page.getByText(MESSAGES.en.ui.productionNoticeTitle, { exact: true }).waitFor();
      assert.equal(await page.getByText(MESSAGES.en.ui.demoTitle, { exact: true }).count(), 0);
    });
    assert.deepEqual(errors, [], 'JavaScript/console/HTTP errors');
    assert.ok(requests.every(url => new URL(url).origin === origin), 'Remote API/resource requested');
    results.push('PASS zero JS/console/HTTP errors or remote API/resource requests; memory-only QA fixtures');
    fs.writeFileSync(path.join(artifactDir, 'guest-results.txt'), results.join('\n') + '\n');
    console.log(results.join('\n'));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
