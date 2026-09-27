import React, { ReactNode } from 'react';
import { Icon } from '@iconify/react';

export interface ButtonProps {
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: string;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export default function Button({
  children,
  onClick,
  icon,
  className = '',
  iconClassName = '',
  disabled = false,
  type = 'button',
  title,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {icon && <Icon icon={icon} className={`text-sm ${iconClassName || ''}`} />}
      {children && <span>{children}</span>}
    </button>
  );
}
