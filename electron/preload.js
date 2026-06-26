const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  store: {
    get: (key, defaultValue) => ipcRenderer.invoke('store:get', key, defaultValue),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    getAll: () => ipcRenderer.invoke('store:getAll')
  },
  clipboard: {
    write: (text) => ipcRenderer.invoke('clipboard:write', text)
  },
  quickAccess: {
    onToggle: (cb) => {
      const handler = () => cb()
      ipcRenderer.on('quick-access:toggle', handler)
      return () => ipcRenderer.removeListener('quick-access:toggle', handler)
    }
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    toggleDevTools: () => ipcRenderer.invoke('window:toggleDevTools'),
    onMaximized: (cb) => {
      const handler = (_e, val) => cb(val)
      ipcRenderer.on('window:maximized', handler)
      return () => ipcRenderer.removeListener('window:maximized', handler)
    }
  }
})
