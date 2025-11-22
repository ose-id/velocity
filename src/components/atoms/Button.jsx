import React from 'react';
import { Icon } from '@iconify/react';

export default function Button({ children, onClick, icon, className, disabled, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {icon && <Icon icon={icon} className="text-sm" />}
      <span>{children}</span>
    </button>
  );
}
