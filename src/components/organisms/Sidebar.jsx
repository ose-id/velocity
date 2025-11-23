import React from 'react';
import { Icon } from '@iconify/react';
import NavItem from '../molecules/NavItem';

export default function Sidebar({ activePage, setActivePage, transparent }) {
  const items = [
    { id: 'home', label: 'Home', icon: 'mdi:home-outline' },
    { id: 'activity', label: 'Activity', icon: 'mdi:clock-outline' },
    { id: 'shortcuts', label: 'Shortcuts', icon: 'mdi:keyboard-outline' },
    { id: 'config', label: 'Configuration', icon: 'mdi:cog-outline' },
  ];

  const year = new Date().getFullYear();

  return (
    <div
      className={`h-full w-56 border-r border-neutral-900 flex flex-col ${
        transparent ? 'bg-transparent' : 'bg-neutral-950'
      }`}
    >
      <div className="px-4 py-4 border-b border-neutral-900">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-neutral-800 flex items-center justify-center">
            <Icon icon="mdi:source-branch" className="text-neutral-100 text-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-100">Clone Tools</span>
            <span className="text-[11px] text-neutral-500">Quick Git launcher</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {items.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activePage === item.id}
            onClick={setActivePage}
          />
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-neutral-900 text-[11px] text-neutral-500">
        <div className="flex flex-col gap-0.5">
          <span>
            © {year}{' '}
            <a
              href="https://www.adydetra.my.id"
              onClick={(e) => {
                e.preventDefault();
                if (window.electronAPI?.openAdydetra) {
                  window.electronAPI.openAdydetra();
                }
              }}
              className="text-neutral-300 hover:text-neutral-100 hover:underline cursor-pointer"
            >
              adydetra
            </a>
          </span>
          <span className="text-[10px] text-neutral-600">MIT License</span>
        </div>
      </div>
    </div>
  );
}
