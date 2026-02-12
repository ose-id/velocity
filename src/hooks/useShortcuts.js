import { useEffect, useCallback } from 'react';

export default function useShortcuts({
  shortcuts,
  setShortcuts,
  setActivePage,
  handleToggleGrid,
  setFocusSearchTrigger,
  appendLog
}) {
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
  }, [shortcuts, setActivePage, handleToggleGrid, setFocusSearchTrigger]);

  const handleUpdateShortcut = useCallback((key, value) => {
    setShortcuts((prev) => ({ ...prev, [key]: value }));
    appendLog(`[CONFIG] Shortcut '${key}' updated to '${value}'`);
  }, [setShortcuts, appendLog]);

  return { handleUpdateShortcut };
}
