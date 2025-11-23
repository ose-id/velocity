const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const { spawn } = require('child_process');
const extract = require('extract-zip');

const isDev = !app.isPackaged;
let mainWindow;

// === CONFIG PATH (PAKAI userData, BUKAN __dirname) ===
function getConfigPath() {
  // contoh di Windows:
  // C:\Users\Kamu\AppData\Roaming\<NamaApp>\clone-tools-config.json
  const userDataDir = app.getPath('userData');
  return path.join(userDataDir, 'clone-tools-config.json');
}

// === DEFAULT CONFIG ===
const DEFAULT_CONFIG = {
  baseDir: path.join(os.homedir(), 'Downloads'),
  editor: 'vscode',
  fontSize: 'default',
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
      label: 'React Starter',
      repoUrl: 'https://github.com/adydetra/react-starter.git',
      folderName: 'react-starter',
      useSsh: false,
      color: 'sky',
      group: 'Starter',
    },
    {
      id: 'C',
      label: 'Button C',
      repoUrl: '',
      folderName: '',
      useSsh: false,
      color: 'neutral',
    },
    {
      id: 'D',
      label: 'Button D',
      repoUrl: '',
      folderName: '',
      useSsh: false,
      color: 'neutral',
    },
    {
      id: 'E',
      label: 'Button E',
      repoUrl: '',
      folderName: '',
      useSsh: false,
      color: 'neutral',
    },
  ],
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

  const tmpZipPath = path.join(os.tmpdir(), `clone-tools-${Date.now()}.zip`);

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
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// === IPC HANDLERS ===
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

// Open adydetra website (dengan fallback browser)
ipcMain.handle('open-adydetra', async () => {
  const url = 'https://www.adydetra.my.id';

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
      message: 'Gagal membuka https://www.adydetra.my.id di browser.\n' + 'Pastikan setidaknya satu browser (default / Zen / Chrome / Firefox / Edge) terpasang dan terdaftar di PATH.',
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

ipcMain.handle('save-config', (_event, newConfig) => {
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

// === APP LIFECYCLE ===
app.whenReady().then(() => {
  const cfg = loadConfig();
  createWindow();
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
