import React from 'react';
import ConfigTable from '../organisms/ConfigTable';
import ConfigSettings from '../organisms/ConfigSettings';

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
}) {
  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto custom-scroll">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Configuration</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Atur tombol clone, warna, base directory, editor, dan ukuran font UI. Semua perubahan akan otomatis disimpan.
          </p>
        </div>

        {configPath && (
          <div className="text-right">
            <div className="text-[11px] text-neutral-500">Config file</div>
            <div className="text-[11px] text-neutral-400 max-w-xs truncate font-mono">{configPath}</div>
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
      />
    </div>
  );
}
