# Architecture

## Boundaries and runtime models

Velocity is divided into three distinct process layers:

1. **Main Process (`electron/main.cjs`)**
   - Owns Node.js system calls, child process execution (`git`, `explorer`, code editors), network zip downloads, file system access, and native window frames.
   - Manages persistent configuration in Electron's `userData` path: `%APPDATA%/velocity/velocity-config.json` (Windows). Never write or read configs relative to `__dirname` or the application root in production.
   - Houses the `autoUpdater` lifecycle via `electron-updater` and GitHub releases provider.
   - Dispatches desktop events to the renderer via WebContents IPC channels (e.g., `update-status`, `github-device-code`).

2. **Preload Script (`electron/preload.cjs`)**
   - The secure bridge using `contextBridge.exposeInMainWorld('electronAPI', { ... })`.
   - `contextIsolation: true` and `nodeIntegration: false` must remain strictly enforced.
   - Exposes asynchronous `ipcRenderer.invoke` calls and bidirectional listener attachments (`ipcRenderer.on`).

3. **Renderer Process (`src/`)**
   - React 19 single-page application bundled with Vite.
   - Communicates exclusively with the operating system through `window.electronAPI`.
   - Never attempts direct Node.js `fs` or `child_process` imports.

## Directory structure (Feature-Based Architecture)

```
src/
├── components/
│   ├── ui/            # Base reusable UI primitives (Button, BaseInput, Pill, Tooltip, Toast)
│   ├── layout/        # Layout & chrome (TopBar, Sidebar, WindowControls, NavItem)
│   ├── home/          # Home repository launcher view (ProjectCard, ProjectGrid, ProjectContextMenu, BatchActionBar)
│   ├── dialogs/       # Modal dialogs & orchestration (CloneDialog, BatchCloneDialog, GlobalDialogs)
│   ├── config/        # Settings & configurations (ConfigSettings, ConfigTable, setting fields)
│   ├── activity/      # Process & clone logs (ActivityLog, LogItem, StatusCard)
│   ├── github/        # GitHub sync & auth (GitHubStatusIndicator)
│   ├── onboarding/    # First-launch modal (OnboardingModal)
│   ├── updater/       # Update check & release notifications (UpdatePopup)
│   ├── dev/           # Development interceptors (DevStartupInterceptor)
│   └── pages/         # Top-level view routes (HomePage, GitHubPage, ActivityPage, ShortcutsPage, ConfigPage)
├── contexts/          # React Contexts (LanguageContext for i18n, ToastContext for notifications)
├── hooks/             # Custom state & orchestration hooks (useAppConfig.ts, useGitOperations.ts, useShortcuts.ts, useUpdateSystem.ts)
├── locales/           # i18n translation JSON dictionaries (en.json, id.json)
├── types/             # TypeScript definitions for domain models and window.electronAPI contract
└── utils/             # Pure helper utilities (constants, helpers, projectIcons, statusCache)

test/                  # Dedicated test directory (Vitest setup, 1:1 mirroring of components/ and utils/)
├── components/
│   ├── ui/            # Tests for base UI components
│   ├── layout/        # Tests for layout components
│   ├── home/          # Tests for home components
│   ├── dialogs/       # Tests for dialog components
│   ├── config/        # Tests for configuration components
│   └── activity/      # Tests for activity components
└── utils/             # Tests for utility helpers
```

## State flow and persistence

- **Configuration Sync**: State is managed in `useAppConfig.ts`. On startup, it retrieves config via `window.electronAPI.getConfig()`. Any state change triggers a debounced auto-save via `window.electronAPI.saveConfig(...)`.
- **Git Operations State**: Managed in `useGitOperations.ts`. Handles single clone, batch clone queues, and zip downloads. Records logs through `appendLog` into `logs` state rendered in `ActivityPage`.
- **Shortcut Listener**: Managed in `useShortcuts.ts`. Listens to global `window` `keydown` events, matching against recorded keybindings while ignoring active input and textarea elements.

## Invariants

- The configuration schema must always be validated via `ensureConfigShape()` in `main.cjs` to guard against corrupted or incomplete JSON files.
- The frameless window title bar region (`TopBar`) must specify `WebkitAppRegion: 'drag'`, while interactive controls (window control buttons, language toggle) must specify `WebkitAppRegion: 'no-drag'`.
- All background images loaded via file path must use the `file://` protocol URI with normalized forward slashes.
