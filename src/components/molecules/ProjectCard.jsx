import React from 'react';
import { Icon } from '@iconify/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getButtonColorStyles } from '../../utils/constants';
import Pill from '../atoms/Pill';

export default function ProjectCard({ 
  btn, 
  loading, 
  activeButtonId, 
  onClone, 
  onOpenColorMenu,
  isSelectionMode,
  isSelected,
  onToggleSelection
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: btn.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = activeButtonId === btn.id && loading;
  const colorId = btn.color || 'neutral';
  const colorStyles = getButtonColorStyles(colorId);
  const hasUrl = !!btn.repoUrl;

  const handleMouseMove = (e) => {
    if (!hasUrl && !isSelectionMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  const handleClick = (e) => {
    // If disabled, do nothing
    if (!hasUrl) return;

    // If we are in selection mode, any click toggles selection
    if (isSelectionMode) {
      onToggleSelection(btn.id);
      return;
    }
    
    // Otherwise normal behavior
    onClone(btn);
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleSelection(btn.id);
  };

  return (
    <div ref={setNodeRef} style={style} className="relative h-full group/card">
      {/* Top Right Actions Container */}
      <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
        {/* Drag Handle */}
        {!isSelectionMode && (
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 rounded-md text-neutral-500/50 hover:text-neutral-300 hover:bg-black/20 cursor-grab active:cursor-grabbing transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon icon="mdi:drag" className="text-lg" />
          </div>
        )}

        {/* Selection Checkbox */}
        {hasUrl && (
          <div 
            className="transition-all duration-200 opacity-100 scale-100"
            onClick={handleCheckboxClick}
          >
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 cursor-pointer
              ${isSelected 
                ? 'bg-emerald-500 border-emerald-500' 
                : 'bg-black/40 border-neutral-500/50 hover:border-neutral-300'}
            `}>
              {isSelected && <Icon icon="mdi:check" className="text-white text-sm" />}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleClick}
        onContextMenu={(e) => !isSelectionMode && onOpenColorMenu && onOpenColorMenu(btn, e)}
        onMouseMove={handleMouseMove}
        disabled={loading}
        className={[
          'group relative flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition w-full h-full',
          colorStyles.card,
          loading ? 'opacity-90' : '',
          !hasUrl ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          isSelected ? 'ring-2 ring-neutral-100 ring-offset-2 ring-offset-neutral-950' : ''
        ].join(' ')}
      >
        {/* Spotlight Effect */}
        {(hasUrl || isSelectionMode) && hasUrl && (
          <div
            className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.1), transparent 40%)`,
            }}
          />
        )}

        <div className="relative z-10 flex items-center justify-between w-full gap-2 pr-6"> 
          {/* Removed pl-6, reverted to standard padding */}
          
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={['h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center', colorStyles.iconBg].join(' ')}>
              <Icon icon="mdi:download-network-outline" className="text-neutral-100 text-lg" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-neutral-50 truncate">{btn.label || `Button ${btn.id}`}</span>
              <span className="text-[11px] text-neutral-200/80 font-mono truncate max-w-[140px]">
                {btn.repoUrl || '— no repo url —'}
              </span>
            </div>
          </div>
        </div>

        {/* Custom Tooltip for disabled state */}
        {!hasUrl && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
            <div className="text-[10px] text-neutral-200 whitespace-nowrap">Repo URL belum di-set</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-neutral-800" />
          </div>
        )}

        <div className="relative z-10 mt-auto pt-2 flex items-center justify-between w-full">
          <Pill
            icon="mdi:folder-outline"
            label={btn.folderName || 'auto-folder'}
            className={colorStyles.pill}
          />

          <div className="flex items-center gap-2">
            {/* Status Icon */}
            <div className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  hasUrl ? 'bg-emerald-400' : 'bg-red-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  hasUrl ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
            </div>

            <div className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5">
              <Icon
                icon={btn.useSsh ? 'mdi:lock-outline' : 'mdi:lock-open-variant-outline'}
                className="text-[10px] text-neutral-200"
              />
              <span className="text-[10px] text-neutral-200">{btn.useSsh ? 'SSH' : 'HTTPS'}</span>
            </div>
          </div>
        </div>

        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-black/35 flex items-center justify-center z-40">
            <div className="inline-flex items-center gap-2 text-xs text-neutral-200">
              <Icon icon="mdi:loading" className="animate-spin text-base" />
              <span>Processing…</span>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}
