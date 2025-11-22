import React from 'react';
import IconButton from '../atoms/IconButton';

export default function WindowControls({ onWindowControl, windowState }) {
  return (
    <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
      <IconButton
        icon="mdi:minus"
        onClick={() => onWindowControl('minimize')}
        className="w-10 h-9 hover:bg-neutral-800 text-neutral-400"
      />
      <IconButton
        icon={windowState?.isMaximized ? 'mdi:window-restore' : 'mdi:window-maximize'}
        onClick={() => onWindowControl(windowState?.isMaximized ? 'unmaximize' : 'maximize')}
        className="w-10 h-9 hover:bg-neutral-800 text-neutral-400"
      />
      <IconButton
        icon="mdi:close"
        onClick={() => onWindowControl('close')}
        className="w-10 h-9 hover:bg-red-600/90 text-neutral-200"
      />
    </div>
  );
}
