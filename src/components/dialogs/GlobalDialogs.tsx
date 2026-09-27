import React from 'react';
import CloneDialog from './CloneDialog';
import BatchCloneDialog from './BatchCloneDialog';
import { OnboardingModal } from '@/components/onboarding';
import { UpdatePopup } from '@/components/updater';
import { ProjectContextMenu } from '@/components/home';
import type {
  ConfigButton,
  ButtonColor,
  CloneOptions,
  BatchCloneOptions,
  UpdateStatus,
} from '@/types';

export interface GlobalDialogsProps {
  // Clone
  cloneDialog: {
    open: boolean;
    button: ConfigButton | null;
  };
  setCloneDialog: React.Dispatch<React.SetStateAction<{ open: boolean; button: ConfigButton | null }>> | ((state: { open: boolean; button: ConfigButton | null }) => void);
  performCloneViaGit: (button: ConfigButton, options: CloneOptions) => void;
  handleOpenRepoForZip: (options: CloneOptions) => void;

  // Batch
  batchDialog: {
    open: boolean;
    count: number;
  };
  setBatchDialog: React.Dispatch<React.SetStateAction<{ open: boolean; count: number }>> | ((state: { open: boolean; count: number }) => void);
  handleBatchConfirm: (options: BatchCloneOptions) => void;

  // Onboarding
  showOnboarding: boolean;
  handleOnboardingFinish: () => void;

  // Update
  updateStatus: UpdateStatus | null;
  handleDownloadUpdate: () => void;
  handleQuitAndInstall: () => void;

  // Color Menu
  colorMenu: {
    open: boolean;
    x: number;
    y: number;
    buttonId: number | string | null;
    targetType?: 'button' | 'github';
    repoUrl?: string | null;
  };
  handlePickColorFromMenu: (color: ButtonColor) => void;
  handleCloseColorMenu: () => void;

  // Data for Context Menu
  buttons?: ConfigButton[];
  githubColors?: Record<string, ButtonColor>;
  baseDir?: string;
}

export default function GlobalDialogs({
  // Clone
  cloneDialog,
  setCloneDialog,
  performCloneViaGit,
  handleOpenRepoForZip,

  // Batch
  batchDialog,
  setBatchDialog,
  handleBatchConfirm,

  // Onboarding
  showOnboarding,
  handleOnboardingFinish,

  // Update
  updateStatus,
  handleDownloadUpdate,
  handleQuitAndInstall,

  // Color Menu
  colorMenu,
  handlePickColorFromMenu,
  handleCloseColorMenu,

  // Data for Context Menu
  buttons,
  githubColors,
  baseDir,
}: GlobalDialogsProps) {
  const activeBtn = buttons?.find((b) => b.id === colorMenu.buttonId);

  return (
    <>
      {cloneDialog.open && (
        <CloneDialog
          open={cloneDialog.open}
          button={cloneDialog.button}
          baseDir={baseDir}
          onClose={() => setCloneDialog({ open: false, button: null })}
          onCloneGit={performCloneViaGit}
          onDownloadZip={handleOpenRepoForZip}
        />
      )}

      {batchDialog.open && (
        <BatchCloneDialog
          open={batchDialog.open}
          count={batchDialog.count}
          baseDir={baseDir}
          onClose={() => setBatchDialog({ open: false, count: 0 })}
          onConfirm={handleBatchConfirm}
        />
      )}

      {showOnboarding && <OnboardingModal open={true} onFinish={handleOnboardingFinish} />}

      <UpdatePopup
        updateStatus={updateStatus}
        onDownload={handleDownloadUpdate}
        onQuitAndInstall={handleQuitAndInstall}
        onClose={() => {}}
      />

      <ProjectContextMenu
        open={colorMenu.open}
        x={colorMenu.x}
        y={colorMenu.y}
        activeColor={
          (activeBtn?.color as ButtonColor) ||
          (colorMenu.buttonId && colorMenu.targetType === 'github'
            ? ((githubColors?.[colorMenu.buttonId] as ButtonColor) || 'neutral')
            : 'neutral')
        }
        repoUrl={colorMenu.repoUrl}
        onClose={handleCloseColorMenu}
        onPickColor={handlePickColorFromMenu}
      />
    </>
  );
}
