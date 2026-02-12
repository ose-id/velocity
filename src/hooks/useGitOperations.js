import { useState, useCallback } from 'react';
import { toSshUrl } from '../utils/helpers';

export default function useGitOperations({ baseDir, editor, buttons, appendLog }) {
  const [loading, setLoading] = useState(false);
  const [activeButtonId, setActiveButtonId] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  
  // Dialog States
  const [cloneDialog, setCloneDialog] = useState({ open: false, button: null });
  const [batchDialog, setBatchDialog] = useState({ open: false, count: 0 });

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Selection Handlers
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      if (prev) setSelectedIds([]);
      return !prev;
    });
  }, []);

  const handleToggleSelection = useCallback((id) => {
    setSelectedIds((prev) => {
      const newSelection = prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id];
      setIsSelectionMode(newSelection.length > 0);
      return newSelection;
    });
  }, []);

  // Dialog Handlers
  const handleCloneClick = useCallback((btn) => setCloneDialog({ open: true, button: btn }), []);

  const handleBatchCloneClick = useCallback(() => {
    if (selectedIds.length === 0) return;
    if (selectedIds.length === 1) {
      const btn = buttons.find(b => b.id === selectedIds[0]);
      if (btn) handleCloneClick(btn);
    } else {
      setBatchDialog({ open: true, count: selectedIds.length });
    }
  }, [selectedIds, buttons, handleCloneClick]);

  // Queue Processing - Wrapped in useCallback
  const processQueue = useCallback(async ({ mode, groupName, customItems, deleteGit, useSsh }) => {
    setBatchDialog({ open: false, count: 0 });
    
    const selectedItems = (customItems && customItems.length > 0)
        ? customItems
        : buttons.filter(b => selectedIds.includes(b.id));

    if (selectedItems.length === 0) return;

    setLoading(true);
    appendLog(`[BATCH] Starting batch clone for ${selectedItems.length} items. Mode: ${mode}, SSH: ${useSsh}`);

    let targetBaseDir = baseDir;
    
    // Group Folder Logic
    if (mode === 'group' && groupName) {
      targetBaseDir = baseDir ? `${baseDir}/${groupName}` : groupName; // Simple separator assumption
      
      if (window.electronAPI?.checkPathExists) {
        const exists = await window.electronAPI.checkPathExists(targetBaseDir);
        if (exists) {
          setLoading(false);
          setActiveButtonId(null);
          setIsSelectionMode(false);
          setSelectedIds([]);
          
          if (window.electronAPI?.showMessageBox) {
            await window.electronAPI.showMessageBox({
              type: 'warning', title: 'Folder Exists',
              message: `Folder "${groupName}" already exists.\n\nCancelled.`,
              buttons: ['OK']
            });
          }
          appendLog(`[CANCEL] Batch clone cancelled. Folder "${groupName}" exists.`);
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
      
      const effectiveUrl = useSsh ? toSshUrl(btn.repoUrl) : btn.repoUrl;
      const finalUrl = effectiveUrl; 

      setActiveButtonId(btn.id); // Show spinner
      
      try {
        appendLog(`[QUEUE] Cloning ${btn.label || btn.id}...`);
        
        const result = await window.electronAPI.cloneRepo({
          repoUrl: finalUrl,
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
    if (!customItems) {
        setIsSelectionMode(false);
        setSelectedIds([]);
    }
    
    appendLog(`[BATCH] Completed. Success: ${successCount}, Failed: ${failCount}.`);
    
    if ((successCount > 0 || lastSuccessPath) && lastSuccessPath) {
      const separator = lastSuccessPath.includes('\\') ? '\\' : '/';
      const parentPath = lastSuccessPath.substring(0, lastSuccessPath.lastIndexOf(separator));

      if (mode === 'group') {
        appendLog(`[INFO] Opening Group Folder: ${parentPath}`);
        await window.electronAPI.openFolder({ path: parentPath });
        await window.electronAPI.openInEditor({ path: parentPath, editor });
      } else {
        appendLog(`[INFO] Opening Base Directory: ${parentPath}`);
        await window.electronAPI.openFolder({ path: parentPath });
      }
    }
  }, [baseDir, buttons, editor, selectedIds, appendLog]);

  const handleBatchConfirm = useCallback((data) => {
    const { mode, groupName, deleteGit, useSsh, customItems } = data;
    processQueue({ mode, groupName, customItems, deleteGit, useSsh });
  }, [processQueue]);

  // Single Clone
  const performCloneViaGit = useCallback(async (btn, options = {}) => {
    if (!window.electronAPI?.cloneRepo) return;

    setCloneDialog({ open: false, button: null });

    if (!btn.repoUrl) {
      appendLog(`[WARN] Button ${btn.id} has no URL`);
      setLastResult({ status: 'error', message: `Button ${btn.id} has no URL.` });
      return;
    }
    const effectiveUrl = btn.useSsh ? toSshUrl(btn.repoUrl) : btn.repoUrl;
    const { deleteGit, customName } = options;

    setLoading(true);
    setActiveButtonId(btn.id);
    setLastResult(null);

    try {
      const targetFolderName = customName || btn.folderName;
      appendLog(`[INFO] Cloning ${effectiveUrl} -> ${targetFolderName || '[auto]'}…`);

      const result = await window.electronAPI.cloneRepo({
        repoUrl: effectiveUrl,
        folderName: targetFolderName,
        baseDir: baseDir || null,
        editor,
        options: { deleteGit }
      });

      if (result.status === 'duplicate') {
        appendLog(`[SKIP] Exists: ${result.path}`);
      } else if (result.status === 'success') {
        appendLog(`[OK] Cloned to: ${result.path}`);
      } else {
        appendLog(`[ERROR] ${result.message}`);
      }
      setLastResult(result);
    } catch (err) {
      console.error(err);
      appendLog(`[ERROR] ${err.message}`);
      setLastResult({ status: 'error', message: err.message });
    } finally {
      setLoading(false);
      setActiveButtonId(null);
    }
  }, [baseDir, editor, appendLog]);

  // ZIP Download
  const handleOpenRepoForZip = useCallback(async (options = {}) => {
    if (!cloneDialog.button) return;
    const btn = cloneDialog.button;
    setCloneDialog({ open: false, button: null });

    if (!btn.repoUrl) {
      appendLog(`[WARN] Button ${btn.id} has no URL`);
      setLastResult({ status: 'error', message: `No URL for ${btn.id}` });
      return;
    }
    if (!window.electronAPI?.downloadZipRepo) {
      appendLog('[ERROR] IPC download-zip-repo unavailable.');
      return;
    }

    const { deleteGit, customName } = options;
    setLoading(true);
    setActiveButtonId(btn.id);
    setLastResult(null);

    try {
      const targetFolderName = customName || btn.folderName;
      appendLog(`[INFO] Downloading ZIP for ${btn.repoUrl}…`);

      const result = await window.electronAPI.downloadZipRepo({
        repoUrl: btn.repoUrl,
        folderName: targetFolderName,
        baseDir: baseDir || null,
        editor,
        options: { deleteGit }
      });

      if (result.status === 'duplicate') {
        appendLog(`[SKIP] Exists: ${result.path}`);
      } else if (result.status === 'success') {
        appendLog(`[OK] ZIP extracted to: ${result.path}`);
      } else {
        appendLog(`[ERROR] ${result.message}`);
      }
      setLastResult(result);
    } catch (err) {
      console.error(err);
      appendLog(`[ERROR] ${err.message}`);
      setLastResult({ status: 'error', message: err.message });
    } finally {
      setLoading(false);
      setActiveButtonId(null);
    }
  }, [cloneDialog.button, baseDir, editor, appendLog]);

  return {
    loading,
    activeButtonId,
    lastResult, setLastResult,
    cloneDialog, setCloneDialog,
    batchDialog, setBatchDialog,
    isSelectionMode, setIsSelectionMode,
    selectedIds, setSelectedIds,
    
    handleToggleSelectionMode,
    handleToggleSelection,
    handleCloneClick,
    handleBatchCloneClick,
    handleBatchConfirm,
    performCloneViaGit,
    handleOpenRepoForZip,
    handleBatchCloneFromGithub: handleBatchConfirm
  };
}
