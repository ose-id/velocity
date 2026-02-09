const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  cloneRepo: (config) => ipcRenderer.invoke('clone-repo', config),
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  pickDirectory: () => ipcRenderer.invoke('pick-directory'),
  windowControls: (action) => ipcRenderer.invoke('window-control', action),
  getWindowState: () => ipcRenderer.invoke('get-window-state'),
  openDevTools: () => ipcRenderer.invoke('open-devtools'),
  openOSE: () => ipcRenderer.invoke('open-ose'),
  openRepoUrl: (url) => ipcRenderer.invoke('open-repo-url', url),
  downloadZipRepo: (config) => ipcRenderer.invoke('download-zip-repo', config),
  pickImage: () => ipcRenderer.invoke('pick-image'),
  openFolder: (config) => ipcRenderer.invoke('open-folder', config),
  openInEditor: (config) => ipcRenderer.invoke('open-in-editor', config),
  checkRequirements: () => ipcRenderer.invoke('check-requirements'),
  checkPathExists: (path) => ipcRenderer.invoke('check-path-exists', path),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_event, value) => callback(value)),
  removeUpdateStatusListener: () => ipcRenderer.removeAllListeners('update-status'),
  
  // GitHub Auth
  startGithubAuth: (clientId, scopes) => ipcRenderer.invoke('github-auth-device', { clientId, scopes }),
  onGithubDeviceCode: (callback) => ipcRenderer.on('github-device-code', (_event, value) => callback(value)),
  removeGithubDeviceCodeListener: () => ipcRenderer.removeAllListeners('github-device-code'),
});
