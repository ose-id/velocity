import React from 'react';
import { Icon } from '@iconify/react';

export interface IconButtonProps {
  icon: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function IconButton({
  icon,
  onClick,
  className = '',
  title,
  type = 'button',
}: IconButtonProps) {
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
