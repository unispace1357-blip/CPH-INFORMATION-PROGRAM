/* STEP 04 browser QA; Playwright comes from the separate QA environment. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const baseURL = process.env.CPH_UI_BASE_URL || 'http://127.0.0.1:5174';
const origin = new URL(baseURL).origin;
const artifacts = process.env.CPH_UI_ARTIFACT_DIR || '/tmp/cph-step04-qa';
const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/facilities.json'), 'utf8'));
const publicRecords = source.facilities.filter(item => item.isPublished);
const errors = [];
const requests = [];
const results = [];

function observe(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
  page.on('request', request => requests.push(request.url()));
}
async function visibleCount(page, count) {
  await page.waitForFunction(expected => document.querySelectorAll('.facility-card').length === expected, count);
  assert.equal(await page.locator('.facility-card').count(), count);
}
async function noOverflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(await page.locator('h1,h2,h3,p,label,button,dd').evaluateAll(elements => elements.filter(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.textContent)), []);
}
async function loadStaff(page) {
  assert.equal((await page.goto(`${baseURL}/staff`)).status(), 200);
  await page.locator('.staff-category-grid button:not([disabled])').first().waitFor();
}
async function selectRecord(page, name) {
  await page.getByRole('article', { name, exact: true }).getByRole('button').click();
  await page.locator('#staff-detail-title').filter({ hasText: name }).waitFor();
  assert.equal(await page.locator('#staff-detail-title').innerText(), name);
}

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CPH_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    for (const width of [320, 390, 768, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
      const page = await context.newPage(); observe(page);
      await loadStaff(page);
      await visibleCount(page, publicRecords.length);
      assert.ok(await page.getByText('개발용 가상 데이터 · 실제 시설 정보가 아닙니다', { exact: true }).isVisible());
      for (const record of source.facilities.filter(item => !item.isPublished)) assert.equal(await page.getByText(record.translations.ko.name, { exact: true }).count(), 0);
      const search = page.getByRole('searchbox', { name: '시설명 또는 키워드' });
      assert.ok(await search.isEditable());
      for (const query of ['사우나', 'SAUNA', '  sauna  ', '카페', 'cafe', 'ATM']) {
        await search.fill(query); await visibleCount(page, 1);
      }
      await search.fill('.*'); await visibleCount(page, 0);
      assert.ok(await page.getByRole('heading', { name: '검색 결과가 없습니다.', exact: true }).isVisible());
      await page.getByRole('button', { name: '검색어 지우기', exact: true }).click();
      assert.equal(await search.inputValue(), ''); await visibleCount(page, publicRecords.length);
      await page.getByRole('button', { name: '카페', exact: true }).click(); await visibleCount(page, 1);
      assert.equal(await page.getByRole('button', { name: '카페', exact: true }).getAttribute('aria-pressed'), 'true');
      await search.fill('atm'); await visibleCount(page, 0);
      await page.getByRole('button', { name: '검색어 지우기', exact: true }).click(); await visibleCount(page, 1);
      const cafe = publicRecords.find(item => item.category === 'cafe');
      await selectRecord(page, cafe.translations.ko.name);
      if (width < 1000) assert.equal(await page.evaluate(() => document.activeElement.id), 'staff-detail-title');
      const details = page.locator('#staff-facility-detail');
      assert.ok(await details.getByText('영업시간 미확인', { exact: true }).isVisible());
      assert.ok(await details.getByText('도보시간 미확인', { exact: true }).isVisible());
      assert.ok(await details.getByText('정보 확인 전', { exact: true }).isVisible());
      await page.getByRole('button', { name: '영어 문구 1 복사', exact: true }).click();
      await page.locator('.copy-status').getByText('복사 완료', { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), cafe.englishPhrases[0]);
      await page.getByRole('button', { name: '약국', exact: true }).click();
      assert.ok(await details.getByRole('heading', { name: '시설을 선택해 주세요', exact: true }).isVisible());
      assert.equal(await page.locator('.copy-status').innerText(), '');
      await page.getByRole('button', { name: '전체', exact: true }).click();
      await visibleCount(page, publicRecords.length);
      assert.ok(await details.getByRole('heading', { name: '시설을 선택해 주세요', exact: true }).isVisible());
      const cardButton = page.getByRole('article', { name: publicRecords[0].translations.ko.name, exact: true }).getByRole('button');
      await cardButton.focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('#staff-detail-title').innerText(), publicRecords[0].translations.ko.name);
      await page.getByRole('button', { name: '전체', exact: true }).focus();
      assert.equal(await page.getByRole('button', { name: '전체', exact: true }).evaluate(el => getComputedStyle(el).outlineWidth), '3px');
      const sauna = publicRecords.find(item => item.category === 'sauna_spa');
      await search.fill('sauna'); await visibleCount(page, 1);
      await selectRecord(page, sauna.translations.ko.name);
      await noOverflow(page);
      if (width === 1280 || width === 390) await page.screenshot({ path: path.join(artifacts, `staff-${width}.png`), fullPage: true });
      results.push(`PASS ${width}px search/filter/clear, private exclusion, selection/reset, unknown fields, keyboard, real clipboard write/read and no overflow`);
      await context.close();
    }

    async function fixtureCase(label, dataset, action, clipboardMode) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
      if (clipboardMode === 'unavailable') await context.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }); });
      if (clipboardMode === 'denied') await context.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new DOMException('Denied for QA', 'NotAllowedError'); } } }); });
      await context.route(url => url.pathname === '/src/data/facilities.json', route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(dataset)};` }));
      const page = await context.newPage(); observe(page);
      try { await page.goto(`${baseURL}/staff`); await action(page); results.push(`PASS ${label}`); }
      finally { await context.close(); }
    }
    const two = structuredClone(source);
    two.facilities = source.facilities.filter(item => item.isPublished).slice(0, 2).map(item => structuredClone(item));
    two.facilities[0].englishPhrases = ['First fictional QA sentence.', 'Second fictional QA sentence.'];
    two.facilities[1].englishPhrases = [];
    two.facilities[0].walkingMinutes = 5;
    two.facilities[0].lastVerifiedAt = '2026-10-15';
    two.facilities[0].translations.en.directions = 'Fictional QA directions only.';
    await fixtureCase('multiple/zero phrases, individual/all copy and facility-change reset', two, async page => {
      await visibleCount(page, 2);
      await selectRecord(page, two.facilities[0].translations.ko.name);
      assert.deepEqual(await page.locator('.english-phrase-text').allTextContents(), two.facilities[0].englishPhrases);
      assert.ok(await page.locator('#staff-facility-detail').getByText('약 도보 5분', { exact: true }).isVisible());
      assert.ok(await page.getByText('최종 확인: 2026-10-15', { exact: true }).isVisible());
      assert.ok(await page.getByText('Fictional QA directions only.', { exact: true }).isVisible());
      await page.getByRole('button', { name: '영어 문구 2 복사', exact: true }).click();
      await page.locator('.copy-status').getByText('복사 완료', { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), two.facilities[0].englishPhrases[1]);
      await page.getByRole('button', { name: '전체 문구 복사', exact: true }).click();
      await page.locator('.copy-status').getByText('복사 완료', { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), two.facilities[0].englishPhrases.join('\n'));
      await selectRecord(page, two.facilities[1].translations.ko.name);
      assert.ok(await page.getByText('영어 안내 문구가 아직 등록되지 않았습니다.', { exact: true }).isVisible());
      assert.ok(await page.getByRole('button', { name: '복사', exact: true }).isDisabled());
      assert.equal(await page.locator('.copy-status').innerText(), '');
    });
    for (const mode of ['unavailable', 'denied']) await fixtureCase(`clipboard ${mode}: failure announcement and manually selectable text`, source, async page => {
      await visibleCount(page, publicRecords.length);
      await selectRecord(page, publicRecords[0].translations.ko.name);
      await page.getByRole('button', { name: '영어 문구 1 복사', exact: true }).click();
      await page.locator('.copy-status').getByText('복사에 실패했습니다. 문구를 직접 선택해 복사해 주세요.', { exact: true }).waitFor();
      assert.equal(await page.locator('.copy-status').getAttribute('role'), 'status');
      const text = await page.locator('.english-phrase-text').first().evaluate(el => {
        const range = document.createRange(); range.selectNodeContents(el); const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); return selection.toString();
      });
      assert.equal(text, publicRecords[0].englishPhrases[0]);
    }, mode);
    await fixtureCase('no public data has a dedicated empty state', { ...source, facilities: source.facilities.filter(item => !item.isPublished) }, async page => {
      await page.getByRole('heading', { name: '등록된 시설 정보가 없습니다.', exact: true }).waitFor();
      assert.equal(await page.locator('.facility-card').count(), 0);
    });
    await fixtureCase('validation error shows no substitute facilities; Guest still renders', { ...source, facilities: [{ id: 'broken-record' }] }, async page => {
      await page.getByText('시설 데이터를 불러오지 못했습니다', { exact: true }).waitFor();
      assert.equal(await page.locator('.facility-card').count(), 0);
      assert.ok(await page.getByRole('searchbox').isDisabled());
      assert.ok(await page.getByRole('alert').isVisible());
      await page.getByRole('link', { name: '고객 화면 미리보기' }).click();
      await page.getByRole('heading', { name: 'Welcome to your stay.', exact: true }).waitFor();
      assert.equal(await page.locator('a[href^="/staff"]').count(), 0);
    });
    assert.deepEqual(errors, [], 'Unhandled JavaScript/console/HTTP errors');
    assert.ok(requests.every(url => new URL(url).origin === origin), 'Remote resource/API requested');
    results.push('PASS no JavaScript/console/HTTP errors or external resources/APIs');
    fs.writeFileSync(path.join(artifacts, 'staff-results.txt'), results.join('\n') + '\n');
    console.log(results.join('\n'));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
