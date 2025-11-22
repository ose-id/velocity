import React from 'react';
import { Icon } from '@iconify/react';

export default function NavItem({ id, label, icon, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
        isActive
          ? 'bg-neutral-800 text-neutral-50'
          : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100'
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon icon={icon} className="text-base text-neutral-300" />
        {label}
      </span>
      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
    </button>
  );
}
