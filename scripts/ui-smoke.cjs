/* Optional browser QA. Playwright is provided by the QA environment, not the application. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseURL = process.env.CPH_UI_BASE_URL || 'http://127.0.0.1:5174';
const artifactDir = process.env.CPH_UI_ARTIFACT_DIR || '/tmp/cph-step03-qa';
const origin = new URL(baseURL).origin;
const widths = [320, 375, 390, 430, 768, 1280];
const results = [];
const errors = [];
const requests = [];

function contrast(a, b) {
  const luminance = hex => {
    const rgb = hex.trim().replace('#', '').match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

async function checkLayout(page, label, expectDisabled = true) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: horizontal overflow`);
  const clipped = await page.locator('h1, h2, h3, p, label, button').evaluateAll(elements => elements.filter(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
  assert.deepEqual(clipped, [], `${label}: clipped labels/text`);
  const sizes = await page.locator('button, input[type="search"], nav a, .button').evaluateAll(elements => elements.map(el => ({ label: el.textContent || el.getAttribute('aria-label'), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })));
  assert.ok(sizes.every(size => size.width >= 44 && size.height >= 44), `${label}: target smaller than 44px: ${JSON.stringify(sizes.filter(size => size.width < 44 || size.height < 44))}`);
  if (expectDisabled) {
    for (const button of await page.getByRole('button').all()) assert.ok(await button.isDisabled(), `${label}: unfinished button is enabled`);
    for (const input of await page.getByRole('searchbox').all()) assert.ok(await input.isDisabled());
  }
}

(async () => {
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CPH_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('request', request => requests.push(request.url()));
      page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });

      assert.equal((await page.goto(`${baseURL}/`)).status(), 200);
      await page.waitForURL('**/guest');
      await page.getByRole('heading', { level: 1, name: 'Welcome to your stay.' }).waitFor();
      results.push(`PASS ${width}px / redirects to /guest`);
      for (const route of ['/guest', '/staff', '/review-missing-page']) {
        assert.equal((await page.goto(baseURL + route)).status(), 200);
        const title = route === '/guest' ? 'Welcome to your stay.' : route === '/staff' ? '직원용 안내' : 'Page not found';
        await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor();
        await page.reload();
        await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor();
        if (route === '/staff') await page.locator('.staff-category-grid button:not([disabled])').first().waitFor();
        if (route === '/guest') { await page.locator('.hotel-category-grid button:not([disabled])').first().waitFor(); await page.locator('.guest-search-panel input:not([disabled])').waitFor(); }
        await checkLayout(page, `${width}px ${route}`, route === '/review-missing-page');
        if (route === '/guest') {
          assert.equal(await page.locator('html').getAttribute('lang'), 'en');
          assert.equal(await page.locator('a[href^="/staff"]').count(), 0);
          assert.ok(await page.getByRole('searchbox').isEditable());
          assert.equal(await page.locator('.language-options button').count(), 4);
          assert.equal(await page.locator('.language-options button[aria-pressed="true"]').innerText(), 'English');
          assert.ok(await page.getByText('Development preview', { exact: true }).isVisible());
          const columns = await page.locator('.guest-category-grid').first().evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
          assert.equal(columns, width < 600 ? 2 : width < 1000 ? 3 : 4);
          if (width === 390) {
            const tokens = await page.evaluate(() => Object.fromEntries(['text', 'text-secondary', 'surface', 'background', 'subtle', 'primary', 'focus'].map(key => [key, getComputedStyle(document.documentElement).getPropertyValue(`--color-${key}`).trim()])));
            for (const [foreground, background] of [['text', 'surface'], ['text-secondary', 'surface'], ['text-secondary', 'background'], ['text-secondary', 'subtle'], ['surface', 'primary']]) {
              assert.ok(contrast(tokens[foreground], tokens[background]) >= 4.5, `Insufficient text contrast: ${foreground}/${background}`);
            }
            assert.ok(contrast(tokens.focus, tokens.surface) >= 3);
            results.push('PASS primary/secondary text token contrast >= 4.5:1 and focus-on-surface contrast >= 3:1');
            await page.screenshot({ path: path.join(artifactDir, 'guest-390.png'), fullPage: true });
          }
          await page.keyboard.press('Tab');
          assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Skip to content');
          assert.equal(await page.locator('.skip-link').evaluate(el => getComputedStyle(el).outlineWidth), '3px');
          await page.keyboard.press('Enter');
          assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
          await page.goto(`${baseURL}/guest`);
          await page.getByRole('heading', { name: title, exact: true }).waitFor();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          assert.equal(await page.evaluate(() => document.activeElement.getAttribute('href')), '#hotel-information');
          await page.keyboard.press('Enter');
          assert.equal(new URL(page.url()).hash, '#hotel-information');
        } else if (route === '/staff') {
          assert.equal(await page.locator('html').getAttribute('lang'), 'ko');
          assert.equal(await page.locator('.staff-category-grid button').count(), 11);
          assert.equal(await page.locator('.staff-category-grid button[aria-pressed="true"]').innerText(), '전체');
          assert.ok(await page.getByRole('button', { name: '복사', exact: true }).isDisabled());
          const columns = await page.locator('.staff-workspace').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
          assert.equal(columns, width >= 1000 ? 2 : 1);
          if (width === 1280) await page.screenshot({ path: path.join(artifactDir, 'staff-1280.png'), fullPage: true });
          await page.getByRole('link', { name: '고객 화면 미리보기' }).click();
          await page.waitForURL('**/guest');
          await page.getByRole('heading', { name: 'Welcome to your stay.' }).waitFor();
          await page.goBack();
          await page.waitForURL('**/staff');
          await page.getByRole('heading', { name: title }).waitFor();
        } else {
          await page.getByRole('link', { name: 'Return to Guest Guide' }).click();
          await page.waitForURL('**/guest');
          await page.getByRole('heading', { name: 'Welcome to your stay.' }).waitFor();
        }
        results.push(`PASS ${width}px ${route}: load/reload, no clipping/overflow, target sizes, disabled state and navigation`);
      }
      const svg = await context.request.get(`${baseURL}/favicon.svg`);
      assert.equal(svg.status(), 200);
      assert.match(await svg.text(), /<svg[\s>]/);
      const ico = await context.request.get(`${baseURL}/favicon.ico`);
      assert.equal(ico.status(), 200);
      assert.equal((await ico.body()).readUInt16LE(2), 1);
      assert.equal((await ico.body()).readUInt16LE(4), 1);
      results.push(`PASS ${width}px local SVG/ICO favicon HTTP 200`);
      await context.close();
    }
    assert.deepEqual(errors, [], 'Browser JavaScript, console or HTTP errors');
    assert.ok(requests.every(url => new URL(url).origin === origin), 'Remote resource requested');
    assert.ok(requests.some(url => /\/src\/data\/facilityDataset/.test(new URL(url).pathname)), 'Staff shared data was not loaded');
    results.push('PASS zero JavaScript/console/HTTP errors; no remote resource/API requests; shared canonical data loaded; active Guest guide and Staff preserved');
    fs.writeFileSync(path.join(artifactDir, 'results.txt'), results.join('\n') + '\n');
    console.log(results.join('\n'));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
