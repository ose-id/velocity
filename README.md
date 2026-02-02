# **Clone Tools** 🧩

![Static Badge](https://img.shields.io/badge/license-MIT-brightgreen?label=LICENSE)

Clone Tools is a small personal desktop app to quickly clone Git repositories and open them in your favorite editor (VS Code, Cursor, or Windsurf) with a clean dashboard UI.

---

## Getting Started

Required: [Bun](https://bun.sh) and [Git](https://git-scm.com)

Install dependencies:

```bash
bun install
```

Run development (Vite + Electron together):

```bash
bun run dev
```

This will:

- start Vite dev server (React frontend)
- start Electron and load `http://localhost:5173`

---

> [!NOTE]
> If you don’t want to use `bun`, delete `bun.lockb` and switch to another package manager:
>
> ```bash
> # npm install
> # yarn install
> # pnpm install
> ```

---

## Build Windows Installer (`setup.exe`)

This project can be packaged into a Windows installer using **electron-builder**.

### 1. Install electron-builder (dev dependency)

```bash
bun add -d electron-builder
```

### 2. Add scripts & build config in `package.json`

Example (adjust to match your existing scripts):

```jsonc
{
  "main": "electron/main.cjs",
  "scripts": {
    "dev": "concurrently \"vite\" \"bun run dev:electron\"",
    "dev:electron": "electron ./electron/main.cjs",
    "build:renderer": "vite build",
    "build:win": "bun run build:renderer && bunx electron-builder@24.6.3 --win",
  },
  "build": {
    "appId": "com.adydetra.clonetools",
    "productName": "Clone Tools",
    "files": ["dist/", "electron/", "config.json", "package.json"],
    "directories": {
      "output": "release",
      "buildResources": "build",
    },
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico",
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
    },
  },
}
```

> Minimal explanation:
>
> - `build:renderer` – builds the React frontend into `dist/` using Vite
> - `build:win` – runs Vite build, then runs electron-builder for Windows
> - `directories.output` – installer output folder (here: `release/`)
> - `win.icon` – path to your app icon (`.ico`), create this file yourself

### 3. Build the installer

```bash
bun run build:win
```

After it finishes, you’ll get something like:

```text
release/Clone Tools Setup X.Y.Z.exe
```

Send this `.exe` file to other PCs to install Clone Tools like standard Windows software.

---

## License

The code is licensed under the [MIT](LICENSE) license.
