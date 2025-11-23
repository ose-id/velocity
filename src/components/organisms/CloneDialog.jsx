import React from 'react';
import { Icon } from '@iconify/react';

export default function CloneDialog({ open, button, onClose, onCloneGit, onDownloadZip }) {
  const [deleteGit, setDeleteGit] = React.useState(false);

  if (!open || !button) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="mdi:source-branch" className="text-neutral-200 text-base" />
          <h2 className="text-sm font-semibold text-neutral-100">Clone options</h2>
        </div>
        <p className="text-xs text-neutral-400 mb-3">
          Pilih cara clone untuk{' '}
          <span className="font-medium text-neutral-100">{button.label || `Button ${button.id}`}</span>.
        </p>

        <div className="flex flex-col gap-2 mb-3">
          <button
            type="button"
            onClick={() => onCloneGit(button, { deleteGit })}
            className="inline-flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 hover:bg-neutral-800 cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              <Icon icon="mdi:terminal" className="text-neutral-200 text-sm" />
              <span>Clone via Git</span>
            </span>
            <span className="text-[10px] text-neutral-500">Respect SSH setting</span>
          </button>

          <button
            type="button"
            onClick={() => onDownloadZip({ deleteGit })}
            className="inline-flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 hover:bg-neutral-800 cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              <Icon icon="mdi:zip-box-outline" className="text-neutral-200 text-sm" />
              <span>Unduh ZIP</span>
            </span>
            <span className="text-[10px] text-neutral-500">Selalu pakai HTTPS</span>
          </button>
        </div>

        {/* Delete .git Checkbox */}
        <div className="mb-4 px-1">
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
              Delete <span className="font-mono text-emerald-500/80">.git</span> folder after clone
            </span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 cursor-pointer"
          >
            <Icon icon="mdi:close" className="text-[13px] text-neutral-400" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
