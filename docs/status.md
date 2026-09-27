# Project status and scope

## Current release

- **Version**: 2.0.0
- **Runtime**: Electron 43.7.5, React 19.3.0, Vite 8.3.1, TypeScript 5.9.3, Node/Bun runtime
- **License**: MIT

## Implemented scope

- **Feature-Based Architecture**: Modular domain-driven frontend architecture replacing Atomic Design (`src/components/ui/`, `layout/`, `home/`, `dialogs/`, `config/`, `activity/`, `github/`, `onboarding/`, `updater/`, `dev/`, `pages/`).
- **Complete TypeScript Typing**: End-to-end type safety covering domain models, Electron IPC context bridge (`window.electronAPI`), settings schemas, and React component props.
- **Home Launcher**: Sortable cards with drag & drop (`@dnd-kit`), filter by group, column toggling (2 vs 3), right-click color customization, and selection mode for batch cloning.
- **GitHub Browser**: Full integration with GitHub via OAuth Device flow or Personal Access Tokens (PAT). Visibility filters, organization grouping, search, and pagination.
- **Git & ZIP Operations**: Multi-engine repository acquisition (Git CLI clone with optional `.git` cleanup, and ZIP archive download fallback).
- **Activity Logging**: Real-time tracking of clone operations, failures, and system events.
- **Config & Customization**: Customizable base directory, code editor presets (VS Code, Cursor, Windsurf, Antigravity, Vim, Visual Studio), custom background wallpaper with opacity/blur controls, font size selection, and i18n support (`en` and `id`).
- **Testing Infrastructure**: Automated unit and component test runner via Vitest mirroring `src/` 1:1 in dedicated `test/` directory.
- **Packaging & Updates**: Automated Windows builds for `x64`, `ia32`, and `arm64`, integrated with GitHub Releases auto-updating.

## Dependency snapshot

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `electron` | `^43.7.5` | Desktop runtime |
| `react` / `react-dom` | `^19.3.0` | UI view layer |
| `vite` | `^8.3.1` | Frontend bundler and dev server |
| `typescript` | `^5.9.3` | Static typing system |
| `tailwindcss` | `^4.3.3` | Utility styling system |
| `@dnd-kit/core` | `^6.3.1` | Drag & drop sorting |
| `framer-motion` | `^12.43.0` | Micro-animations and page transitions |
| `@octokit/rest` | `^22.0.1` | GitHub REST API client |
| `@octokit/auth-oauth-device` | `^8.0.5` | GitHub OAuth Device flow authentication |
| `electron-updater` | `^6.8.9` | Auto-update mechanism |
| `vitest` | `^5.0.2` | Test runner |
| `@testing-library/react` | `^16.3.3` | React component testing utilities |
| `jsdom` | `^30.1.1` | DOM emulation environment for tests |

## Roadmap considerations

- Cross-platform packaging support for macOS (DMG) and Linux (AppImage/deb).
- Additional Git host providers (GitLab, Bitbucket, Gitea).
- Repository branch switcher directly from the launcher dialog.
