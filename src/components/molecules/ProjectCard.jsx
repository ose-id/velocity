import React from 'react';
import { Icon } from '@iconify/react';
import { getButtonColorStyles } from '../../utils/constants';
import Pill from '../atoms/Pill';

export default function ProjectCard({ btn, loading, activeButtonId, onClone, onOpenColorMenu }) {
  const isActive = activeButtonId === btn.id && loading;
  const colorId = btn.color || 'neutral';
  const colorStyles = getButtonColorStyles(colorId);
  const hasUrl = !!btn.repoUrl;

  const handleMouseMove = (e) => {
    if (!hasUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  return (
    <button
      type="button"
      onClick={() => {
        if (!hasUrl) return;
        onClone(btn);
      }}
      onContextMenu={(e) => onOpenColorMenu && onOpenColorMenu(btn, e)}
      onMouseMove={handleMouseMove}
      disabled={loading}
      className={[
        'group relative flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition',
        colorStyles.card,
        loading ? 'opacity-90' : '',
        !hasUrl ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      {/* Spotlight Effect */}
      {hasUrl && (
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.1), transparent 40%)`,
          }}
        />
      )}

      <div className="relative z-10 flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-2">
          <div className={['h-7 w-7 rounded-lg flex items-center justify-center', colorStyles.iconBg].join(' ')}>
            <Icon icon="mdi:download-network-outline" className="text-neutral-100 text-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-50">{btn.label || `Button ${btn.id}`}</span>
            <span className="text-[11px] text-neutral-200/80 font-mono truncate max-w-[180px]">
              {btn.repoUrl || '— no repo url —'}
            </span>
          </div>
        </div>

        <Icon
          icon="mdi:arrow-right"
          className={['text-neutral-200/70 group-hover:text-neutral-50 text-lg mr-3', hasUrl ? 'animate-move-x' : ''].join(' ')}
        />
      </div>

      {/* Custom Tooltip for disabled state */}
      {!hasUrl && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
          <div className="text-[10px] text-neutral-200 whitespace-nowrap">Repo URL belum di-set</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-neutral-800" />
        </div>
      )}

      <div className="relative z-10 mt-2 flex items-center justify-between w-full">
        <Pill
          icon="mdi:folder-outline"
          label={btn.folderName || 'auto-folder'}
          className={colorStyles.pill}
        />

        <div className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5">
          <Icon
            icon={btn.useSsh ? 'mdi:lock-outline' : 'mdi:lock-open-variant-outline'}
            className="text-[10px] text-neutral-200"
          />
          <span className="text-[10px] text-neutral-200">{btn.useSsh ? 'SSH enabled' : 'SSH disabled'}</span>
        </div>
      </div>

      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-black/35 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 text-xs text-neutral-200">
            <Icon icon="mdi:loading" className="animate-spin text-base" />
            <span>Processing…</span>
          </div>
        </div>
      )}
    </button>
  );
}
