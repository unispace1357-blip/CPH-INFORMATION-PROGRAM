/* Optional focused MVP QA; Playwright lives outside app dependencies. No live map requests. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const baseURL = process.env.CPH_UI_BASE_URL || 'http://127.0.0.1:5173';
const publicTest = process.env.CPH_UI_PUBLIC_TEST === '1';
const routeURL = route => `${baseURL}${publicTest ? '/#' : ''}${route}`;
const adminURL = process.env.CPH_ADMIN_BASE_URL || 'http://127.0.0.1:5190';
const artifactDir = process.env.CPH_UI_ARTIFACT_DIR || '/tmp/cph-mvp-qa';
const files = ['facilities.json', 'hotel.json'].map(name => path.join(__dirname, '../src/data', name));
const original = files.map(file => fs.readFileSync(file));
const data = JSON.parse(original[0]);
const languages = { en: 'English', ko: '한국어', 'zh-CN': '简体中文', ja: '日本語' };
const results = [], errors = [], requests = [], interceptedMaps = [];
const visible = data.facilities.filter(item => item.isPublished);
const ordered = visible;
async function count(page, selector, expected) {
  await page.waitForFunction(({ selector, expected }) => document.querySelectorAll(selector).length === expected, { selector, expected });
}
async function layout(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal overflow');
}
async function download(page) {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '전체 시설 JSON 다운로드', exact: true }).click();
  const file = await pending;
  assert.equal(await file.failure(), null);
  return JSON.parse(fs.readFileSync(await file.path(), 'utf8'));
}
async function upload(page, candidate) {
  const pending = page.waitForEvent('dialog');
  const uploading = page.getByLabel('시설 JSON 불러오기', { exact: true }).setInputFiles({ name: 'facilities.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(candidate)) });
  const dialog = await pending;
  assert.equal(dialog.type(), 'confirm');
  await dialog.accept();
  await uploading;
}
async function mapPopup(page, link, url) {
  assert.equal(await link.getAttribute('href'), url);
  assert.equal(await link.getAttribute('target'), '_blank');
  assert.deepEqual((await link.getAttribute('rel')).split(' ').sort(), ['noopener', 'noreferrer']);
  const pending = page.waitForEvent('popup');
  await link.click();
  const popup = await pending;
  await popup.waitForLoadState('domcontentloaded');
  assert.equal(popup.url(), new URL(url).href);
  assert.equal(await popup.evaluate(() => window.opener === null), true);
  await popup.close();
}
(async () => {
  const { MESSAGES } = await import('../src/i18n/messages.ts');
  const { FACILITY_CATEGORY_OPTIONS } = await import('../src/config/uiCategories.ts');
  const { USER_NAVER_PLACE_ROUTE } = await import('./naver-place-fixture.ts');
  assert.equal(data.facilities.length, 23);
  assert.equal(visible.length, 23);
  const browser = await chromium.launch({ executablePath: process.env.CPH_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, reducedMotion: 'reduce' });
  await context.route(url => url.hostname === 'map.naver.com', route => {
    interceptedMaps.push(route.request().url());
    return route.fulfill({ contentType: 'text/html', body: '<title>Local QA interception</title><p>No live route checked.</p>' });
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(baseURL).origin });
  context.on('request', request => requests.push(request.url()));
  context.on('page', page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`); });
  });
  try {
    fs.mkdirSync(artifactDir, { recursive: true });
    const staff = await context.newPage();
    if (publicTest) {
      await staff.goto(`${baseURL}/`);
      await staff.waitForURL('**/#/staff');
      await staff.reload();
      await count(staff, '.facility-card', visible.length);
      await staff.goto(routeURL('/not-a-route'));
      await staff.getByText('404', { exact: true }).waitFor();
      await staff.goto(`${baseURL}/staff/`);
      await staff.waitForURL('**/#/staff');
    } else await staff.goto(routeURL('/staff'));
    await count(staff, '.facility-card', visible.length);
    assert.deepEqual(await staff.locator('.facility-card h3').allTextContents(), ordered.map(f => f.translations.ko.name));
    assert.equal(await staff.locator('.staff-intro').count(), 1);
    assert.equal(await staff.locator('.staff-release-details').count(), 1);
    assert.equal(await staff.locator('.staff-category-grid .category-card').count(), 1 + 9);
    assert.ok(await staff.getByText(publicTest ? 'Information is being collected and verified.' : '프론트 테스트용 미리보기', { exact: true }).isVisible());
    assert.equal(await staff.locator('.staff-category-grid').getByRole('button', { name: 'ATM', exact: true }).count(), 0);
    for (const item of visible) {
      await staff.locator('.staff-category-grid').getByRole('button', { name: '전체', exact: true }).click();
      for (const query of [item.translations.ko.name, item.translations.en.name]) {
        await staff.getByRole('searchbox').fill(query);
        await count(staff, '.facility-card', 1);
        assert.equal(await staff.locator('.facility-card h3').innerText(), item.translations.ko.name);
      }
      await staff.locator('.staff-category-grid').getByRole('button', { name: FACILITY_CATEGORY_OPTIONS.find(category => category.code === item.category).staffLabel, exact: true }).click();
      await count(staff, '.facility-card', 1);
      await staff.locator('.facility-card button').click();
      await staff.locator('#staff-detail-title').waitFor();
      assert.equal(await staff.locator('#staff-detail-title').innerText(), item.translations.ko.name);
      assert.equal(await staff.locator('.detail-facts dd').nth(0).innerText(), item.translations.ko.address);
      assert.equal(await staff.locator('.detail-facts dd').nth(1).innerText(), item.translations.ko.openingHours || '영업시간 미확인');
      if (item.translations.ko.directions) {
        assert.equal(await staff.locator('.detail-facts dd').nth(4).innerText(), item.translations.ko.directions);
        assert.equal(await staff.locator('.english-directions p').innerText(), item.translations.en.directions);
      }
      assert.deepEqual(await staff.locator('.english-phrase-text').allTextContents(), item.englishPhrases);
      assert.ok(await staff.locator('.english-guide').evaluate(el => !!el.compareDocumentPosition(document.querySelector('.staff-facility-metadata')) && (el.compareDocumentPosition(document.querySelector('.staff-facility-metadata')) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0), 'English guidance must appear before secondary facility metadata');
      assert.ok(await staff.locator('.staff-walking-summary').isVisible());
      assert.ok(await staff.locator('.english-phrase-text').first().evaluate(node => parseFloat(getComputedStyle(node).fontSize) >= 17), 'English scripts must remain legible at 17px or larger');
      assert.ok(await staff.locator('.english-phrase-meaning').first().evaluate(node => parseFloat(getComputedStyle(node).fontSize) >= 15), 'Korean script meanings must remain legible at 15px or larger');
      assert.deepEqual(await staff.locator('.english-phrase-label').allTextContents(), ['기본 안내', '상세 안내']);
      assert.deepEqual(await staff.locator('.english-phrase-meaning').allTextContents(), item.englishPhraseMeanings);
      assert.deepEqual(await staff.locator('.english-phrases li').first().locator('p').allTextContents(), [item.englishPhrases[0], item.englishPhraseMeanings[0]]);
      for (const [index, phrase] of item.englishPhrases.entries()) {
        await staff.getByRole('button', { name: `영어 문구 ${index + 1} 복사`, exact: true }).click();
        await staff.waitForFunction(expected => navigator.clipboard.readText().then(text => text === expected), phrase);
      }
      await staff.getByRole('button', { name: '전체 문구 복사', exact: true }).click();
      await staff.waitForFunction(expected => navigator.clipboard.readText().then(text => text === expected), item.englishPhrases.join('\n'));
      if (item.naverMapUrl) {
        assert.ok(await staff.locator('.naver-map-link').isVisible());
        assert.equal(await staff.locator('.naver-map-link').getAttribute('href'), item.naverMapUrl);
      } else assert.ok(await staff.locator('.naver-map-disabled').isDisabled());
      await layout(staff);
    }
    await staff.getByRole('searchbox').fill('');
    await staff.locator('.staff-category-grid').getByRole('button', { name: '전체', exact: true }).click();
    await count(staff, '.facility-card', visible.length);
    await staff.screenshot({ path: path.join(artifactDir, 'staff-desktop.png'), fullPage: true });
    results.push('PASS Staff 1280px: 23 basic/detail English scripts with Korean meanings in order, individual/full clipboard contains only English, facility search and original information retained');

    const guest = await context.newPage();
    await guest.setViewportSize({ width: 390, height: 844 });
    await guest.goto(publicTest ? `${baseURL}/guest/` : `${baseURL}/`);
    await guest.waitForURL('**/guest');
    await count(guest, '.facility-card', visible.length);
    for (const width of [320, 390]) {
      await guest.setViewportSize({ width, height: 844 });
      for (const link of await guest.locator('.guest-navigation a').all()) {
        assert.equal(await link.evaluate(node => getComputedStyle(node).whiteSpace), 'nowrap', 'guest navigation must keep labels on one line');
        assert.ok(await link.evaluate(node => parseFloat(getComputedStyle(node).fontSize) >= 15), 'guest navigation text must be at least 15px');
        assert.ok(await link.evaluate(node => node.scrollWidth <= node.clientWidth), 'guest navigation labels must fit');
      }
      await layout(guest);
    }
    await guest.setViewportSize({ width: 390, height: 844 });
    assert.equal(await guest.locator('a[href^="/staff"]').count(), 0);
    assert.equal(await guest.locator('.english-guide').count(), 0);
    assert.ok((await guest.request.get(`${baseURL}/favicon.svg`)).ok());
    if (publicTest) {
      await guest.reload();
      await count(guest, '.facility-card', visible.length);
      for (const link of await guest.locator('.guest-navigation a').all()) {
        await link.click();
        assert.equal(new URL(guest.url()).hash, '#/guest');
      }
      await guest.getByRole('link', { name: MESSAGES.en.ui.skipContent, exact: true }).focus();
      await guest.keyboard.press('Enter');
      assert.equal(new URL(guest.url()).hash, '#/guest');
      assert.equal(await guest.locator('#main-content').evaluate(node => node === document.activeElement), true);
    }
    for (const [language, label] of Object.entries(languages)) {
      const m = MESSAGES[language];
      await guest.locator('.language-options').getByRole('button', { name: label, exact: true }).click();
      assert.equal(await guest.locator('html').getAttribute('lang'), language);
      assert.deepEqual(await guest.locator('.facility-card h3').allTextContents(), ordered.map(f => f.translations[language].name));
      for (const item of visible) {
        await guest.locator('.guest-category-grid').getByRole('button', { name: m.categories[item.category], exact: true }).click();
        await guest.getByRole('searchbox').fill(item.translations[language].name);
        await count(guest, '.facility-card', 1);
        await guest.locator('.facility-card button').click();
        assert.equal(await guest.locator('#guest-detail-title').innerText(), item.translations[language].name);
        assert.equal(await guest.locator('.detail-facts dd').nth(0).innerText(), item.translations[language].address);
        assert.equal(await guest.locator('.detail-facts dd').nth(1).innerText(), item.translations[language].openingHours || m.ui.informationUnavailable);
        if (item.translations[language].directions) assert.equal(await guest.locator('.detail-facts dd').nth(4).innerText(), item.translations[language].directions);
        if (item.naverMapUrl) {
          assert.ok(await guest.locator('.naver-map-link').isVisible());
          assert.equal(await guest.locator('.naver-map-link').getAttribute('href'), item.naverMapUrl);
        } else assert.ok(await guest.locator('.naver-map-disabled').isDisabled());
        await layout(guest);
        await guest.getByRole('button', { name: m.ui.closeDetails, exact: true }).click();
        await guest.getByRole('searchbox').fill('');
        await guest.getByRole('button', { name: m.ui.allFacilities, exact: true }).click();
        await count(guest, '.facility-card', visible.length);
      }
      await guest.locator('.guest-category-grid').getByRole('button', { name: m.categories.transportation, exact: true }).click();
      await count(guest, '.facility-card', visible.filter(item => item.category === 'transportation').length);
      assert.ok(await guest.getByText(m.ui.airportBusPending, { exact: true }).isVisible());
      await count(guest, '.pending-transit-notice button', 2);
      assert.equal(await guest.locator('.pending-transit-notice a').count(), 0);
      for (const button of await guest.locator('.pending-transit-notice button').all()) assert.ok(await button.isDisabled());
      await guest.getByRole('button', { name: m.ui.allFacilities, exact: true }).click();
      await count(guest, '.facility-card', visible.length);
    }
    await guest.screenshot({ path: path.join(artifactDir, 'guest-mobile.png'), fullPage: true });
    results.push('PASS Guest 390px: all 23 real facilities in four languages, category+search+detail, no fictional records/staff menu, no horizontal overflow, airport bus pending, maps unavailable');

    const admin = await context.newPage();
    await admin.goto(adminURL);
    await count(admin, '.admin-records li', data.facilities.length);
    for (const item of data.facilities) {
      await admin.getByLabel('시설명 검색', { exact: true }).fill(item.translations.ko.name);
      await count(admin, '.admin-records li', 1);
      await admin.getByRole('button', { name: `편집 ${item.id}`, exact: true }).click();
      for (const [index, title] of ['기본 안내', '상세 안내'].entries()) {
        assert.equal(await admin.getByLabel(`${title} 영어`, { exact: true }).inputValue(), item.englishPhrases[index]);
        assert.equal(await admin.getByLabel(`${title} 한국어 뜻`, { exact: true }).inputValue(), item.englishPhraseMeanings[index]);
      }
      assert.equal(await admin.getByLabel('공개 시설로 표시', { exact: true }).isChecked(), item.isPublished);
      for (const [label, value] of [['네이버 지도 길찾기 URL', item.naverMapUrl ?? ''], ['마지막 확인일', item.lastVerifiedAt ?? ''], ['예상 도보시간 (분)', item.walkingMinutes == null ? '' : String(item.walkingMinutes)]]) assert.equal(await admin.getByLabel(label, { exact: true }).inputValue(), value);
      for (const [language, label] of Object.entries(languages)) {
        await admin.getByRole('group', { name: '편집 언어', exact: true }).getByRole('button', { name: label, exact: true }).click();
        for (const [label, field] of [['시설명','name'],['시설 설명','description'],['주소','address'],['영업시간','openingHours'],['이동 안내','directions'],['참고 사항','notes']]) assert.equal(await admin.getByLabel(label, { exact: true }).inputValue(), item.translations[language][field]);
        assert.equal(await admin.getByLabel('휴무일', { exact: true }).inputValue(), item.closedDays[language]);
      }
    }
    await admin.getByLabel('시설명 검색', { exact: true }).fill('');
    const item = data.facilities[0];
    await admin.getByRole('button', { name: `편집 ${item.id}`, exact: true }).click();
    await admin.getByRole('button', { name: '영어 응대 문구 1 아래로', exact: true }).click();
    assert.equal(await admin.getByLabel('기본 안내 영어', { exact: true }).inputValue(), item.englishPhrases[1]);
    assert.equal(await admin.getByLabel('기본 안내 한국어 뜻', { exact: true }).inputValue(), item.englishPhraseMeanings[1]);
    await admin.getByRole('button', { name: '영어 응대 문구 2 위로', exact: true }).click();
    await admin.getByRole('button', { name: '영어 응대 문구 추가', exact: true }).click();
    await admin.getByLabel('영어 응대 문구 3 영어', { exact: true }).fill('Temporary additional English.');
    await admin.getByLabel('영어 응대 문구 3 한국어 뜻', { exact: true }).fill('임시 추가 해석');
    await admin.getByRole('button', { name: '영어 응대 문구 3 삭제', exact: true }).click();
    assert.equal(await admin.getByLabel('상세 안내 영어', { exact: true }).inputValue(), item.englishPhrases[1]);
    assert.equal(await admin.getByLabel('상세 안내 한국어 뜻', { exact: true }).inputValue(), item.englishPhraseMeanings[1]);
    await admin.getByRole('group', { name: '편집 언어', exact: true }).getByRole('button', { name: '한국어', exact: true }).click();
    const edited = structuredClone(data);
    edited.facilities[0].englishPhrases = ['Temporary basic English.', 'Temporary detailed English.'];
    edited.facilities[0].englishPhraseMeanings = ['임시 기본 해석', '임시 상세 해석'];
    for (const [index, title] of ['기본 안내', '상세 안내'].entries()) {
      await admin.getByLabel(`${title} 영어`, { exact: true }).fill(edited.facilities[0].englishPhrases[index]);
      await admin.getByLabel(`${title} 한국어 뜻`, { exact: true }).fill(edited.facilities[0].englishPhraseMeanings[index]);
    }
    edited.facilities[0].translations.ko.openingHours += '\n[temporary QA edit]';
    // Transient browser-memory compatibility/security case; never register this route in source data.
    edited.facilities[0].naverMapUrl = USER_NAVER_PLACE_ROUTE;
    await admin.getByLabel('영업시간', { exact: true }).fill(edited.facilities[0].translations.ko.openingHours);
    await admin.getByLabel('네이버 지도 길찾기 URL', { exact: true }).fill(USER_NAVER_PLACE_ROUTE);
    await admin.getByRole('button', { name: '편집 내용 저장', exact: true }).click();
    await mapPopup(admin, admin.getByRole('link', { name: '등록 링크 확인', exact: true }), USER_NAVER_PLACE_ROUTE);
    await admin.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
    assert.deepEqual(await download(admin), edited);
    await upload(admin, edited);
    assert.deepEqual(await download(admin), edited);
    await admin.getByRole('button', { name: '시설 관리', exact: true }).click();
    await admin.getByRole('button', { name: `편집 ${item.id}`, exact: true }).click();
    assert.equal(await admin.getByLabel('영업시간', { exact: true }).inputValue(), edited.facilities[0].translations.ko.openingHours);
    for (const [index, title] of ['기본 안내', '상세 안내'].entries()) {
      assert.equal(await admin.getByLabel(`${title} 영어`, { exact: true }).inputValue(), edited.facilities[0].englishPhrases[index]);
      assert.equal(await admin.getByLabel(`${title} 한국어 뜻`, { exact: true }).inputValue(), edited.facilities[0].englishPhraseMeanings[index]);
    }
    await admin.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
    await upload(admin, data);
    assert.deepEqual(await download(admin), data);
    await admin.getByRole('button', { name: '데이터 검증', exact: true }).click();
    assert.ok(await admin.getByRole('heading', { name: '시설 개발 데이터 검증 · PASS', exact: true }).isVisible());
    assert.ok(await admin.getByRole('heading', { name: '현재 운영 배포 검증 · FAIL', exact: true }).isVisible());
    results.push('PASS Admin: all 23 records, four-language values/visibility/unknown fields, edit/save/download/reimport retains change, original restored, demo deployment blocked');

    // Preserve shared-link security coverage without repeating old per-STEP browser suites.
    const fixture = structuredClone(data);
    fixture.facilities[0].englishPhrases = edited.facilities[0].englishPhrases;
    fixture.facilities[0].englishPhraseMeanings = edited.facilities[0].englishPhraseMeanings;
    fixture.facilities[0].naverMapUrl = USER_NAVER_PLACE_ROUTE;
    await context.route(url => url.pathname === '/src/data/facilities.json', route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(fixture)};` }));
    const mapPage = await context.newPage();
    for (const audience of ['staff', 'guest']) {
      await mapPage.goto(routeURL(`/${audience}`));
      await count(mapPage, '.facility-card', visible.length);
      await mapPage.getByRole('searchbox').fill(data.facilities[0].translations.ko.name);
      await count(mapPage, '.facility-card', 1);
      await mapPage.locator('.facility-card button').click();
      if (audience === 'staff') {
        const expected = publicTest ? data.facilities[0] : fixture.facilities[0];
        assert.deepEqual(await mapPage.locator('.english-phrase-text').allTextContents(), expected.englishPhrases);
        assert.deepEqual(await mapPage.locator('.english-phrase-meaning').allTextContents(), expected.englishPhraseMeanings);
        await mapPage.getByRole('button', { name: '전체 문구 복사', exact: true }).click();
        await mapPage.waitForFunction(expected => navigator.clipboard.readText().then(text => text === expected), expected.englishPhrases.join('\n'));
      } else assert.equal(await mapPage.locator('.english-guide').count(), 0);
      await mapPopup(mapPage, mapPage.locator('.naver-map-link'), publicTest ? data.facilities[0].naverMapUrl : USER_NAVER_PLACE_ROUTE);
    }
    assert.equal(interceptedMaps.length, 3);
    results.push('PASS Admin/Staff/Guest PLACE_POI links: original URL preserved, new tab with noopener/noreferrer and null opener. Three navigations intercepted locally; live Naver service NOT verified.');
    assert.deepEqual(errors, []);
    const origins = [new URL(baseURL).origin, new URL(adminURL).origin];
    assert.ok(requests.every(url => origins.includes(new URL(url).origin) || interceptedMaps.includes(url)), 'unexpected external request');
    files.forEach((file, index) => assert.deepEqual(fs.readFileSync(file), original[index]));
    results.push('PASS zero JavaScript/console/HTTP errors or unhandled external requests; QA did not modify source JSON. Live maps/devices/other browsers not tested.');
    fs.writeFileSync(path.join(artifactDir, 'results.txt'), results.join('\n') + '\n');
    console.log(results.join('\n'));
  } finally { await context.close(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
