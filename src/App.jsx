import React, { useEffect, useState } from 'react';
import { toSshUrl } from './utils/helpers';
import { arrayMove } from '@dnd-kit/sortable';

// Organisms
import TopBar from './components/organisms/TopBar';
import Sidebar from './components/organisms/Sidebar';
import CloneDialog from './components/organisms/CloneDialog';
import BatchCloneDialog from './components/organisms/BatchCloneDialog';

// Molecules
import ColorMenu from './components/molecules/ColorMenu';

// Pages
import HomePage from './components/pages/HomePage';
import ActivityPage from './components/pages/ActivityPage';
import ConfigPage from './components/pages/ConfigPage';

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

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchDialog, setBatchDialog] = useState({
    open: false,
    count: 0
  });

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
          if (cfg.configPath) setConfigPath(cfg.configPath);
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
  }, [baseDir, buttons, editor, fontSize, backgroundImage, bgSidebar, bgOpacity, bgBlur, configInitialized]);

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
    });
  };

  const handlePickColorFromMenu = (colorId) => {
    if (!colorMenu.buttonId) return;

    setButtons((prev) => prev.map((b) => (b.id === colorMenu.buttonId ? { ...b, color: colorId } : b)));

    appendLog(`[INFO] Button ${colorMenu.buttonId} color set to ${colorId} via Home.`);

    setColorMenu({
      open: false,
      buttonId: null,
      x: 0,
      y: 0,
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

  const processQueue = async ({ mode, groupName }) => {
    setBatchDialog({ open: false, count: 0 });
    
    const selectedButtons = buttons.filter(b => selectedIds.includes(b.id));
    if (selectedButtons.length === 0) return;

    setLoading(true);
    appendLog(`[BATCH] Starting batch clone for ${selectedButtons.length} items. Mode: ${mode}`);

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
    }

    let successCount = 0;
    let failCount = 0;

    for (const btn of selectedButtons) {
      if (!btn.repoUrl) {
        appendLog(`[SKIP] Button ${btn.id} has no Repo URL.`);
        continue;
      }

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
          options: { skipOpenEditor: true, skipOpenFolder: true }
        });

        if (result.status === 'success') {
          successCount++;
          appendLog(`[OK] ${btn.label || btn.id} cloned.`);
        } else if (result.status === 'duplicate') {
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
    
    appendLog(`[BATCH] Completed. Success: ${successCount}, Failed: ${failCount}.`);
    
    // Post-batch actions: Open folder/editor
    if (successCount > 0) {
      if (mode === 'group') {
        // Open the Group Folder
        appendLog(`[INFO] Opening Group Folder: ${targetBaseDir}`);
        await window.electronAPI.openFolder({ path: targetBaseDir });
        await window.electronAPI.openInEditor({ path: targetBaseDir, editor });
      } else {
        // Separate mode: Open the Base Directory so user can see all cloned folders
        appendLog(`[INFO] Opening Base Directory: ${baseDir}`);
        await window.electronAPI.openFolder({ path: baseDir });
        // We do NOT open editor for separate mode to avoid spam
      }
    }
  };

  // === ACTION: Clone via Git ===
  const performCloneViaGit = async (btn) => {
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

    setLoading(true);
    setActiveButtonId(btn.id);
    setLastResult(null);

    try {
      appendLog(`[INFO] Cloning ${effectiveUrl}${btn.useSsh ? ' (SSH)' : ''} -> ${btn.folderName || '[auto-folder]'}…`);

      const result = await window.electronAPI.cloneRepo({
        repoUrl: effectiveUrl,
        folderName: btn.folderName,
        baseDir: baseDir || null,
        editor,
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
  const handleOpenRepoForZip = async () => {
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

    setLoading(true);
    setActiveButtonId(btn.id);
    setLastResult(null);

    try {
      appendLog(`[INFO] Downloading ZIP untuk ${btn.repoUrl} (method: ZIP)…`);

      const result = await window.electronAPI.downloadZipRepo({
        repoUrl: btn.repoUrl,
        folderName: btn.folderName,
        baseDir: baseDir || null,
        editor,
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

  const fontSizeClass =
    fontSize === 'medium' ? 'font-size-medium' : fontSize === 'large' ? 'font-size-large' : 'font-size-default';

  return (
    <div
      className={`h-screen w-screen bg-neutral-950 text-neutral-50 flex flex-col ${fontSizeClass} relative`}
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

            <div className="relative z-10 flex-1 flex flex-col min-h-0">
              {activePage === 'home' ? (
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
                  onToggleSelectionMode={handleToggleSelectionMode}
                  onToggleSelection={handleToggleSelection}
                  onBatchClone={handleBatchCloneClick}
                />
              ) : activePage === 'activity' ? (
                <ActivityPage lastResult={lastResult} logs={logs} onClearLogs={handleClearLogs} />
              ) : (
                <ConfigPage
                  buttons={buttons}
                  setButtons={setButtons}
                  baseDir={baseDir}
                  setBaseDir={setBaseDir}
                  editor={editor}
                  onChangeEditor={handleChangeEditor}
                  fontSize={fontSize}
                  onChangeFontSize={handleChangeFontSize}
                  saving={saving}
                  lastSavedLabel={lastSavedLabel}
                  configPath={configPath}
                  onPickDirectory={handlePickDirectory}
                  onAddButton={handleAddButton}
                  onRemoveButton={handleRemoveButton}
                  backgroundImage={backgroundImage}
                  onPickBackgroundImage={handlePickBackgroundImage}
                  onRemoveBackgroundImage={handleRemoveBackgroundImage}
                  bgSidebar={bgSidebar}
                  setBgSidebar={setBgSidebar}
                  bgOpacity={bgOpacity}
                  setBgOpacity={setBgOpacity}
                  bgBlur={bgBlur}
                  setBgBlur={setBgBlur}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <CloneDialog
        open={cloneDialog.open}
        button={cloneDialog.button}
        onClose={() => setCloneDialog({ open: false, button: null })}
        onCloneGit={performCloneViaGit}
        onDownloadZip={handleOpenRepoForZip}
      />

      <BatchCloneDialog
        open={batchDialog.open}
        count={batchDialog.count}
        onClose={() => setBatchDialog({ open: false, count: 0 })}
        onConfirm={processQueue}
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
