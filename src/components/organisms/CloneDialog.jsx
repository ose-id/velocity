import React from 'react';
import { Icon } from '@iconify/react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CloneDialog({ open, button, baseDir, onClose, onCloneGit, onDownloadZip }) {
  const [deleteGit, setDeleteGit] = React.useState(false);
  const [useSsh, setUseSsh] = React.useState(false); // New State
  const [useCustomName, setUseCustomName] = React.useState(false);
  const [customName, setCustomName] = React.useState('');
  const [destinationDir, setDestinationDir] = React.useState(baseDir);
  const { t } = useLanguage();

  React.useEffect(() => {
    if (open) {
        setDestinationDir(baseDir);
    }
  }, [open, baseDir]);

  const handlePickDirectory = async () => {
      if (window.electronAPI?.pickDirectory) {
          const result = await window.electronAPI.pickDirectory();
          if (result) setDestinationDir(result);
      }
  };

  if (!open || !button) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:source-branch" className="text-neutral-200 text-base" />
            <h2 className="text-sm font-semibold text-neutral-100">{t('clone_options')}</h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer group">
            <Icon icon="mdi:close" className="text-xl group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 mb-3">
          {t('clone_choose_method')}{' '}
          <span className="font-medium text-neutral-100">{button.label || `Button ${button.id}`}</span>.
        </p>

        {/* Destination Picker */}
        <div className="mb-3 p-2 bg-neutral-900 rounded-lg border border-neutral-800 group hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Destination</span>
                <button onClick={handlePickDirectory} className="text-[10px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer flex items-center gap-1">
                    Change <Icon icon="mdi:pencil-outline" className="text-[10px]" />
                </button>
            </div>
            <div className="text-xs text-neutral-300 truncate font-mono" title={destinationDir}>
                {destinationDir || 'Default (Downloads)'}
            </div>
        </div>

        <div className="flex flex-col gap-2 mb-3">
          <button
            type="button"
            onClick={() => onCloneGit(button, { deleteGit, useSsh, customName: useCustomName ? customName : undefined, baseDir: destinationDir })}
            className="inline-flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 hover:bg-neutral-800 cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              <Icon icon="mdi:terminal" className="text-neutral-200 text-sm" />
              <span>{t('clone_via_git')}</span>
            </span>
            <span className="text-[10px] text-neutral-500">{t('clone_respect_ssh')}</span>
          </button>

          <button
            type="button"
            disabled={useSsh}
            onClick={() => onDownloadZip({ deleteGit, customName: useCustomName ? customName : undefined, baseDir: destinationDir })}
            className={`inline-flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${
              useSsh 
              ? 'border-neutral-800 bg-neutral-900/50 text-neutral-500 cursor-not-allowed hidden' 
              : 'border-neutral-700 bg-neutral-900 text-neutral-100 hover:bg-neutral-800 cursor-pointer'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Icon icon="mdi:zip-box-outline" className={useSsh ? "text-neutral-600" : "text-neutral-200 text-sm"} />
              <span>{t('clone_download_zip')}</span>
            </span>
            <span className={useSsh ? "text-[10px] text-neutral-700" : "text-[10px] text-neutral-500"}>
               {useSsh ? t('clone_not_available_ssh') : t('clone_always_https')}
            </span>
          </button>
        </div>

        {/* Options Checkboxes */}
        <div className="mb-4 px-1 flex flex-col gap-2">
           {/* SSH Checkbox */}
           <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer h-4 w-4 appearance-none rounded border border-neutral-700 bg-neutral-900 checked:border-emerald-500 checked:bg-emerald-500 transition-all"
                checked={useSsh}
                onChange={(e) => setUseSsh(e.target.checked)}
              />
              <Icon icon="mdi:check" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
            </div>
            <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">
              {t('clone_use_ssh')}
            </span>
          </label>

          {/* Delete Git Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer h-4 w-4 appearance-none rounded border border-neutral-700 bg-neutral-900 checked:border-emerald-500 checked:bg-emerald-500 transition-all"
                checked={deleteGit}
                onChange={(e) => setDeleteGit(e.target.checked)}
              />
              <Icon icon="mdi:check" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
            </div>
            <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">
              {t('clone_delete_git')}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer h-4 w-4 appearance-none rounded border border-neutral-700 bg-neutral-900 checked:border-emerald-500 checked:bg-emerald-500 transition-all"
                checked={useCustomName}
                onChange={(e) => setUseCustomName(e.target.checked)}
              />
              <Icon icon="mdi:check" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
            </div>
            <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">
              {t('clone_custom_folder')}
            </span>
          </label>

          {useCustomName && (
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={t('clone_folder_placeholder')}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          )}
        </div>


      </div>
    </div>
  );
}

