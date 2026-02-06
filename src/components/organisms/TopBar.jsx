import React from 'react';
import WindowControls from '../molecules/WindowControls';

export default function TopBar({ onWindowControl, windowState }) {
  return (
    <div
      className="flex items-center justify-between px-3 h-9 bg-neutral-900 border-b border-neutral-800 select-none"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="font-medium text-neutral-100">Velocity</span>
        <span className="text-neutral-500">Git repo launcher</span>
      </div>

      <WindowControls onWindowControl={onWindowControl} windowState={windowState} />
    </div>
  );
}
