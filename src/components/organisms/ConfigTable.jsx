import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { BUTTON_COLOR_OPTIONS, GROUP_PRESETS } from '../../utils/constants';
import Button from '../atoms/Button';
import IconButton from '../atoms/IconButton';
import BaseInput from '../atoms/BaseInput';

export default function ConfigTable({ buttons, setButtons, onAddButton, onRemoveButton, saving, lastSavedLabel }) {
  // === PAGINATION STATE ===
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(buttons.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [buttons.length, totalPages, currentPage]);

  const pageStart = (currentPage - 1) * pageSize;
  const pageButtons = buttons.slice(pageStart, pageStart + pageSize);

  const handleButtonChange = (index, field, value) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index], [field]: value };
    setButtons(updated);
  };

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:gesture-tap-button" className="text-neutral-300 text-base" />
          <h2 className="text-sm font-semibold text-neutral-100">Buttons</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastSavedLabel && (
            <span className="text-[11px] text-neutral-500 hidden sm:inline">{saving ? 'Saving…' : lastSavedLabel}</span>
          )}
          <Button onClick={onAddButton} icon="mdi:plus" className="bg-neutral-900 text-neutral-100 border border-neutral-700 hover:bg-neutral-800">
            Add
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scroll">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-800 text-[11px] text-neutral-500">
              <th className="text-left py-2 pr-3 font-normal">ID</th>
              <th className="text-left py-2 pr-3 font-normal">Label</th>
              <th className="text-left py-2 pr-3 font-normal">Group</th>
              <th className="text-left py-2 pr-3 font-normal">Repo URL</th>
              <th className="text-left py-2 pr-3 font-normal">Folder Name</th>
              <th className="text-left py-2 pr-3 font-normal">Color</th>
              <th className="text-left py-2 pr-3 font-normal">SSH</th>
              <th className="text-left py-2 pr-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageButtons.map((btn, idx) => {
              const rowIndex = pageStart + idx;
              const currentColorId = btn.color || 'neutral';
              const colorMeta = BUTTON_COLOR_OPTIONS.find((c) => c.id === currentColorId) || BUTTON_COLOR_OPTIONS[0];

              return (
                <tr key={btn.id} className="border-b border-neutral-900 last:border-0">
                  <td className="py-2 pr-3 text-neutral-400 font-mono">{btn.id}</td>
                  <td className="py-2 pr-3">
                    <BaseInput
                      value={btn.label}
                      onChange={(e) => handleButtonChange(rowIndex, 'label', e.target.value)}
                      className="w-44"
                      placeholder={`Button ${btn.id}`}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      value={btn.group || ''}
                      onChange={(e) => handleButtonChange(rowIndex, 'group', e.target.value)}
                      className="w-24 rounded-md bg-neutral-950 border border-neutral-800 px-2 py-1 text-[11px] text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-500 cursor-pointer"
                    >
                      <option value="">(None)</option>
                      {GROUP_PRESETS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <BaseInput
                      value={btn.repoUrl}
                      onChange={(e) => handleButtonChange(rowIndex, 'repoUrl', e.target.value)}
                      className="w-64 font-mono"
                      placeholder="https://github.com/user/repo.git"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <BaseInput
                      value={btn.folderName}
                      onChange={(e) => handleButtonChange(rowIndex, 'folderName', e.target.value)}
                      className="w-40 font-mono"
                      placeholder="folder-name"
                    />
                  </td>

                  {/* COLOR */}
                  <td className="py-2 pr-3">
                    <div className="inline-flex items-center gap-1.5">
                      <span className={['inline-flex h-3 w-3 rounded-full', colorMeta.dotClass].join(' ')} />
                      <select
                        value={currentColorId}
                        onChange={(e) => handleButtonChange(rowIndex, 'color', e.target.value)}
                        className="rounded-md bg-neutral-950 border border-neutral-800 px-2 py-1 text-[11px] text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-500 cursor-pointer"
                      >
                        {BUTTON_COLOR_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* SSH */}
                  <td className="py-2 pr-3">
                    <input
                      type="checkbox"
                      checked={!!btn.useSsh}
                      onChange={(e) => handleButtonChange(rowIndex, 'useSsh', e.target.checked)}
                      className="h-3 w-3 accent-emerald-500 cursor-pointer"
                    />
                  </td>

                  {/* ACTIONS */}
                  <td className="py-2 pr-3">
                    <IconButton
                      icon="mdi:trash-can-outline"
                      onClick={() => onRemoveButton(btn.id)}
                      className="w-7 h-7 rounded-md border border-neutral-800 bg-neutral-900 text-red-300 hover:bg-red-900/40 hover:border-red-500"
                    />
                  </td>
                </tr>
              );
            })}

            {buttons.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-center text-[11px] text-neutral-500">
                  Belum ada button. Klik &quot;Add&quot; untuk membuat konfigurasi baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {buttons.length > pageSize && (
        <div className="flex items-center justify-between mt-3 text-[11px] text-neutral-500">
          <span>
            Showing{' '}
            <span className="text-neutral-200">
              {pageStart + 1}–{Math.min(pageStart + pageSize, buttons.length)}
            </span>{' '}
            of <span className="text-neutral-200">{buttons.length}</span>
          </span>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={[
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 cursor-pointer',
                currentPage === 1
                  ? 'border-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'border-neutral-700 text-neutral-200 hover:bg-neutral-800',
              ].join(' ')}
            >
              <Icon icon="mdi:chevron-left" className="text-xs" />
              <span>Prev</span>
            </button>
            <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={[
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 cursor-pointer',
                currentPage === totalPages
                  ? 'border-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'border-neutral-700 text-neutral-200 hover:bg-neutral-800',
              ].join(' ')}
            >
              <span>Next</span>
              <Icon icon="mdi:chevron-right" className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
