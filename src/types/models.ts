export type ButtonColorId = 'neutral' | 'emerald' | 'sky' | 'blue' | 'red' | 'violet';
export type ButtonColor = ButtonColorId;

export type EditorId = 'vscode' | 'cursor' | 'windsurf' | 'antigravity' | 'antigravity-ide' | 'vim' | 'visualstudio';

export type FontSize = 'default' | 'medium' | 'large';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export type PageId = 'home' | 'github' | 'activity' | 'shortcuts' | 'config';

export interface RepoButton {
  id: number | string;
  label?: string;
  repoUrl?: string;
  folderName?: string;
  useSsh?: boolean;
  color?: ButtonColorId;
  group?: string;
  isGithub?: boolean;
  html_url?: string;
}

export type ConfigButton = RepoButton;

export interface ShortcutMap {
  switchPage: string;
  openHome: string;
  openGitHub: string;
  openActivity: string;
  openShortcuts: string;
  openSettings: string;
  toggleGrid?: string;
  search?: string;
}

export type ShortcutsConfig = ShortcutMap;

export interface AppConfig {
  baseDir: string;
  editor: EditorId;
  fontSize: FontSize;
  buttons: RepoButton[];
  shortcuts: ShortcutMap;
  backgroundImage?: string | null;
  bgSidebar?: boolean;
  bgOpacity?: number;
  bgBlur?: number;
  githubColors?: Record<string, ButtonColorId>;
  githubToken?: string;
  githubPerPage?: number;
  onboardingShown?: boolean;
  configPath?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}

export interface CloneOptions {
  deleteGit?: boolean;
  useSsh?: boolean;
  customName?: string;
  baseDir?: string;
  skipOpenFolder?: boolean;
  skipOpenEditor?: boolean;
}

export interface CloneResult {
  status: 'success' | 'duplicate' | 'error';
  message?: string;
  path?: string;
  zipUrl?: string;
}

export type LogResult = CloneResult;

export interface BatchCloneOptions {
  mode: 'separate' | 'group';
  groupName?: string;
  baseDir?: string;
  deleteGit?: boolean;
  useSsh?: boolean;
}

export interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string | Array<{ version: string; note: string }>;
}

export interface UpdateStatus {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'progress' | 'downloaded' | 'error' | 'dev-mode';
  info?: UpdateInfo;
  progress?: { percent: number; bytesPerSecond?: number; total?: number; transferred?: number };
  error?: string;
}

export interface GithubDeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}
