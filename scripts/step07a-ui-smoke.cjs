/* Actual approved source data QA. Temporary admin edits never change source JSON. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const baseURL = process.env.CPH_UI_BASE_URL || 'http://127.0.0.1:5175';
const adminURL = process.env.CPH_ADMIN_BASE_URL || 'http://127.0.0.1:5190';
const artifactDir = process.env.CPH_UI_ARTIFACT_DIR || '/tmp/cph-step07a-qa';
const hotelFile = path.join(__dirname, '../src/data/hotel.json');
const facilityFile = path.join(__dirname, '../src/data/facilities.json');
const hotelBytes = fs.readFileSync(hotelFile), facilityBytes = fs.readFileSync(facilityFile);
const hotel = JSON.parse(hotelBytes), reference = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/reference/step07a-approved-copy.json')));
const labels = { ko: '한국어', en: 'English', 'zh-CN': '简体中文', ja: '日本語' };
const results = [], errors = [], requests = [];

function observe(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => requests.push(request.url()));
}
async function confirm(page, action) {
  const dialogPromise = page.waitForEvent('dialog'), pending = action();
  const dialog = await dialogPromise; assert.equal(dialog.type(), 'confirm'); await dialog.accept(); await pending;
}
async function download(page, label) {
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: label, exact: true }).click();
  const item = await pending; assert.equal(await item.failure(), null);
  return JSON.parse(fs.readFileSync(await item.path(), 'utf8'));
}

(async () => {
  const { MESSAGES } = await import('../src/i18n/messages.ts');
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CPH_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage(); observe(page);
    await page.goto(`${baseURL}/guest`); await page.locator('#guest-hotel-checkIn:not([disabled])').waitFor();
    for (const [language, topic, screenshot] of [['en', 'breakfast', 'breakfast-en-390.png'], ['ko', 'checkIn', 'check-in-ko-390.png'], ['zh-CN', 'roomUsage', 'room-information-zh-CN-390.png'], ['ja', 'roomUsage', 'pet-policy-ja-390.png']]) {
      await page.locator('.language-options').getByRole('button', { name: labels[language], exact: true }).click();
      await page.locator(`#guest-hotel-${topic}`).click();
      assert.deepEqual(await page.locator('.hotel-topic-text p').allTextContents(), hotel.translations[language][topic].split('\n\n'));
      assert.deepEqual(await page.locator('#guest-hotel-detail .detail-facts > div:last-child dd p').allTextContents(), hotel.translations[language].notes.split('\n\n'));
      assert.equal(await page.getByText(reference.records.find(record => record.id === 'H33').translations[language], { exact: true }).count(), 0);
      assert.ok(await page.getByText(MESSAGES[language].ui.demoWarning, { exact: true }).isVisible());
      const target = language === 'ja' ? page.locator('#guest-hotel-detail p').filter({ hasText: reference.records.find(record => record.id === 'H34').translations.ja }) : page.locator('#guest-hotel-detail h3');
      await target.evaluate(element => { document.activeElement?.blur(); scrollTo(0, scrollY + element.getBoundingClientRect().top - 170); });
      await page.screenshot({ path: path.join(artifactDir, screenshot) });
      results.push(`PASS actual approved ${language}/${topic} copy and notes; H33 absent; 390px screenshot ${screenshot}`);
    }
    await context.close();
    const adminContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
    const admin = await adminContext.newPage(); observe(admin); await admin.goto(adminURL);
    await admin.getByRole('button', { name: '호텔 기본 정보', exact: true }).click();
    assert.equal(await admin.getByLabel('체크인 시간', { exact: true }).inputValue(), '15:00');
    assert.equal(await admin.getByLabel('체크아웃 시간', { exact: true }).inputValue(), '12:00');
    assert.equal(await admin.getByLabel('호텔 마지막 확인일', { exact: true }).inputValue(), '2026-10-15');
    for (const language of Object.keys(labels)) {
      await admin.getByRole('group', { name: '편집 언어', exact: true }).getByRole('button', { name: labels[language], exact: true }).click();
      for (const [label, field] of [['호텔명','name'],['호텔 설명','description'],['호텔 주소','address'],['체크인 안내','checkIn'],['체크아웃 안내','checkOut'],['조식 안내','breakfast'],['주차 안내','parking'],['객실 이용 안내','roomUsage'],['호텔 참고 사항','notes']]) assert.equal(await admin.getByLabel(label, { exact: true }).inputValue(), hotel.translations[language][field]);
    }
    await admin.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
    await confirm(admin, () => admin.getByLabel('호텔 JSON 불러오기', { exact: true }).setInputFiles(hotelFile));
    assert.deepEqual(await download(admin, '호텔 JSON 다운로드'), hotel);
    await admin.getByRole('button', { name: '호텔 기본 정보', exact: true }).click();
    await admin.getByRole('group', { name: '편집 언어' }).getByRole('button', { name: '한국어', exact: true }).click();
    await admin.getByLabel('호텔 설명', { exact: true }).fill('관리자 동작 확인용 가상 초안 (원본에 저장하지 않음)');
    await admin.getByRole('button', { name: '호텔 편집 저장', exact: true }).click();
    await admin.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
    const edited = await download(admin, '호텔 JSON 다운로드');
    const expected = structuredClone(hotel); expected.translations.ko.description = '관리자 동작 확인용 가상 초안 (원본에 저장하지 않음)';
    assert.deepEqual(edited, expected);
    await confirm(admin, () => admin.getByLabel('호텔 JSON 불러오기', { exact: true }).setInputFiles({ name: 'approved-hotel-roundtrip.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(edited)) }));
    assert.deepEqual(await download(admin, '호텔 JSON 다운로드'), expected);
    await admin.getByRole('button', { name: '데이터 검증', exact: true }).click();
    assert.ok(await admin.getByRole('heading', { name: '호텔 개발 데이터 검증 · PASS', exact: true }).isVisible());
    assert.ok(await admin.getByRole('heading', { name: '현재 운영 배포 검증 · FAIL', exact: true }).isVisible());
    await adminContext.close();
    results.push('PASS Admin loads actual hotel JSON, all 4 languages/common fields, import/export unchanged, temporary edit/export/reimport, valid schema and blocked demo deployment');
    assert.deepEqual(fs.readFileSync(hotelFile), hotelBytes); assert.deepEqual(fs.readFileSync(facilityFile), facilityBytes);
    assert.deepEqual(errors, []); assert.ok(requests.every(url => [new URL(baseURL).origin, new URL(adminURL).origin].includes(new URL(url).origin) || url.startsWith('data:')));
    results.push('PASS source hotel/facility bytes unchanged by UI QA; no JS/console/HTTP errors or external APIs/resources');
    fs.writeFileSync(path.join(artifactDir, 'approved-hotel-ui-results.txt'), results.join('\n') + '\n'); console.log(results.join('\n'));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
