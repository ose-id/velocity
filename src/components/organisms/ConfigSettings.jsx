import React from 'react';
import { Icon } from '@iconify/react';
import Button from '../atoms/Button';
import BaseInput from '../atoms/BaseInput';
import { useLanguage } from '@/contexts/LanguageContext';

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
  backgroundImage,
  onPickBackgroundImage,
  onRemoveBackgroundImage,
  bgSidebar,
  setBgSidebar,
  bgOpacity,
  setBgOpacity,
  bgBlur,
  setBgBlur,
  updateStatus,
  onCheckUpdate,
  onQuitAndInstall,
}) {
  const [appVersion, setAppVersion] = React.useState('');
  const { t } = useLanguage();

  React.useEffect(() => {
    async function fetchVersion() {
      if (window.electronAPI?.getAppVersion) {
        const ver = await window.electronAPI.getAppVersion();
        setAppVersion(ver);
      }
    }
    fetchVersion();
  }, []);

  const editorOptions = [
    { id: 'vscode', label: 'VS Code', icon: 'mdi:alpha-v-circle-outline' },
    { id: 'cursor', label: 'Cursor', icon: 'mdi:alpha-c-circle-outline' },
    { id: 'windsurf', label: 'Windsurf', icon: 'mdi:alpha-w-circle-outline' },
    { id: 'antigravity', label: 'Antigravity', icon: 'mdi:alpha-a-circle-outline' },
    { id: 'vim', label: 'Vim', icon: 'mdi:alpha-v-box-outline' },
    { id: 'visualstudio', label: 'Visual Studio', icon: 'mdi:microsoft-visual-studio' },
  ];

  const fontSizeOptions = [
    { id: 'default', label: t('config_font_default') },
    { id: 'medium', label: t('config_font_medium') },
    { id: 'large', label: t('config_font_large') },
  ];

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-4">
      {/* Base Directory */}
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
                {t('config_pick_folder')}
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500">
            {t('config_if_empty')}
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
            <h2 className="text-sm font-semibold text-neutral-100">{t('config_default_editor')}</h2>
            <p className="text-[11px] text-neutral-500">
              {t('config_default_editor_desc')}
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
              {t('config_editor_path_note')} (<code className="font-mono">code</code>,{' '}
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
            <h2 className="text-sm font-semibold text-neutral-100">{t('config_font_size')}</h2>
            <p className="text-[11px] text-neutral-500">
              {t('config_font_size_desc')}
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
      {/* Appearance */}
      <div className="border-t border-neutral-900 pt-4 mt-2">
        <div className="flex items-start gap-3">
          <div className="mt-1.5">
            <Icon icon="mdi:palette-outline" className="text-neutral-300 text-lg" />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-sm font-semibold text-neutral-100">{t('config_appearance')}</h2>
            <p className="text-[11px] text-neutral-500">
              {t('config_appearance_desc')}
            </p>

            {/* Background Image Redesign */}
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
                      <span className="text-xs font-medium text-neutral-300">{t('config_apply_sidebar')}</span>
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
                      <span className="text-xs font-mono text-neutral-400 w-8 text-right">{bgOpacity}%</span>
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
                      <span className="text-xs font-mono text-neutral-400 w-8 text-right">{bgBlur}px</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onPickBackgroundImage}
                  className="w-full h-24 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 hover:border-neutral-600 transition flex flex-col items-center justify-center gap-2 group cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-700 transition">
                    <Icon icon="mdi:image-plus" className="text-neutral-400 group-hover:text-neutral-200" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-neutral-300 group-hover:text-neutral-100">
                      {t('config_upload_wallpaper')}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      1920x1080px (JPG/PNG/WEBP)
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Update */}
      <div className="border-t border-neutral-900 pt-4 mt-2">
        <div className="flex items-start gap-3">
          <div className="mt-1.5">
            <Icon icon="mdi:update" className="text-neutral-300 text-lg" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">{t('config_update')}</h2>
                <p className="text-[11px] text-neutral-500">
                  {t('config_update_desc')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block">{t('config_current_version')}</span>
                <span className="text-xs font-mono text-neutral-300">v{appVersion || '...'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              {updateStatus?.status === 'downloaded' ? (
                <Button
                  onClick={onQuitAndInstall}
                  icon="mdi:restart"
                  className="bg-emerald-600 text-white hover:bg-emerald-500 border-none shadow-lg animate-pulse"
                >
                  {t('config_restart_install')} v{updateStatus?.info?.version}
                </Button>
              ) : (
                <Button
                  onClick={onCheckUpdate}
                  disabled={updateStatus?.status === 'checking' || updateStatus?.status === 'downloading' || updateStatus?.status === 'progress'}
                  icon={updateStatus?.status === 'checking' ? 'mdi:loading' : 'mdi:refresh'}
                  iconClassName={updateStatus?.status === 'checking' ? 'animate-spin' : ''}
                  className={`min-w-[180px] justify-center transition-all duration-300 border-none shadow-md
                    ${updateStatus?.status === 'idle' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-100' : ''}
                    ${updateStatus?.status === 'checking' ? 'bg-neutral-700 text-neutral-300 opacity-80 cursor-wait' : ''}
                    ${updateStatus?.status === 'available' ? 'bg-emerald-600 text-white hover:bg-emerald-500' : ''}
                    ${updateStatus?.status === 'progress' ? 'bg-blue-600 text-white' : ''}
                    ${updateStatus?.status === 'not-available' ? 'bg-blue-500 text-white hover:bg-blue-400' : ''}
                    ${updateStatus?.status === 'error' ? 'bg-red-500 text-white hover:bg-red-400' : ''}
                    ${updateStatus?.status === 'dev-mode' ? 'bg-amber-500 text-white hover:bg-amber-400' : ''}
                  `}
                >
                  {updateStatus?.status === 'idle' && t('config_check_update')}
                  {updateStatus?.status === 'checking' && (
                    <span className="flex items-center">
                      {t('config_checking')}
                      <span className="animate-pulse">.</span>
                      <span className="animate-pulse delay-75">.</span>
                      <span className="animate-pulse delay-150">.</span>
                    </span>
                  )}
                  {updateStatus?.status === 'available' && `${t('config_update_available')} (v${updateStatus?.info?.version})`}
                  {updateStatus?.status === 'progress' && `${t('config_downloading')} ${Math.round(updateStatus.progress?.percent || 0)}%`}
                  {updateStatus?.status === 'not-available' && t('config_up_to_date')}
                  {updateStatus?.status === 'error' && t('config_retry')}
                  {updateStatus?.status === 'dev-mode' && t('config_dev_mode')}
                </Button>
              )}

              {/* Error Message */}
              {updateStatus?.status === 'error' && (
                <span className="text-xs text-red-500">{updateStatus.error}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
