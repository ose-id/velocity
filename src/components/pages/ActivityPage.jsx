import React from 'react';
import StatusCard from '../molecules/StatusCard';
import ActivityLog from '../organisms/ActivityLog';

export default function ActivityPage({ lastResult, logs, onClearLogs }) {
  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto custom-scroll">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Activity</h1>
          <p className="text-xs text-neutral-500 mt-1">Lihat status terakhir dan riwayat log Clone Tools.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[300px]">
        <StatusCard lastResult={lastResult} onClearLogs={onClearLogs} />
        <ActivityLog logs={logs} />
      </div>
    </div>
  );
}
