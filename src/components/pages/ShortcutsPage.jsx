import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function ShortcutsPage({ shortcuts, onUpdateShortcut }) {
  const [recordingKey, setRecordingKey] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!recordingKey) return;
      e.preventDefault();
      e.stopPropagation();

      // Ignore modifier keys alone
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

      let key = e.key;
      if (key === ' ') key = 'Space';
      if (key.length === 1) key = key.toUpperCase();

      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.metaKey) modifiers.push('Meta');

      const shortcut = [...modifiers, key].join('+');
      
      // Auto-save and exit recording mode
      onUpdateShortcut(recordingKey, shortcut);
      setRecordingKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recordingKey, onUpdateShortcut]);

  const handleStartRecord = (id) => {
    setRecordingKey(id);
  };

  const handleCancelRecord = () => {
    setRecordingKey(null);
  };

  const handleRemoveShortcut = (id) => {
    onUpdateShortcut(id, null);
  };

  const shortcutList = [
    { id: 'switchPage', label: 'Ganti Halaman', description: 'Pindah antar halaman (Home, Activity, Shortcuts, Config)' },
    { id: 'goHome', label: 'Ke Home', description: 'Langsung kembali ke halaman Home' },
    { id: 'openSettings', label: 'Buka Pengaturan', description: 'Langsung ke halaman Configuration' },
    { id: 'toggleGrid', label: 'Ubah Grid', description: 'Ganti tampilan antara 2 atau 3 kolom' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto custom-scroll">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Shortcuts</h1>
          <p className="text-xs text-neutral-500 mt-1">Atur shortcut keyboard untuk navigasi lebih cepat.</p>
        </div>
      </div>

      <div className="grid gap-3">
        {shortcutList.map((item) => {
          const isRecording = recordingKey === item.id;
          const currentShortcut = shortcuts[item.id];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl p-4 flex items-center justify-between transition-colors ${
                isRecording 
                  ? 'bg-emerald-500/10 border-emerald-500/50' 
                  : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80'
              }`}
            >
              <div>
                <h3 className={`text-sm font-semibold ${isRecording ? 'text-emerald-400' : 'text-neutral-200'}`}>
                  {item.label}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">{item.description}</p>
              </div>

              <div className="flex items-center gap-3">
                {isRecording ? (
                  <div className="flex items-center gap-2 animate-pulse">
                    <span className="text-emerald-400 font-mono text-xs font-bold">
                      Tekan tombol...
                    </span>
                    <button
                      onClick={handleCancelRecord}
                      className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:close" className="text-xs" />
                    </button>
                  </div>
                ) : currentShortcut ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-neutral-800 border border-emerald-500/50 rounded-md font-mono text-xs font-bold min-w-[60px] text-center shadow-sm">
                      {currentShortcut}
                    </span>
                    <button
                      onClick={() => handleRemoveShortcut(item.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-md text-neutral-500 hover:text-red-500 transition-colors group cursor-pointer"
                      title="Hapus shortcut"
                    >
                      <Icon icon="mdi:close" className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleStartRecord(item.id)}
                      className="p-1.5 hover:bg-amber-300/10 rounded-md text-neutral-500 hover:text-amber-300 transition-colors cursor-pointer"
                      title="Edit shortcut"
                    >
                      <Icon icon="mdi:pencil" className="text-sm" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartRecord(item.id)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-md border border-red-500/50 hover:border-red-400 text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Set Key
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
