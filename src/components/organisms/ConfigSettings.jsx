import React from 'react';
import { Icon } from '@iconify/react';
import Button from '../atoms/Button';
import BaseInput from '../atoms/BaseInput';

export default function ConfigSettings({
  baseDir,
  setBaseDir,
  onPickDirectory,
  editor,
  onChangeEditor,
  fontSize,
  onChangeFontSize,
  saving,
  lastSavedLabel,
}) {
  const editorOptions = [
    { id: 'vscode', label: 'VS Code', icon: 'mdi:alpha-v-circle-outline' },
    { id: 'cursor', label: 'Cursor', icon: 'mdi:alpha-c-circle-outline' },
    { id: 'windsurf', label: 'Windsurf', icon: 'mdi:alpha-w-circle-outline' },
    { id: 'antigravity', label: 'Antigravity', icon: 'mdi:alpha-a-circle-outline' },
  ];

  const fontSizeOptions = [
    { id: 'default', label: 'Default' },
    { id: 'medium', label: 'Medium (+1px)' },
    { id: 'large', label: 'Large (+2px)' },
  ];

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-4">
      {/* Base Directory */}
      <div className="flex items-start gap-3">
        <div className="mt-1.5">
          <Icon icon="mdi:folder-cog-outline" className="text-neutral-300 text-lg" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">Base Directory</h2>
              <p className="text-[11px] text-neutral-500">Folder utama tempat semua repo akan di-clone.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <BaseInput
              value={baseDir}
              onChange={(e) => setBaseDir(e.target.value)}
              className="w-full font-mono"
              placeholder="C:\\Users\\you\\Downloads"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={onPickDirectory}
                icon="mdi:folder-search-outline"
                className="bg-neutral-200 text-neutral-900 hover:bg-neutral-100"
              >
                Pilih Folder…
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500">
            Jika dikosongkan, akan otomatis memakai folder <span className="font-mono">Downloads</span> di user profile.
          </p>
        </div>
      </div>

      {/* Editor selection */}
      <div className="border-t border-neutral-900 pt-4 mt-2">
        <div className="flex items-start gap-3">
          <div className="mt-1.5">
            <Icon icon="mdi:application-brackets-outline" className="text-neutral-300 text-lg" />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-sm font-semibold text-neutral-100">Default Editor</h2>
            <p className="text-[11px] text-neutral-500">
              Pilih editor yang akan dipakai untuk membuka project setelah clone.
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {editorOptions.map((opt) => {
                const active = editor === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeEditor(opt.id)}
                    className={[
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer',
                      active
                        ? 'bg-neutral-100 text-neutral-900 border-neutral-100'
                        : 'bg-neutral-900/80 text-neutral-200 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-500',
                    ].join(' ')}
                  >
                    <Icon icon={opt.icon} className="text-sm" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-neutral-500">
              Pastikan editor aktif di PATH (<code className="font-mono">code</code>,{' '}
              <code className="font-mono">cursor</code>, <code className="font-mono">windsurf</code>,{' '}
              <code className="font-mono">antigravity</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Font Size selection */}
      <div className="border-t border-neutral-900 pt-4 mt-2">
        <div className="flex items-start gap-3">
          <div className="mt-1.5">
            <Icon icon="mdi:format-size" className="text-neutral-300 text-lg" />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-sm font-semibold text-neutral-100">UI Font Size</h2>
            <p className="text-[11px] text-neutral-500">
              Atur ukuran font seluruh UI. Medium/large menaikkan ukuran teks kecil sekitar +1–2px.
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {fontSizeOptions.map((opt) => {
                const active = fontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeFontSize(opt.id)}
                    className={[
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer',
                      active
                        ? 'bg-neutral-100 text-neutral-900 border-neutral-100'
                        : 'bg-neutral-900/80 text-neutral-200 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-500',
                    ].join(' ')}
                  >
                    <Icon
                      icon={
                        opt.id === 'default'
                          ? 'mdi:alpha-d-circle-outline'
                          : opt.id === 'medium'
                          ? 'mdi:alpha-m-circle-outline'
                          : 'mdi:alpha-l-circle-outline'
                      }
                      className="text-sm"
                    />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {lastSavedLabel && <p className="text-[11px] text-neutral-500">{saving ? 'Saving…' : lastSavedLabel}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
