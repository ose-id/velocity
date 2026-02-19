import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '../atoms/Button';

export default function UpdatePopup({ updateStatus, onDownload, onQuitAndInstall, onClose }) {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [version, setVersion] = useState('');

  // Monitor status changes
  useEffect(() => {
    if (!updateStatus) return;

    const { status, info } = updateStatus;

    // 1. Available
    if (status === 'available' && info?.version) {
      const newVersion = info.version;
      const ignoredVersion = localStorage.getItem('ignoredUpdateVersion');
      if (newVersion !== ignoredVersion) {
        setVersion(newVersion);
        setShow(true);
      }
    }
    // 2. Downloading / Progress / Downloaded -> Force show
    else if (['downloading', 'progress', 'downloaded'].includes(status)) {
      setShow(true);
      if (info?.version) setVersion(info.version);
    }
    // 3. Error -> Show if we were already showing (contextual)
    else if (status === 'error') {
       // Optional: decide if we want to show error if it wasn't open
       // For now, let's keep it open if it was already open to show the error
    }
  }, [updateStatus]);

  const handleLater = () => {
    if (version) {
      localStorage.setItem('ignoredUpdateVersion', version);
    }
    setShow(false);
    onClose && onClose();
  };

  const handleUpdate = () => {
    // Don't close, just trigger download
    // setShow(false); 
    onDownload && onDownload();
  };

  const handleRestart = () => {
     onQuitAndInstall && onQuitAndInstall();
  };

  // Render logic based on status
  const renderContent = () => {
    const { status, progress, error } = updateStatus || {};

    // A. Downloaded -> Restart
    if (status === 'downloaded') {
      return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
            <Icon icon="mdi:check-circle-outline" className="text-3xl text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('update_ready')}</h2>
            <p className="text-neutral-400 mb-6 text-center">
            {t('update_downloaded_desc').replace('{version}', version)}
            </p>
            <Button
            onClick={handleRestart}
            className="w-full justify-center bg-emerald-600 text-white hover:bg-emerald-500 py-3 rounded-xl shadow-lg shadow-emerald-900/20 font-medium"
            >
            {t('update_restart')}
            </Button>
        </div>
      );
    }

    // B. Downloading / Progress
    if (status === 'downloading' || status === 'progress') {
      const percent = progress?.percent ? Math.round(progress.percent) : 0;
      return (
        <div className="flex flex-col items-center w-full">
             <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
                <Icon icon="mdi:cloud-download-outline" className="text-3xl text-blue-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('update_downloading')}</h2>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mb-2">
                <motion.div 
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.2 }}
                />
            </div>
            <p className="text-sm text-neutral-400 mb-6">{t('update_completed').replace('{percent}', percent)}</p>
        </div>
      );
    }

    // C. Error
    if (status === 'error') {
        return (
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-red-500/20">
                    <Icon icon="mdi:alert-circle-outline" className="text-3xl text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{t('update_failed')}</h2>
                <p className="text-red-400 mb-6 text-center text-sm">{error || t('log_error')}</p>
                <Button
                    onClick={() => setShow(false)}
                    className="w-full justify-center bg-neutral-800 text-neutral-300 hover:bg-neutral-700 py-3 rounded-xl border border-neutral-700 font-medium"
                >
                    {t('update_close')}
                </Button>
            </div>
        )
    }

    // D. Available (Default)
    return (
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
          <Icon icon="mdi:gift-outline" className="text-3xl text-emerald-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          {t('update_popup_title')}
        </h2>
        
        <p className="text-neutral-400 mb-8 max-w-xs mx-auto leading-relaxed">
          {t('update_popup_desc') && t('update_popup_desc').replace('{version}', version)}
        </p>

        <div className="flex items-center gap-3 w-full">
          <Button
            onClick={handleLater}
            className="flex-1 justify-center bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white py-3 rounded-xl border border-neutral-700 hover:border-neutral-600 transition-all font-medium"
          >
            {t('update_later')}
          </Button>
          <Button
            onClick={handleUpdate}
            className="flex-1 justify-center bg-emerald-600 text-white hover:bg-emerald-500 py-3 rounded-xl shadow-lg shadow-emerald-900/20 font-medium"
          >
            <p className="flex items-center"><Icon icon="mdi:download-outline" className="text-xl mr-2 group-hover:-translate-y-0.5 transition-transform" />
            {t('update_now')}</p>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={handleLater}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden mx-4 p-8"
          >
            {/* Ambient Glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
            
            {renderContent()}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
