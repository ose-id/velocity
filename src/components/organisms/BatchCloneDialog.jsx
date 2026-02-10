import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BatchCloneDialog({ open, count, onClose, onConfirm }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState('separate'); // 'separate' | 'group'
  const [groupName, setGroupName] = useState('');
  const [deleteGit, setDeleteGit] = useState(false);
  const [useSsh, setUseSsh] = useState(false); // New state

  if (!open) return null;

  const handleConfirm = (extraOptions = {}) => {
    if (mode === 'group' && !groupName.trim()) {
      return; // Validation
    }
    // Merge extraOptions (like deleteGit) with standard options
    onConfirm({ 
      mode, 
      groupName: mode === 'group' ? groupName : null,
      ...extraOptions
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-black/50 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-black/50">
            <h3 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
              <Icon icon="mdi:folder-multiple-outline" className="text-neutral-100" />
              {t('batch_clone_title').replace('{count}', count)}
            </h3>
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 transition-colors">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm text-neutral-400">
              {t('batch_clone_desc').replace('{count}', count)}
            </p>

            <div className="space-y-3">
              {/* Option A: Separate */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'separate'
                    ? 'bg-neutral-100/5 border-neutral-100/30'
                    : 'bg-neutral-800/30 border-neutral-800 hover:bg-neutral-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="batchMode"
                  value="separate"
                  checked={mode === 'separate'}
                  onChange={() => setMode('separate')}
                  className="mt-1 accent-emerald-500"
                />
                <div>
                  <div className="text-sm font-medium text-neutral-200">{t('batch_clone_separate_title')}</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {t('batch_clone_separate_desc')}
                  </div>
                </div>
              </label>

              {/* Option B: Group */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'group'
                    ? 'bg-neutral-100/5 border-neutral-100/30'
                    : 'bg-neutral-800/30 border-neutral-800 hover:bg-neutral-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="batchMode"
                  value="group"
                  checked={mode === 'group'}
                  onChange={() => setMode('group')}
                  className="mt-1 accent-emerald-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-neutral-200">{t('batch_clone_group_title')}</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {t('batch_clone_group_desc')}
                  </div>
                  
                  {mode === 'group' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >

                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder={t('batch_clone_group_placeholder')}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-neutral-500 transition-colors"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </div>
              </label>
            </div>

            {/* Options Checkboxes */}
            <div className="mt-4 px-1 flex flex-col gap-2">
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
                   {t('batch_clone_ssh_label')}
                </span>
              </label>

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
                  {t('batch_clone_delete_git')}
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-neutral-950/50 border-t border-neutral-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
            >

              {t('batch_clone_cancel')}
            </button>
            <button
              onClick={() => handleConfirm({ deleteGit, useSsh })}
              disabled={mode === 'group' && !groupName.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-900 hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-neutral-900/20 cursor-pointer"
            >
              {t('batch_clone_start')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
