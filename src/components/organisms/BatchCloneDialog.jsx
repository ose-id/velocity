import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BatchCloneDialog({ open, count, onClose, onConfirm }) {
  const [mode, setMode] = useState('separate'); // 'separate' | 'group'
  const [groupName, setGroupName] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    if (mode === 'group' && !groupName.trim()) {
      return; // Validation
    }
    onConfirm({ mode, groupName: mode === 'group' ? groupName : null });
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
              Batch Clone ({count} Items)
            </h3>
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 transition-colors">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <p className="text-sm text-neutral-400">
              Bagaimana Anda ingin meng-clone <strong>{count} repository</strong> yang dipilih?
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
                  <div className="text-sm font-medium text-neutral-200">Terpisah (Standard)</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Clone setiap repo langsung ke folder Base Directory masing-masing.
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
                  <div className="text-sm font-medium text-neutral-200">Gabung dalam Folder (Group)</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Buat folder induk baru, lalu clone semua repo ke dalamnya.
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
                        placeholder="Nama Folder Group (e.g. My-Stack)"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-neutral-500 transition-colors"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-neutral-950/50 border-t border-neutral-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={mode === 'group' && !groupName.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-900 hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-neutral-900/20"
            >
              Start Cloning
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
