import { useState, useCallback } from 'react';
import { toSshUrl } from '../utils/helpers';
import type { RepoButton, CloneOptions, CloneResult, BatchCloneOptions } from '../types/models';

interface UseGitOperationsProps {
  baseDir: string;
  editor?: string;
  buttons: RepoButton[];
  appendLog: (message: string) => void;
}

export interface CloneDialogState {
  open: boolean;
  button: RepoButton | null;
}

export interface BatchDialogState {
  open: boolean;
  count: number;
}

export default function useGitOperations({ baseDir, editor, buttons, appendLog }: UseGitOperationsProps) {
  const [loading, setLoading] = useState(false);
  const [activeButtonId, setActiveButtonId] = useState<number | string | null>(null);
  const [lastResult, setLastResult] = useState<CloneResult | null>(null);

  // Dialog States
  const [cloneDialog, setCloneDialog] = useState<CloneDialogState>({ open: false, button: null });
  const [batchDialog, setBatchDialog] = useState<BatchDialogState>({ open: false, count: 0 });

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  // Selection Handlers
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      if (prev) setSelectedIds([]);
      return !prev;
    });
  }, []);

  const handleToggleSelection = useCallback((id: number | string) => {
    setSelectedIds((prev) => {
      const newSelection = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id];
      setIsSelectionMode(newSelection.length > 0);
      return newSelection;
    });
  }, []);

  // Dialog Handlers
  const handleCloneClick = useCallback((btn: RepoButton) => setCloneDialog({ open: true, button: btn }), []);

  const handleBatchCloneClick = useCallback(() => {
    if (selectedIds.length === 0) return;
    if (selectedIds.length === 1) {
      const btn = buttons.find((b) => b.id === selectedIds[0]);
      if (btn) handleCloneClick(btn);
    } else {
      setBatchDialog({ open: true, count: selectedIds.length });
    }
  }, [selectedIds, buttons, handleCloneClick]);

  // Pending Batch Integration
  const [pendingBatchItems, setPendingBatchItems] = useState<RepoButton[] | null>(null);

  // Queue Processing
  const processQueue = useCallback(
    async ({
      mode,
      groupName,
      customItems,
      deleteGit,
      useSsh,
      baseDir: overrideBaseDir,
    }: BatchCloneOptions & { customItems?: RepoButton[] }) => {
      setBatchDialog({ open: false, count: 0 });

      // Priority: Custom Items > Pending Items > Selected Buttons
      const selectedItems =
        customItems && customItems.length > 0
          ? customItems
          : pendingBatchItems && pendingBatchItems.length > 0
          ? pendingBatchItems
          : buttons.filter((b) => selectedIds.includes(b.id));

      if (selectedItems.length === 0) return;

      setLoading(true);
      appendLog(`[BATCH] Starting batch clone for ${selectedItems.length} items. Mode: ${mode}, SSH: ${Boolean(useSsh)}`);

      let targetBaseDir = overrideBaseDir || baseDir;

      // Group Folder Logic
      if (mode === 'group' && groupName) {
        targetBaseDir = targetBaseDir ? `${targetBaseDir}/${groupName}` : groupName;

        if (window.electronAPI?.checkPathExists) {
          const exists = await window.electronAPI.checkPathExists(targetBaseDir);
          if (exists) {
            setLoading(false);
            setActiveButtonId(null);
            setIsSelectionMode(false);
            setSelectedIds([]);
            setPendingBatchItems(null);

            if (window.electronAPI?.showMessageBox) {
              await window.electronAPI.showMessageBox({
                type: 'warning',
                title: 'Folder Exists',
                message: `Folder "${groupName}" already exists.\n\nCancelled.`,
                buttons: ['OK'],
              });
            }
            appendLog(`[CANCEL] Batch clone cancelled. Folder "${groupName}" exists.`);
            return;
          }
        }
      }

      let successCount = 0;
      let failCount = 0;
      let lastSuccessPath: string | undefined = undefined;

      for (const btn of selectedItems) {
        if (!btn.repoUrl) {
          appendLog(`[SKIP] Button ${btn.id} has no Repo URL.`);
          continue;
        }

        const effectiveUrl = useSsh ? toSshUrl(btn.repoUrl) : btn.repoUrl;

        setActiveButtonId(btn.id);

        try {
          appendLog(`[QUEUE] Cloning ${btn.label || btn.id}...`);

          const result = await window.electronAPI?.cloneRepo({
            repoUrl: effectiveUrl,
            folderName: btn.folderName,
            baseDir: targetBaseDir,
            editor,
            options: { skipOpenEditor: true, skipOpenFolder: true, deleteGit },
          });

          if (!result) {
            failCount++;
            appendLog(`[FAIL] ${btn.label || btn.id}: Electron API unavailable`);
          } else if (result.status === 'success') {
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
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error(err);
          failCount++;
          appendLog(`[ERROR] ${btn.label || btn.id}: ${errMsg}`);
        }
      }

      setLoading(false);
      setActiveButtonId(null);
      setPendingBatchItems(null);

      if (!customItems && !pendingBatchItems) {
        setIsSelectionMode(false);
        setSelectedIds([]);
      }

      appendLog(`[BATCH] Completed. Success: ${successCount}, Failed: ${failCount}.`);

      if ((successCount > 0 || lastSuccessPath) && lastSuccessPath && window.electronAPI) {
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
    },
    [baseDir, buttons, editor, selectedIds, appendLog, pendingBatchItems]
  );

  const handleBatchConfirm = useCallback(
    (data: BatchCloneOptions) => {
      const { mode, groupName, deleteGit, useSsh, baseDir: overrideBaseDir } = data;
      processQueue({ mode, groupName, deleteGit, useSsh, baseDir: overrideBaseDir });
    },
    [processQueue]
  );

  const startBatchCloneFromGithub = useCallback((repos: RepoButton[]) => {
    if (!repos || repos.length === 0) return;
    setPendingBatchItems(repos);
    setBatchDialog({ open: true, count: repos.length });
  }, []);

  // Single Clone
  const performCloneViaGit = useCallback(
    async (btn: RepoButton, options: CloneOptions = {}) => {
      if (!window.electronAPI?.cloneRepo) return;

      setCloneDialog({ open: false, button: null });

      if (!btn.repoUrl) {
        appendLog(`[WARN] Button ${btn.id} has no URL`);
        setLastResult({ status: 'error', message: `Button ${btn.id} has no URL.` });
        return;
      }
      const { deleteGit, customName, baseDir: overrideBaseDir, useSsh } = options;
      const effectiveUseSsh = useSsh !== undefined ? useSsh : btn.useSsh;
      const effectiveUrl = effectiveUseSsh ? toSshUrl(btn.repoUrl) : btn.repoUrl;

      setLoading(true);
      setActiveButtonId(btn.id);
      setLastResult(null);

      try {
        const targetFolderName = customName || btn.folderName;
        appendLog(`[INFO] Cloning ${effectiveUrl} -> ${targetFolderName || '[auto]'}…`);

        const result = await window.electronAPI.cloneRepo({
          repoUrl: effectiveUrl,
          folderName: targetFolderName,
          baseDir: overrideBaseDir || baseDir || null,
          editor,
          options: { deleteGit },
        });

        if (result.status === 'duplicate') {
          appendLog(`[SKIP] Exists: ${result.path}`);
        } else if (result.status === 'success') {
          appendLog(`[OK] Cloned to: ${result.path}`);
        } else {
          appendLog(`[ERROR] ${result.message}`);
        }
        setLastResult(result);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(err);
        appendLog(`[ERROR] ${errMsg}`);
        setLastResult({ status: 'error', message: errMsg });
      } finally {
        setLoading(false);
        setActiveButtonId(null);
      }
    },
    [baseDir, editor, appendLog]
  );

  // ZIP Download
  const handleOpenRepoForZip = useCallback(
    async (options: CloneOptions = {}) => {
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

      const { deleteGit, customName, baseDir: overrideBaseDir } = options;
      setLoading(true);
      setActiveButtonId(btn.id);
      setLastResult(null);

      try {
        const targetFolderName = customName || btn.folderName;
        appendLog(`[INFO] Downloading ZIP for ${btn.repoUrl}…`);

        const result = await window.electronAPI.downloadZipRepo({
          repoUrl: btn.repoUrl,
          folderName: targetFolderName,
          baseDir: overrideBaseDir || baseDir || null,
          editor,
          options: { deleteGit },
        });

        if (result.status === 'duplicate') {
          appendLog(`[SKIP] Exists: ${result.path}`);
        } else if (result.status === 'success') {
          appendLog(`[OK] ZIP extracted to: ${result.path}`);
        } else {
          appendLog(`[ERROR] ${result.message}`);
        }
        setLastResult(result);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(err);
        appendLog(`[ERROR] ${errMsg}`);
        setLastResult({ status: 'error', message: errMsg });
      } finally {
        setLoading(false);
        setActiveButtonId(null);
      }
    },
    [cloneDialog.button, baseDir, editor, appendLog]
  );

  return {
    loading,
    activeButtonId,
    lastResult,
    setLastResult,
    cloneDialog,
    setCloneDialog,
    batchDialog,
    setBatchDialog,
    isSelectionMode,
    setIsSelectionMode,
    selectedIds,
    setSelectedIds,

    handleToggleSelectionMode,
    handleToggleSelection,
    handleCloneClick,
    handleBatchCloneClick,
    handleBatchConfirm,
    performCloneViaGit,
    handleOpenRepoForZip,
    handleBatchCloneFromGithub: startBatchCloneFromGithub,
  };
}
