import type {
  AppConfig,
  CloneOptions,
  CloneResult,
  UpdateStatus,
  UpdateInfo,
  GithubDeviceCode
} from './models';

export interface ElectronAPI {
  // Git & Repos
  cloneRepo(config: {
    repoUrl: string;
    folderName?: string | null;
    baseDir?: string | null;
    editor?: string;
    options?: CloneOptions;
  }): Promise<CloneResult>;

  downloadZipRepo(config: {
    repoUrl: string;
    folderName?: string | null;
    baseDir?: string | null;
    editor?: string;
    options?: CloneOptions;
  }): Promise<CloneResult>;

  openFolder(config: { path: string }): Promise<boolean>;
  openInEditor(config: { path: string; editor?: string }): Promise<boolean>;
  openRepoUrl(url: string): Promise<{ ok: boolean; message?: string }>;
  openExternal(url: string, browser?: string): Promise<{ ok: boolean; message?: string }>;
  openOSE(): Promise<{ ok: boolean; method?: string }>;

  // Config & System
  getConfig(): Promise<AppConfig & { configPath: string }>;
  saveConfig(config: Partial<AppConfig>): Promise<AppConfig & { configPath: string }>;
  pickDirectory(): Promise<string | null>;
  pickImage(): Promise<string | null>;
  checkRequirements(): Promise<{ git: boolean; node: boolean; code: boolean }>;
  checkPathExists(path: string): Promise<boolean>;
  detectProjectType(path: string): Promise<string>;
  showMessageBox(options: {
    type?: 'none' | 'info' | 'error' | 'question' | 'warning';
    buttons?: string[];
    title?: string;
    message: string;
    detail?: string;
  }): Promise<{ response: number; checkboxChecked?: boolean }>;

  // Window Controls
  windowControls(action: 'minimize' | 'maximize' | 'unmaximize' | 'close'): Promise<void>;
  getWindowState(): Promise<{ isMaximized: boolean }>;
  getAppVersion(): Promise<string>;
  openDevTools(): Promise<void>;

  // Auto Updates
  checkForUpdates(): Promise<{ status: string; updateInfo?: UpdateInfo; error?: string }>;
  downloadUpdate(): Promise<{ status: string; error?: string }>;
  quitAndInstall(): Promise<void>;
  onUpdateStatus(callback: (status: UpdateStatus) => void): void;
  removeUpdateStatusListener(): void;

  // GitHub Auth Device Flow
  startGithubAuth(clientId: string, scopes?: string[]): Promise<{ status: 'success' | 'error'; token?: string; message?: string }>;
  onGithubDeviceCode(callback: (verification: GithubDeviceCode) => void): void;
  removeGithubDeviceCodeListener(): void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
