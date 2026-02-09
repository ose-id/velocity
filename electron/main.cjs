const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const { spawn, exec } = require('child_process');
const extract = require('extract-zip');

const isDev = !app.isPackaged;
let mainWindow;

// === CONFIG PATH (PAKAI userData, BUKAN __dirname) ===
function getConfigPath() {
  // contoh di Windows:
  // C:\Users\Kamu\AppData\Roaming\<NamaApp>\velocity-config.json
  const userDataDir = app.getPath('userData');
  return path.join(userDataDir, 'velocity-config.json');
}

// === DEFAULT CONFIG ===
const DEFAULT_CONFIG = {
  baseDir: path.join(os.homedir(), 'Downloads'),
  editor: 'vscode',
  fontSize: 'default',
  onboardingShown: false, // New flag
  buttons: [
    {
      id: 'A',
      label: 'Nuxt Starter',
      repoUrl: 'https://github.com/adydetra/nuxt-starter.git',
      folderName: 'nuxt-starter',
      useSsh: false,
      color: 'emerald',
      group: 'Starter',
    },
    {
      id: 'B',
      label: 'Vue Starter',
      repoUrl: 'https://github.com/adydetra/vue-starter.git',
      folderName: 'vue-starter',
      useSsh: false,
      color: 'emerald', // Using emerald as well since it's Vue? Or green? Emerald fits.
      group: 'Starter',
    },
    {
      id: 'C',
      label: 'React Starter',
      repoUrl: 'https://github.com/adydetra/react-starter.git',
      folderName: 'react-starter',
      useSsh: false,
      color: 'sky',
      group: 'Starter',
    },
    {
      id: 'D',
      label: 'Electron Starter',
      repoUrl: 'https://github.com/adydetra/electron-starter.git',
      folderName: 'electron-starter',
      useSsh: false,
      color: 'blue',
      group: 'Starter',
    },
    {
      id: 'E',
      label: 'Button E',
      repoUrl: '',
      folderName: '',
      useSsh: false,
      color: 'neutral',
    },
    {
      id: 'F',
      label: 'Button F',
      repoUrl: '',
      folderName: '',
      useSsh: false,
      color: 'neutral',
    },
  ],
  shortcuts: {
    switchPage: 'Tab',
    openHome: '1',
    openActivity: '2',
    openShortcuts: '3',
    openSettings: '4',
    toggleGrid: '',
    search: '',
  },
};

// === UTIL: buka folder di file manager ===
function openFolderInExplorer(folderPath) {
  if (!folderPath) return;
  const platform = process.platform;
  if (platform === 'win32') {
    spawn('explorer', [folderPath], { shell: true });
  } else if (platform === 'darwin') {
    spawn('open', [folderPath]);
  } else {
    spawn('xdg-open', [folderPath]);
  }
}

// === DOWNLOAD + EXTRACT ZIP ===
async function downloadAndExtractZip(zipUrl, baseDir, folderName) {
  fs.mkdirSync(baseDir, { recursive: true });

  const isGithub = /^https?:\/\/github\.com\//i.test(zipUrl);

  let repoName = 'repo';
  let branchName = 'main';

  if (isGithub) {
    const urlNoQuery = zipUrl.split('?')[0];
    const parts = urlNoQuery.split('/');
    const idxRepo = parts.findIndex((p) => p === 'github.com') + 2;
    repoName = parts[idxRepo] || 'repo';

    const branchMatch = urlNoQuery.match(/\/archive\/refs\/heads\/([^/]+)\.zip$/);
    if (branchMatch) {
      branchName = branchMatch[1];
    }
  }

  const defaultExtractedName = isGithub ? `${repoName}-${branchName}` : folderName || 'repo';
  const targetFolderName = folderName || defaultExtractedName;
  const targetPath = path.join(baseDir, targetFolderName);

  if (fs.existsSync(targetPath)) {
    return {
      status: 'duplicate',
      message: 'Folder sudah ada, tidak di-overwrite.',
      path: targetPath,
      zipUrl,
    };
  }

  const tmpZipPath = path.join(os.tmpdir(), `velocity-${Date.now()}.zip`);

  const res = await fetch(zipUrl);
  if (!res.ok) {
    throw new Error(`Gagal download ZIP (${res.status} ${res.statusText})`);
  }

  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(tmpZipPath, Buffer.from(arrayBuffer));

  await extract(tmpZipPath, { dir: baseDir });

  try {
    fs.unlinkSync(tmpZipPath);
  } catch (e) {
    // ignore
  }

  if (isGithub) {
    const extractedName = `${repoName}-${branchName}`;
    const extractedPath = path.join(baseDir, extractedName);

    if (folderName && fs.existsSync(extractedPath) && !fs.existsSync(targetPath)) {
      try {
        fs.renameSync(extractedPath, targetPath);
      } catch (e) {
        return {
          status: 'success',
          message: 'ZIP downloaded & extracted (rename gagal, pakai nama default).',
          path: extractedPath,
          zipUrl,
        };
      }
    }
  }

  return {
    status: 'success',
    message: 'ZIP downloaded & extracted.',
    path: targetPath,
    zipUrl,
  };
}

// === CONFIG HELPERS ===
function ensureConfigShape(raw) {
  const cfg = raw && typeof raw === 'object' ? raw : {};
  if (!Array.isArray(cfg.buttons)) {
    cfg.buttons = DEFAULT_CONFIG.buttons;
  }
  if (!cfg.baseDir) {
    cfg.baseDir = DEFAULT_CONFIG.baseDir;
  }
  if (!cfg.editor) {
    cfg.editor = DEFAULT_CONFIG.editor;
  }
  if (typeof cfg.onboardingShown === 'undefined') {
    cfg.onboardingShown = DEFAULT_CONFIG.onboardingShown;
  }
  if (!cfg.shortcuts) {
    cfg.shortcuts = DEFAULT_CONFIG.shortcuts;
  }

  return cfg;
}

function loadConfig() {
  const CONFIG_PATH = getConfigPath();
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      const cfg = ensureConfigShape(DEFAULT_CONFIG);
      // pastikan folder userData ada
      fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf-8');
      console.log('[config] created new config at', CONFIG_PATH);
      return cfg;
    }
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    const cfg = ensureConfigShape(parsed);
    return cfg;
  } catch (err) {
    console.error('Failed to load config, using defaults.', err);
    return ensureConfigShape(DEFAULT_CONFIG);
  }
}

function saveConfig(newConfig) {
  const CONFIG_PATH = getConfigPath();
  const cfg = ensureConfigShape(newConfig);
  try {
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf-8');
    console.log('[config] saved to', CONFIG_PATH);
    return cfg;
  } catch (err) {
    console.error('Failed to save config', err);
    throw err;
  }
}

// === OPEN FOLDER + EDITOR ===
function openFolder(targetPath) {
  if (!targetPath) return;
  const platform = process.platform;
  if (platform === 'darwin') {
    spawn('open', [targetPath], { shell: true });
  } else if (platform === 'win32') {
    spawn('explorer', [targetPath], { shell: true });
  } else {
    spawn('xdg-open', [targetPath], { shell: true });
  }
}

function openInEditor(targetPath, editorId) {
  if (!targetPath) return;

  let cmd = 'code';
  switch (editorId) {
    case 'cursor':
      cmd = 'cursor';
      break;
    case 'windsurf':
      cmd = 'windsurf';
      break;
    case 'antigravity':
      cmd = 'antigravity';
      break;
    case 'vscode':
    default:
      cmd = 'code';
  }

  const child = spawn(cmd, [targetPath], {
    shell: true,
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}



// === WINDOW ===
function createWindow() {
  const iconPath = isDev ? path.join(__dirname, '..', 'build', 'icon.ico') : path.join(process.resourcesPath, 'build', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#020617',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow loading local files (file://)
    },
  });

  Menu.setApplicationMenu(null);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
    // if (isDev) {
    //   mainWindow.webContents.openDevTools(); // Open DevTools handled by Interceptor
    // }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// === IPC HANDLERS ===
ipcMain.handle('open-devtools', () => {
  if (mainWindow) {
    mainWindow.webContents.openDevTools();
  }
});

ipcMain.handle('window-control', (_event, action) => {
  if (!mainWindow) return;
  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      mainWindow.maximize();
      break;
    case 'unmaximize':
      mainWindow.unmaximize();
      break;
    case 'close':
      mainWindow.close();
      break;
    default:
      break;
  }
});

// Download ZIP + extract + open folder + open editor
ipcMain.handle('download-zip-repo', async (_event, { repoUrl, folderName, baseDir }) => {
  try {
    if (!repoUrl) {
      return { status: 'error', message: 'Repo URL kosong.' };
    }

    let url = repoUrl.trim();
    const isZip = /\.zip($|\?)/i.test(url);
    const isGithub = /^https?:\/\/github\.com\//i.test(url);

    if (isGithub && !isZip) {
      const withoutGit = url.replace(/\.git$/, '');
      url = `${withoutGit}/archive/refs/heads/main.zip`;
    }

    const cfg = loadConfig();
    const editorId = cfg.editor || 'vscode';

    const resolvedBaseDir = baseDir && baseDir.trim() ? baseDir.trim() : cfg.baseDir || path.join(os.homedir(), 'Downloads');

    const result = await downloadAndExtractZip(url, resolvedBaseDir, folderName && folderName.trim() ? folderName.trim() : null);

    if (result.status === 'success') {
      openFolderInExplorer(result.path);
      openInEditor(result.path, editorId);
    }

    return result;
  } catch (err) {
    console.error('download-zip-repo error:', err);
    return {
      status: 'error',
      message: err.message || 'Gagal download & extract ZIP.',
    };
  }
});

// Open repo URL in external browser
ipcMain.handle('open-repo-url', async (_event, rawUrl) => {
  if (!rawUrl) {
    return { ok: false, message: 'No URL provided' };
  }

  const url = rawUrl.replace(/\.git$/, '');

  try {
    await shell.openExternal(url);
    return { ok: true };
  } catch (err) {
    console.error('Failed to open repo URL:', err);
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Cannot open browser',
        message: `Gagal membuka ${url} di browser.\n${err.message || ''}`,
        buttons: ['OK'],
      });
    }
    return { ok: false, message: err.message };
  }
});

// Open OSE website (dengan fallback browser)
ipcMain.handle('open-ose', async () => {
  const url = 'https://www.ose.web.id/';

  try {
    await shell.openExternal(url);
    return { ok: true, method: 'default' };
  } catch (err) {
    console.error('openExternal (default) failed:', err);
  }

  const candidates = ['zen', 'chrome', 'firefox', 'msedge'];

  for (const cmd of candidates) {
    try {
      const child = spawn(cmd, [url], {
        shell: true,
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      console.log(`Opened ${url} with ${cmd}`);
      return { ok: true, method: cmd };
    } catch (err) {
      console.error(`Failed to open with ${cmd}:`, err);
    }
  }

  if (mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Cannot open browser',
      message: 'Gagal membuka https://www.ose.web.id/ di browser.\n' + 'Pastikan setidaknya satu browser (default / Zen / Chrome / Firefox / Edge) terpasang dan terdaftar di PATH.',
      buttons: ['OK'],
    });
  }

  return { ok: false };
});

// Window state
ipcMain.handle('get-window-state', () => {
  if (!mainWindow) return { isMaximized: false };
  return { isMaximized: mainWindow.isMaximized() };
});

// Config get/save
ipcMain.handle('get-config', () => {
  const cfg = loadConfig();
  return {
    ...cfg,
    configPath: getConfigPath(),
  };
});

ipcMain.handle('save-config', (_event, partialConfig) => {
  const currentConfig = loadConfig();
  const newConfig = { ...currentConfig, ...partialConfig };
  const saved = saveConfig(newConfig);
  return {
    ...saved,
    configPath: getConfigPath(),
  };
});

// Pick directory dialog
ipcMain.handle('pick-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select base directory',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// Pick image dialog
ipcMain.handle('pick-image', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select background image',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// Clone via git
ipcMain.handle('clone-repo', async (_event, args) => {
  const cfg = loadConfig();
  const editorId = cfg.editor || 'vscode';
  const { repoUrl, folderName, baseDir, options } = args;

  if (!repoUrl) {
    return {
      status: 'error',
      message: 'Repo URL is required.',
    };
  }

  const baseDirectory = baseDir || cfg.baseDir || DEFAULT_CONFIG.baseDir;
  const targetFolderName =
    folderName && folderName.trim()
      ? folderName.trim()
      : repoUrl
          .split('/')
          .pop()
          .replace(/\.git$/, '');
  const targetPath = path.join(baseDirectory, targetFolderName);

  if (fs.existsSync(targetPath)) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Folder sudah ada',
      message: 'Folder project sudah ada, clone baru dibatalkan.\n\n' + targetPath,
      buttons: ['OK'],
    });
    return {
      status: 'duplicate',
      message: 'Folder already exists, clone skipped.',
      path: targetPath,
    };
  }

  if (!fs.existsSync(baseDirectory)) {
    fs.mkdirSync(baseDirectory, { recursive: true });
  }

  return new Promise((resolve) => {
    const child = spawn('git', ['clone', repoUrl, targetPath], {
      shell: true,
    });

    child.on('error', (err) => {
      console.error('Failed to start git', err);
      resolve({
        status: 'error',
        message: `Failed to start git: ${err.message}`,
      });
    });
    child.on('close', (code) => {
      if (code === 0) {
        // Check options.skipOpenFolder
        if (!options?.skipOpenFolder) {
          openFolderInExplorer(targetPath);
        }

        // Check options.deleteGit
        if (options?.deleteGit) {
          const gitFolderPath = path.join(targetPath, '.git');
          if (fs.existsSync(gitFolderPath)) {
            try {
              fs.rmSync(gitFolderPath, { recursive: true, force: true });
              console.log(`[INFO] Deleted .git folder at ${gitFolderPath}`);
            } catch (err) {
              console.error(`[WARN] Failed to delete .git folder: ${err.message}`);
            }
          }
        }

        // Check options.skipOpenEditor
        if (!options?.skipOpenEditor) {
          openInEditor(targetPath, editorId);
        }

        resolve({
          status: 'success',
          message: 'Repo cloned successfully.',
          path: targetPath,
        });
      } else {
        resolve({
          status: 'error',
          message: `git clone exited with code ${code}`,
        });
      }
    });
  });
});

ipcMain.handle('open-folder', async (_event, { path: folderPath }) => {
  if (folderPath) {
    openFolder(folderPath);
    return true;
  }
  return false;
});

ipcMain.handle('open-in-editor', async (_event, { path: folderPath, editor }) => {
  if (folderPath) {
    openInEditor(folderPath, editor);
    return true;
  }
  return false;
});

// Check requirements (git, node, code)
ipcMain.handle('check-requirements', async () => {
  const checkCommand = (cmd) => {
    return new Promise((resolve) => {
      exec(`${cmd} --version`, (error, stdout, stderr) => {
        if (error) {
          console.warn(`[check-requirements] ${cmd} failed:`, error.message);
          resolve(false);
        } else {
          console.log(`[check-requirements] ${cmd} detected:`, stdout.trim());
          resolve(true);
        }
      });
    });
  };

  console.log('[check-requirements] Checking tools...');
  // Optional: Log PATH to debug if needed (be careful with sensitive info, but for dev it's ok)
  // console.log('PATH:', process.env.PATH);

  const [git, node, code] = await Promise.all([
    checkCommand('git'),
    checkCommand('node'),
    checkCommand('code'),
  ]);

  return { git, node, code };
});

// Check path exists
ipcMain.handle('check-path-exists', async (_event, targetPath) => {
  return fs.existsSync(targetPath);
});

// Show message box
ipcMain.handle('show-message-box', async (_event, options) => {
  if (!mainWindow) return { response: -1 };
  return dialog.showMessageBox(mainWindow, options);
});

// === GITHUB AUTH (DEVICE FLOW) ===
ipcMain.handle('github-auth-device', async (_event, { clientId, scopes }) => {
  try {
    const { createOAuthDeviceAuth } = await import('@octokit/auth-oauth-device');
    
    // We can't pass functions over IPC, so we need to bridge the onVerification callback
    const auth = createOAuthDeviceAuth({
      clientType: 'oauth-app',
      clientId: clientId,
      scopes: scopes || ['repo', 'read:user'],
      onVerification(verification) {
        // Send code to frontend
        if (mainWindow) {
           mainWindow.webContents.send('github-device-code', verification);
        }
      },
    });

    const tokenAuthentication = await auth({
      type: 'oauth',
    });
    
    return { status: 'success', token: tokenAuthentication.token };

  } catch (error) {
    console.error('GitHub Auth Error:', error);
    return { status: 'error', message: error.message };
  }
});

// === AUTO UPDATE ===
const { autoUpdater } = require('electron-updater');

// Configure autoUpdater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// IPC Handlers for Auto Update
ipcMain.handle('check-for-updates', async () => {
  // In dev mode, this requires dev-app-update.yml to work
  try {
    const result = await autoUpdater.checkForUpdates();
    return { status: 'checked', updateInfo: result?.updateInfo };
  } catch (err) {
    console.error('[AutoUpdate] Check failed:', err);
    return { status: 'error', error: err.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { status: 'downloading' };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

// Auto Update Events
autoUpdater.on('checking-for-update', () => {
  if (mainWindow) mainWindow.webContents.send('update-status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  if (mainWindow) mainWindow.webContents.send('update-status', { status: 'available', info });
});

autoUpdater.on('update-not-available', (info) => {
  if (mainWindow) mainWindow.webContents.send('update-status', { status: 'not-available', info });
});

autoUpdater.on('error', (err) => {
  if (mainWindow) mainWindow.webContents.send('update-status', { status: 'error', error: err.message });
});

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) mainWindow.webContents.send('update-status', { status: 'progress', progress: progressObj });
});

autoUpdater.on('update-downloaded', (info) => {
  if (mainWindow) mainWindow.webContents.send('update-status', { status: 'downloaded', info });
});

// === APP LIFECYCLE ===
app.whenReady().then(() => {
  // Force disable auto-start (cleanup legacy setting)
  app.setLoginItemSettings({
    openAtLogin: false,
    path: app.getPath('exe'),
  });

  const cfg = loadConfig();
  createWindow();
  
  // Optional: Check for updates on startup
  if (!isDev) {
    autoUpdater.checkForUpdates().catch(err => console.error('Failed to check for updates on startup:', err));
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
