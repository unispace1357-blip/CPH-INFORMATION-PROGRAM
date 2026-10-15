/* Focused data-entry QA only; no full UI suite or live map access. Edits stay in browser memory. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const adminURL = process.env.CPH_ADMIN_BASE_URL || 'http://127.0.0.1:5190';
const publicURL = process.env.CPH_UI_BASE_URL || 'http://127.0.0.1:5175';
const artifactDir = process.env.CPH_UI_ARTIFACT_DIR || '/tmp/cph-batch01-data-qa';
const files = ['facilities.json', 'hotel.json'].map(name => path.join(__dirname, '../src/data', name));
const original = files.map(file => fs.readFileSync(file));
const data = JSON.parse(original[0]);
const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/reference/step07b-batch01-source.json')));
const languages = { ko: '한국어', en: 'English', 'zh-CN': '简体中文', ja: '日本語' };
const qaUrl = 'https://map.naver.com/p/directions/126.63,37.39,QA-start/126.64,37.40,QA-end/-/walk';
const results = [], errors = [], requests = [];

async function download(page) {
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: '전체 시설 JSON 다운로드', exact: true }).click();
  const file = await pending; assert.equal(await file.failure(), null); return JSON.parse(fs.readFileSync(await file.path(), 'utf8'));
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CPH_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  context.on('request', request => requests.push(request.url()));
  context.on('page', page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  });
  try {
    const page = await context.newPage(); await page.goto(adminURL);
    await page.waitForFunction(() => document.querySelectorAll('.admin-records li').length === 11);
    assert.equal(await page.locator('.admin-records li').count(), 11);
    for (const entry of source.records) {
      const item = data.facilities.find(item => item.id === entry.jsonId);
      await page.getByLabel('시설명 검색', { exact: true }).fill(item.translations.ko.name);
      await page.waitForFunction(() => document.querySelectorAll('.admin-records li').length === 1);
      await page.getByRole('button', { name: `편집 ${item.id}`, exact: true }).click();
      assert.equal(await page.getByLabel('카테고리', { exact: true }).inputValue(), item.category);
      assert.equal(await page.getByLabel('공개 시설로 표시', { exact: true }).isChecked(), false);
      for (const label of ['네이버 지도 길찾기 URL', '마지막 확인일', '예상 도보시간 (분)']) assert.equal(await page.getByLabel(label, { exact: true }).inputValue(), '');
      for (const language of Object.keys(languages)) {
        await page.getByRole('group', { name: '편집 언어', exact: true }).getByRole('button', { name: languages[language], exact: true }).click();
        for (const [label, field] of [['시설명','name'],['시설 설명','description'],['주소','address'],['영업시간','openingHours'],['이동 안내','directions'],['참고 사항','notes']]) assert.equal(await page.getByLabel(label, { exact: true }).inputValue(), item.translations[language][field]);
        assert.equal(await page.getByLabel('휴무일', { exact: true }).inputValue(), item.closedDays[language]);
      }
      results.push(`PASS Admin ${entry.sourceId}/${item.id}: search/select, all 4 languages, private, unknown date/walk/URL retained`);
    }
    await page.getByLabel('시설명 검색', { exact: true }).fill('');
    await page.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
    assert.deepEqual(await download(page), data);
    const pending = page.waitForEvent('dialog'), uploading = page.getByLabel('시설 JSON 불러오기', { exact: true }).setInputFiles(files[0]);
    const dialog = await pending; assert.equal(dialog.type(), 'confirm'); await dialog.accept(); await uploading;
    assert.deepEqual(await download(page), data);
    await page.getByRole('button', { name: '시설 관리', exact: true }).click();
    const item = data.facilities.find(item => item.id === source.records[0].jsonId);
    await page.getByRole('button', { name: `편집 ${item.id}`, exact: true }).click();
    await page.getByRole('group', { name: '편집 언어', exact: true }).getByRole('button', { name: '한국어', exact: true }).click();
    await page.getByLabel('영업시간', { exact: true }).fill(item.translations.ko.openingHours + '\n[메모리 QA 편집]');
    await page.getByLabel('네이버 지도 길찾기 URL', { exact: true }).fill(qaUrl);
    await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click();
    assert.equal(await page.getByRole('link', { name: '등록 링크 확인', exact: true }).getAttribute('href'), qaUrl);
    assert.equal(await page.getByLabel('공개 시설로 표시', { exact: true }).isChecked(), false);
    await page.getByLabel('영업시간', { exact: true }).fill(item.translations.ko.openingHours);
    await page.getByLabel('네이버 지도 길찾기 URL', { exact: true }).fill('');
    await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click();
    assert.ok(await page.getByRole('button', { name: '등록 링크 확인', exact: true }).isDisabled());
    await page.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
    assert.deepEqual(await download(page), data);
    await page.getByRole('button', { name: '데이터 검증', exact: true }).click();
    assert.ok(await page.getByRole('heading', { name: '시설 개발 데이터 검증 · PASS', exact: true }).isVisible());
    assert.ok(await page.getByRole('heading', { name: '현재 운영 배포 검증 · FAIL', exact: true }).isVisible());
    results.push('PASS actual source JSON export/import/export equality; temporary hours/URL add/delete restored; private retained; development PASS and deployment blocked');

    const publicPage = await context.newPage();
    for (const audience of ['staff', 'guest']) {
      await publicPage.goto(`${publicURL}/${audience}`);
      await publicPage.waitForFunction(() => document.querySelectorAll('.facility-card').length === 5);
      for (const language of audience === 'guest' ? Object.keys(languages) : ['ko']) {
        if (audience === 'guest') await publicPage.locator('.language-options').getByRole('button', { name: languages[language], exact: true }).click();
        for (const entry of source.records) {
          const name = data.facilities.find(item => item.id === entry.jsonId).translations[language].name;
          assert.equal(await publicPage.getByText(name, { exact: true }).count(), 0);
          await publicPage.getByRole('searchbox').fill(name);
          await publicPage.waitForFunction(() => document.querySelectorAll('.facility-card').length === 0);
        }
        await publicPage.getByRole('searchbox').fill('');
        await publicPage.waitForFunction(() => document.querySelectorAll('.facility-card').length === 5);
      }
      results.push(`PASS ${audience}: all five staged records absent from public results and exact-name searches; original five public demos retained`);
    }
    assert.deepEqual(errors, []); const origins = [new URL(adminURL).origin, new URL(publicURL).origin];
    assert.ok(requests.every(url => origins.includes(new URL(url).origin)));
    files.forEach((file, index) => assert.deepEqual(fs.readFileSync(file), original[index]));
    results.push('PASS zero browser errors/external API requests; source hotel/facility bytes unchanged by QA; full UI suites not rerun');
    fs.mkdirSync(artifactDir, { recursive: true }); fs.writeFileSync(path.join(artifactDir, 'batch01-admin-data-results.txt'), results.join('\n') + '\n');
    console.log(results.join('\n'));
  } finally { await context.close(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
