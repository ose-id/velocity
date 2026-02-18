import { useState, useEffect, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

export default function useAppConfig() {
  // State
  const [buttons, setButtons] = useState([]);
  const [baseDir, setBaseDir] = useState('');
  const [editor, setEditor] = useState('vscode');
  const [fontSize, setFontSize] = useState('default');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [bgSidebar, setBgSidebar] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(60);
  const [bgBlur, setBgBlur] = useState(4);
  const [shortcuts, setShortcuts] = useState({
    switchPage: 'Tab',
    openHome: '1',
    openGithub: '2',
    openActivity: '3',
    openShortcuts: '4',
    openSettings: '5'
  });
  const [githubColors, setGithubColors] = useState({});
  const [githubToken, setGithubToken] = useState('');
  const [githubPerPage, setGithubPerPage] = useState(30);
  const [windowState, setWindowState] = useState({ isMaximized: false });
  const [colorMenu, setColorMenu] = useState({ open: false, buttonId: null, repoUrl: null, x: 0, y: 0 });
  
  // Layout State
  const [preferredGrid, setPreferredGrid] = useState(3);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Resize Listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveGrid = windowWidth < 1024 ? 2 : preferredGrid;
  const handleToggleGrid = () => setPreferredGrid((prev) => (prev === 3 ? 2 : 3));
  
  // Meta State
  const [configInitialized, setConfigInitialized] = useState(false);
  const [configPath, setConfigPath] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [logs, setLogs] = useState([]);

  // Actions
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

  const handleClearLogs = () => setLogs([]);

  // Init
  useEffect(() => {
    async function init() {
      try {
        if (!window.electronAPI) return;

        // Vercel Rule: async-parallel - Fetch independent data in parallel
        const [state, cfg] = await Promise.all([
          window.electronAPI.getWindowState?.(),
          window.electronAPI.getConfig()
        ]);

        if (state) setWindowState(state);

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
          if (cfg.githubToken) setGithubToken(cfg.githubToken);
          if (cfg.githubPerPage) setGithubPerPage(cfg.githubPerPage);
          if (cfg.configPath) setConfigPath(cfg.configPath);
          
          const devSkip = import.meta.env.DEV && sessionStorage.getItem('onboarding_complete') === 'true';
          if (!devSkip && ((import.meta.env.DEV) || cfg.onboardingShown === false || typeof cfg.onboardingShown === 'undefined')) {
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

  // Auto Save
  useEffect(() => {
    if (!configInitialized) return;
    if (!window.electronAPI || !window.electronAPI.saveConfig) return;

    let cancelled = false;
    async function save() {
      try {
        setSaving(true);
        const saved = await window.electronAPI.saveConfig({
          baseDir, buttons, editor, fontSize, backgroundImage,
          bgSidebar, bgOpacity, bgBlur, shortcuts, githubColors,
          githubToken, githubPerPage, // Add this
          onboardingShown: !showOnboarding
        });
        if (!cancelled) {
          if (saved?.configPath) setConfigPath(saved.configPath);
          setLastSavedLabel(`Saved at ${new Date().toLocaleTimeString()}`);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setLastSavedLabel('Failed to save config');
      } finally {
        if (!cancelled) setSaving(false);
      }
    }
    save();
    return () => { cancelled = true; };
  }, [baseDir, buttons, editor, fontSize, backgroundImage, bgSidebar, bgOpacity, bgBlur, shortcuts, githubColors, githubToken, githubPerPage, configInitialized, showOnboarding]);

  // Window Controls
  const handleWindowControl = async (action) => {
    try {
      if (!window.electronAPI?.windowControls) return;
      await window.electronAPI.windowControls(action);
      if (action === 'maximize' || action === 'unmaximize') {
        const state = await window.electronAPI.getWindowState?.();
        if (state) setWindowState(state);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Font Size Effect
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-default', 'font-size-medium', 'font-size-large');
    const fontSizeClass = fontSize === 'medium' ? 'font-size-medium' : fontSize === 'large' ? 'font-size-large' : 'font-size-default';
    root.classList.add(fontSizeClass);
  }, [fontSize]);

  // Specific Handlers - Memoized (rerender-memo)
  const handleAddButton = useCallback(() => {
    setButtons((prev) => {
      const nextIndex = prev.length;
      const baseCode = 'A'.charCodeAt(0);
      let newId = nextIndex < 26 ? String.fromCharCode(baseCode + nextIndex) : `B${nextIndex + 1}`;
      if (prev.some((b) => b.id === newId)) {
        newId = `B${Date.now().toString().slice(-3)}`;
      }
      return [...prev, {
        id: newId, label: `Button ${newId}`, repoUrl: '', folderName: '', useSsh: false, color: 'neutral',
      }];
    });
  }, []);

  const handleRemoveButton = useCallback((id) => setButtons((prev) => prev.filter((btn) => btn.id !== id)), []);
  
  const handleOpenColorMenu = useCallback((btn, event) => {
    event.preventDefault();
    setColorMenu({
      open: true,
      buttonId: btn.id,
      repoUrl: btn.repoUrl || btn.html_url, // Store repo URL directly
      x: event.clientX,
      y: event.clientY,
      targetType: btn.isGithub ? 'github' : 'button'
    });
  }, []);

  const handleCloseColorMenu = useCallback(() => {
    setColorMenu((prev) => ({ ...prev, open: false, buttonId: null }));
  }, []);

  const handlePickColorFromMenu = useCallback((colorId) => {
    if (!colorMenu.buttonId) return;

    if (colorMenu.targetType === 'github') {
       setGithubColors(prev => ({ ...prev, [colorMenu.buttonId]: colorId }));
       appendLog(`[INFO] GitHub repo ${colorMenu.buttonId} color set to ${colorId}.`);
    } else {
       setButtons((prev) => prev.map((b) => (b.id === colorMenu.buttonId ? { ...b, color: colorId } : b)));
       appendLog(`[INFO] Button ${colorMenu.buttonId} color set to ${colorId} via Home.`);
    }

    setColorMenu({ open: false, buttonId: null, x: 0, y: 0, targetType: 'button' });
  }, [colorMenu.buttonId, colorMenu.targetType]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setButtons((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handlePickDirectory = useCallback(async () => {
    if (!window.electronAPI?.pickDirectory) return;
    try {
      const picked = await window.electronAPI.pickDirectory();
      if (picked) {
        setBaseDir(picked);
        appendLog(`[INFO] Base directory set to: ${picked}.`);
      }
    } catch (err) { console.error(err); }
  }, []);

  const handlePickBackgroundImage = useCallback(async () => {
    if (!window.electronAPI?.pickImage) return;
    try {
      const picked = await window.electronAPI.pickImage();
      if (picked) {
        setBackgroundImage(picked);
        appendLog(`[INFO] Background image set to: ${picked}`);
      }
    } catch (err) { console.error(err); }
  }, []);

  const handleRemoveBackgroundImage = useCallback(() => { 
    setBackgroundImage(null); 
    appendLog('[INFO] Background image removed.'); 
  }, []);

  const handleChangeEditor = useCallback((v) => { 
    setEditor(v); 
    appendLog(`[INFO] Editor changed to ${v}.`); 
  }, []);

  const handleChangeFontSize = useCallback((v) => { 
    setFontSize(v); 
    appendLog(`[INFO] UI font size: ${v}.`); 
  }, []);
  
  const handleOnboardingFinish = useCallback(async () => {
      setShowOnboarding(false);
      // Force save immediately to record onboarding status
      if (window.electronAPI?.saveConfig) {
          await window.electronAPI.saveConfig({
              baseDir, buttons, editor, fontSize, backgroundImage,
              bgSidebar, bgOpacity, bgBlur, shortcuts, githubColors,
              onboardingShown: true
          });
      }
  }, [baseDir, buttons, editor, fontSize, backgroundImage, bgSidebar, bgOpacity, bgBlur, shortcuts, githubColors]);

  return {
    // State
    buttons, setButtons,
    baseDir, setBaseDir,
    editor, setEditor,
    fontSize, setFontSize,
    backgroundImage, setBackgroundImage,
    bgSidebar, setBgSidebar,
    bgOpacity, setBgOpacity,
    bgBlur, setBgBlur,
    shortcuts, setShortcuts,
    githubColors, setGithubColors,
    githubToken, setGithubToken,
    githubPerPage, setGithubPerPage,
    windowState, setWindowState,
    configInitialized,
    saving, lastSavedLabel, configPath,
    showOnboarding, setShowOnboarding,
    logs, appendLog, handleClearLogs,
    colorMenu, setColorMenu,
    preferredGrid, setPreferredGrid,
    effectiveGrid,

    // Actions
    handleToggleGrid,
    handleWindowControl,
    handleAddButton,
    handleRemoveButton,
    handleOpenColorMenu,
    handleCloseColorMenu,
    handlePickColorFromMenu,
    handleDragEnd,
    handlePickDirectory,
    handlePickBackgroundImage,
    handleRemoveBackgroundImage,
    handleChangeEditor,
    handleChangeFontSize,
    handleOnboardingFinish
  };
}
