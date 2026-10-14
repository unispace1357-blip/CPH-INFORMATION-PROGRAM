/* Focused real-browser compatibility QA. No source data is written or facility registered. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const baseURL = process.env.CPH_UI_BASE_URL || 'http://127.0.0.1:5175';
const adminURL = process.env.CPH_ADMIN_BASE_URL || 'http://127.0.0.1:5190';
const artifactDir = process.env.CPH_UI_ARTIFACT_DIR || '/tmp/cph-naver-place-qa';
const sourceFiles = ['facilities.json', 'hotel.json'].map(name => path.join(__dirname, '../src/data', name));
const originals = sourceFiles.map(file => fs.readFileSync(file));
const source = JSON.parse(originals[0]), record = source.facilities.find(item => item.isPublished);
const languages = { ko: '한국어', en: 'English', 'zh-CN': '简体中文', ja: '日本語' };
const results = [], errors = [], external = [];

async function confirm(page, action) {
  const pending = page.waitForEvent('dialog'), running = action(); const dialog = await pending;
  assert.equal(dialog.type(), 'confirm'); await dialog.accept(); await running;
}
async function popup(page, link, url) {
  assert.equal(await link.getAttribute('href'), url); assert.equal(await link.getAttribute('target'), '_blank');
  assert.deepEqual((await link.getAttribute('rel')).split(' ').sort(), ['noopener', 'noreferrer']);
  const pending = page.waitForEvent('popup'); await link.click(); const child = await pending;
  await child.waitForLoadState('domcontentloaded'); assert.equal(child.url(), new URL(url).href);
  assert.equal(await child.evaluate(() => window.opener === null), true); await child.close();
}
async function layout(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(await page.locator('.naver-directions button,.naver-map-link').evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent)), []);
}

(async () => {
  const { USER_NAVER_PLACE_ROUTE } = await import('./naver-place-fixture.ts');
  const { MESSAGES } = await import('../src/i18n/messages.ts');
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CPH_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    for (const url of [USER_NAVER_PLACE_ROUTE, encodeURI(USER_NAVER_PLACE_ROUTE).replace('/transit', '/walk')]) {
      for (const width of [390, 1280]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
        context.on('page', page => { page.on('pageerror', error => errors.push(error.message)); page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); }); });
        context.on('request', req => { if (! [new URL(baseURL).origin, new URL(adminURL).origin].includes(new URL(req.url()).origin)) external.push(req.url()); });
        await context.route(request => request.hostname === 'map.naver.com', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Local intercepted route QA</title>' }));
        const fixture = structuredClone(source); fixture.facilities.find(item => item.id === record.id).naverMapUrl = url;
        await context.route(request => request.pathname === '/src/data/facilities.json', route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(fixture)};` }));
        const page = await context.newPage();
        for (const audience of ['staff', 'guest']) {
          const countBefore = external.length;
          await page.goto(`${baseURL}/${audience}`); await page.locator('.facility-card button').first().waitFor();
          await page.getByRole('searchbox').fill(audience === 'staff' ? record.translations.ko.name : record.translations.en.name);
          await page.locator(audience === 'staff' ? '.staff-result-list .facility-card button' : `#guest-result-${record.id}`).first().click();
          await page.locator(audience === 'staff' ? '#staff-detail-title' : '#guest-detail-title').waitFor();
          assert.equal(external.length, countBefore, 'No automatic map request');
          for (const language of audience === 'guest' ? ['ko', 'en', 'zh-CN', 'ja'] : ['ko']) {
            if (audience === 'guest') await page.locator('.language-options').getByRole('button', { name: languages[language], exact: true }).click();
            const input = await page.getByRole('searchbox').inputValue();
            await popup(page, page.getByRole('link', { name: MESSAGES[language].ui.naverMapDirections, exact: true }), url);
            assert.equal(await page.getByRole('searchbox').inputValue(), input);
            assert.equal(await page.locator(audience === 'guest' ? '#guest-detail-title' : '#staff-detail-title').innerText(), record.translations[language].name);
            await layout(page);
          }
          results.push(`PASS ${audience} ${width}px: ${url.includes('/transit') ? 'native Korean PLACE_POI transit' : 'encoded PLACE_POI walking'} URL active, popup target/rel/opener correct, search/selection retained${audience === 'guest' ? ', all 4 languages' : ''}`);
        }
        await page.goto(adminURL); await page.getByRole('button', { name: `편집 ${record.id}`, exact: true }).click();
        await page.getByLabel('네이버 지도 길찾기 URL', { exact: true }).fill(url);
        assert.ok(await page.getByText(/URL 형식 검사는 실제 출발지·도착지를 자동 확인하지 않습니다/).isVisible());
        await popup(page, page.getByRole('link', { name: '등록 링크 확인', exact: true }), url);
        await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click();
        await page.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
        const pending = page.waitForEvent('download'); await page.getByRole('button', { name: '전체 시설 JSON 다운로드', exact: true }).click();
        const download = await pending; assert.equal(await download.failure(), null);
        const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8')); assert.equal(exported.facilities.find(item => item.id === record.id).naverMapUrl, url);
        await confirm(page, () => page.getByLabel('시설 JSON 불러오기', { exact: true }).setInputFiles({ name: 'place-qa.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)) }));
        await page.getByRole('button', { name: '시설 관리', exact: true }).click(); await page.getByRole('button', { name: `편집 ${record.id}`, exact: true }).click();
        assert.equal(await page.getByLabel('네이버 지도 길찾기 URL', { exact: true }).inputValue(), url); await layout(page);
        results.push(`PASS Admin ${width}px: ${url.includes('/transit') ? 'native Korean transit' : 'encoded walking'} input, preview popup, save/download/reimport preserves original URL and manual verification notice`);
        await context.close();
      }
    }
    assert.deepEqual(errors, []); assert.ok(external.every(url => new URL(url).hostname === 'map.naver.com')); assert.equal(external.length, 24);
    sourceFiles.forEach((file, index) => assert.deepEqual(fs.readFileSync(file), originals[index]));
    results.push('PASS 24 explicit popups intercepted locally; zero actual map/API requests, zero browser errors; hotel/facility JSON unchanged');

    // Explicit opt-in integration check. Failure is reported as UNVERIFIED, separately from local QA.
    if (process.env.CPH_NAVER_LIVE_QA === '1') {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const navigations = [], failures = [];
      // Observe before clicking: a fast blocked response can precede the popup event.
      context.on('response', response => { if (response.request().isNavigationRequest() && new URL(response.url()).hostname === 'map.naver.com') navigations.push(response); });
      context.on('requestfailed', request => { if (new URL(request.url()).hostname === 'map.naver.com') failures.push(request.failure()?.errorText ?? 'Request failed'); });
      const page = await context.newPage(); let child;
      try {
        await page.goto(adminURL); await page.getByRole('button', { name: `편집 ${record.id}`, exact: true }).click();
        await page.getByLabel('네이버 지도 길찾기 URL', { exact: true }).fill(USER_NAVER_PLACE_ROUTE);
        const pending = page.waitForEvent('popup'); await page.getByRole('link', { name: '등록 링크 확인', exact: true }).click(); child = await pending;
        await child.waitForLoadState('domcontentloaded', { timeout: 15000 });
        const status = navigations.at(-1)?.status() ?? 'no HTTP response', title = await child.title();
        if (status === 200 && /네이버|NAVER|Naver/i.test(title)) results.push(`CONNECTED live Admin preview: HTTP ${status}, title=${title}. Actual origin/destination and route correctness remain UNVERIFIED.`);
        else results.push(`UNVERIFIED actual Naver service: HTTP ${status}, title=${title}, failure=${failures.join('; ') || 'none'}. No route/printing verification.`);
      } catch (error) { results.push(`UNVERIFIED actual Naver service: ${error.message.split('\n')[0]}. No route/printing verification.`); }
      finally { await context.close(); }
    } else results.push('UNVERIFIED actual Naver service: live opt-in not run');
    sourceFiles.forEach((file, index) => assert.deepEqual(fs.readFileSync(file), originals[index]));
    fs.writeFileSync(path.join(artifactDir, 'compatibility-results.txt'), results.join('\n') + '\n'); console.log(results.join('\n'));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
