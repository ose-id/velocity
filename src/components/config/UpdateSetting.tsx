import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui';
import { useLanguage } from '@/contexts/LanguageContext';
import type { UpdateStatus } from '@/types';

export interface UpdateSettingProps {
  updateStatus?: UpdateStatus;
  onCheckUpdate: () => void;
  onQuitAndInstall: () => void;
  onDownloadUpdate: () => void;
  onTestUpdatePopup: () => void;
}

export default function UpdateSetting({
  updateStatus,
  onCheckUpdate,
  onQuitAndInstall,
  onDownloadUpdate,
  onTestUpdatePopup,
}: UpdateSettingProps) {
  const [appVersion, setAppVersion] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchVersion() {
      if (window.electronAPI?.getAppVersion) {
        const ver = await window.electronAPI.getAppVersion();
        setAppVersion(ver);
      }
    }
    fetchVersion();
  }, []);

  return (
    <div className="border-t border-neutral-900 pt-4 mt-2">
      <div className="flex items-start gap-3">
        <div className="mt-1.5">
          <Icon icon="mdi:update" className="text-neutral-300 text-lg" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">{t('config_update')}</h2>
              <p className="text-[11px] text-neutral-500">{t('config_update_desc')}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-500 block">{t('config_current_version')}</span>
              <span className="text-xs font-mono text-neutral-300">v{appVersion || '...'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {updateStatus?.status === 'downloaded' ? (
              <Button
                onClick={onQuitAndInstall}
                icon="mdi:restart"
                className="bg-emerald-600 text-white hover:bg-emerald-500 border-none shadow-lg animate-pulse"
              >
                {t('config_restart_install')} v{updateStatus?.info?.version}
              </Button>
            ) : updateStatus?.status === 'available' ? (
              <Button
                onClick={onDownloadUpdate}
                icon="mdi:download-outline"
                className="bg-emerald-600 text-white hover:bg-emerald-500 border-none shadow-lg"
              >
                {t('update_now')} (v{updateStatus?.info?.version})
              </Button>
            ) : (
              <Button
                onClick={onCheckUpdate}
                disabled={
                  updateStatus?.status === 'checking' ||
                  updateStatus?.status === 'downloading' ||
                  updateStatus?.status === 'progress'
                }
                icon={updateStatus?.status === 'checking' ? 'mdi:loading' : 'mdi:refresh'}
                iconClassName={updateStatus?.status === 'checking' ? 'animate-spin' : ''}
                className={`min-w-[180px] justify-center transition-all duration-300 border-none shadow-md
                  ${updateStatus?.status === 'idle' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-100' : ''}
                  ${updateStatus?.status === 'checking' ? 'bg-neutral-700 text-neutral-300 opacity-80 cursor-wait' : ''}
                  ${updateStatus?.status === 'progress' ? 'bg-blue-600 text-white' : ''}
                  ${updateStatus?.status === 'not-available' ? 'bg-blue-500 text-white hover:bg-blue-400' : ''}
                  ${updateStatus?.status === 'error' ? 'bg-red-500 text-white hover:bg-red-400' : ''}
                  ${updateStatus?.status === 'dev-mode' ? 'bg-amber-500 text-white hover:bg-amber-400' : ''}
                `}
              >
                {updateStatus?.status === 'idle' && t('config_check_update')}
                {updateStatus?.status === 'checking' && (
                  <span className="flex items-center">
                    {t('config_checking')}
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse delay-75">.</span>
                    <span className="animate-pulse delay-150">.</span>
                  </span>
                )}
                {updateStatus?.status === 'progress' &&
                  `${t('config_downloading')} ${Math.round(updateStatus.progress?.percent || 0)}%`}
                {updateStatus?.status === 'not-available' && t('config_up_to_date')}
                {updateStatus?.status === 'error' && t('config_retry')}
                {updateStatus?.status === 'dev-mode' && t('config_dev_mode')}
              </Button>
            )}

            {updateStatus?.status === 'error' && (
              <span className="text-xs text-red-500">{updateStatus.error}</span>
            )}

            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={onTestUpdatePopup}
                className="ml-2 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 transition-all text-[10px] font-mono flex items-center gap-1.5 cursor-pointer"
                title="Trigger Test Update Popup"
              >
                <Icon icon="mdi:flask-outline" className="text-xs" />
                <span>DEV: TEST POPUP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
