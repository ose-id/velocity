import React from 'react';
import { Icon } from '@iconify/react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { FontSize } from '@/types';

export interface FontSizeSettingProps {
  fontSize: FontSize | string;
  onChangeFontSize: (size: FontSize) => void;
  saving?: boolean;
  lastSavedLabel?: string;
}

export default function FontSizeSetting({
  fontSize,
  onChangeFontSize,
  saving,
  lastSavedLabel,
}: FontSizeSettingProps) {
  const { t } = useLanguage();

  const fontSizeOptions: Array<{ id: FontSize; label: string; icon: string }> = [
    { id: 'default', label: t('config_font_default'), icon: 'mdi:alpha-d-circle-outline' },
    { id: 'medium', label: t('config_font_medium'), icon: 'mdi:alpha-m-circle-outline' },
    { id: 'large', label: t('config_font_large'), icon: 'mdi:alpha-l-circle-outline' },
  ];

  return (
    <div className="border-t border-neutral-900 pt-4 mt-2">
      <div className="flex items-start gap-3">
        <div className="mt-1.5">
          <Icon icon="mdi:format-size" className="text-neutral-300 text-lg" />
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-sm font-semibold text-neutral-100">{t('config_font_size')}</h2>
          <p className="text-[11px] text-neutral-500">{t('config_font_size_desc')}</p>

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
                  <Icon icon={opt.icon} className="text-sm" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {lastSavedLabel && (
            <p className="text-[11px] text-neutral-500">{saving ? 'Saving…' : lastSavedLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}
