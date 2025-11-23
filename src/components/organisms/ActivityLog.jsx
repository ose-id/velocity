import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import LogItem from '../molecules/LogItem';

export default function ActivityLog({ logs }) {
  const [sortDir, setSortDir] = useState('desc'); // 'desc' = newest first

  const sortedLogs = [...logs].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime();
    const tb = new Date(b.timestamp).getTime();
    if (sortDir === 'asc') return ta - tb;
    return tb - ta;
  });

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 flex flex-col">
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
              sortDir === 'desc'
                ? 'border-neutral-300 bg-neutral-200 text-neutral-900'
                : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800',
            ].join(' ')}
          >
            Newest
          </button>
          <button
            type="button"
            onClick={() => setSortDir('asc')}
            className={[
              'px-2 py-0.5 rounded-full border text-[11px] cursor-pointer',
              sortDir === 'asc'
                ? 'border-neutral-300 bg-neutral-200 text-neutral-900'
                : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800',
            ].join(' ')}
          >
            Oldest
          </button>
        </div>
      </div>
      <div className="flex-1 px-3 py-2">
        <div className="min-h-[250px] lg:h-full rounded-lg bg-neutral-950 border border-neutral-900 overflow-auto custom-scroll">
          {sortedLogs.length === 0 ? (
            <pre className="text-[11px] text-neutral-500 p-2 whitespace-pre-wrap font-mono">$ ready…</pre>
          ) : (
            <div className="text-[11px] font-mono">
              {sortedLogs.map((entry) => (
                <LogItem key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
