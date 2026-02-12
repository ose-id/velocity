import { useState, useEffect, useCallback } from 'react';

export default function useUpdateSystem() {
  const [updateStatus, setUpdateStatus] = useState({ status: 'idle' });

  // Update Status Listener
  useEffect(() => {
    if (!window.electronAPI?.onUpdateStatus) return;
    window.electronAPI.onUpdateStatus((statusObj) => {
      console.log('[App] Update status:', statusObj);
      setUpdateStatus(statusObj);
    });
    return () => {
      if (window.electronAPI.removeUpdateStatusListener) {
        window.electronAPI.removeUpdateStatusListener();
      }
    };
  }, []);

  const handleCheckUpdate = useCallback(async () => {
    if (!window.electronAPI?.checkForUpdates) return;
    setUpdateStatus({ status: 'checking' });

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ status: 'timeout' }), 30000);
    });

    const checkPromise = window.electronAPI.checkForUpdates();
    const result = await Promise.race([checkPromise, timeoutPromise]);

    if (result.status === 'timeout') {
      setUpdateStatus({ status: 'error', error: 'Connection timed out (30s)' });
    } else if (result.status === 'dev-mode') {
      setUpdateStatus({ status: 'dev-mode' });
    } else if (result.status === 'error') {
      if (import.meta.env.DEV) {
        setUpdateStatus({ status: 'error', error: result.error });
      } else {
        console.error("Update Check Error:", result.error);
        setUpdateStatus({ status: 'error', error: "Update check failed." });
      }
    } else if (result.status === 'checked' && !result.updateInfo) {
      setUpdateStatus({ status: 'not-available' });
      setTimeout(() => {
        setUpdateStatus((prev) => (prev.status === 'not-available' ? { status: 'idle' } : prev));
      }, 3000);
    }
  }, []);

  const handleDownloadUpdate = useCallback(() => {
    if (!window.electronAPI?.downloadUpdate) return;
    setUpdateStatus({ status: 'downloading' });
    window.electronAPI.downloadUpdate();
  }, []);

  const handleQuitAndInstall = useCallback(() => {
    if (!window.electronAPI?.quitAndInstall) return;
    window.electronAPI.quitAndInstall();
  }, []);

  const handleTestUpdatePopup = useCallback(() => {
    localStorage.removeItem('ignoredUpdateVersion');
    setUpdateStatus({ status: 'idle' });
    setTimeout(() => {
      setUpdateStatus({
        status: 'available',
        info: { 
          version: `9.9.9-test-${Date.now()}`, 
          releaseDate: new Date().toISOString() 
        }
      });
    }, 50);
  }, []);

  return {
    updateStatus,
    handleCheckUpdate,
    handleDownloadUpdate,
    handleQuitAndInstall,
    handleTestUpdatePopup
  };
}
