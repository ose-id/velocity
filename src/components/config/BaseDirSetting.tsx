import React from 'react';
import { Icon } from '@iconify/react';
import { Button, BaseInput } from '@/components/ui';
import { useLanguage } from '@/contexts/LanguageContext';

export interface BaseDirSettingProps {
  baseDir: string;
  setBaseDir: (val: string) => void;
  onPickDirectory: () => void;
}

export default function BaseDirSetting({ baseDir, setBaseDir, onPickDirectory }: BaseDirSettingProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-start gap-3">
      <div className="mt-1.5">
        <Icon icon="mdi:folder-cog-outline" className="text-neutral-300 text-lg" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-100">{t('config_base_directory')}</h2>
            <p className="text-[11px] text-neutral-500">{t('config_base_directory_desc')}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <BaseInput
            value={baseDir}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBaseDir(e.target.value)}
            className="w-full font-mono"
            placeholder="C:\\Users\\you\\Downloads"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onPickDirectory}
              icon="mdi:folder-search-outline"
              className="bg-neutral-200 text-neutral-900 hover:bg-neutral-100"
            >
              {t('config_pick_folder')}
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-neutral-500">{t('config_if_empty')}</p>
      </div>
    </div>
  );
}
