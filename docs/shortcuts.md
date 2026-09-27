# Shortcuts

## Overview

Velocity provides a customizable keyboard shortcut management system orchestrated by `useShortcuts.js` and configured via `ShortcutsPage.jsx`.

## Default shortcuts

| Action ID | Action Name | Default Key | Description |
| :--- | :--- | :--- | :--- |
| `switchPage` | Switch Page | `Tab` | Cycles through all navigation tabs |
| `openHome` | Open Home | `1` | Navigates directly to Home |
| `openGitHub` | Open GitHub | `2` | Navigates directly to GitHub page |
| `openActivity` | Open Activity | `3` | Navigates directly to Activity log |
| `openShortcuts` | Open Shortcuts | `4` | Navigates directly to Shortcuts page |
| `openSettings` | Open Settings | `5` | Navigates directly to Configuration page |
| `toggleGrid` | Toggle Grid Columns | *(unassigned)* | Toggles between 2 and 3 columns on Home |
| `search` | Focus Search | *(unassigned)* | Focuses the search bar on Home |

## Key rules and behavior

- **Input Suppression**: Keystrokes are ignored when typing inside `INPUT` or `TEXTAREA` elements to prevent triggering actions during text input.
- **Recording Mode**:
  - When clicking "Set Key" or edit on `ShortcutsPage`, the listener enters recording mode (`recordingKey !== null`).
  - Supports modifier combinations: `Ctrl`, `Alt`, `Shift`, `Meta` plus regular keys (e.g., `Ctrl+Shift+K`).
  - Standalone modifier keys are ignored until a non-modifier key is pressed.
- **Conflict Prevention**: If a shortcut combination is already assigned to another action, recording is rejected and an error toast notification is displayed.
