import React from 'react';
import { Icon } from '@iconify/react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { EditorId } from '@/types';

const EDITOR_OPTIONS: Array<{ id: EditorId; label: string; icon: string }> = [
  { id: 'vscode', label: 'VS Code', icon: 'mdi:alpha-v-circle-outline' },
  { id: 'cursor', label: 'Cursor', icon: 'mdi:alpha-c-circle-outline' },
  { id: 'windsurf', label: 'Windsurf', icon: 'mdi:alpha-w-circle-outline' },
  { id: 'antigravity', label: 'Antigravity', icon: 'mdi:alpha-a-circle-outline' },
  { id: 'vim', label: 'Vim', icon: 'mdi:alpha-v-box-outline' },
  { id: 'visualstudio', label: 'Visual Studio', icon: 'mdi:microsoft-visual-studio' },
];

export interface EditorSettingProps {
  editor: EditorId | string;
  onChangeEditor: (id: EditorId) => void;
}

export default function EditorSetting({ editor, onChangeEditor }: EditorSettingProps) {
  const { t } = useLanguage();

  return (
    <div className="border-t border-neutral-900 pt-4 mt-2">
      <div className="flex items-start gap-3">
        <div className="mt-1.5">
          <Icon icon="mdi:application-brackets-outline" className="text-neutral-300 text-lg" />
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-sm font-semibold text-neutral-100">{t('config_default_editor')}</h2>
          <p className="text-[11px] text-neutral-500">{t('config_default_editor_desc')}</p>

          <div className="flex flex-wrap gap-2 mt-2">
            {EDITOR_OPTIONS.map((opt) => {
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
            {t('config_editor_path_note')} (<code className="font-mono">code</code>,{' '}
            <code className="font-mono">cursor</code>, <code className="font-mono">windsurf</code>,{' '}
            <code className="font-mono">antigravity</code>).
          </p>
        </div>
      </div>
    </div>
  );
}
