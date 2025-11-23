import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import ProjectGrid from '../organisms/ProjectGrid';
import BatchActionBar from '../molecules/BatchActionBar';

export default function HomePage({
  buttons,
  baseDir,
  onClone,
  loading,
  activeButtonId,
  onOpenColorMenu,
  effectiveGrid,
  onToggleGrid,
  onDragEnd,
  isSelectionMode,
  selectedIds,
  onToggleSelectionMode,
  onToggleSelection,
  onBatchClone
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');

  // Extract unique groups
  const groups = ['All', ...new Set(buttons.map((b) => b.group).filter(Boolean))];

  const filteredButtons = buttons.filter((btn) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (btn.label && btn.label.toLowerCase().includes(query)) ||
      (btn.repoUrl && btn.repoUrl.toLowerCase().includes(query)) ||
      (btn.folderName && btn.folderName.toLowerCase().includes(query));
    
    const matchesGroup = activeGroup === 'All' || btn.group === activeGroup;

    return matchesSearch && matchesGroup;
  });

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto custom-scroll relative">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-100">Home</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Total <span className="text-neutral-300 font-medium">{filteredButtons.length}</span> / {buttons.length} repo.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-[11px] text-neutral-500">Base directory</div>
              <div className="text-xs font-mono text-neutral-300 max-w-xs truncate">
                {baseDir || 'Not set (gunakan Configuration)'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative group">
                <Icon
                  icon="mdi:magnify"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-neutral-300 transition-colors"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search repo..."
                  className="w-48 rounded-lg bg-neutral-900/50 border border-neutral-800/50 pl-8 pr-3 py-1 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:bg-neutral-900 focus:border-neutral-700 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  >
                    <Icon icon="mdi:close-circle" className="text-xs" />
                  </button>
                )}
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
        </div>

        {/* Group Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scroll pb-1">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer',
                activeGroup === g
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800',
              ].join(' ')}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <ProjectGrid
        buttons={filteredButtons}
        loading={loading}
        activeButtonId={activeButtonId}
        onClone={onClone}
        onOpenColorMenu={onOpenColorMenu}
        effectiveGrid={effectiveGrid}
        onDragEnd={onDragEnd}
        isSelectionMode={isSelectionMode}
        selectedIds={selectedIds}
        onToggleSelection={onToggleSelection}
      />

      <BatchActionBar 
        selectedCount={selectedIds.length}
        onCancel={onToggleSelectionMode}
        onClone={onBatchClone}
      />
    </div>
  );
}
