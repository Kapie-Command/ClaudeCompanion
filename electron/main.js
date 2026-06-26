const { app, BrowserWindow, ipcMain, clipboard, Tray, Menu, globalShortcut } = require('electron')
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
let tray = null
const store = new Store()

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

  mainWindow.webContents.openDevTools({ mode: 'detach' })

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
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
