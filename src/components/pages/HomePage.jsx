import React from 'react';
import { Icon } from '@iconify/react';
import ProjectGrid from '../organisms/ProjectGrid';

export default function HomePage({
  buttons,
  baseDir,
  onClone,
  loading,
  activeButtonId,
  onOpenColorMenu,
  effectiveGrid,
  onToggleGrid,
}) {
  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto custom-scroll">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Home</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Total <span className="text-neutral-300 font-medium">{buttons.length}</span> repo. Pilih tombol untuk clone
            repo &amp; buka editor.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-[11px] text-neutral-500">Base directory</div>
            <div className="text-xs font-mono text-neutral-300 max-w-xs truncate">
              {baseDir || 'Not set (gunakan Configuration)'}
            </div>
          </div>

          {/* Grid Toggle Switch Tab */}
          <div className="flex items-center bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800/50">
            <button
              type="button"
              onClick={() => effectiveGrid !== 2 && onToggleGrid()}
              className={[
                'flex items-center justify-center w-7 h-6 rounded-md transition-all',
                effectiveGrid === 2
                  ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300',
              ].join(' ')}
              title="2 Columns"
            >
              <Icon icon="mdi:view-grid-outline" className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => effectiveGrid !== 3 && onToggleGrid()}
              className={[
                'flex items-center justify-center w-7 h-6 rounded-md transition-all',
                effectiveGrid === 3
                  ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300',
              ].join(' ')}
              title="3 Columns"
            >
              <Icon icon="mdi:view-grid" className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      <ProjectGrid
        buttons={buttons}
        loading={loading}
        activeButtonId={activeButtonId}
        onClone={onClone}
        onOpenColorMenu={onOpenColorMenu}
        effectiveGrid={effectiveGrid}
      />
    </div>
  );
}
