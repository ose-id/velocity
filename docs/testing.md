# Testing

## Required commands

Run relevant checks before opening a pull request or building a release:

```bash
# Run unit & component tests in watch mode
bun run test

# Run tests once (single pass)
bun run test:run

# Run TypeScript typechecker
bun run typecheck

# Lint codebase
bun run lint

# Build renderer bundle
bun run build:renderer
```

Use `bun install` or `bun install --frozen-lockfile` to keep dependencies consistent.

## Test runner and environment

Velocity uses **Vitest** configured in `vite.config.ts` with:
- **Environment**: `jsdom` for browser DOM API emulation.
- **Setup file**: `test/setup.ts` importing `@testing-library/jest-dom/vitest` for custom DOM matchers (e.g. `toBeInTheDocument()`, `toHaveClass()`) and automatic `cleanup()` after each test.
- **Path aliases**: `@/` maps directly to `./src/`, resolved automatically via Vite's configuration.

## Mocking Electron IPC

Because the renderer relies on `window.electronAPI` exposed by `electron/preload.cjs`, tests interacting with Electron APIs must stub `window.electronAPI`:

```javascript
import { vi, beforeEach } from 'vitest';

beforeEach(() => {
  window.electronAPI = {
    getConfig: vi.fn().mockResolvedValue({
      baseDir: 'C:/Users/Test/Downloads',
      buttons: [],
      editor: 'vscode',
      fontSize: 'default',
    }),
    saveConfig: vi.fn().mockResolvedValue({ status: 'success' }),
    cloneRepo: vi.fn().mockResolvedValue({ status: 'success', path: 'C:/Users/Test/Downloads/repo' }),
    downloadZipRepo: vi.fn().mockResolvedValue({ status: 'success', path: 'C:/Users/Test/Downloads/repo' }),
    pickDirectory: vi.fn().mockResolvedValue('C:/Users/Test/Downloads'),
    windowControls: vi.fn(),
    getWindowState: vi.fn().mockResolvedValue({ isMaximized: false }),
    getAppVersion: vi.fn().mockResolvedValue('1.9.0'),
    openFolder: vi.fn().mockResolvedValue(true),
    openInEditor: vi.fn().mockResolvedValue(true),
  };
});
```

## Testing conventions

1. **Utility Tests (`test/utils/*.test.ts`)**:
   - Cover edge cases: empty strings, null values, trailing slashes, malformed URLs, alias fallbacks.
   - Example: `helpers.test.ts` tests `toSshUrl` format conversion and timestamp formatting.
   - Example: `projectIcons.test.ts` tests icon resolution and project type inference.
2. **Component Tests (`test/components/<feature>/*.test.tsx`)**:
   - Strictly mirror `src/components/<feature>/` directory structure 1:1.
   - Focus on user interactions, rendered text, conditional classes, and accessibility attributes.
   - Avoid tests that merely snapshot JSX markup. Test behavioral contracts and user flows.
3. **Hook Tests (`test/hooks/*.test.ts`)**:
   - Test state updates, debounced actions, and cleanup routines using `renderHook` from `@testing-library/react`.

## Automated coverage

Current test suite covers:
- URL parser & SSH transformer (`test/utils/helpers.test.ts`).
- Project type icon mappings and alias resolution (`test/utils/projectIcons.test.ts`).
- Base UI primitives (`test/components/ui/Button.test.tsx`, `test/components/ui/Pill.test.tsx`).
- Window chrome and frameless controls (`test/components/layout/WindowControls.test.tsx`).
- Home project card & interaction modes (`test/components/home/ProjectCard.test.tsx`).
- Clone options modal dialog (`test/components/dialogs/CloneDialog.test.tsx`).
- Configuration editor & general settings (`test/components/config/ConfigSettings.test.tsx`).
- Activity execution log rendering (`test/components/activity/LogItem.test.tsx`).
