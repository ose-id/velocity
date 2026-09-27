import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui';
import { useLanguage } from '@/contexts/LanguageContext';

export interface AppearanceSettingProps {
  backgroundImage?: string | null;
  onPickBackgroundImage: () => void;
  onRemoveBackgroundImage: () => void;
  bgSidebar?: boolean;
  setBgSidebar: (val: boolean) => void;
  bgOpacity: number;
  setBgOpacity: (val: number) => void;
  bgBlur: number;
  setBgBlur: (val: number) => void;
}

export default function AppearanceSetting({
  backgroundImage,
  onPickBackgroundImage,
  onRemoveBackgroundImage,
  bgSidebar,
  setBgSidebar,
  bgOpacity,
  setBgOpacity,
  bgBlur,
  setBgBlur,
}: AppearanceSettingProps) {
  const { t } = useLanguage();

  return (
    <div className="border-t border-neutral-900 pt-4 mt-2">
      <div className="flex items-start gap-3">
        <div className="mt-1.5">
          <Icon icon="mdi:palette-outline" className="text-neutral-300 text-lg" />
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-sm font-semibold text-neutral-100">{t('config_appearance')}</h2>
          <p className="text-[11px] text-neutral-500">{t('config_appearance_desc')}</p>

          <div className="w-full">
            {backgroundImage ? (
              <div className="space-y-4">
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-neutral-800 group">
                  <img
                    src={`file://${backgroundImage.replace(/\\/g, '/')}`}
                    alt="Background Preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <Button
                      onClick={onPickBackgroundImage}
                      icon="mdi:image-edit"
                      className="bg-neutral-100 text-neutral-900 hover:bg-white border-none shadow-lg"
                    >
                      {t('config_change')}
                    </Button>
                    <Button
                      onClick={onRemoveBackgroundImage}
                      icon="mdi:delete-outline"
                      className="bg-red-500/90 text-white hover:bg-red-500 border-none shadow-lg"
                    >
                      {t('config_remove')}
                    </Button>
                  </div>
                </div>

                {/* Advanced Controls */}
                <div className="flex items-center gap-6 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50">
                  {/* Sidebar Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={bgSidebar}
                        onChange={(e) => setBgSidebar(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="text-xs font-medium text-neutral-300">
                      {t('config_apply_sidebar')}
                    </span>
                  </label>

                  <div className="h-8 w-px bg-neutral-800" />

                  {/* Opacity Slider */}
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold w-12">
                      {t('config_opacity')}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="95"
                      value={bgOpacity}
                      onChange={(e) => setBgOpacity(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs font-mono text-neutral-400 w-8 text-right">
                      {bgOpacity}%
                    </span>
                  </div>

                  <div className="h-8 w-px bg-neutral-800" />

                  {/* Blur Slider */}
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold w-8">
                      {t('config_blur')}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={bgBlur}
                      onChange={(e) => setBgBlur(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs font-mono text-neutral-400 w-8 text-right">
                      {bgBlur}px
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onPickBackgroundImage}
                className="w-full h-24 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 hover:border-neutral-600 transition flex flex-col items-center justify-center gap-2 group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-700 transition">
                  <Icon
                    icon="mdi:image-plus"
                    className="text-neutral-400 group-hover:text-neutral-200"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-neutral-300 group-hover:text-neutral-100">
                    {t('config_upload_wallpaper')}
                  </span>
                  <span className="text-[10px] text-neutral-500">1920x1080px (JPG/PNG/WEBP)</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
