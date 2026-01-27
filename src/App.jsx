import React, { useEffect, useState } from 'react';
import { toSshUrl } from './utils/helpers';
import { arrayMove } from '@dnd-kit/sortable';

// Organisms
import TopBar from './components/organisms/TopBar';
import Sidebar from './components/organisms/Sidebar';
import CloneDialog from './components/organisms/CloneDialog';
import BatchCloneDialog from './components/organisms/BatchCloneDialog';
import OnboardingModal from './components/organisms/OnboardingModal';

// Molecules
import ColorMenu from './components/molecules/ColorMenu';

// Pages
import HomePage from './components/pages/HomePage';
import ActivityPage from './components/pages/ActivityPage';
import ShortcutsPage from './components/pages/ShortcutsPage';
import ConfigPage from './components/pages/ConfigPage';
import GitHubPage from './components/pages/GitHubPage';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [buttons, setButtons] = useState([]);
  const [baseDir, setBaseDir] = useState('');
  const [editor, setEditor] = useState('vscode');
  const [fontSize, setFontSize] = useState('default');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [bgSidebar, setBgSidebar] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(60); // 0-100
  const [bgBlur, setBgBlur] = useState(4); // 0-20
  const [preferredGrid, setPreferredGrid] = useState(3); // 2 or 3
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);
  const [activeButtonId, setActiveButtonId] = useState(null);
  const [logs, setLogs] = useState([]); // [{id, timestamp, message}]
  const [lastResult, setLastResult] = useState(null);
  const [windowState, setWindowState] = useState({ isMaximized: false });
  const [saving, setSaving] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState('');
  const [configPath, setConfigPath] = useState('');
  const [configInitialized, setConfigInitialized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [cloneDialog, setCloneDialog] = useState({
    open: false,
    button: null,
  });
  const [colorMenu, setColorMenu] = useState({
    open: false,
    buttonId: null,
    x: 0,
    y: 0,
  });
  const [shortcuts, setShortcuts] = useState({ switchPage: 'Tab', search: '/' });
  const [focusSearchTrigger, setFocusSearchTrigger] = useState(0);

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchDialog, setBatchDialog] = useState({
    open: false,
    count: 0
  });
  const [updateStatus, setUpdateStatus] = useState({ status: 'idle' });
  const [githubColors, setGithubColors] = useState({}); // { [repoId]: colorId }

  // INIT
  useEffect(() => {
    async function init() {
      try {
        if (!window.electronAPI) return;

        const state = await window.electronAPI.getWindowState?.();
        if (state) {
          setWindowState(state);
        }

        const cfg = await window.electronAPI.getConfig();
        if (cfg) {
          setButtons(cfg.buttons || []);
          setBaseDir(cfg.baseDir || '');
          setEditor(cfg.editor || 'vscode');
          setFontSize(cfg.fontSize || 'default');
          setBackgroundImage(cfg.backgroundImage || null);
          setBgSidebar(cfg.bgSidebar || false);
          setBgOpacity(cfg.bgOpacity !== undefined ? cfg.bgOpacity : 60);
          setBgBlur(cfg.bgBlur !== undefined ? cfg.bgBlur : 4);
          if (cfg.shortcuts) setShortcuts(cfg.shortcuts);
          if (cfg.githubColors) setGithubColors(cfg.githubColors);
          if (cfg.configPath) setConfigPath(cfg.configPath);
          
          // Check onboarding
          // Always show in DEV mode, otherwise check config
          if (import.meta.env.DEV || cfg.onboardingShown === false || typeof cfg.onboardingShown === 'undefined') {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setConfigInitialized(true);
      }
    }

    init();
  }, []);

  // WINDOW RESIZE LISTENER
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // CALCULATE EFFECTIVE GRID
  const effectiveGrid = windowWidth < 1024 ? 2 : preferredGrid;

  const handleToggleGrid = () => {
    setPreferredGrid((prev) => (prev === 3 ? 2 : 3));
  };

  const handleOnboardingFinish = async () => {
    setShowOnboarding(false);
    if (window.electronAPI && window.electronAPI.saveConfig) {
      try {
        // We need to save the current state + onboardingShown: true
        // But we can just rely on the auto-save effect if we update a state?
        // No, onboardingShown is not in the auto-save dependency list.
        // So we manually save it here.
        await window.electronAPI.saveConfig({
          baseDir,
          buttons,
          editor,
          fontSize,
          backgroundImage,
          bgSidebar,
          bgOpacity,
          bgBlur,
          shortcuts,
          githubColors,
          onboardingShown: true
        });
      } catch (err) {
        console.error('Failed to save onboarding status', err);
      }
    }
  };

  // AUTO SAVE CONFIG
  useEffect(() => {
    if (!configInitialized) return;
    if (!window.electronAPI || !window.electronAPI.saveConfig) return;

    let cancelled = false;

    async function save() {
      try {
        setSaving(true);
        const saved = await window.electronAPI.saveConfig({
          baseDir,
          buttons,
          editor,
          fontSize,
          backgroundImage,
          bgSidebar,
          bgOpacity,
          bgBlur,
          shortcuts,
          githubColors,
          onboardingShown: !showOnboarding // If currently showing, it's false. If not showing, it's true (presumably finished)
          // Wait, this logic is tricky. If we just finished onboarding, showOnboarding is false.
          // But if we are in the middle of it, it is true.
          // Actually, we should probably just read the current config or assume true if we are past init?
          // Let's just set it to true if showOnboarding is false.
        });
        if (!cancelled) {
          if (saved && saved.configPath) {
            setConfigPath(saved.configPath);
          }
          const time = new Date().toLocaleTimeString();
          setLastSavedLabel(`Saved at ${time}`);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setLastSavedLabel('Failed to save config');
        }
      } finally {
        if (!cancelled) setSaving(false);
      }
    }

    save();

    return () => {
      cancelled = true;
    };
  }, [baseDir, buttons, editor, fontSize, backgroundImage, bgSidebar, bgOpacity, bgBlur, shortcuts, githubColors, configInitialized, showOnboarding]);

  // SHORTCUTS LISTENER
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore if typing in input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.metaKey) modifiers.push('Meta');

      let key = e.key;
      if (key === ' ') key = 'Space';
      if (key.length === 1) key = key.toUpperCase();

      const pressed = [...modifiers, key].join('+');

      if (pressed === shortcuts.switchPage) {
        e.preventDefault();
        setActivePage((prev) => {
          const order = ['home', 'github', 'activity', 'shortcuts', 'config'];
          const idx = order.indexOf(prev);
          const nextIdx = (idx + 1) % order.length;
          return order[nextIdx];
        });
      } else if (pressed === shortcuts.openHome) {
        e.preventDefault();
        setActivePage('home');
      } else if (pressed === shortcuts.openActivity) {
        e.preventDefault();
        setActivePage('activity');
      } else if (pressed === shortcuts.openShortcuts) {
        e.preventDefault();
        setActivePage('shortcuts');
      } else if (pressed === shortcuts.openSettings) {
        e.preventDefault();
        setActivePage('config');
      } else if (pressed === shortcuts.toggleGrid) {
        e.preventDefault();
        handleToggleGrid();
      } else if (pressed === shortcuts.search) {
        e.preventDefault();
        setActivePage('home');
        setFocusSearchTrigger(Date.now());
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [shortcuts]);

  const handleUpdateShortcut = (key, value) => {
    setShortcuts((prev) => ({ ...prev, [key]: value }));
    appendLog(`[CONFIG] Shortcut '${key}' updated to '${value}'`);
  };

  const handleWindowControl = async (action) => {
    try {
      if (!window.electronAPI || !window.electronAPI.windowControls) return;
      await window.electronAPI.windowControls(action);
      if (action === 'maximize' || action === 'unmaximize') {
        const state = await window.electronAPI.getWindowState?.();
        if (state) setWindowState(state);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const appendLog = (text) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        message: text,
      },
    ]);
  };

  const handleOpenColorMenu = (btn, event) => {
    event.preventDefault();
    setColorMenu({
      open: true,
      buttonId: btn.id,
      x: event.clientX,
      y: event.clientY,
      targetType: btn.isGithub ? 'github' : 'button' // Add targetType
    });
  };

  const handlePickColorFromMenu = (colorId) => {
    if (!colorMenu.buttonId) return;

    if (colorMenu.targetType === 'github') {
       setGithubColors(prev => ({ ...prev, [colorMenu.buttonId]: colorId }));
       appendLog(`[INFO] GitHub repo ${colorMenu.buttonId} color set to ${colorId}.`);
    } else {
       setButtons((prev) => prev.map((b) => (b.id === colorMenu.buttonId ? { ...b, color: colorId } : b)));
       appendLog(`[INFO] Button ${colorMenu.buttonId} color set to ${colorId} via Home.`);
    }

    setColorMenu({
      open: false,
      buttonId: null,
      x: 0,
      y: 0,
      targetType: 'button'
    });
  };

  const handleCloseColorMenu = () => {
    setColorMenu((prev) => ({
      ...prev,
      open: false,
      buttonId: null,
    }));
  };

  const handleCloneClick = (btn) => {
    setCloneDialog({ open: true, button: btn });
  };

  const handleClearLogs = () => {
    setLogs([]);
    setLastResult(null);
  };

  const handleChangeEditor = (newEditor) => {
    setEditor(newEditor);
    appendLog(`[INFO] Editor changed to ${newEditor}.`);
  };

  const handleChangeFontSize = (mode) => {
    setFontSize(mode);
    appendLog(`[INFO] UI font size: ${mode}.`);
  };

  const handlePickDirectory = async () => {
    if (!window.electronAPI || !window.electronAPI.pickDirectory) return;
    try {
      const picked = await window.electronAPI.pickDirectory();
      if (picked) {
        setBaseDir(picked);
        appendLog(`[INFO] Base directory set to: ${picked}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePickBackgroundImage = async () => {
    if (!window.electronAPI || !window.electronAPI.pickImage) return;
    try {
      const picked = await window.electronAPI.pickImage();
      if (picked) {
        setBackgroundImage(picked);
        appendLog(`[INFO] Background image set to: ${picked}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveBackgroundImage = () => {
    setBackgroundImage(null);
    appendLog('[INFO] Background image removed.');
  };

  const handleAddButton = () => {
    setButtons((prev) => {
      const nextIndex = prev.length;
      const baseCode = 'A'.charCodeAt(0);
      let newId = nextIndex < 26 ? String.fromCharCode(baseCode + nextIndex) : `B${nextIndex + 1}`;
      if (prev.some((b) => b.id === newId)) {
        newId = `B${Date.now().toString().slice(-3)}`;
      }
      return [
        ...prev,
        {
          id: newId,
          label: `Button ${newId}`,
          repoUrl: '',
          folderName: '',
          useSsh: false,
          color: 'neutral',
        },
      ];
    });
  };

  const handleRemoveButton = (id) => {
    setButtons((prev) => prev.filter((btn) => btn.id !== id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setButtons((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // === SELECTION MODE HANDLERS ===
  const handleToggleSelectionMode = () => {
    setIsSelectionMode((prev) => {
      if (prev) setSelectedIds([]); // Clear selection on exit
      return !prev;
    });
  };

  const handleToggleSelection = (id) => {
    setSelectedIds((prev) => {
      const newSelection = prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id];
      setIsSelectionMode(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleBatchCloneClick = () => {
    if (selectedIds.length === 0) return;
    
    if (selectedIds.length === 1) {
      // If only 1 selected, treat as normal clone
      const btn = buttons.find(b => b.id === selectedIds[0]);
      if (btn) handleCloneClick(btn);
      // Reset selection mode? Maybe keep it. Let's keep it for now.
    } else {
      // Open Batch Dialog
      setBatchDialog({ open: true, count: selectedIds.length });
    }
  };

  const processQueue = async ({ mode, groupName, customItems, deleteGit, useSsh }) => { // Updated sig
    setBatchDialog({ open: false, count: 0 });
    
    let selectedItems = [];

    if (customItems && customItems.length > 0) {
        // GitHub Batch
        selectedItems = customItems;
    } else {
        // Home Batch
        selectedItems = buttons.filter(b => selectedIds.includes(b.id));
    }

    if (selectedItems.length === 0) return;

    setLoading(true);
    appendLog(`[BATCH] Starting batch clone for ${selectedItems.length} items. Mode: ${mode}, SSH: ${useSsh}`);

    // Determine target base dir
    let targetBaseDir = baseDir;
    if (mode === 'group' && groupName) {
      // We rely on the backend to handle path joining, but here we might need to pass it differently.
      // Actually, we can just append to baseDir for the IPC call if backend supports it.
      // But backend takes absolute path. So we construct it here.
      // Note: We need 'path' module or just string concat if we assume OS separator.
      // Since this is frontend, we can't use 'path' module directly unless polyfilled.
      // Better approach: Pass 'subfolder' to backend? No, backend doesn't support it yet.
      // We will just append to baseDir string. It might be tricky with separators.
      // Let's assume standard forward slash works or let backend handle it if we pass a relative path?
      // No, backend expects absolute baseDir.
      // Workaround: We will rely on the fact that we can just add the folder name.
      // But wait, we don't know the separator.
      // Let's assume we pass the groupName as a separate arg if we updated backend?
      // We didn't update backend to accept 'groupName'.
      // We updated backend to accept 'baseDir'.
      // So we need to construct the new baseDir.
      // Let's try to use a safe guess or just append with '/'. Electron/Node usually handles mixed separators fine.
      targetBaseDir = baseDir ? `${baseDir}/${groupName}` : groupName; 
      
      // DUPLICATE CHECK FOR GROUP FOLDER
      if (window.electronAPI?.checkPathExists) {
        const exists = await window.electronAPI.checkPathExists(targetBaseDir);
        if (exists) {
          setLoading(false);
          setActiveButtonId(null);
          setIsSelectionMode(false);
          setSelectedIds([]);
          
          if (window.electronAPI?.showMessageBox) {
            await window.electronAPI.showMessageBox({
              type: 'warning',
              title: 'Folder Exists',
              message: `Folder "${groupName}" already exists in the base directory.\n\nProcess cancelled to prevent duplicates.`,
              buttons: ['OK']
            });
          }
          appendLog(`[CANCEL] Batch clone cancelled. Group folder "${groupName}" already exists.`);
          return;
        }
      }
    }

    let successCount = 0;
    let failCount = 0;
    let lastSuccessPath = null;

    for (const btn of selectedItems) {
      if (!btn.repoUrl) {
        appendLog(`[SKIP] Button ${btn.id} has no Repo URL.`);
        continue;
      }
      
      const targetUrl = customItems && customItems.length > 0 && mode.useSsh && btn.sshUrl 
                        ? btn.sshUrl 
                        : (mode.useSsh ? toSshUrl(btn.repoUrl) : btn.repoUrl); // Use SSH if requested


      setActiveButtonId(btn.id); // Show spinner on current card
      
      const effectiveUrl = btn.useSsh ? toSshUrl(btn.repoUrl) : btn.repoUrl;
      
      try {
        appendLog(`[QUEUE] Cloning ${btn.label || btn.id}...`);
        
        // We use skipOpenEditor: true and skipOpenFolder: true for batch
        const result = await window.electronAPI.cloneRepo({
          repoUrl: effectiveUrl,
          folderName: btn.folderName,
          baseDir: targetBaseDir,
          editor,
          options: { skipOpenEditor: true, skipOpenFolder: true, deleteGit }
        });

        if (result.status === 'success') {
          successCount++;
          lastSuccessPath = result.path;
          appendLog(`[OK] ${btn.label || btn.id} cloned.`);
        } else if (result.status === 'duplicate') {
          // If duplicate, we still consider it "successful" enough to maybe open the folder if it's the only one?
          // Or at least we can use its path to know where we are.
          lastSuccessPath = result.path;
          appendLog(`[SKIP] ${btn.label || btn.id} already exists.`);
        } else {
          failCount++;
          appendLog(`[FAIL] ${btn.label || btn.id}: ${result.message}`);
        }
      } catch (err) {
        console.error(err);
        failCount++;
        appendLog(`[ERROR] ${btn.label || btn.id}: ${err.message}`);
      }
    }

    setLoading(false);
    setActiveButtonId(null);
    setIsSelectionMode(false);
    setSelectedIds([]);
    // If it was custom items (GitHub), we should also clear its selection in GitHubPage?
    // We can't do that easily from here unless we expose a cleaner way.
    // But GitHubPage will pass customItems, so it handles its own state logic if needed?
    // Actually, GitHubPage passes handleBatchClone -> App opens Dialog -> App calls processQueue.
    // The selection clearing in GitHubPage needs to happen after this.
    // We can return a promise?
    if (customItems) {
        // We need to signal GitHubPage to clear selection?
        // Or we pass a callback in customItems? No.
        // For now, let's just leave it. The user can manually unselect or we reset via Ref/Context?
        // Maybe we just don't clear it from App side for GitHub.
    } else {
        setSelectedIds([]);
        setIsSelectionMode(false);
    }
    
    appendLog(`[BATCH] Completed. Success: ${successCount}, Failed: ${failCount}.`);
    
    // Post-batch actions: Open folder/editor
    if ((successCount > 0 || lastSuccessPath) && lastSuccessPath) {
      // Robustly determine parent path from the actual cloned path
      // This handles cases where baseDir state might be empty or out of sync
      const separator = lastSuccessPath.includes('\\') ? '\\' : '/';
      const parentPath = lastSuccessPath.substring(0, lastSuccessPath.lastIndexOf(separator));

      if (mode === 'group') {
        // Open the Group Folder (which is the parent of the repo)
        appendLog(`[INFO] Opening Group Folder: ${parentPath}`);
        await window.electronAPI.openFolder({ path: parentPath });
        await window.electronAPI.openInEditor({ path: parentPath, editor });
      } else {
        // Separate mode: Open the Base Directory (parent of the repo)
        appendLog(`[INFO] Opening Base Directory: ${parentPath}`);
        await window.electronAPI.openFolder({ path: parentPath });
        // We do NOT open editor for separate mode to avoid spam
      }
    }
  };

  const handleBatchConfirm = (data) => {
    setBatchDialog({ open: false, count: 0 });
    const { mode, groupName, deleteGit, useSsh, customItems } = data; // Receive useSsh
    processQueue({ mode: mode, groupName, customItems, deleteGit, useSsh }); // Pass useSsh as separate arg
  };

  // === ACTION: Clone via Git ===
  const performCloneViaGit = async (btn, options = {}) => {
    if (!window.electronAPI || !window.electronAPI.cloneRepo) return;

    setCloneDialog({ open: false, button: null });

    if (!btn.repoUrl) {
      appendLog(`[WARN] Button ${btn.id} belum punya repo URL`);
      setLastResult({
        status: 'error',
        message: `Button ${btn.id} belum dikonfigurasi repo URL.`,
      });
      return;
    }
    const effectiveUrl = btn.useSsh ? toSshUrl(btn.repoUrl) : btn.repoUrl;
    const { deleteGit, customName } = options; // Extract deleteGit and customName

    setLoading(true);
    setActiveButtonId(btn.id);
    setLastResult(null);

    try {
      const targetFolderName = customName || btn.folderName;
      appendLog(`[INFO] Cloning ${effectiveUrl}${btn.useSsh ? ' (SSH)' : ''} -> ${targetFolderName || '[auto-folder]'}…`);

      const result = await window.electronAPI.cloneRepo({
        repoUrl: effectiveUrl,
        folderName: targetFolderName,
        baseDir: baseDir || null,
        editor,
        options: { deleteGit } // Pass to backend
      });

      if (result.status === 'duplicate') {
        appendLog(`[SKIP] Folder sudah ada: ${result.path}`);
      } else if (result.status === 'success') {
        appendLog(`[OK] Repo berhasil di-clone ke: ${result.path}`);
      } else {
        appendLog(`[ERROR] ${result.message || 'Gagal clone repo (git).'}`);
      }

      setLastResult(result);
    } catch (err) {
      console.error(err);
      appendLog(`[ERROR] ${err.message}`);
      setLastResult({
        status: 'error',
        message: err.message,
      });
    } finally {
      setLoading(false);
      setActiveButtonId(null);
    }
  };

  // === ACTION: Download ZIP ===
  const handleOpenRepoForZip = async (options = {}) => {
    if (!cloneDialog.button) return;
    const btn = cloneDialog.button;
    setCloneDialog({ open: false, button: null });

    if (!btn.repoUrl) {
      appendLog(`[WARN] Button ${btn.id} belum punya repo URL`);
      setLastResult({
        status: 'error',
        message: `Button ${btn.id} belum dikonfigurasi repo URL.`,
      });
      return;
    }

    if (!window.electronAPI || !window.electronAPI.downloadZipRepo) {
      appendLog('[ERROR] downloadZipRepo API tidak tersedia.');
      setLastResult({
        status: 'error',
        message: 'IPC download-zip-repo tidak tersedia.',
      });
      return;
    }

    const { deleteGit, customName } = options; // Extract deleteGit and customName

    setLoading(true);
    setActiveButtonId(btn.id);
    setLastResult(null);

    try {
      const targetFolderName = customName || btn.folderName;
      appendLog(`[INFO] Downloading ZIP untuk ${btn.repoUrl} (method: ZIP)…`);

      const result = await window.electronAPI.downloadZipRepo({
        repoUrl: btn.repoUrl,
        folderName: targetFolderName,
        baseDir: baseDir || null,
        editor,
        options: { deleteGit } // Pass to backend
      });

      if (result.status === 'duplicate') {
        appendLog(`[SKIP] Folder sudah ada: ${result.path}`);
      } else if (result.status === 'success') {
        appendLog(`[OK] ZIP berhasil di-download & extract ke: ${result.path}`);
      } else {
        appendLog(`[ERROR] ${result.message || 'Gagal download & extract ZIP'}`);
      }

      setLastResult(result);
    } catch (err) {
      console.error(err);
      appendLog(`[ERROR] ${err.message}`);
      setLastResult({
        status: 'error',
        message: err.message,
      });
    } finally {
      setLoading(false);
      setActiveButtonId(null);
    }
  };

  // === AUTO UPDATE HANDLERS ===
  useEffect(() => {
    if (!window.electronAPI || !window.electronAPI.onUpdateStatus) return;

    const removeListener = window.electronAPI.onUpdateStatus((statusObj) => {
      console.log('[App] Update status:', statusObj);
      setUpdateStatus(statusObj);
      if (statusObj.status === 'available') {
        // Auto download when available
        window.electronAPI.downloadUpdate();
      }
    });

    return () => {
      if (window.electronAPI.removeUpdateStatusListener) {
        window.electronAPI.removeUpdateStatusListener();
      }
    };
  }, []);

  const handleCheckUpdate = async () => {
    if (!window.electronAPI || !window.electronAPI.checkForUpdates) return;
    setUpdateStatus({ status: 'checking' });

    // Race between check and timeout
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'timeout' });
      }, 30000); // 30 seconds
    });

    const checkPromise = window.electronAPI.checkForUpdates();

    const result = await Promise.race([checkPromise, timeoutPromise]);

    if (result.status === 'timeout') {
      setUpdateStatus({ status: 'error', error: 'Connection timed out (30s)' });
    } else if (result.status === 'dev-mode') {
      setUpdateStatus({ status: 'dev-mode' });
    } else if (result.status === 'error') {
      setUpdateStatus({ status: 'error', error: result.error });
    } else if (result.status === 'checked' && !result.updateInfo) {
      // No update available
      setUpdateStatus({ status: 'not-available' });
      // Revert to idle after 3 seconds
      setTimeout(() => {
        setUpdateStatus((prev) => (prev.status === 'not-available' ? { status: 'idle' } : prev));
      }, 3000);
    }
  };

  const handleQuitAndInstall = () => {
    if (!window.electronAPI || !window.electronAPI.quitAndInstall) return;
    window.electronAPI.quitAndInstall();
  };

  // === FONT SIZE EFFECT ===
  useEffect(() => {
    const root = document.documentElement;
    // Remove all font-size classes
    root.classList.remove('font-size-default', 'font-size-medium', 'font-size-large');
    // Add current class
    const fontSizeClass = fontSize === 'medium' ? 'font-size-medium' : fontSize === 'large' ? 'font-size-large' : 'font-size-default';
    root.classList.add(fontSizeClass);
  }, [fontSize]);

  // === GITHUB CLONE HANDLER ===
  const handleCloneFromGithub = (repoData) => {
      // Check if already exists in buttons to warn user?
      // For now, allow duplicates or let cloneDialog handle it (it doesn't check buttons, but backend checks folder)
      // We just open the dialog with a temp button object.
      setCloneDialog({ 
          open: true, 
          button: {
              ...repoData,
              // Ensure we have necessary fields for performCloneViaGit
              // repoData should have: id, label, repoUrl, folderName, useSsh
          }
      });
  };

  // === GITHUB BATCH CLONE ===
  const handleBatchCloneFromGithub = (items) => {
      setBatchDialog({ 
          open: true, 
          count: items.length,
          customItems: items // Temporary property on dialog state? 
          // Wait, batchDialog state structure is { open, count }. We need to store items.
          // Better: setBatchDialog({ open: true, count: items.length, items });
      });
  };

  return (
    <div
      className={`h-screen w-screen bg-neutral-950 text-neutral-50 flex flex-col relative`}
      style={
        backgroundImage && bgSidebar
          ? {
              backgroundImage: `url("file://${backgroundImage.replace(/\\/g, '/')}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      {/* Global Overlay if sidebar is included */}
      {backgroundImage && bgSidebar && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${(100 - bgOpacity) / 100})`,
            backdropFilter: `blur(${bgBlur}px)`,
          }}
        />
      )}

      <div className="relative z-10 flex flex-col h-full w-full">
        <TopBar onWindowControl={handleWindowControl} windowState={windowState} />
        <div className="flex flex-1 min-h-0">
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            transparent={backgroundImage && bgSidebar}
          />

          {/* Main Content Area */}
          <div
            className="flex-1 flex flex-col min-w-0 relative"
            style={
              backgroundImage && !bgSidebar
                ? {
                    backgroundImage: `url("file://${backgroundImage.replace(/\\/g, '/')}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : {}
            }
          >
            {/* Local Overlay if sidebar is NOT included */}
            {backgroundImage && !bgSidebar && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${(100 - bgOpacity) / 100})`,
                  backdropFilter: `blur(${bgBlur}px)`,
                }}
              />
            )}

            <div className={`relative h-full overflow-hidden ${activePage === 'home' || activePage === 'config' ? 'p-0' : 'p-0'}`}>
              {activePage === 'home' && (
                  <HomePage 
                    buttons={buttons}
                    baseDir={baseDir}
                    onClone={handleCloneClick}
                    loading={loading}
                    activeButtonId={activeButtonId}
                    onOpenColorMenu={handleOpenColorMenu}
                    effectiveGrid={effectiveGrid}
                    onToggleGrid={handleToggleGrid}
                    onDragEnd={handleDragEnd}
                    isSelectionMode={isSelectionMode}
                    selectedIds={selectedIds}
                    onToggleSelection={handleToggleSelection}
                    onToggleSelectionMode={handleToggleSelectionMode}
                    onBatchClone={handleBatchCloneClick}
                    focusSearchTrigger={focusSearchTrigger}
                  />
              )}
              {activePage === 'activity' && (
                <div className="h-full overflow-y-auto p-6">
                  <ActivityPage 
                    logs={logs} 
                    onClearLogs={handleClearLogs} 
                    lastResult={lastResult}
                  />
                </div>
              )}
              {activePage === 'shortcuts' && (
                <div className="h-full overflow-y-auto p-6">
                  <ShortcutsPage 
                    shortcuts={shortcuts} 
                    onUpdateShortcut={handleUpdateShortcut} 
                  />
                </div>
              )}
              {activePage === 'config' && (
                <div className="h-full overflow-y-auto p-0">
                  <ConfigPage
                    buttons={buttons}
                    setButtons={setButtons}
                    baseDir={baseDir}
                    setBaseDir={setBaseDir}
                    onPickDirectory={handlePickDirectory}
                    editor={editor}
                    onChangeEditor={handleChangeEditor}
                    fontSize={fontSize}
                    onChangeFontSize={handleChangeFontSize}
                    backgroundImage={backgroundImage}
                    onPickBackgroundImage={handlePickBackgroundImage}
                    onRemoveBackgroundImage={handleRemoveBackgroundImage}
                    bgSidebar={bgSidebar}
                    onChangeBgSidebar={setBgSidebar}
                    bgOpacity={bgOpacity}
                    onChangeBgOpacity={setBgOpacity}
                    bgBlur={bgBlur}
                    onChangeBgBlur={setBgBlur}
                    saving={saving}
                    lastSavedLabel={lastSavedLabel}
                    configPath={configPath}
                    onAddButton={handleAddButton}
                    onRemoveButton={handleRemoveButton}
                    showOnboarding={showOnboarding}
                    onOnboardingFinish={handleOnboardingFinish}
                    updateStatus={updateStatus}
                    onCheckUpdate={handleCheckUpdate}
                    onQuitAndInstall={handleQuitAndInstall}
                  />
                </div>
              )}
              {activePage === 'github' && (
                  <GitHubPage 
                      baseDir={baseDir}
                      editor={editor}
                      onClone={handleCloneFromGithub}
                      githubColors={githubColors}
                      onOpenColorMenu={handleOpenColorMenu}
                      onBatchClone={handleBatchCloneFromGithub}
                  />
              )}
            </div>


            {/* Legacy block removed */}
          </div>
        </div>
      </div>

      {cloneDialog.open && (
        <CloneDialog
          open={cloneDialog.open}
          button={cloneDialog.button}
          onClose={() => setCloneDialog({ open: false, button: null })}
          onCloneGit={performCloneViaGit}
          onDownloadZip={handleOpenRepoForZip}
        />
      )}

      {batchDialog.open && (
        <BatchCloneDialog
          open={batchDialog.open}
          count={batchDialog.count}
          onClose={() => setBatchDialog({ open: false, count: 0 })}
          onConfirm={(data) => handleBatchConfirm({ ...data, customItems: batchDialog.items })} // Pass items from state
        />
      )}

      <OnboardingModal
        open={showOnboarding}
        onFinish={handleOnboardingFinish}
      />

      <ColorMenu
        open={colorMenu.open}
        x={colorMenu.x}
        y={colorMenu.y}
        buttonId={colorMenu.buttonId}
        buttons={buttons}
        onClose={handleCloseColorMenu}
        onPickColor={handlePickColorFromMenu}
      />
    </div>
  );
}

export default App;
