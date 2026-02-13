import React from 'react';
import { Icon } from '@iconify/react';
import { BUTTON_COLOR_OPTIONS } from '../../utils/constants';

export default function ProjectContextMenu({ open, x, y, activeColor, repoUrl, onClose, onPickColor }) {
  if (!open) return null;

  const handleOpenBrowser = (browserId) => {
      if (window.electronAPI?.openExternal && repoUrl) {
          window.electronAPI.openExternal(repoUrl, browserId);
      }
      onClose();
  };

  return (
    <div className="fixed inset-0 z-30" onClick={onClose} onContextMenu={(e) => e.preventDefault()}>
      <div
        className="absolute z-40 rounded-lg border border-neutral-700 bg-neutral-950 shadow-xl p-2 min-w-48"
        style={{ top: y, left: x }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color Section */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <Icon icon="mdi:palette-outline" className="text-neutral-400 text-sm" />
          <span className="text-[11px] text-neutral-400 font-medium">Change Color</span>
        </div>
        <div className="flex flex-col gap-1 mb-2">
          {BUTTON_COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onPickColor(opt.id)}
              className="inline-flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] text-neutral-200 hover:bg-neutral-800 hover:text-white cursor-pointer transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <span className={['inline-flex h-3 w-3 rounded-full', opt.dotClass].join(' ')} />
                <span>{opt.label}</span>
              </span>
              {opt.id === activeColor && (
                <Icon icon="mdi:check" className="text-[13px] text-emerald-400" />
              )}
            </button>
          ))}
        </div>

        {/* Separator */}
        {repoUrl && (
            <>
                <div className="h-px bg-neutral-800 my-1 mx-1" />
                
                <div className="flex flex-col gap-1 mt-1">
                    <button onClick={() => handleOpenBrowser('default')} className="w-full text-left px-2 py-1.5 text-[11px] text-neutral-200 hover:bg-neutral-800 hover:text-white rounded-md cursor-pointer flex items-center gap-2">
                        <Icon icon="mdi:web" />
                        Open Repo in Browser
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
