import React from 'react';
import { formatTimestamp } from '../../utils/helpers';

export default function LogItem({ entry }) {
  return (
    <div className="flex gap-2 px-2 py-1 border-b border-neutral-900 last:border-0">
      <span className="text-neutral-500 min-w-[115px]">{formatTimestamp(entry.timestamp)}</span>
      <span className="text-neutral-300 whitespace-pre-wrap flex-1">{entry.message}</span>
    </div>
  );
}
