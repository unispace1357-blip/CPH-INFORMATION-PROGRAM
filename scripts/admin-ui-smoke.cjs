/* Local-only STEP 06 QA. Files/fixtures stay in browser memory and QA output, never src/data. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const baseURL = process.env.CPH_ADMIN_BASE_URL || 'http://127.0.0.1:5190';
const origin = new URL(baseURL).origin;
const artifactDir = process.env.CPH_UI_ARTIFACT_DIR || '/tmp/cph-step06-admin-qa';
const results = [], errors = [], requests = [];
const sourceFiles = ['facilities.json', 'hotel.json'].map(name => path.join(__dirname, '../src/data', name));
const original = sourceFiles.map(file => fs.readFileSync(file));
const sourceRecordCount = JSON.parse(original[0].toString('utf8')).facilities.length;
const names = { ko: 'Fictional UI QA <b>한글</b>', en: 'Fictional UI QA English', 'zh-CN': '虚构 UI QA 中文', ja: '架空 UI QA 日本語' };
const languages = { ko: '한국어', en: 'English', 'zh-CN': '简体中文', ja: '日本語' };

async function confirm(page, action, accept, match) {
  const dialogPromise = page.waitForEvent('dialog');
  const pending = action();
  const dialog = await dialogPromise;
  assert.equal(dialog.type(), 'confirm');
  assert.match(dialog.message(), match);
  if (accept) await dialog.accept(); else await dialog.dismiss();
  await pending;
}
async function upload(page, label, value, accept = true) {
  await confirm(page, () => page.getByLabel(label, { exact: true }).setInputFiles({ name: 'qa-fixture.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) }), accept, /교체할까요/);
}
async function download(page, label) {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: label, exact: true }).click();
  const result = await pending;
  assert.equal(await result.failure(), null);
  return { text: fs.readFileSync(await result.path(), 'utf8'), filename: result.suggestedFilename() };
}
async function records(page, count) {
  await page.waitForFunction(count => document.querySelectorAll('.admin-records li').length === count, count);
}
async function language(page, code) { await page.getByRole('group', { name: '편집 언어' }).getByRole('button', { name: languages[code], exact: true }).click(); }
async function layout(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
  const clipped = await page.locator('h1,h2,h3,p,label,button,dd').evaluateAll(elements => elements.filter(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
  assert.deepEqual(clipped, [], 'Clipped text');
}
async function capture(page, name) {
  await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
  await page.screenshot({ path: path.join(artifactDir, name), fullPage: true });
}

(async () => {
  const { adminFacilities, adminHotel } = await import('./admin-test-fixtures.ts');
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CPH_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => requests.push(request.url()));
  try {
    assert.equal((await page.goto(baseURL)).status(), 200);
    await page.getByRole('heading', { name: 'CPH ADMIN MANAGER', exact: true }).waitFor();
    await records(page, sourceRecordCount); await layout(page);
    assert.ok(await page.getByText('운영 배포 준비 미완료', { exact: true }).isVisible());
    await capture(page, 'admin-main-1280.png');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
    results.push('PASS separate localhost admin entry; source demo + private records; keyboard skip and 1280px layout');
    await page.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
    await upload(page, '시설 JSON 불러오기', adminFacilities());
    await upload(page, '호텔 JSON 불러오기', adminHotel());
    for (const invalid of ['{', 'null', JSON.stringify({ ...adminFacilities(), schemaVersion: 3 }), JSON.stringify({ ...adminFacilities(), facilities: [adminFacilities().facilities[0], adminFacilities().facilities[0]] }), JSON.stringify(adminHotel())]) {
      await page.getByLabel('시설 JSON 불러오기', { exact: true }).setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from(invalid) });
      await page.getByRole('alert').waitFor();
      assert.deepEqual(JSON.parse((await download(page, '전체 시설 JSON 다운로드')).text), adminFacilities());
    }
    await page.getByLabel('시설 JSON 불러오기', { exact: true }).setInputFiles({ name: 'large.json', mimeType: 'application/json', buffer: Buffer.alloc(2 * 1024 * 1024 + 1, 'x') });
    await page.getByRole('alert').getByText(/최대 2MB/).first().waitFor();
    await upload(page, '시설 JSON 불러오기', { ...adminFacilities(), facilities: [] }, false);
    assert.deepEqual(JSON.parse((await download(page, '전체 시설 JSON 다운로드')).text), adminFacilities());
    await page.getByLabel('시설 데이터 상태', { exact: true }).selectOption('production');
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByLabel('시설 데이터 상태', { exact: true }).inputValue(), 'demo');
    results.push('PASS independent imports; malformed/schema/version/duplicate/wrong-kind/oversized files and replacement cancellation preserve workspace; incomplete production transition blocked');

    await page.getByRole('button', { name: '시설 관리', exact: true }).click(); await records(page, 2);
    await page.getByRole('button', { name: '신규 시설 추가', exact: true }).click();
    assert.equal(await page.getByLabel('공개 시설로 표시', { exact: true }).isChecked(), false);
    assert.equal(await page.getByLabel('마지막 확인일', { exact: true }).inputValue(), '');
    assert.equal(await page.getByLabel('예상 도보시간 (분)', { exact: true }).inputValue(), '');
    await page.getByLabel('시설 ID', { exact: true }).fill('qa-admin-new');
    for (const code of Object.keys(languages)) {
      await language(page, code);
      await page.getByLabel('시설명', { exact: true }).fill(names[code]);
      for (const label of ['시설 설명', '주소', '영업시간', '이동 안내', '참고 사항', '휴무일']) await page.getByLabel(label, { exact: true }).fill(`Fictional UI QA ${code} ${label}\n한글 中文 日本語`);
    }
    await language(page, 'ko');
    await page.getByRole('button', { name: '검색 키워드 추가', exact: true }).click();
    await page.getByLabel('검색 키워드 1', { exact: true }).fill('qa-ko');
    await page.getByRole('button', { name: '검색 키워드 추가', exact: true }).click();
    await page.getByLabel('검색 키워드 2', { exact: true }).fill('qa-ko');
    await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click();
    await page.getByRole('alert').waitFor(); await records(page, 2);
    assert.equal(await page.getByLabel('검색 키워드 2', { exact: true }).inputValue(), 'qa-ko');
    await page.getByLabel('검색 키워드 2', { exact: true }).fill('qa-ko-2');
    for (let i = 1; i <= 3; i++) { await page.getByRole('button', { name: '영어 응대 문구 추가', exact: true }).click(); await page.getByLabel(`영어 응대 문구 ${i}`, { exact: true }).fill(`Fictional ${['first', 'second', 'third'][i - 1]} UI.`); }
    await page.getByRole('button', { name: '영어 응대 문구 3 위로', exact: true }).click();
    await page.getByRole('button', { name: '영어 응대 문구 1 삭제', exact: true }).click();
    await page.getByLabel('영어 응대 문구 1', { exact: true }).fill('Fictional edited UI.');
    await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click(); await records(page, 3);
    assert.ok(await page.getByLabel('시설 ID', { exact: true }).getAttribute('readonly') !== null);
    assert.equal(await page.locator('.admin-records h3 b').count(), 0);
    await page.getByLabel('카테고리', { exact: true }).selectOption('atm');
    await page.getByLabel('공개 시설로 표시', { exact: true }).check();
    await page.getByLabel('예상 도보시간 (분)', { exact: true }).fill('-1');
    await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click(); await page.getByRole('alert').waitFor();
    assert.equal(await page.getByLabel('예상 도보시간 (분)', { exact: true }).inputValue(), '-1');
    await page.getByLabel('예상 도보시간 (분)', { exact: true }).fill('0');
    await page.getByLabel('마지막 확인일', { exact: true }).fill('2024-02-29');
    await page.getByRole('button', { name: '편집 내용 저장', exact: true }).click();
    await confirm(page, () => page.getByRole('button', { name: '삭제 qa-admin-public', exact: true }).click(), false, /qa-admin-public/); await records(page, 3);
    await confirm(page, () => page.getByRole('button', { name: '삭제 qa-admin-public', exact: true }).click(), true, /qa-admin-public/); await records(page, 2);
    await capture(page, 'admin-facility-editor-1280.png');
    await page.getByLabel('공개 상태 필터', { exact: true }).selectOption('public'); await records(page, 1);
    await page.getByLabel('카테고리 필터', { exact: true }).selectOption('cafe'); await records(page, 0);
    await page.getByLabel('카테고리 필터', { exact: true }).selectOption('all');
    await page.getByLabel('공개 상태 필터', { exact: true }).selectOption('all'); await records(page, 2);
    await page.getByLabel('시설명 검색', { exact: true }).fill('日本語'); await records(page, 1);
    await page.getByLabel('시설명 검색', { exact: true }).fill(''); await records(page, 2);
    results.push('PASS private defaults, multilingual independent edits, duplicate keyword save blocked without loss, phrases edit/order/delete, ID lock, category/public/date/walking edits, delete confirm/cancel and list AND filters');

    await page.getByLabel('참고 사항', { exact: true }).fill('Fictional unsaved local edit');
    await confirm(page, () => page.getByRole('button', { name: '편집 qa-admin-private', exact: true }).click(), false, /저장하지 않은/);
    assert.equal(await page.getByLabel('시설 ID', { exact: true }).inputValue(), 'qa-admin-new');
    assert.equal(await page.getByLabel('참고 사항', { exact: true }).inputValue(), 'Fictional unsaved local edit');
    await confirm(page, () => page.getByRole('button', { name: '호텔 기본 정보', exact: true }).click(), false, /저장하지 않은/);
    assert.equal(await page.getByLabel('시설 ID', { exact: true }).inputValue(), 'qa-admin-new');
    await confirm(page, () => page.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click(), false, /저장하지 않은/);
    assert.equal(await page.getByLabel('참고 사항', { exact: true }).inputValue(), 'Fictional unsaved local edit');
    await confirm(page, () => page.getByRole('button', { name: '호텔 기본 정보', exact: true }).click(), true, /저장하지 않은/);
    assert.equal(await page.getByLabel('체크인 시간', { exact: true }).inputValue(), '');
    assert.equal(await page.getByLabel('체크아웃 시간', { exact: true }).inputValue(), '');
    await page.getByLabel('체크인 시간', { exact: true }).fill('24:00');
    await page.getByRole('button', { name: '호텔 편집 저장', exact: true }).click(); await page.getByRole('alert').waitFor();
    assert.equal(await page.getByLabel('체크인 시간', { exact: true }).inputValue(), '24:00');
    await page.getByLabel('체크인 시간', { exact: true }).fill('01:23');
    await page.getByLabel('체크아웃 시간', { exact: true }).fill('04:56');
    await page.getByLabel('호텔 마지막 확인일', { exact: true }).fill('2024-02-29');
    for (const code of Object.keys(languages)) {
      await language(page, code);
      for (const label of ['호텔명', '호텔 설명', '호텔 주소', '체크인 안내', '체크아웃 안내', '조식 안내', '주차 안내', '객실 이용 안내', '호텔 참고 사항']) await page.getByLabel(label, { exact: true }).fill(`Fictional UI Hotel ${code} ${label}`);
    }
    await page.getByRole('button', { name: '호텔 편집 저장', exact: true }).click();
    await capture(page, 'admin-hotel-editor-1280.png');
    await page.getByRole('button', { name: '데이터 검증', exact: true }).click();
    assert.ok(await page.getByRole('heading', { name: '현재 운영 배포 검증 · FAIL', exact: true }).isVisible());
    assert.ok(await page.getByRole('heading', { name: '운영 전환 전 필수 정보 검사 (상태는 변경하지 않음) · PASS', exact: true }).isVisible());
    await capture(page, 'admin-validation-1280.png');
    await page.getByRole('button', { name: '호텔 기본 정보', exact: true }).click();
    await confirm(page, () => page.getByLabel('호텔 데이터 상태', { exact: true }).selectOption('production'), false, /PRODUCTION/);
    assert.equal(await page.getByLabel('호텔 데이터 상태', { exact: true }).inputValue(), 'demo');
    await confirm(page, () => page.getByLabel('호텔 데이터 상태', { exact: true }).selectOption('production'), true, /PRODUCTION/);
    await page.getByRole('button', { name: '호텔 편집 저장', exact: true }).click();
    await page.getByRole('button', { name: '가져오기 / 내보내기', exact: true }).click();
    await confirm(page, () => page.getByLabel('시설 데이터 상태', { exact: true }).selectOption('production'), true, /PRODUCTION/);
    const full = await download(page, '전체 시설 JSON 다운로드'), hotel = await download(page, '호텔 JSON 다운로드'), published = await download(page, '운영 검증 후 공개 시설 다운로드');
    assert.equal(full.filename, 'facilities.json'); assert.equal(hotel.filename, 'hotel.json'); assert.equal(published.filename, 'facilities.public.json');
    const dataset = JSON.parse(full.text), hotelData = JSON.parse(hotel.text), publicData = JSON.parse(published.text);
    const record = dataset.facilities.find(item => item.id === 'qa-admin-new');
    for (const code of Object.keys(languages)) { assert.equal(record.translations[code].name, names[code]); assert.ok(hotelData.translations[code].breakfast.includes(`Fictional UI Hotel ${code}`)); }
    assert.deepEqual(record.englishPhrases, ['Fictional edited UI.', 'Fictional second UI.']); assert.deepEqual(record.keywords.ko, ['qa-ko', 'qa-ko-2']); assert.equal(record.walkingMinutes, 0);
    assert.deepEqual(publicData.facilities.map(item => item.id), ['qa-admin-new']); assert.ok(!published.text.includes('qa-admin-private')); assert.equal(dataset.dataStatus, 'production');
    assert.ok(await page.locator('.admin-status').getByText('파일 저장 확인이 필요한 변경사항', { exact: true }).isVisible());
    await confirm(page, () => page.getByRole('button', { name: '전체 시설 파일 저장 확인', exact: true }).click(), false, /직접 확인/);
    assert.ok(await page.locator('.admin-status').getByText('파일 저장 확인이 필요한 변경사항', { exact: true }).isVisible());
    await confirm(page, () => page.getByRole('button', { name: '전체 시설 파일 저장 확인', exact: true }).click(), true, /직접 확인/);
    await confirm(page, () => page.getByRole('button', { name: '호텔 파일 저장 확인', exact: true }).click(), true, /직접 확인/);
    assert.ok(await page.locator('.admin-status').getByText('작업 데이터 변경 없음', { exact: true }).isVisible());
    await upload(page, '시설 JSON 불러오기', dataset); await upload(page, '호텔 JSON 불러오기', hotelData);
    assert.deepEqual(JSON.parse((await download(page, '전체 시설 JSON 다운로드')).text), dataset);
    assert.deepEqual(JSON.parse((await download(page, '호텔 JSON 다운로드')).text), hotelData);
    results.push('PASS cancel/discard guards on facility/menu/file-management moves, invalid hotel time retained, four-language hotel edit, development vs production checks, explicit/cancelled transitions, actual Unicode downloads/reimports and public-only snapshot; download request keeps dirty warning until manual file confirmation');

    for (const width of [390, 768, 1280, 1440]) { await page.setViewportSize({ width, height: 900 }); await layout(page); }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole('button', { name: '시설 관리', exact: true }).click();
    await page.getByRole('button', { name: '편집 qa-admin-new', exact: true }).click();
    await language(page, 'ko'); await page.getByLabel('참고 사항', { exact: true }).fill('Fictional beforeunload QA');
    const beforeUnload = page.waitForEvent('dialog');
    const refresh = page.reload().catch(error => error);
    const dialog = await beforeUnload; assert.equal(dialog.type(), 'beforeunload'); await dialog.dismiss(); await refresh;
    assert.equal(await page.getByLabel('참고 사항', { exact: true }).inputValue(), 'Fictional beforeunload QA');
    const discard = page.waitForEvent('dialog'), reload = page.reload(); const accepted = await discard; assert.equal(accepted.type(), 'beforeunload'); await accepted.accept(); await reload;
    await records(page, sourceRecordCount); assert.ok(await page.getByText('운영 배포 준비 미완료', { exact: true }).isVisible());
    results.push('PASS 390/768/1280/1440px layout; actual Chromium beforeunload cancel retains editor, accepted reload returns source demo (memory only)');
    for (let i = 0; i < sourceFiles.length; i++) assert.deepEqual(fs.readFileSync(sourceFiles[i]), original[i]);
    assert.deepEqual(errors, [], 'JS/console/HTTP errors');
    assert.ok(requests.every(url => new URL(url).origin === origin || url.startsWith('data:')), 'Remote API/resource request');
    results.push('PASS no source-file changes, no JS/console/HTTP errors, no external APIs/resources; all UI fixtures fictional and local');
    fs.writeFileSync(path.join(artifactDir, 'admin-results.txt'), results.join('\n') + '\n');
    console.log(results.join('\n'));
  } finally { await context.close(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
