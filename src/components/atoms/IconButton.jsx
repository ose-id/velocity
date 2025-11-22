import React from 'react';
import { Icon } from '@iconify/react';

export default function IconButton({ icon, onClick, className, title, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center cursor-pointer transition-colors ${className}`}
      title={title}
    >
      <Icon icon={icon} className="text-inherit text-lg" />
    </button>
  );
}
