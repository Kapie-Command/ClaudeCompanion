const { app, BrowserWindow, ipcMain, clipboard, Tray, Menu, globalShortcut, screen } = require('electron')
const path = require('path')
const fs = require('fs')

// --- Inline Store (persists to %LOCALAPPDATA%\ClaudeCompanion\config.json) ---
class Store {
  constructor() {
    const configDir = path.join(
      process.env.LOCALAPPDATA || path.join(require('os').homedir(), 'AppData', 'Local'),
      'ClaudeCompanion'
    )
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    this.filePath = path.join(configDir, 'config.json')
    this.data = this._load()
  }
  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
      }
    } catch (_) {}
    return {}
  }
  _save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
  }
  get(key, defaultValue) {
    return key in this.data ? this.data[key] : defaultValue
  }
  set(key, value) {
    this.data[key] = value
    this._save()
  }
  getAll() {
    return { ...this.data }
  }
}

let mainWindow = null
let popupWindow = null
let tray = null
const store = new Store()

function interpolate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined && variables[key] !== '' ? variables[key] : match
  })
}

function getPopupHTML() {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#12121a; color:#e8e6f0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; border:1px solid #2a2a3a; border-radius:10px; overflow:hidden; }
.header { display:flex; align-items:center; justify-content:space-between; padding:8px 14px; border-bottom:1px solid #2a2a3a; }
.header-title { font-size:11px; font-weight:500; color:#9994b8; }
.header-hint { font-size:10px; color:#6b6589; }
.empty { padding:28px 14px; text-align:center; }
.empty p { font-size:12px; color:#6b6589; }
.empty .sub { font-size:11px; margin-top:4px; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; padding:8px; }
.card { text-align:left; background:#1a1a25; border:1px solid #2a2a3a; border-radius:8px; padding:8px 10px; cursor:pointer; transition:all .15s; }
.card:hover { background:#222230; border-color:#3a3a50; }
.card.copied { background:rgba(124,107,245,.15); border-color:rgba(124,107,245,.4); }
.card-head { display:flex; align-items:center; gap:5px; margin-bottom:3px; }
.heart { color:#7c6bf5; font-size:10px; }
.card-title { font-size:11px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.card-preview { font-size:10px; color:#6b6589; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
</style></head><body>
<div class="header"><span class="header-title">Quick Access — Favorites</span><span class="header-hint">Click outside to close</span></div>
<div id="content"></div>
<script>
async function init() {
  const data = await window.popupAPI.getFavorites();
  const el = document.getElementById('content');
  if (!data.favorites.length) {
    el.innerHTML = '<div class="empty"><p>No favorites yet</p><p class="sub">Right-click a template and select "Favorite"</p></div>';
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'grid';
  data.favorites.forEach(f => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<div class="card-head"><span class="heart">♥</span><span class="card-title">' +
      esc(f.title) + '</span></div><p class="card-preview">' + esc(f.preview) + '</p>';
    card.onclick = async () => {
      await window.popupAPI.copyText(f.copyText);
      card.className = 'card copied';
      card.querySelector('.card-title').textContent = '✓ Copied';
      setTimeout(() => window.popupAPI.close(), 350);
    };
    grid.appendChild(card);
  });
  el.appendChild(grid);
}
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
init();
</script></body></html>`;
}

function buildFavoritesData() {
  const templates = store.get('templates', [])
  const favorites = templates.filter(t => t.isFavorited).slice(0, 6)
  const savedVars = store.get('variables', {})
  const { custom, ...builtIn } = savedVars
  const variables = { ...builtIn, ...(custom || {}) }
  const contextBlocks = (store.get('contextBlocks', []) || []).filter(b => b.active)
  const contextPrefix = contextBlocks.length > 0 ? contextBlocks.map(b => b.text).join('\n') + '\n\n' : ''

  return favorites.map(t => ({
    id: t.id,
    title: t.title,
    preview: interpolate(t.body, variables).slice(0, 120),
    copyText: contextPrefix + interpolate(t.body, variables),
  }))
}

function showFavoritesPopup() {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.close()
    popupWindow = null
    return
  }

  const cursor = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(cursor)
  const popupWidth = 340
  const popupHeight = 280

  let x = cursor.x
  let y = cursor.y
  if (x + popupWidth > display.workArea.x + display.workArea.width) {
    x = display.workArea.x + display.workArea.width - popupWidth
  }
  if (y + popupHeight > display.workArea.y + display.workArea.height) {
    y = display.workArea.y + display.workArea.height - popupHeight
  }

  popupWindow = new BrowserWindow({
    width: popupWidth,
    height: popupHeight,
    x,
    y,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'popupPreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  popupWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(getPopupHTML()))

  popupWindow.once('ready-to-show', () => popupWindow.show())
  popupWindow.on('blur', () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.close()
      popupWindow = null
    }
  })
  popupWindow.on('closed', () => { popupWindow = null })
}

function createWindow() {
  const windowState = store.get('windowState', { width: 960, height: 700 })

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 700,
    minHeight: 500,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'))
  }

  mainWindow.on('close', (e) => {
    const settings = store.get('settings', {})
    if (settings.minimizeToTray && tray) {
      e.preventDefault()
      mainWindow.hide()
      return
    }
    saveWindowState()
  })

  mainWindow.on('moved', saveWindowState)
  mainWindow.on('resized', saveWindowState)

  mainWindow.on('maximize', () => mainWindow.webContents.send('window:maximized', true))
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:maximized', false))
}

function saveWindowState() {
  if (!mainWindow) return
  const bounds = mainWindow.getBounds()
  store.set('windowState', bounds)
}

function createTray() {
  tray = new Tray(path.join(__dirname, '..', '..', 'resources', 'icon.png'))
  tray.setToolTip('ClaudeCompanion')
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    }
  })
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit() } }
  ]))
}

// IPC handlers
ipcMain.handle('store:get', (_e, key, defaultValue) => store.get(key, defaultValue))
ipcMain.handle('store:set', (_e, key, value) => store.set(key, value))
ipcMain.handle('store:getAll', () => store.getAll())

ipcMain.handle('clipboard:write', (_e, text) => {
  clipboard.writeText(text)
  return true
})

ipcMain.handle('window:minimize', () => mainWindow?.minimize())
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.handle('window:close', () => mainWindow?.close())
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)
ipcMain.handle('window:toggleDevTools', () => mainWindow?.webContents.toggleDevTools())

ipcMain.handle('popup:getFavorites', () => ({ favorites: buildFavoritesData() }))
ipcMain.handle('popup:copyText', (_e, text) => {
  clipboard.writeText(text)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('clipboard:fromPopup', text)
  }
  return true
})
ipcMain.handle('popup:close', () => {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.close()
    popupWindow = null
  }
})

app.whenReady().then(() => {
  createWindow()

  const settings = store.get('settings', {})
  if (settings.minimizeToTray) {
    try { createTray() } catch (_) {}
  }

  if (settings.globalHotkey) {
    try {
      globalShortcut.register(settings.globalHotkey, () => {
        if (mainWindow?.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow?.show()
          mainWindow?.focus()
        }
      })
    } catch (_) {}
  }

  try {
    globalShortcut.register('CommandOrControl+Shift+C', () => {
      showFavoritesPopup()
    })
  } catch (_) {}
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
