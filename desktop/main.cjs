const { app, BrowserWindow, protocol, net, shell, session, Menu, ipcMain } = require('electron');
const { readFileSync } = require('node:fs');
const { resolve, relative, isAbsolute, join } = require('node:path');
const { pathToFileURL } = require('node:url');
const { createAdminAuth } = require('./admin-auth.cjs');

protocol.registerSchemesAsPrivileged([
  { scheme: 'cph', privileges: { standard: true, secure: true, supportFetchAPI: true } },
  { scheme: 'cph-admin', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);
const webRoot = resolve(__dirname, 'web');
const adminRoot = resolve(__dirname, 'admin');
const mapLinks = new Set(JSON.parse(readFileSync(resolve(__dirname, 'map-links.json'), 'utf8')).map(url => new URL(url).href));
// Existing AJV schema validator compiles functions locally; remote code stays blocked.
const csp = "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'";
let staffWindow = null;
let adminWindow = null;
let adminAuth = null;

function openMap(url) {
  try {
    const target = new URL(url).href;
    if (mapLinks.has(target)) void shell.openExternal(target).catch(() => {});
  } catch { /* Unknown schemes and malformed links never leave the app. */ }
}
function localFileResponse(request, scheme, root) {
  try {
    const url = new URL(request.url);
    const file = resolve(root, '.' + decodeURIComponent(url.pathname));
    const rel = relative(root, file);
    if (url.protocol !== scheme + ':' || url.hostname !== 'app' ||
        !rel || rel.startsWith('..') || isAbsolute(rel)) return Promise.resolve(new Response('Not found', { status: 404 }));
    return net.fetch(pathToFileURL(file).href).then(response => {
      const headers = new Headers(response.headers);
      headers.set('Content-Security-Policy', csp);
      headers.set('Cache-Control', 'no-store');
      return new Response(response.body, { status: response.status, headers });
    });
  } catch { return Promise.resolve(new Response('Not found', { status: 404 })); }
}
function trustedStaffFrame(event) {
  if (!staffWindow || staffWindow.isDestroyed() || event.sender.id !== staffWindow.webContents.id) return false;
  try {
    const url = new URL(event.senderFrame.url);
    return url.protocol === 'cph:' && url.hostname === 'app' && url.pathname === '/index.html' &&
      /^#\/staff(?:$|[/?])/.test(url.hash);
  } catch { return false; }
}
function setupAdminIpc() {
  adminAuth = createAdminAuth(join(app.getPath('userData'), 'admin-auth.json'));
  ipcMain.handle('cph-admin:status', event =>
    trustedStaffFrame(event) ? adminAuth.status() : { ready: false, configured: true, error: '직원용 화면에서만 접근할 수 있습니다.' });
  ipcMain.handle('cph-admin:setup', (event, input) => {
    if (!trustedStaffFrame(event) || !input || typeof input !== 'object') return { ok: false, message: '허용되지 않은 접근입니다.' };
    return adminAuth.setup(input.password, input.confirmation);
  });
  ipcMain.handle('cph-admin:open', async (event, input) => {
    if (!trustedStaffFrame(event) || !input || typeof input !== 'object') return { ok: false, message: '허용되지 않은 접근입니다.' };
    const check = adminAuth.verify(input.password);
    if (!check.ok) return check;
    if (adminWindow && !adminWindow.isDestroyed()) {
      adminWindow.focus();
      return { ok: true };
    }
    adminWindow = new BrowserWindow({
      width: 1320, height: 920, minWidth: 860, minHeight: 620,
      title: 'CPH 관리자 · 이 PC 전용', parent: staffWindow,
      webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, devTools: false },
    });
    adminWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    adminWindow.webContents.on('will-navigate', (navEvent, destination) => {
      try {
        const url = new URL(destination);
        if (url.protocol === 'cph-admin:' && url.hostname === 'app' && url.pathname === '/index.html') return;
      } catch { /* blocked below */ }
      navEvent.preventDefault();
    });
    adminWindow.on('closed', () => { adminWindow = null; });
    try {
      await adminWindow.loadURL('cph-admin://app/index.html');
    } catch {
      if (adminWindow && !adminWindow.isDestroyed()) adminWindow.close();
      return { ok: false, message: '관리자 화면 파일을 열지 못했습니다. 관리자 포함 실행 파일로 다시 설치하세요.' };
    }
    return { ok: true };
  });
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 1360, height: 900, minWidth: 800, minHeight: 600,
    title: 'CPH Front Desk · 공개 테스트 DEMO',
    webPreferences: {
      nodeIntegration: false, contextIsolation: true, sandbox: true, devTools: false,
      preload: join(__dirname, 'staff-preload.cjs'),
    },
  });
  staffWindow = window;
  window.on('closed', () => { if (adminWindow && !adminWindow.isDestroyed()) adminWindow.close(); staffWindow = null; });
  window.webContents.setWindowOpenHandler(({ url }) => { openMap(url); return { action: 'deny' }; });
  window.webContents.on('will-navigate', (event, url) => {
    const target = new URL(url);
    if (target.protocol !== 'cph:' || target.hostname !== 'app' || target.pathname !== '/index.html') {
      event.preventDefault(); openMap(url);
    }
  });
  await window.loadURL('cph://app/index.html');
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  session.defaultSession.setPermissionRequestHandler((_contents, permission, callback) => callback(permission === 'clipboard-sanitized-write'));
  session.defaultSession.setPermissionCheckHandler((_contents, permission) => permission === 'clipboard-sanitized-write');
  protocol.handle('cph', request => localFileResponse(request, 'cph', webRoot));
  protocol.handle('cph-admin', request => {
    if (!adminWindow || adminWindow.isDestroyed()) return new Response('Not found', { status: 404 });
    return localFileResponse(request, 'cph-admin', adminRoot);
  });
  setupAdminIpc();
  await createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) void createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
