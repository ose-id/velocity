import React from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BatchActionBar({ selectedCount, onCancel, onClone }) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/50 px-6 py-3 rounded-2xl shadow-2xl"
        >
          <div className="flex items-center gap-3 pr-4 border-r border-neutral-700/50">
            <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-full">
              <Icon icon="mdi:check" className="text-lg" />
            </div>
            <span className="text-sm font-medium text-neutral-200">
              {selectedCount} Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onClone}
              disabled={selectedCount < 2}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20 cursor-pointer ${
                selectedCount < 2
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              <Icon icon="mdi:download-multiple" className="text-lg" />
              Clone Selected
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
