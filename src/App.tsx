import React, { useState } from 'react';

// Hooks
import useAppConfig from './hooks/useAppConfig';
import useUpdateSystem from './hooks/useUpdateSystem';
import useGitOperations from './hooks/useGitOperations';
import useShortcuts from './hooks/useShortcuts';

// Layout & Dialogs
import { TopBar, Sidebar } from '@/components/layout';
import { GlobalDialogs } from '@/components/dialogs';

// Pages
import {
  HomePage,
  ActivityPage,
  ShortcutsPage,
  ConfigPage,
  GitHubPage,
} from '@/components/pages';
import type { PageId } from '@/types';

function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [focusSearchTrigger, setFocusSearchTrigger] = useState(0);

  // 1. App Config & State
  const config = useAppConfig();

  // 2. Git Operations
  const gitOps = useGitOperations({
    baseDir: config.baseDir,
    editor: config.editor,
    buttons: config.buttons,
    appendLog: config.appendLog,
  });

  // 3. Update System
  const updateSys = useUpdateSystem();

  // 4. Shortcuts
  const shortcutCtrl = useShortcuts({
    shortcuts: config.shortcuts,
    setShortcuts: config.setShortcuts,
    setActivePage,
    handleToggleGrid: config.handleToggleGrid,
    setFocusSearchTrigger,
    appendLog: config.appendLog,
  });

  // Render Page
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <HomePage
            buttons={config.buttons}
            baseDir={config.baseDir}
            effectiveGrid={config.effectiveGrid}
            loading={gitOps.loading}
            activeButtonId={gitOps.activeButtonId}
            onDragEnd={config.handleDragEnd}
            onClone={gitOps.handleCloneClick}
            onToggleGrid={config.handleToggleGrid}
            // Selection Mode
            isSelectionMode={gitOps.isSelectionMode}
            selectedIds={gitOps.selectedIds}
            onToggleSelectionMode={gitOps.handleToggleSelectionMode}
            onToggleSelection={gitOps.handleToggleSelection}
            onBatchClone={gitOps.handleBatchCloneClick}
            // Color Menu
            onOpenColorMenu={config.handleOpenColorMenu}
            focusSearchTrigger={focusSearchTrigger}
          />
        );
      case 'github':
        return (
          <GitHubPage
            baseDir={config.baseDir}
            editor={config.editor}
            onClone={gitOps.handleCloneClick}
            onBatchClone={gitOps.handleBatchCloneFromGithub}
            githubColors={config.githubColors}
            onOpenColorMenu={config.handleOpenColorMenu}
            token={config.githubToken}
            onTokenChange={config.setGithubToken}
            itemsPerPage={config.githubPerPage}
            onItemsPerPageChange={config.setGithubPerPage}
          />
        );
      case 'activity':
        return (
          <ActivityPage
            lastResult={gitOps.lastResult}
            logs={config.logs}
            onClearLogs={config.handleClearLogs}
          />
        );
      case 'shortcuts':
        return (
          <ShortcutsPage
            shortcuts={config.shortcuts}
            onUpdateShortcut={(k: string, v: string | null) =>
              config.setShortcuts((p) => ({ ...p, [k]: v || '' }))
            }
            recordingKey={shortcutCtrl.recordingKey}
            onStartRecord={shortcutCtrl.startRecording}
            onStopRecord={shortcutCtrl.stopRecording}
          />
        );
      case 'config':
        return (
          <ConfigPage
            // Button Props for Table
            buttons={config.buttons}
            setButtons={config.setButtons}
            onAddButton={config.handleAddButton}
            onRemoveButton={config.handleRemoveButton}

            baseDir={config.baseDir}
            setBaseDir={config.setBaseDir}
            configPath={config.configPath}
            onPickDirectory={config.handlePickDirectory}
            editor={config.editor}
            onChangeEditor={config.handleChangeEditor}
            fontSize={config.fontSize}
            onChangeFontSize={config.handleChangeFontSize}
            saving={config.saving}
            lastSavedLabel={config.lastSavedLabel}
            backgroundImage={config.backgroundImage}
            onPickBackgroundImage={config.handlePickBackgroundImage}
            onRemoveBackgroundImage={config.handleRemoveBackgroundImage}
            bgSidebar={config.bgSidebar}
            setBgSidebar={config.setBgSidebar}
            bgOpacity={config.bgOpacity}
            setBgOpacity={config.setBgOpacity}
            bgBlur={config.bgBlur}
            setBgBlur={config.setBgBlur}
            
            // Update Props
            updateStatus={updateSys.updateStatus}
            onCheckUpdate={updateSys.handleCheckUpdate}
            onDownloadUpdate={updateSys.handleDownloadUpdate}
            onQuitAndInstall={updateSys.handleQuitAndInstall}
            onTestUpdatePopup={updateSys.handleTestUpdatePopup}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen w-full bg-neutral-950 text-neutral-100 overflow-hidden font-sans selection:bg-blue-500/30">
        {/* Background Overlay */}
        {Boolean(config.backgroundImage) && (
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
              style={{
                backgroundImage: `url('file://${String(config.backgroundImage).replace(/\\/g, '/')}')`,
                opacity: (config.bgOpacity ?? 60) / 100,
                filter: `blur(${config.bgBlur ?? 4}px)`,
              }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* TopBar (Full Width) */}
        <div className="relative z-20">
          <TopBar
            windowState={config.windowState}
            onWindowControl={config.handleWindowControl}
          />
        </div>

        {/* Main Content Area (Sidebar + Page) */}
        <div className="flex-1 flex overflow-hidden z-10 relative">
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            transparent={Boolean(config.backgroundImage && config.bgSidebar)}
          />

          <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
            {renderPage()}
          </main>
        </div>
      </div>

      <GlobalDialogs
        // Dialog States
        cloneDialog={gitOps.cloneDialog}
        setCloneDialog={gitOps.setCloneDialog}
        batchDialog={gitOps.batchDialog}
        setBatchDialog={gitOps.setBatchDialog}
        
        // Actions
        performCloneViaGit={gitOps.performCloneViaGit}
        handleOpenRepoForZip={gitOps.handleOpenRepoForZip}
        handleBatchConfirm={gitOps.handleBatchConfirm}
        
        // Onboarding
        showOnboarding={config.showOnboarding}
        handleOnboardingFinish={config.handleOnboardingFinish}
        
        // Update
        updateStatus={updateSys.updateStatus}
        handleDownloadUpdate={updateSys.handleDownloadUpdate}
        handleQuitAndInstall={updateSys.handleQuitAndInstall}
        
        // Color Menu
        colorMenu={config.colorMenu}
        handlePickColorFromMenu={config.handlePickColorFromMenu}
        handleCloseColorMenu={config.handleCloseColorMenu}
        
        // Context Menu Data
        buttons={config.buttons}
        githubColors={config.githubColors}
        baseDir={config.baseDir}
      />
    </>
  );
}

export default App;
