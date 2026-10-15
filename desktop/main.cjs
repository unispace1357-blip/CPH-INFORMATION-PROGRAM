const { app, BrowserWindow, protocol, net, shell, session, Menu } = require('electron');
const { readFileSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');

protocol.registerSchemesAsPrivileged([{ scheme: 'cph', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);
const webRoot = resolve(__dirname, 'web');
const mapLinks = new Set(JSON.parse(readFileSync(resolve(__dirname, 'map-links.json'), 'utf8')).map(url => new URL(url).href));
// The existing AJV schema validator compiles functions locally; external scripts stay blocked.
const csp = "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'";

function openMap(url) {
  try {
    const target = new URL(url).href;
    if (mapLinks.has(target)) void shell.openExternal(target).catch(() => {});
  } catch { /* Unknown schemes and malformed links never leave the app. */ }
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 1360, height: 900, minWidth: 800, minHeight: 600,
    title: 'CPH Front Desk · 공개 테스트 DEMO',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, devTools: false },
  });
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
  protocol.handle('cph', async request => {
    try {
      const url = new URL(request.url);
      const file = resolve(webRoot, '.' + decodeURIComponent(url.pathname));
      const rel = relative(webRoot, file);
      if (url.hostname !== 'app' || !rel || rel.startsWith('..') || isAbsolute(rel)) return new Response('Not found', { status: 404 });
      const response = await net.fetch(pathToFileURL(file).href);
      const headers = new Headers(response.headers);
      headers.set('Content-Security-Policy', csp);
      return new Response(response.body, { status: response.status, headers });
    } catch { return new Response('Not found', { status: 404 }); }
  });
  await createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) void createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
