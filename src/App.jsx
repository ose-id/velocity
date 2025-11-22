import React, { useEffect, useState } from 'react';
import { toSshUrl } from './utils/helpers';
import { arrayMove } from '@dnd-kit/sortable';

// Organisms
import TopBar from './components/organisms/TopBar';
import Sidebar from './components/organisms/Sidebar';
import CloneDialog from './components/organisms/CloneDialog';

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
  }, [baseDir, buttons, editor, fontSize, configInitialized]);

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
    <div className={`h-screen w-screen bg-neutral-950 text-neutral-50 flex flex-col ${fontSizeClass}`}>
      <TopBar onWindowControl={handleWindowControl} windowState={windowState} />
      <div className="flex flex-1 min-h-0">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

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
          />
        )}
      </div>

      <CloneDialog
        open={cloneDialog.open}
        button={cloneDialog.button}
        onClose={() => setCloneDialog({ open: false, button: null })}
        onCloneGit={performCloneViaGit}
        onDownloadZip={handleOpenRepoForZip}
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
