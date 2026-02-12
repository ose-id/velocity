import React from 'react';
import CloneDialog from './CloneDialog';
import BatchCloneDialog from './BatchCloneDialog';
import OnboardingModal from './OnboardingModal';
import UpdatePopup from '../molecules/UpdatePopup';
import ColorMenu from '../molecules/ColorMenu';

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
}) {
  return (
    <>
      {cloneDialog.open && (
        <CloneDialog
          open={cloneDialog.open}
          button={cloneDialog.button}
          onClose={() => setCloneDialog({ open: false, button: null })}
          onCloneGit={performCloneViaGit}
          onDownloadZip={handleOpenRepoForZip}
        />
      )}

      {batchDialog.open && (
        <BatchCloneDialog
          open={batchDialog.open}
          count={batchDialog.count}
          onClose={() => setBatchDialog({ open: false, count: 0 })}
          onConfirm={handleBatchConfirm} // Ensure this matches what BatchCloneDialog expects
        />
      )}

      {showOnboarding && <OnboardingModal onFinish={handleOnboardingFinish} />}

      <UpdatePopup
        updateStatus={updateStatus}
        onDownload={handleDownloadUpdate}
        onQuitAndInstall={handleQuitAndInstall}
        onClose={() => {}} // Optional if we want to handle close explicitly, but popup handles it internally via state/later
      />
      
      <ColorMenu
        open={colorMenu.open}
        x={colorMenu.x}
        y={colorMenu.y}
        onClose={handleCloseColorMenu}
        onSelectColor={handlePickColorFromMenu}
      />
    </>
  );
}
