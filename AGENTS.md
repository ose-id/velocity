# Agent guide

This is Velocity, a personal Git repository launcher and desktop manager built with Electron 43, React 19, Vite, and Tailwind CSS. Read only the document needed for the task:

- `docs/architecture.md`: process boundaries, state flow, directory ownership, and invariants.
- `docs/git-operations.md`: git clone, ZIP download fallback, batch clone queue, and editor launching.
- `docs/github.md`: GitHub OAuth Device Flow, personal access token (PAT), repo sync, and pagination.
- `docs/shortcuts.md`: global shortcut registry, recording mode, conflict detection, and default keymaps.
- `docs/testing.md`: test commands, Vitest setup, mocking Electron IPC, and acceptance criteria.
- `docs/release.md`: electron-builder setup, Windows multi-arch builds (x64, ia32, arm64), and auto-updater.
- `docs/status.md`: implemented scope, dependency snapshot, and architecture roadmap.

## Source map

- `electron/main.cjs`: Node.js main process, system execution, config persistence, auto-update.
- `electron/preload.cjs`: IPC context bridge exposing `window.electronAPI`.
- `src/components/ui/`: base UI primitives (Button, BaseInput, Pill, Tooltip, Toast).
- `src/components/layout/`: application layout (TopBar, Sidebar, WindowControls, NavItem).
- `src/components/home/`: home repository view (ProjectCard, ProjectGrid, ProjectContextMenu, BatchActionBar).
- `src/components/dialogs/`: modal dialogs (CloneDialog, BatchCloneDialog, GlobalDialogs).
- `src/components/config/`: configuration views (ConfigTable, ConfigSettings, setting fields).
- `src/components/activity/`: execution logs (ActivityLog, LogItem, StatusCard).
- `src/components/github/`: GitHub integration components (GitHubStatusIndicator).
- `src/components/onboarding/`: first-launch walkthrough (OnboardingModal).
- `src/components/updater/`: auto-update prompt (UpdatePopup).
- `src/components/dev/`: development startup interceptors (DevStartupInterceptor).
- `src/components/pages/`: top-level page views (HomePage, GitHubPage, ActivityPage, ShortcutsPage, ConfigPage).
- `src/contexts/`: language (i18n) and toast notification context providers.
- `src/hooks/`: app config auto-sync, git execution queue, shortcut listener, update system.
- `src/utils/`: url converters, icon mappings, constants, status cache.
- `src/types/`: TypeScript definitions for domain models and window.electronAPI contract.
- `test/`: Vitest global test suite mirroring `src/` structure 1:1 (`test/components/*`, `test/utils/*`).

## Non-negotiable rules

- Never import Node.js native modules (`fs`, `child_process`, `os`, `path`) directly in the `src/` renderer process. All system operations must go through `window.electronAPI` via `electron/preload.cjs`.
- Never store persistent configuration inside the application installation directory or relative to `__dirname`. Always use Electron's `app.getPath('userData')`.
- Always validate configuration objects through `ensureConfigShape()` before writing or after reading to avoid state crashes.
- Do not remove the frameless drag region on `TopBar` (`WebkitAppRegion: 'drag'`) or interactive controls (`WebkitAppRegion: 'no-drag'`).
- Preserve Feature-Based directory conventions in `src/components/`. Keep components modular and single-responsibility (< 150 lines).
- All tests must live in the dedicated `test/` directory, mirroring the `src/` component and utility folders 1:1.
- Keep tests fast and isolated. Always mock `window.electronAPI` in component and hook tests.

## Library and change workflow

Read `package.json` to verify dependency versions before changing framework or library usage. Follow the Feature-Based component pattern for all React UI modifications.

Run the test suite and typechecker before submitting changes:
```bash
bun run test:run
bun run typecheck
bun run lint
```
Update the relevant document in `docs/` whenever an architecture boundary, IPC contract, configuration schema, or build script is altered.
