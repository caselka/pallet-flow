const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('pfDesktop', {
  quit: () => ipcRenderer.send('pf-quit'),
  fullscreen: () => ipcRenderer.send('pf-fullscreen'),
  unlock: key => ipcRenderer.send('pf-unlock', key)
});
