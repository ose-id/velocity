import React from 'react';
import { Icon } from '@iconify/react';

export default function Pill({ icon, label, className }) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${className}`}>
      {icon && <Icon icon={icon} className="text-neutral-200 text-xs" />}
      <span className="text-[11px] text-neutral-50 font-mono truncate max-w-[150px]">{label}</span>
    </div>
  );
}
