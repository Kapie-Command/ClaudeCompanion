const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('popupAPI', {
  getFavorites: () => ipcRenderer.invoke('popup:getFavorites'),
  copyText: (text) => ipcRenderer.invoke('popup:copyText', text),
  close: () => ipcRenderer.invoke('popup:close'),
})
