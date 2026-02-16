import React from 'react';
import CloneDialog from './CloneDialog';
import BatchCloneDialog from './BatchCloneDialog';
import OnboardingModal from './OnboardingModal';
import UpdatePopup from '../molecules/UpdatePopup';
import ProjectContextMenu from '../molecules/ProjectContextMenu';

export default function GlobalDialogs({
  // Clone
  cloneDialog,
  setCloneDialog,
  performCloneViaGit,
  handleOpenRepoForZip,
  
  // Batch
  batchDialog,
  setBatchDialog,
  handleBatchConfirm, // mapped to handleBatchCloneFromGithub or similar
  
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
  baseDir
}) {
  const activeBtn = buttons?.find(b => b.id === colorMenu.buttonId);

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
          onConfirm={handleBatchConfirm} // Ensure this matches what BatchCloneDialog expects
        />
      )}

      {showOnboarding && <OnboardingModal open={true} onFinish={handleOnboardingFinish} />}

      <UpdatePopup
        updateStatus={updateStatus}
        onDownload={handleDownloadUpdate}
        onQuitAndInstall={handleQuitAndInstall}
        onClose={() => {}} // Optional if we want to handle close explicitly, but popup handles it internally via state/later
      />
      
      <ProjectContextMenu
        open={colorMenu.open}
        x={colorMenu.x}
        y={colorMenu.y}
        activeColor={activeBtn?.color || (colorMenu.targetType === 'github' ? (githubColors?.[colorMenu.buttonId] || 'neutral') : 'neutral')}
        repoUrl={colorMenu.repoUrl} // Use passed repoUrl
        onClose={handleCloseColorMenu}
        onPickColor={handlePickColorFromMenu}
      />
    </>
  );
}
