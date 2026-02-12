import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '../atoms/Button';

export default function UpdatePopup({ updateStatus, onDownload, onClose }) {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [version, setVersion] = useState('');

  useEffect(() => {
    if (updateStatus?.status === 'available' && updateStatus?.info?.version) {
      const newVersion = updateStatus.info.version;
      const ignoredVersion = localStorage.getItem('ignoredUpdateVersion');

      if (newVersion !== ignoredVersion) {
        setVersion(newVersion);
        setShow(true);
      }
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
    setShow(false);
    onDownload && onDownload();
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleLater}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden mx-4"
          >
            {/* Ambient Glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
            
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
                <Icon icon="mdi:gift-outline" className="text-3xl text-emerald-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                {t('update_popup_title')}
              </h2>
              
              <p className="text-neutral-400 mb-8 max-w-xs mx-auto leading-relaxed">
                {t('update_popup_desc').replace('{version}', version)}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
