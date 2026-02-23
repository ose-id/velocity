import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function useShortcuts({
  shortcuts,
  setShortcuts,
  setActivePage,
  handleToggleGrid,
  setFocusSearchTrigger,
  appendLog
}) {
  const [recordingKey, setRecordingKey] = useState(null);
  const { addToast } = useToast();
  const { t } = useLanguage();



  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore if typing in input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.metaKey) modifiers.push('Meta');

      let key = e.key;
      if (key === ' ') key = 'Space';
      if (key.length === 1) key = key.toUpperCase();

      const pressed = [...modifiers, key].join('+');

      // RECORDING MODE
      if (recordingKey) {
        e.preventDefault();
        e.stopPropagation();

        // Ignore modifier keys alone
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

        // Validation
        const isDuplicate = Object.entries(shortcuts).some(([id, val]) => val === pressed && id !== recordingKey);
        
        if (isDuplicate) {
          addToast(t('shortcut_already_used', { key: pressed }), 'error');
          return;
        }

        setShortcuts((prev) => ({ ...prev, [recordingKey]: pressed }));
        appendLog(`[CONFIG] Shortcut '${recordingKey}' updated to '${pressed}'`);
        setRecordingKey(null);
        return;
      }

      // NORMAL MODE
      if (pressed === shortcuts.switchPage) {
        e.preventDefault();
        setActivePage((prev) => {
          const order = ['home', 'github', 'activity', 'shortcuts', 'config'];
          const idx = order.indexOf(prev);
          const nextIdx = (idx + 1) % order.length;
          return order[nextIdx];
        });
      } else if (pressed === shortcuts.openHome) {
        e.preventDefault();
        setActivePage('home');
      } else if (pressed === shortcuts.openGitHub) {
        e.preventDefault();
        setActivePage('github');
      } else if (pressed === shortcuts.openActivity) {
        e.preventDefault();
        setActivePage('activity');
      } else if (pressed === shortcuts.openShortcuts) {
        e.preventDefault();
        setActivePage('shortcuts');
      } else if (pressed === shortcuts.openSettings) {
        e.preventDefault();
        setActivePage('config');
      } else if (pressed === shortcuts.toggleGrid) {
        e.preventDefault();
        handleToggleGrid();
      } else if (pressed === shortcuts.search) {
        e.preventDefault();
        setActivePage('home');
        setFocusSearchTrigger(Date.now());
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [shortcuts, setActivePage, handleToggleGrid, setFocusSearchTrigger, recordingKey, setShortcuts, appendLog, addToast, t]);

  return { 
    recordingKey, 
    startRecording: setRecordingKey, 
    stopRecording: () => setRecordingKey(null)
  };
}
