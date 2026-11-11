// Desktop shell for Pallet Flow. The game itself is the same web page; this adds a window,
// fullscreen, a quit button and (when a Steam app id is present) Steam achievements.
const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path'), fs = require('fs');

// Build flavour: "demo" unless a file named FULL sits next to the app, or --full is passed.
const full = process.argv.includes('--full') || fs.existsSync(path.join(__dirname, 'FULL'));
const demo = process.argv.includes('--demo') || !full;

// Steam is optional. It only starts if steamworks.js is installed and steam_appid.txt holds your app id.
let steam = null;
try {
  const idFile = path.join(__dirname, 'steam_appid.txt');
  if (fs.existsSync(idFile)) steam = require('steamworks.js').init(Number(fs.readFileSync(idFile, 'utf8').trim()));
} catch (e) { console.log('Steam not available:', e.message); }

let win;
function create() {
  win = new BrowserWindow({
    width: 1600, height: 900, minWidth: 1024, minHeight: 640, backgroundColor: '#1d1f21', show: false,
    title: 'Pallet Flow: Depot Manager',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  Menu.setApplicationMenu(null);
  const local = path.join(__dirname, 'game', 'game.html');
  const page = fs.existsSync(local) ? local : path.join(__dirname, '..', 'game.html');
  win.loadFile(page, { search: demo ? 'demo=1' : '' });
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
}
ipcMain.on('pf-quit', () => app.quit());
ipcMain.on('pf-fullscreen', () => win && win.setFullScreen(!win.isFullScreen()));
ipcMain.on('pf-unlock', (e, key) => { try { if (steam) steam.achievement.activate('ACH_' + String(key).toUpperCase()); } catch (err) {} });
app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
