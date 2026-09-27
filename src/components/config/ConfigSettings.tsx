import React from 'react';
import BaseDirSetting from './BaseDirSetting';
import EditorSetting from './EditorSetting';
import FontSizeSetting from './FontSizeSetting';
import AppearanceSetting from './AppearanceSetting';
import UpdateSetting from './UpdateSetting';
import type { EditorId, FontSize, UpdateStatus } from '@/types';

export interface ConfigSettingsProps {
  baseDir: string;
  setBaseDir: (val: string) => void;
  onPickDirectory: () => void;
  editor: EditorId | string;
  onChangeEditor: (editor: EditorId) => void;
  fontSize: FontSize | string;
  onChangeFontSize: (fontSize: FontSize) => void;
  saving?: boolean;
  lastSavedLabel?: string;
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
  onDownloadUpdate,
  onTestUpdatePopup,
}: ConfigSettingsProps) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-4">
      <BaseDirSetting
        baseDir={baseDir}
        setBaseDir={setBaseDir}
        onPickDirectory={onPickDirectory}
      />

      <EditorSetting
        editor={editor}
        onChangeEditor={onChangeEditor}
      />

      <FontSizeSetting
        fontSize={fontSize}
        onChangeFontSize={onChangeFontSize}
        saving={saving}
        lastSavedLabel={lastSavedLabel}
      />

      <AppearanceSetting
        backgroundImage={backgroundImage}
        onPickBackgroundImage={onPickBackgroundImage}
        onRemoveBackgroundImage={onRemoveBackgroundImage}
        bgSidebar={bgSidebar}
        setBgSidebar={setBgSidebar}
        bgOpacity={bgOpacity}
        setBgOpacity={setBgOpacity}
        bgBlur={bgBlur}
        setBgBlur={setBgBlur}
      />

      <UpdateSetting
        updateStatus={updateStatus}
        onCheckUpdate={onCheckUpdate}
        onQuitAndInstall={onQuitAndInstall}
        onDownloadUpdate={onDownloadUpdate}
        onTestUpdatePopup={onTestUpdatePopup}
      />
    </section>
  );
}
