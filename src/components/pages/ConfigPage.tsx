import React from 'react';
import { motion } from 'framer-motion';
import { ConfigTable, ConfigSettings } from '@/components/config';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ConfigButton, EditorId, FontSize, UpdateStatus } from '@/types';

export interface ConfigPageProps {
  buttons: ConfigButton[];
  setButtons: React.Dispatch<React.SetStateAction<ConfigButton[]>> | ((buttons: ConfigButton[]) => void);
  baseDir: string;
  setBaseDir: (val: string) => void;
  editor: EditorId | string;
  onChangeEditor: (editor: EditorId) => void;
  fontSize: FontSize | string;
  onChangeFontSize: (fontSize: FontSize) => void;
  saving?: boolean;
  lastSavedLabel?: string;
  configPath?: string;
  onPickDirectory: () => void;
  onAddButton: () => void;
  onRemoveButton: (id: string | number) => void;
  backgroundImage?: string | null;
  onPickBackgroundImage: () => void;
  onRemoveBackgroundImage: () => void;
  bgSidebar?: boolean;
  setBgSidebar: (val: boolean) => void;
  bgOpacity: number;
  setBgOpacity: (val: number) => void;
  bgBlur: number;
  setBgBlur: (val: number) => void;
  updateStatus?: UpdateStatus;
  onCheckUpdate: () => void;
  onQuitAndInstall: () => void;
  onDownloadUpdate: () => void;
  onTestUpdatePopup: () => void;
}

export default function ConfigPage({
  buttons,
  setButtons,
  baseDir,
  setBaseDir,
  editor,
  onChangeEditor,
  fontSize,
  onChangeFontSize,
  saving,
  lastSavedLabel,
  configPath,
  onPickDirectory,
  onAddButton,
  onRemoveButton,
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
  onDownloadUpdate,
  onTestUpdatePopup,
}: ConfigPageProps) {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto custom-scroll">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-lg font-semibold text-neutral-100">{t('config_page_title')}</h1>
            <p className="text-xs text-neutral-500 mt-1">{t('config_page_desc')}</p>
          </div>

          {configPath && (
            <div className="text-right">
              <div className="text-[11px] text-neutral-500">{t('config_file')}</div>
              <div className="text-[11px] text-neutral-400 max-w-xs truncate font-mono">
                {configPath}
              </div>
            </div>
          )}
        </div>

        <ConfigTable
          buttons={buttons}
          setButtons={setButtons}
          onAddButton={onAddButton}
          onRemoveButton={onRemoveButton}
          saving={saving}
          lastSavedLabel={lastSavedLabel}
        />

        <ConfigSettings
          baseDir={baseDir}
          setBaseDir={setBaseDir}
          onPickDirectory={onPickDirectory}
          editor={editor}
          onChangeEditor={onChangeEditor}
          fontSize={fontSize}
          onChangeFontSize={onChangeFontSize}
          saving={saving}
          lastSavedLabel={lastSavedLabel}
          backgroundImage={backgroundImage}
          onPickBackgroundImage={onPickBackgroundImage}
          onRemoveBackgroundImage={onRemoveBackgroundImage}
          bgSidebar={bgSidebar}
          setBgSidebar={setBgSidebar}
          bgOpacity={bgOpacity}
          setBgOpacity={setBgOpacity}
          bgBlur={bgBlur}
          setBgBlur={setBgBlur}
          updateStatus={updateStatus}
          onCheckUpdate={onCheckUpdate}
          onQuitAndInstall={onQuitAndInstall}
          onDownloadUpdate={onDownloadUpdate}
          onTestUpdatePopup={onTestUpdatePopup}
        />
      </motion.div>
    </div>
  );
}
