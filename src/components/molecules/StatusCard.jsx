import React from 'react';
import { Icon } from '@iconify/react';
import Button from '../atoms/Button';

export default function StatusCard({ lastResult, onClearLogs }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950/60 flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-900">
        <div className="inline-flex items-center gap-2">
          <Icon icon="mdi:console" className="text-neutral-300 text-sm" />
          <h3 className="text-xs font-semibold text-neutral-200">Status</h3>
        </div>
        <Button
          onClick={onClearLogs}
          icon="mdi:trash-can-outline"
          className="rounded-full border border-neutral-700 text-[11px] text-neutral-300 hover:bg-neutral-800 px-2 py-0.5"
        >
          Clear log
        </Button>
      </div>
      <div className="px-3 py-2 text-xs text-neutral-300">
        {lastResult ? (
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 bg-neutral-900">
              <span
                className={[
                  'inline-flex h-1.5 w-1.5 rounded-full',
                  lastResult.status === 'success'
                    ? 'bg-emerald-400'
                    : lastResult.status === 'duplicate'
                    ? 'bg-amber-400'
                    : 'bg-red-400',
                ].join(' ')}
              />
              <span className="text-[11px] font-medium text-neutral-100">
                {lastResult.status === 'success'
                  ? 'Success'
                  : lastResult.status === 'duplicate'
                  ? 'Already exists'
                  : 'Error'}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">{lastResult.message}</div>
            {lastResult.path && <div className="text-[11px] text-neutral-500 font-mono">{lastResult.path}</div>}
          </div>
        ) : (
          <p className="text-[11px] text-neutral-500">Belum ada aktivitas. Coba clone satu repo dari tab Home.</p>
        )}
      </div>
    </section>
  );
}
