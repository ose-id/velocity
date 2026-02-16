import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';

// Hooks
import useAppConfig from './hooks/useAppConfig';
import useUpdateSystem from './hooks/useUpdateSystem';
import useGitOperations from './hooks/useGitOperations';
import useShortcuts from './hooks/useShortcuts';

// Organisms
import TopBar from './components/organisms/TopBar';
import Sidebar from './components/organisms/Sidebar';
import GlobalDialogs from './components/organisms/GlobalDialogs';

// Pages
import HomePage from './components/pages/HomePage';
import ActivityPage from './components/pages/ActivityPage';
import ShortcutsPage from './components/pages/ShortcutsPage';
import ConfigPage from './components/pages/ConfigPage';
import GitHubPage from './components/pages/GitHubPage';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [focusSearchTrigger, setFocusSearchTrigger] = useState(0);

  // 1. App Config & State
  const config = useAppConfig();

  // 2. Git Operations
  const gitOps = useGitOperations({
    baseDir: config.baseDir,
    editor: config.editor,
    buttons: config.buttons,
    appendLog: config.appendLog
  });

  // 3. Update System
  const updateSys = useUpdateSystem();

  // 4. Shortcuts
  useShortcuts({
    shortcuts: config.shortcuts,
    setShortcuts: config.setShortcuts,
    setActivePage,
    handleToggleGrid: config.handleToggleGrid,
    setFocusSearchTrigger,
    appendLog: config.appendLog
  });

  // Render Page
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <HomePage
            buttons={config.buttons}
            baseDir={config.baseDir}
            editor={config.editor}
            effectiveGrid={config.effectiveGrid}
            onAddButton={config.handleAddButton}
            onRemoveButton={config.handleRemoveButton}
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
            activeButtonId={gitOps.activeButtonId}
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
            logs={config.logs}
            onClearLogs={config.handleClearLogs}
            lastSavedLabel={config.lastSavedLabel}
            saving={config.saving}
            configPath={config.configPath}
          />
        );
      case 'shortcuts':
        return (
          <ShortcutsPage
            shortcuts={config.shortcuts}
            onUpdateShortcut={(k, v) => config.setShortcuts(p => ({ ...p, [k]: v }))}
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
    <LanguageProvider>
      <div className="flex flex-col h-screen w-full bg-neutral-950 text-neutral-100 overflow-hidden font-sans selection:bg-blue-500/30">
        
        {/* Background Overlay */}
        {config.backgroundImage && (
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
              style={{
                backgroundImage: `url('file://${config.backgroundImage.replace(/\\/g, '/')}')`,
                opacity: config.bgOpacity / 100,
                filter: `blur(${config.bgBlur}px)`,
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
            activePage={activePage}
            loading={gitOps.loading}
            updateStatus={updateSys.updateStatus}
          />
        </div>

        {/* Main Content Area (Sidebar + Page) */}
        <div className="flex-1 flex overflow-hidden z-10 relative">
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            windowState={config.windowState}
            transparent={!!config.backgroundImage && config.bgSidebar}
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
    </LanguageProvider>
  );
}

export default App;
