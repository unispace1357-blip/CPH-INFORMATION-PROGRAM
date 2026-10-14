/* Real Chromium QA; synthetic route URLs and intercepted popups never contact Naver. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const baseURL = process.env.CPH_UI_BASE_URL || 'http://127.0.0.1:5175';
const adminURL = process.env.CPH_ADMIN_BASE_URL || 'http://127.0.0.1:5190';
const artifactDir = process.env.CPH_UI_ARTIFACT_DIR || '/tmp/cph-step07b-map-qa';
const files = ['facilities.json', 'hotel.json'].map(name => path.join(__dirname, '../src/data', name));
const originals = files.map(file => fs.readFileSync(file));
const source = JSON.parse(originals[0]);
const record = source.facilities.find(item => item.isPublished);
const routeURL = 'https://map.naver.com/p/directions/126.63,37.39,QA-start/126.64,37.40,QA-end/-/walk?c=15.00,0,0,0,dh';
const mobileRoute = 'https://m.map.naver.com/route.nhn?menu=route&sX=126.63&sY=37.39&eX=126.64&eY=37.40';
const languages = { ko: '한국어', en: 'English', 'zh-CN': '简体中文', ja: '日本語' };
const results = [], errors = [], requests = [], interceptedMaps = [];
let MESSAGES;

async function setup(context, fixture) {
  context.on('page', page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  });
  context.on('request', request => requests.push(request.url()));
  await context.route(url => ['map.naver.com', 'm.map.naver.com'].includes(url.hostname), route => {
    interceptedMaps.push(route.request().url());
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>QA intercepted Naver navigation</title><p>Local QA response. No real route verified.</p>' });
  });
  if (fixture) await context.route(url => url.pathname === '/src/data/facilities.json', route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(fixture)};` }));
}
async function layout(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
  assert.deepEqual(await page.locator('h1,h2,h3,p,label,button,dd,.naver-map-link').evaluateAll(elements => elements.filter(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.textContent)), [], 'Clipped text');
  for (const box of await page.locator('.naver-map-link').evaluateAll(elements => elements.map(el => { const r = el.getBoundingClientRect(); return { width: r.width, height: r.height }; }))) assert.ok(box.width >= 44 && box.height >= 44);
}
async function capture(page, locator, filename) {
  await locator.evaluate(element => { document.activeElement?.blur(); scrollTo(0, scrollY + element.getBoundingClientRect().top - 180); });
  await page.screenshot({ path: path.join(artifactDir, filename) });
}
async function select(page, audience) {
  await page.locator(audience === 'guest' ? `#guest-result-${record.id}` : '.staff-result-list .facility-card button').first().click();
  await page.locator(audience === 'guest' ? '#guest-detail-title' : '#staff-detail-title').waitFor();
}
async function popupClick(page, link, expected) {
  assert.equal(await link.getAttribute('href'), expected); assert.equal(await link.getAttribute('target'), '_blank');
  assert.deepEqual((await link.getAttribute('rel')).split(' ').sort(), ['noopener', 'noreferrer']);
  const hintId = await link.getAttribute('aria-describedby'); assert.ok(hintId);
  assert.ok(await page.locator(`[id="${hintId}"]`).isVisible());
  await link.focus(); assert.equal(await link.evaluate(el => getComputedStyle(el).outlineWidth), '3px');
  const pending = page.waitForEvent('popup'); await link.click(); const popup = await pending;
  await popup.waitForLoadState('domcontentloaded'); assert.equal(popup.url(), expected);
  assert.equal(await popup.evaluate(() => window.opener === null), true); await popup.close();
}
async function checkPending(page, audience, language) {
  const isGuest = audience === 'guest';
  const group = page.locator(isGuest ? '#nearby-facilities .guest-category-grid' : '.staff-category-grid');
  const transportLabel = isGuest ? MESSAGES[language].categories.transportation : '교통';
  const all = isGuest ? page.getByRole('button', { name: MESSAGES[language].ui.allFacilities, exact: true }) : group.getByRole('button', { name: '전체', exact: true });
  assert.equal(await group.getByRole('button', { name: isGuest ? MESSAGES[language].categories.atm : 'ATM', exact: true }).count(), 0);
  assert.equal(await page.locator('.pending-transit-notice').count(), 0);
  await group.getByRole('button', { name: transportLabel, exact: true }).click();
  const pending = page.locator('.pending-transit-notice'); await pending.waitFor();
  assert.equal(await pending.locator('.pending-transit-title').innerText(), isGuest ? MESSAGES[language].ui.airportBusPending : MESSAGES.ko.ui.airportBusPending);
  assert.equal(await pending.locator('a,input,.verification-date,.facility-meta').count(), 0);
  assert.equal(await pending.getByRole('button').count(), 2);
  for (const button of await pending.getByRole('button').all()) assert.ok(await button.isDisabled());
  const actualCount = source.facilities.filter(item => item.isPublished && item.category === 'transportation').length;
  assert.equal(await page.locator(isGuest ? '.guest-result-list .facility-card' : '.staff-result-list .facility-card').count(), actualCount);
  assert.equal(await page.locator(isGuest ? '#guest-facility-results .status-label' : '#staff-results-title + .status-label').innerText(), isGuest ? MESSAGES[language].ui.resultCount.replace('{count}', actualCount) : `검색 결과 ${actualCount}개`);
  await layout(page);
  if (isGuest && language === 'en' && (await page.viewportSize()).width === 390) await capture(page, pending, 'guest-transit-pending-390.png');
  await all.click(); assert.equal(await pending.count(), 0);
}
async function download(page) {
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: '전체 시설 JSON 다운로드', exact: true }).click();
  const file = await pending; assert.equal(await file.failure(), null); return JSON.parse(fs.readFileSync(await file.path(), 'utf8'));
}
async function confirm(page, action) {
  const pending = page.waitForEvent('dialog'), running = action(); const dialog = await pending;
  assert.equal(dialog.type(), 'confirm'); await dialog.accept(); await running;
}

(async () => {
  ({ MESSAGES } = await import('../src/i18n/messages.ts'));
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CPH_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    for (const width of [320, 390, 1280]) {
      for (const audience of ['guest', 'staff']) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        await setup(context); const page = await context.newPage(); const mapBefore = interceptedMaps.length;
        await page.goto(`${baseURL}/${audience}`); await page.locator('.facility-card button').first().waitFor();
        for (const language of audience === 'guest' ? ['en', 'ko', 'zh-CN', 'ja'] : ['ko']) {
          if (audience === 'guest') await page.locator('.language-options').getByRole('button', { name: languages[language], exact: true }).click();
          await select(page, audience);
          const detail = page.locator(audience === 'guest' ? '#guest-facility-detail' : '#staff-facility-detail');
          assert.equal(await detail.locator('.naver-map-link').count(), 0);
          assert.ok(await detail.getByRole('button', { name: MESSAGES[language].ui.naverMapDirections, exact: true }).isDisabled());
          assert.ok(await detail.getByText(MESSAGES[language].ui.naverMapUnavailable, { exact: true }).isVisible());
          await layout(page);
          if (audience === 'guest' && width === 390 && language === 'en') await capture(page, detail.locator('.naver-directions'), 'guest-map-unregistered-390.png');
          await checkPending(page, audience, language);
        }
        assert.equal(interceptedMaps.length, mapBefore, 'Source page must not auto-contact maps');
        results.push(`PASS source ${audience} ${width}px: localized unregistered links, ATM filters absent, transit only in transportation, disabled controls, unchanged result counts and no overflow`);
        await context.close();
      }
    }
    const fixture = structuredClone(source); fixture.facilities.find(item => item.id === record.id).naverMapUrl = routeURL;
    for (const width of [390, 1280]) {
      for (const audience of ['guest', 'staff']) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' }); await setup(context, fixture);
        if (audience === 'staff') await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(baseURL).origin });
        const page = await context.newPage(); const mapBefore = interceptedMaps.length;
        await page.goto(`${baseURL}/${audience}`); await page.locator('.facility-card button').first().waitFor();
        const query = audience === 'guest' ? record.translations.en.name : record.translations.ko.name;
        await page.getByRole('searchbox').fill(query); await select(page, audience);
        assert.equal(interceptedMaps.length, mapBefore, 'Active link does not auto-contact maps');
        for (const language of audience === 'guest' ? ['en', 'ko', 'zh-CN', 'ja'] : ['ko']) {
          if (audience === 'guest') await page.locator('.language-options').getByRole('button', { name: languages[language], exact: true }).click();
          const detail = page.locator(audience === 'guest' ? '#guest-facility-detail' : '#staff-facility-detail');
          const link = detail.getByRole('link', { name: MESSAGES[language].ui.naverMapDirections, exact: true });
          await popupClick(page, link, routeURL);
          assert.equal(await page.getByRole('searchbox').inputValue(), query);
          assert.equal(await page.locator(audience === 'guest' ? '#guest-detail-title' : '#staff-detail-title').innerText(), record.translations[language].name);
          await layout(page);
          if (width === 390 && audience === 'guest' && language === 'en') await capture(page, detail.locator('.naver-directions'), 'guest-map-synthetic-fixture-390.png');
          if (width === 1280 && audience === 'staff') await capture(page, detail.locator('.naver-directions'), 'staff-map-synthetic-fixture-1280.png');
        }
        if (audience === 'staff') {
          assert.ok(await page.getByText('네이버 지도에서 길찾기를 연 뒤 인쇄 기능을 이용할 수 있습니다.', { exact: true }).isVisible());
          await page.getByRole('button', { name: '영어 문구 1 복사', exact: true }).click();
          await page.locator('.copy-status').getByText('복사 완료', { exact: true }).waitFor();
          assert.equal(await page.evaluate(() => navigator.clipboard.readText()), record.englishPhrases[0]);
        }
        for (const hidden of source.facilities.filter(item => !item.isPublished)) assert.equal(await page.getByText(hidden.translations[audience === 'guest' ? 'ja' : 'ko'].name, { exact: true }).count(), 0);
        results.push(`PASS synthetic ${audience} ${width}px: actual popup clicks with intercepted destination, target/rel/opener, localized labels, query/selection retention, no automatic request${audience === 'staff' ? ' and real clipboard copy' : ''}`);
        await context.close();
      }
    }
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true }); await setup(context);
      const page = await context.newPage(); await page.goto(adminURL); await page.getByRole('button', { name: '신규 시설 추가', exact: true }).click();
      assert.equal(await page.getByLabel('네이버 지도 길찾기 URL', { exact: true }).inputValue(), '');
      assert.ok(await page.getByRole('button', { name: '등록 링크 확인', exact: true }).isDisabled());
      assert.equal(await page.getByLabel('카테고리', { exact: true }).locator('option[value="atm"]').count(), 1);
      await page.getByRole('button', { name: '편집 취소', exact: true }).click();
      const editButton = () => page.getByRole('button', { name: `편집 ${record.id}`, exact: true });
      await editButton().click(); const input = page.getByLabel('네이버 지도 길찾기 URL', { exact: true });
      assert.equal(await input.inputValue(), ''); await input.fill(routeURL);
      await popupClick(page, page.getByRole('link', { name: '등록 링크 확인', exact: true }), routeURL);
      await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click();
      await page.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
      const exported = await download(page), expected = structuredClone(source); expected.facilities.find(item => item.id === record.id).naverMapUrl = routeURL;
      assert.deepEqual(exported, expected);
      await confirm(page, () => page.getByLabel('시설 JSON 불러오기', { exact: true }).setInputFiles({ name: 'map-qa-only.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)) }));
      await page.getByRole('button', { name: '시설 관리', exact: true }).click(); await editButton().click();
      assert.equal(await input.inputValue(), routeURL); await input.fill(mobileRoute);
      await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click();
      assert.equal(await page.getByRole('link', { name: '등록 링크 확인', exact: true }).getAttribute('href'), mobileRoute);
      await layout(page);
      if (width === 1280) await capture(page, page.locator('.naver-directions'), 'admin-map-synthetic-fixture-1280.png');
      await input.fill(''); await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click();
      assert.ok(await page.getByRole('button', { name: '등록 링크 확인', exact: true }).isDisabled());
      await page.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
      expected.facilities.find(item => item.id === record.id).naverMapUrl = null; assert.deepEqual(await download(page), expected);
      await page.getByRole('button', { name: '시설 관리', exact: true }).click(); await editButton().click();
      await input.fill('https://naver.me/unverified-qa'); await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click(); await page.getByRole('alert').waitFor();
      assert.equal(await input.inputValue(), 'https://naver.me/unverified-qa'); assert.equal(await page.getByRole('link', { name: '등록 링크 확인', exact: true }).count(), 0);
      await confirm(page, () => page.getByRole('button', { name: '편집 취소', exact: true }).click());
      await page.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click(); assert.deepEqual(await download(page), expected);
      await layout(page); results.push(`PASS Admin ${width}px: blank defaults, ATM retained, preview popup, register/edit/delete/export/reimport, invalid save rejected with workspace preserved`);
      await context.close();
    }
    files.forEach((file, index) => assert.deepEqual(fs.readFileSync(file), originals[index])); assert.deepEqual(errors, []);
    const allowed = [new URL(baseURL).origin, new URL(adminURL).origin];
    assert.ok(requests.every(url => allowed.includes(new URL(url).origin) || ['map.naver.com', 'm.map.naver.com'].includes(new URL(url).hostname)));
    assert.equal(interceptedMaps.length, 12);
    results.push('PASS 12 explicit map popup navigations intercepted locally; zero real Naver/API requests, zero JS/console/HTTP errors, source hotel/facility bytes unchanged');
    fs.writeFileSync(path.join(artifactDir, 'map-results.txt'), results.join('\n') + '\n'); console.log(results.join('\n'));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
