const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  cloneRepo: (config) => ipcRenderer.invoke('clone-repo', config),
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  pickDirectory: () => ipcRenderer.invoke('pick-directory'),
  windowControls: (action) => ipcRenderer.invoke('window-control', action),
  getWindowState: () => ipcRenderer.invoke('get-window-state'),
  openAdydetra: () => ipcRenderer.invoke('open-adydetra'),
  openRepoUrl: (url) => ipcRenderer.invoke('open-repo-url', url),
  downloadZipRepo: (config) => ipcRenderer.invoke('download-zip-repo', config),
});
