import React from 'react';
import WindowControls from '../molecules/WindowControls';
import { useLanguage } from '@/contexts/LanguageContext';
import { Icon } from '@iconify/react';

export default function TopBar({ onWindowControl, windowState }) {
  const { language, setLanguage, t } = useLanguage();

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

      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          type="button"
          onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
          className="h-6 px-2 text-xs font-semibold text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
        >
          {language.toUpperCase()}
        </button>
        <div className="h-4 w-[1px] bg-neutral-800 mx-1" />
        <WindowControls onWindowControl={onWindowControl} windowState={windowState} />
      </div>
    </div>
  );
}
