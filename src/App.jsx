import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

// === SSH URL helper ===
function toSshUrl(httpsUrl) {
  if (!httpsUrl) return httpsUrl;
  if (/\.zip($|\?)/i.test(httpsUrl)) return httpsUrl;

  try {
    const u = new URL(httpsUrl);
    if (u.hostname !== 'github.com') return httpsUrl;

    const parts = u.pathname.replace(/^\/+/, '').split('/');
    if (parts.length < 2) return httpsUrl;

    const [owner, repoRaw] = parts;
    const repo = repoRaw.endsWith('.git') ? repoRaw : `${repoRaw}.git`;

    return `git@github.com:${owner}/${repo}`;
  } catch {
    return httpsUrl;
  }
}

// === COLOR CONFIG ===
const BUTTON_COLOR_OPTIONS = [
  { id: 'neutral', label: 'Default', dotClass: 'bg-neutral-600' },
  { id: 'emerald', label: 'Emerald', dotClass: 'bg-emerald-500' },
  { id: 'sky', label: 'Sky', dotClass: 'bg-sky-500' },
  { id: 'blue', label: 'Blue', dotClass: 'bg-blue-500' },
  { id: 'red', label: 'Red', dotClass: 'bg-red-500' },
  { id: 'violet', label: 'Violet', dotClass: 'bg-violet-500' },
];

const BUTTON_COLOR_STYLES = {
  neutral: {
    card: 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80',
    pill: 'bg-neutral-800/70',
    iconBg: 'bg-neutral-800',
  },
  emerald: {
    card: 'border-emerald-900/60 bg-emerald-950/60 hover:bg-emerald-900/70',
    pill: 'bg-emerald-900/70',
    iconBg: 'bg-emerald-900',
  },
  sky: {
    card: 'border-sky-800/60 bg-sky-950/60 hover:bg-sky-900/70',
    pill: 'bg-sky-900/70',
    iconBg: 'bg-sky-900',
  },
  blue: {
    card: 'border-blue-800/60 bg-blue-950/60 hover:bg-blue-900/70',
    pill: 'bg-blue-900/70',
    iconBg: 'bg-blue-900',
  },
  red: {
    card: 'border-red-800/60 bg-red-950/60 hover:bg-red-900/70',
    pill: 'bg-red-900/70',
    iconBg: 'bg-red-900',
  },
  violet: {
    card: 'border-violet-800/60 bg-violet-950/60 hover:bg-violet-900/70',
    pill: 'bg-violet-900/70',
    iconBg: 'bg-violet-900',
  },
};

function getButtonColorStyles(colorId) {
  return BUTTON_COLOR_STYLES[colorId] || BUTTON_COLOR_STYLES.neutral;
}

// === TIMESTAMP FORMATTER ===
function formatTimestamp(ts) {
  try {
    const d = new Date(ts);
    const date = d.toLocaleDateString(undefined, {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
    const time = d.toLocaleTimeString(undefined, {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `${date} ${time}`;
  } catch {
    return ts;
  }
}

// === TOP BAR ===
function TopBar({ onWindowControl, windowState }) {
  return (
    <div className="flex items-center justify-between px-3 h-9 bg-neutral-900 border-b border-neutral-800 select-none" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="font-medium text-neutral-100">Clone Tools</span>
        <span className="text-neutral-500">Git repo launcher</span>
      </div>

      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
        <button type="button" onClick={() => onWindowControl('minimize')} className="inline-flex items-center justify-center w-10 h-9 hover:bg-neutral-800 cursor-pointer">
          <Icon icon="mdi:minus" className="text-neutral-400 text-lg" />
        </button>
        <button
          type="button"
          onClick={() => onWindowControl(windowState?.isMaximized ? 'unmaximize' : 'maximize')}
          className="inline-flex items-center justify-center w-10 h-9 hover:bg-neutral-800 cursor-pointer"
        >
          <Icon icon={windowState?.isMaximized ? 'mdi:window-restore' : 'mdi:window-maximize'} className="text-neutral-400 text-lg" />
        </button>
        <button type="button" onClick={() => onWindowControl('close')} className="inline-flex items-center justify-center w-10 h-9 hover:bg-red-600/90 cursor-pointer">
          <Icon icon="mdi:close" className="text-neutral-200 text-lg" />
        </button>
      </div>
    </div>
  );
}

// === SIDEBAR ===
function Sidebar({ activePage, setActivePage }) {
  const items = [
    { id: 'home', label: 'Home', icon: 'mdi:home-outline' },
    { id: 'activity', label: 'Activity', icon: 'mdi:clock-outline' },
    { id: 'config', label: 'Configuration', icon: 'mdi:cog-outline' },
  ];

  const year = new Date().getFullYear();

  const navItemClass = (isActive) =>
    [
      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition cursor-pointer',
      isActive ? 'bg-neutral-800 text-neutral-50' : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100',
    ].join(' ');

  return (
    <div className="h-full w-56 bg-neutral-950 border-r border-neutral-900 flex flex-col">
      <div className="px-4 py-4 border-b border-neutral-900">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-neutral-800 flex items-center justify-center">
            <Icon icon="mdi:source-branch" className="text-neutral-100 text-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-100">Clone Tools</span>
            <span className="text-[11px] text-neutral-500">Quick Git launcher</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => setActivePage(item.id)} className={navItemClass(activePage === item.id)}>
            <span className="flex items-center gap-2">
              <Icon icon={item.icon} className="text-base text-neutral-300" />
              {item.label}
            </span>
            {activePage === item.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-neutral-900 text-[11px] text-neutral-500">
        <div className="flex flex-col gap-0.5">
          <span>
            © {year}{' '}
            <a
              href="https://www.adydetra.my.id"
              onClick={(e) => {
                e.preventDefault();
                if (window.electronAPI?.openAdydetra) {
                  window.electronAPI.openAdydetra();
                }
              }}
              className="text-neutral-300 hover:text-neutral-100 hover:underline cursor-pointer"
            >
              adydetra
            </a>
          </span>
          <span className="text-[10px] text-neutral-600">MIT License</span>
        </div>
      </div>
    </div>
  );
}

// === HOME PAGE ===
// (sekarang HANYA project cards, tanpa Status & Log)
function HomePage({ buttons, baseDir, onClone, loading, activeButtonId, onOpenColorMenu, effectiveGrid, onToggleGrid }) {
  const gridClass = effectiveGrid === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto custom-scroll">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Home</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Total <span className="text-neutral-300 font-medium">{buttons.length}</span> repo. Pilih tombol untuk clone repo &amp; buka editor.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-[11px] text-neutral-500">Base directory</div>
            <div className="text-xs font-mono text-neutral-300 max-w-xs truncate">{baseDir || 'Not set (gunakan Configuration)'}</div>
          </div>
          
          {/* Grid Toggle Switch Tab */}
          <div className="flex items-center bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800/50">
            <button
              type="button"
              onClick={() => effectiveGrid !== 2 && onToggleGrid()}
              className={['flex items-center justify-center w-7 h-6 rounded-md transition-all', effectiveGrid === 2 ? 'bg-neutral-700 text-neutral-100 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'].join(' ')}
              title="2 Columns"
            >
              <Icon icon="mdi:view-grid-outline" className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => effectiveGrid !== 3 && onToggleGrid()}
              className={['flex items-center justify-center w-7 h-6 rounded-md transition-all', effectiveGrid === 3 ? 'bg-neutral-700 text-neutral-100 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'].join(' ')}
              title="3 Columns"
            >
              <Icon icon="mdi:view-grid" className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* PROJECT CARDS */}
      <div className={`grid ${gridClass} gap-3`}>
        {buttons.map((btn) => {
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
              key={btn.id}
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
                    <span className="text-[11px] text-neutral-200/80 font-mono truncate max-w-[180px]">{btn.repoUrl || '— no repo url —'}</span>
                  </div>
                </div>

                <Icon icon="mdi:arrow-right" className={['text-neutral-200/70 group-hover:text-neutral-50 text-lg mr-3', hasUrl ? 'animate-move-x' : ''].join(' ')} />
              </div>

              {/* Custom Tooltip for disabled state */}
              {!hasUrl && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                  <div className="text-[10px] text-neutral-200 whitespace-nowrap">Repo URL belum di-set</div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-neutral-800" />
                </div>
              )}

              <div className="relative z-10 mt-2 flex items-center justify-between w-full">
                <div className={['inline-flex items-center gap-1 rounded-full px-2 py-0.5', colorStyles.pill].join(' ')}>
                  <Icon icon="mdi:folder-outline" className="text-neutral-200 text-xs" />
                  <span className="text-[11px] text-neutral-50 font-mono truncate max-w-[150px]">{btn.folderName || 'auto-folder'}</span>
                </div>

                <div className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5">
                  <Icon icon={btn.useSsh ? 'mdi:lock-outline' : 'mdi:lock-open-variant-outline'} className="text-[10px] text-neutral-200" />
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
        })}
      </div>
    </div>
  );
}

// === ACTIVITY PAGE (Status + Log, dengan sort tanggal) ===
function ActivityPage({ lastResult, logs, onClearLogs }) {
  const [sortDir, setSortDir] = useState('desc'); // 'desc' = newest first

  const sortedLogs = [...logs].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime();
    const tb = new Date(b.timestamp).getTime();
    if (sortDir === 'asc') return ta - tb;
    return tb - ta;
  });

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto custom-scroll">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Activity</h1>
          <p className="text-xs text-neutral-500 mt-1">Lihat status terakhir dan riwayat log Clone Tools.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[300px]">
        {/* STATUS */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-950/60 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-900">
            <div className="inline-flex items-center gap-2">
              <Icon icon="mdi:console" className="text-neutral-300 text-sm" />
              <h3 className="text-xs font-semibold text-neutral-200">Status</h3>
            </div>
            <button
              type="button"
              onClick={onClearLogs}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] text-neutral-300 hover:bg-neutral-800 cursor-pointer"
            >
              <Icon icon="mdi:trash-can-outline" className="text-xs" />
              <span>Clear log</span>
            </button>
          </div>
          <div className="px-3 py-2 text-xs text-neutral-300">
            {lastResult ? (
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 bg-neutral-900">
                  <span
                    className={['inline-flex h-1.5 w-1.5 rounded-full', lastResult.status === 'success' ? 'bg-emerald-400' : lastResult.status === 'duplicate' ? 'bg-amber-400' : 'bg-red-400'].join(
                      ' '
                    )}
                  />
                  <span className="text-[11px] font-medium text-neutral-100">{lastResult.status === 'success' ? 'Success' : lastResult.status === 'duplicate' ? 'Already exists' : 'Error'}</span>
                </div>
                <div className="text-[11px] text-neutral-400">{lastResult.message}</div>
                {lastResult.path && <div className="text-[11px] text-neutral-500 font-mono">{lastResult.path}</div>}
              </div>
            ) : (
              <p className="text-[11px] text-neutral-500">Belum ada aktivitas. Coba clone satu repo dari tab Home.</p>
            )}
          </div>
        </section>

        {/* LOG */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-950/60 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-900">
            <div className="inline-flex items-center gap-2">
              <Icon icon="mdi:text-long" className="text-neutral-300 text-sm" />
              <h3 className="text-xs font-semibold text-neutral-200">Log</h3>
            </div>
            <div className="inline-flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="hidden sm:inline">Sort:</span>
              <button
                type="button"
                onClick={() => setSortDir('desc')}
                className={[
                  'px-2 py-0.5 rounded-full border text-[11px] cursor-pointer',
                  sortDir === 'desc' ? 'border-neutral-300 bg-neutral-200 text-neutral-900' : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800',
                ].join(' ')}
              >
                Newest
              </button>
              <button
                type="button"
                onClick={() => setSortDir('asc')}
                className={[
                  'px-2 py-0.5 rounded-full border text-[11px] cursor-pointer',
                  sortDir === 'asc' ? 'border-neutral-300 bg-neutral-200 text-neutral-900' : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800',
                ].join(' ')}
              >
                Oldest
              </button>
            </div>
          </div>
          <div className="flex-1 px-3 py-2">
            <div className="h-48 lg:h-full rounded-lg bg-neutral-950 border border-neutral-900 overflow-auto custom-scroll">
              {sortedLogs.length === 0 ? (
                <pre className="text-[11px] text-neutral-500 p-2 whitespace-pre-wrap font-mono">$ ready…</pre>
              ) : (
                <div className="text-[11px] font-mono">
                  {sortedLogs.map((entry) => (
                    <div key={entry.id} className="flex gap-2 px-2 py-1 border-b border-neutral-900 last:border-0">
                      <span className="text-neutral-500 min-w-[115px]">{formatTimestamp(entry.timestamp)}</span>
                      <span className="text-neutral-300 whitespace-pre-wrap flex-1">{entry.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// === CONFIG PAGE ===
function ConfigPage({
  buttons,
  setButtons,
  baseDir,
  setBaseDir,
  editor,
  onChangeEditor,
  fontSize,
  onChangeFontSize,
  saving,
  lastSavedLabel,
  configPath,
  onPickDirectory,
  onAddButton,
  onRemoveButton,
}) {
  // === PAGINATION STATE ===
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(buttons.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [buttons.length, totalPages, currentPage]);

  const pageStart = (currentPage - 1) * pageSize;
  const pageButtons = buttons.slice(pageStart, pageStart + pageSize);

  const handleButtonChange = (index, field, value) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index], [field]: value };
    setButtons(updated);
  };

  const editorOptions = [
    { id: 'vscode', label: 'VS Code', icon: 'mdi:alpha-v-circle-outline' },
    { id: 'cursor', label: 'Cursor', icon: 'mdi:alpha-c-circle-outline' },
    { id: 'windsurf', label: 'Windsurf', icon: 'mdi:alpha-w-circle-outline' },
    { id: 'antigravity', label: 'Antigravity', icon: 'mdi:alpha-a-circle-outline' },
  ];

  const fontSizeOptions = [
    { id: 'default', label: 'Default' },
    { id: 'medium', label: 'Medium (+1px)' },
    { id: 'large', label: 'Large (+2px)' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto custom-scroll">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Configuration</h1>
          <p className="text-xs text-neutral-500 mt-1">Atur tombol clone, warna, base directory, editor, dan ukuran font UI. Semua perubahan akan otomatis disimpan.</p>
        </div>

        {configPath && (
          <div className="text-right">
            <div className="text-[11px] text-neutral-500">Config file</div>
            <div className="text-[11px] text-neutral-400 max-w-xs truncate font-mono">{configPath}</div>
          </div>
        )}
      </div>

      {/* BUTTON CONFIG (dengan pagination) */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:gesture-tap-button" className="text-neutral-300 text-base" />
            <h2 className="text-sm font-semibold text-neutral-100">Buttons</h2>
          </div>
          <div className="flex items-center gap-3">
            {lastSavedLabel && <span className="text-[11px] text-neutral-500 hidden sm:inline">{saving ? 'Saving…' : lastSavedLabel}</span>}
            <button
              type="button"
              onClick={onAddButton}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-neutral-900 text-neutral-100 border border-neutral-700 hover:bg-neutral-800 cursor-pointer"
            >
              <Icon icon="mdi:plus" className="text-sm" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scroll">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] text-neutral-500">
                <th className="text-left py-2 pr-3 font-normal">ID</th>
                <th className="text-left py-2 pr-3 font-normal">Label</th>
                <th className="text-left py-2 pr-3 font-normal">Repo URL</th>
                <th className="text-left py-2 pr-3 font-normal">Folder Name</th>
                <th className="text-left py-2 pr-3 font-normal">Color</th>
                <th className="text-left py-2 pr-3 font-normal">SSH</th>
                <th className="text-left py-2 pr-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageButtons.map((btn, idx) => {
                const rowIndex = pageStart + idx;
                const currentColorId = btn.color || 'neutral';
                const colorMeta = BUTTON_COLOR_OPTIONS.find((c) => c.id === currentColorId) || BUTTON_COLOR_OPTIONS[0];

                return (
                  <tr key={btn.id} className="border-b border-neutral-900 last:border-0">
                    <td className="py-2 pr-3 text-neutral-400 font-mono">{btn.id}</td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={btn.label}
                        onChange={(e) => handleButtonChange(rowIndex, 'label', e.target.value)}
                        className="w-44 rounded-md bg-neutral-950 border border-neutral-800 px-2 py-1 text-[11px] text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        placeholder={`Button ${btn.id}`}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={btn.repoUrl}
                        onChange={(e) => handleButtonChange(rowIndex, 'repoUrl', e.target.value)}
                        className="w-64 rounded-md bg-neutral-950 border border-neutral-800 px-2 py-1 text-[11px] text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        placeholder="https://github.com/user/repo.git"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={btn.folderName}
                        onChange={(e) => handleButtonChange(rowIndex, 'folderName', e.target.value)}
                        className="w-40 rounded-md bg-neutral-950 border border-neutral-800 px-2 py-1 text-[11px] text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        placeholder="folder-name"
                      />
                    </td>

                    {/* COLOR */}
                    <td className="py-2 pr-3">
                      <div className="inline-flex items-center gap-1.5">
                        <span className={['inline-flex h-3 w-3 rounded-full', colorMeta.dotClass].join(' ')} />
                        <select
                          value={currentColorId}
                          onChange={(e) => handleButtonChange(rowIndex, 'color', e.target.value)}
                          className="rounded-md bg-neutral-950 border border-neutral-800 px-2 py-1 text-[11px] text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-500 cursor-pointer"
                        >
                          {BUTTON_COLOR_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* SSH */}
                    <td className="py-2 pr-3">
                      <input type="checkbox" checked={!!btn.useSsh} onChange={(e) => handleButtonChange(rowIndex, 'useSsh', e.target.checked)} className="h-3 w-3 accent-emerald-500 cursor-pointer" />
                    </td>

                    {/* ACTIONS */}
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => onRemoveButton(btn.id)}
                        className="inline-flex items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 text-[11px] text-red-300 hover:bg-red-900/40 hover:border-red-500 cursor-pointer"
                      >
                        <Icon icon="mdi:trash-can-outline" className="text-sm" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {buttons.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-[11px] text-neutral-500">
                    Belum ada button. Klik &quot;Add&quot; untuk membuat konfigurasi baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {buttons.length > pageSize && (
          <div className="flex items-center justify-between mt-3 text-[11px] text-neutral-500">
            <span>
              Showing{' '}
              <span className="text-neutral-200">
                {pageStart + 1}–{Math.min(pageStart + pageSize, buttons.length)}
              </span>{' '}
              of <span className="text-neutral-200">{buttons.length}</span>
            </span>
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={[
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 cursor-pointer',
                  currentPage === 1 ? 'border-neutral-800 text-neutral-600 cursor-not-allowed' : 'border-neutral-700 text-neutral-200 hover:bg-neutral-800',
                ].join(' ')}
              >
                <Icon icon="mdi:chevron-left" className="text-xs" />
                <span>Prev</span>
              </button>
              <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={[
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 cursor-pointer',
                  currentPage === totalPages ? 'border-neutral-800 text-neutral-600 cursor-not-allowed' : 'border-neutral-700 text-neutral-200 hover:bg-neutral-800',
                ].join(' ')}
              >
                <span>Next</span>
                <Icon icon="mdi:chevron-right" className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* BASE DIR + EDITOR + FONT SIZE + STARTUP */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-4">
        {/* Base Directory */}
        <div className="flex items-start gap-3">
          <div className="mt-1.5">
            <Icon icon="mdi:folder-cog-outline" className="text-neutral-300 text-lg" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">Base Directory</h2>
                <p className="text-[11px] text-neutral-500">Folder utama tempat semua repo akan di-clone.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={baseDir}
                onChange={(e) => setBaseDir(e.target.value)}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-500"
                placeholder="C:\\Users\\you\\Downloads"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onPickDirectory}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-200 text-neutral-900 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 cursor-pointer"
                >
                  <Icon icon="mdi:folder-search-outline" className="text-sm" />
                  <span>Pilih Folder…</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500">
              Jika dikosongkan, akan otomatis memakai folder <span className="font-mono">Downloads</span> di user profile.
            </p>
          </div>
        </div>

        {/* Editor selection */}
        <div className="border-t border-neutral-900 pt-4 mt-2">
          <div className="flex items-start gap-3">
            <div className="mt-1.5">
              <Icon icon="mdi:application-brackets-outline" className="text-neutral-300 text-lg" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-sm font-semibold text-neutral-100">Default Editor</h2>
              <p className="text-[11px] text-neutral-500">Pilih editor yang akan dipakai untuk membuka project setelah clone.</p>

              <div className="flex flex-wrap gap-2 mt-2">
                {editorOptions.map((opt) => {
                  const active = editor === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeEditor(opt.id)}
                      className={[
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer',
                        active ? 'bg-neutral-100 text-neutral-900 border-neutral-100' : 'bg-neutral-900/80 text-neutral-200 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-500',
                      ].join(' ')}
                    >
                      <Icon icon={opt.icon} className="text-sm" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-neutral-500">
                Pastikan editor aktif di PATH (<code className="font-mono">code</code>, <code className="font-mono">cursor</code>, <code className="font-mono">windsurf</code>, <code className="font-mono">antigravity</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Font Size selection */}
        <div className="border-t border-neutral-900 pt-4 mt-2">
          <div className="flex items-start gap-3">
            <div className="mt-1.5">
              <Icon icon="mdi:format-size" className="text-neutral-300 text-lg" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-sm font-semibold text-neutral-100">UI Font Size</h2>
              <p className="text-[11px] text-neutral-500">Atur ukuran font seluruh UI. Medium/large menaikkan ukuran teks kecil sekitar +1–2px.</p>

              <div className="flex flex-wrap gap-2 mt-2">
                {fontSizeOptions.map((opt) => {
                  const active = fontSize === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeFontSize(opt.id)}
                      className={[
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer',
                        active ? 'bg-neutral-100 text-neutral-900 border-neutral-100' : 'bg-neutral-900/80 text-neutral-200 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-500',
                      ].join(' ')}
                    >
                      <Icon icon={opt.id === 'default' ? 'mdi:alpha-d-circle-outline' : opt.id === 'medium' ? 'mdi:alpha-m-circle-outline' : 'mdi:alpha-l-circle-outline'} className="text-sm" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {lastSavedLabel && <p className="text-[11px] text-neutral-500">{saving ? 'Saving…' : lastSavedLabel}</p>}
            </div>
          </div>
        </div>


      </section>
    </div>
  );
}

// === ROOT APP ===
function App() {
  const [activePage, setActivePage] = useState('home');
  const [buttons, setButtons] = useState([]);
  const [baseDir, setBaseDir] = useState('');
  const [editor, setEditor] = useState('vscode');
  const [fontSize, setFontSize] = useState('default');
  const [preferredGrid, setPreferredGrid] = useState(3); // 2 or 3
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);
  const [activeButtonId, setActiveButtonId] = useState(null);
  const [logs, setLogs] = useState([]); // [{id, timestamp, message}]
  const [lastResult, setLastResult] = useState(null);
  const [windowState, setWindowState] = useState({ isMaximized: false });
  const [saving, setSaving] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState('');
  const [configPath, setConfigPath] = useState('');
  const [configInitialized, setConfigInitialized] = useState(false);
  const [cloneDialog, setCloneDialog] = useState({
    open: false,
    button: null,
  });
  const [colorMenu, setColorMenu] = useState({
    open: false,
    buttonId: null,
    x: 0,
    y: 0,
  });

  // INIT
  useEffect(() => {
    async function init() {
      try {
        if (!window.electronAPI) return;

        const state = await window.electronAPI.getWindowState?.();
        if (state) {
          setWindowState(state);
        }

        const cfg = await window.electronAPI.getConfig();
        if (cfg) {
          setButtons(cfg.buttons || []);
          setBaseDir(cfg.baseDir || '');
          setEditor(cfg.editor || 'vscode');
          setFontSize(cfg.fontSize || 'default');
          if (cfg.configPath) setConfigPath(cfg.configPath);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setConfigInitialized(true);
      }
    }

    init();
  }, []);

  // WINDOW RESIZE LISTENER
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // CALCULATE EFFECTIVE GRID
  // Jika window < 1024px (lg), paksa 2 col. Jika >= 1024, pakai preferredGrid.
  const effectiveGrid = windowWidth < 1024 ? 2 : preferredGrid;

  const handleToggleGrid = () => {
    // Toggle hanya mengubah preferredGrid
    setPreferredGrid((prev) => (prev === 3 ? 2 : 3));
  };

  // AUTO SAVE CONFIG
  useEffect(() => {
    if (!configInitialized) return;
    if (!window.electronAPI || !window.electronAPI.saveConfig) return;

    let cancelled = false;

    async function save() {
      try {
        setSaving(true);
        const saved = await window.electronAPI.saveConfig({
          baseDir,
          buttons,
          editor,
          fontSize,
        });
        if (!cancelled) {
          if (saved && saved.configPath) {
            setConfigPath(saved.configPath);
          }
          const time = new Date().toLocaleTimeString();
          setLastSavedLabel(`Saved at ${time}`);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setLastSavedLabel('Failed to save config');
        }
      } finally {
        if (!cancelled) setSaving(false);
      }
    }

    save();

    return () => {
      cancelled = true;
    };
  }, [baseDir, buttons, editor, fontSize, configInitialized]);

  const handleWindowControl = async (action) => {
    try {
      if (!window.electronAPI || !window.electronAPI.windowControls) return;
      await window.electronAPI.windowControls(action);
      if (action === 'maximize' || action === 'unmaximize') {
        const state = await window.electronAPI.getWindowState?.();
        if (state) setWindowState(state);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const appendLog = (text) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        message: text,
      },
    ]);
  };

  const handleOpenColorMenu = (btn, event) => {
    event.preventDefault();
    setColorMenu({
      open: true,
      buttonId: btn.id,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handlePickColorFromMenu = (colorId) => {
    if (!colorMenu.buttonId) return;

    setButtons((prev) => prev.map((b) => (b.id === colorMenu.buttonId ? { ...b, color: colorId } : b)));

    appendLog(`[INFO] Button ${colorMenu.buttonId} color set to ${colorId} via Home.`);

    setColorMenu({
      open: false,
      buttonId: null,
      x: 0,
      y: 0,
    });
  };

  const handleCloseColorMenu = () => {
    setColorMenu((prev) => ({
      ...prev,
      open: false,
      buttonId: null,
    }));
  };

  // Klik card → buka dialog pilihan clone
  const handleCloneClick = (btn) => {
    setCloneDialog({ open: true, button: btn });
  };

  const handleClearLogs = () => {
    setLogs([]);
    setLastResult(null);
  };

  const handleChangeEditor = (newEditor) => {
    setEditor(newEditor);
    appendLog(`[INFO] Editor changed to ${newEditor}.`);
  };



  const handleChangeFontSize = (mode) => {
    setFontSize(mode);
    appendLog(`[INFO] UI font size: ${mode}.`);
  };

  const handlePickDirectory = async () => {
    if (!window.electronAPI || !window.electronAPI.pickDirectory) return;
    try {
      const picked = await window.electronAPI.pickDirectory();
      if (picked) {
        setBaseDir(picked);
        appendLog(`[INFO] Base directory set to: ${picked}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddButton = () => {
    setButtons((prev) => {
      const nextIndex = prev.length;
      const baseCode = 'A'.charCodeAt(0);
      let newId = nextIndex < 26 ? String.fromCharCode(baseCode + nextIndex) : `B${nextIndex + 1}`;
      if (prev.some((b) => b.id === newId)) {
        newId = `B${Date.now().toString().slice(-3)}`;
      }
      return [
        ...prev,
        {
          id: newId,
          label: `Button ${newId}`,
          repoUrl: '',
          folderName: '',
          useSsh: false,
          color: 'neutral',
        },
      ];
    });
  };

  const handleRemoveButton = (id) => {
    setButtons((prev) => prev.filter((btn) => btn.id !== id));
  };

  // === ACTION: Clone via Git ===
  const performCloneViaGit = async (btn) => {
    if (!window.electronAPI || !window.electronAPI.cloneRepo) return;

    setCloneDialog({ open: false, button: null });

    if (!btn.repoUrl) {
      appendLog(`[WARN] Button ${btn.id} belum punya repo URL`);
      setLastResult({
        status: 'error',
        message: `Button ${btn.id} belum dikonfigurasi repo URL.`,
      });
      return;
    }

    const effectiveUrl = btn.useSsh ? toSshUrl(btn.repoUrl) : btn.repoUrl;

    setLoading(true);
    setActiveButtonId(btn.id);
    setLastResult(null);

    try {
      appendLog(`[INFO] Cloning ${effectiveUrl}${btn.useSsh ? ' (SSH)' : ''} -> ${btn.folderName || '[auto-folder]'}…`);

      const result = await window.electronAPI.cloneRepo({
        repoUrl: effectiveUrl,
        folderName: btn.folderName,
        baseDir: baseDir || null,
        editor,
      });

      if (result.status === 'duplicate') {
        appendLog(`[SKIP] Folder sudah ada: ${result.path}`);
      } else if (result.status === 'success') {
        appendLog(`[OK] Repo berhasil di-clone ke: ${result.path}`);
      } else {
        appendLog(`[ERROR] ${result.message || 'Gagal clone repo (git).'}`);
      }

      setLastResult(result);
    } catch (err) {
      console.error(err);
      appendLog(`[ERROR] ${err.message}`);
      setLastResult({
        status: 'error',
        message: err.message,
      });
    } finally {
      setLoading(false);
      setActiveButtonId(null);
    }
  };

  // === ACTION: Download ZIP ===
  const handleOpenRepoForZip = async () => {
    if (!cloneDialog.button) return;
    const btn = cloneDialog.button;
    setCloneDialog({ open: false, button: null });

    if (!btn.repoUrl) {
      appendLog(`[WARN] Button ${btn.id} belum punya repo URL`);
      setLastResult({
        status: 'error',
        message: `Button ${btn.id} belum dikonfigurasi repo URL.`,
      });
      return;
    }

    if (!window.electronAPI || !window.electronAPI.downloadZipRepo) {
      appendLog('[ERROR] downloadZipRepo API tidak tersedia.');
      setLastResult({
        status: 'error',
        message: 'IPC download-zip-repo tidak tersedia.',
      });
      return;
    }

    setLoading(true);
    setActiveButtonId(btn.id);
    setLastResult(null);

    try {
      appendLog(`[INFO] Downloading ZIP untuk ${btn.repoUrl} (method: ZIP)…`);

      const result = await window.electronAPI.downloadZipRepo({
        repoUrl: btn.repoUrl,
        folderName: btn.folderName,
        baseDir: baseDir || null,
        editor,
      });

      if (result.status === 'duplicate') {
        appendLog(`[SKIP] Folder sudah ada: ${result.path}`);
      } else if (result.status === 'success') {
        appendLog(`[OK] ZIP berhasil di-download & extract ke: ${result.path}`);
      } else {
        appendLog(`[ERROR] ${result.message || 'Gagal download & extract ZIP'}`);
      }

      setLastResult(result);
    } catch (err) {
      console.error(err);
      appendLog(`[ERROR] ${err.message}`);
      setLastResult({
        status: 'error',
        message: err.message,
      });
    } finally {
      setLoading(false);
      setActiveButtonId(null);
    }
  };

  const fontSizeClass = fontSize === 'medium' ? 'font-size-medium' : fontSize === 'large' ? 'font-size-large' : 'font-size-default';

  return (
    <div className={`h-screen w-screen bg-neutral-950 text-neutral-50 flex flex-col ${fontSizeClass}`}>
      <TopBar onWindowControl={handleWindowControl} windowState={windowState} />
      <div className="flex flex-1 min-h-0">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        {activePage === 'home' ? (
          <HomePage
            buttons={buttons}
            baseDir={baseDir}
            onClone={handleCloneClick}
            loading={loading}
            activeButtonId={activeButtonId}
            onOpenColorMenu={handleOpenColorMenu}
            effectiveGrid={effectiveGrid}
            onToggleGrid={handleToggleGrid}
          />
        ) : activePage === 'activity' ? (
          <ActivityPage lastResult={lastResult} logs={logs} onClearLogs={handleClearLogs} />
        ) : (
          <ConfigPage
            buttons={buttons}
            setButtons={setButtons}
            baseDir={baseDir}
            setBaseDir={setBaseDir}
            editor={editor}
            onChangeEditor={handleChangeEditor}
            fontSize={fontSize}
            onChangeFontSize={handleChangeFontSize}
            saving={saving}
            lastSavedLabel={lastSavedLabel}
            configPath={configPath}
            onPickDirectory={handlePickDirectory}
            onAddButton={handleAddButton}
            onRemoveButton={handleRemoveButton}
          />
        )}
      </div>

      {/* CLONE METHOD DIALOG */}
      {cloneDialog.open && cloneDialog.button && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="mdi:source-branch" className="text-neutral-200 text-base" />
              <h2 className="text-sm font-semibold text-neutral-100">Clone options</h2>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Pilih cara clone untuk <span className="font-medium text-neutral-100">{cloneDialog.button.label || `Button ${cloneDialog.button.id}`}</span>.
            </p>

            <div className="flex flex-col gap-2 mb-3">
              <button
                type="button"
                onClick={() => performCloneViaGit(cloneDialog.button)}
                className="inline-flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 hover:bg-neutral-800 cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon icon="mdi:terminal" className="text-neutral-200 text-sm" />
                  <span>Clone via Git</span>
                </span>
                <span className="text-[10px] text-neutral-500">Respect SSH setting</span>
              </button>

              <button
                type="button"
                onClick={handleOpenRepoForZip}
                className="inline-flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 hover:bg-neutral-800 cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon icon="mdi:zip-box-outline" className="text-neutral-200 text-sm" />
                  <span>Unduh ZIP</span>
                </span>
                <span className="text-[10px] text-neutral-500">Selalu pakai HTTPS</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCloneDialog({ open: false, button: null })}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 cursor-pointer"
              >
                <Icon icon="mdi:close" className="text-[13px] text-neutral-400" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK COLOR MENU (RIGHT CLICK) */}
      {colorMenu.open && (
        <div className="fixed inset-0 z-30" onClick={handleCloseColorMenu} onContextMenu={(e) => e.preventDefault()}>
          <div
            className="absolute z-40 rounded-lg border border-neutral-700 bg-neutral-950 shadow-xl p-2 min-w-40"
            style={{ top: colorMenu.y, left: colorMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="mdi:palette-outline" className="text-neutral-200 text-sm" />
              <span className="text-[11px] text-neutral-200 font-medium">Change button color</span>
            </div>
            <div className="flex flex-col gap-1">
              {BUTTON_COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePickColorFromMenu(opt.id)}
                  className="inline-flex items-center justify-between rounded-md px-2 py-1 text-[11px] text-neutral-100 hover:bg-neutral-800 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className={['inline-flex h-3 w-3 rounded-full', opt.dotClass].join(' ')} />
                    <span>{opt.label}</span>
                  </span>
                  {opt.id === buttons.find((b) => b.id === colorMenu.buttonId)?.color && <Icon icon="mdi:check" className="text-[13px] text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
