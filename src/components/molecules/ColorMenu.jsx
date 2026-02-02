import React from 'react';
import { Icon } from '@iconify/react';
import { BUTTON_COLOR_OPTIONS } from '../../utils/constants';

export default function ColorMenu({ open, x, y, activeColor, onClose, onPickColor }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30" onClick={onClose} onContextMenu={(e) => e.preventDefault()}>
      <div
        className="absolute z-40 rounded-lg border border-neutral-700 bg-neutral-950 shadow-xl p-2 min-w-40"
        style={{ top: y, left: x }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="mdi:palette-outline" className="text-neutral-200 text-sm" />
          <span className="text-[11px] text-neutral-200 font-medium">Change button color</span>
        </div>
        <div className="flex flex-col gap-1">
          {BUTTON_COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onPickColor(opt.id)}
              className="inline-flex items-center justify-between rounded-md px-2 py-1 text-[11px] text-neutral-100 hover:bg-neutral-800 cursor-pointer"
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
      </div>
    </div>
  );
}
