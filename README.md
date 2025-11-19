# **Clone Tools** 🧩

![Static Badge](https://img.shields.io/badge/license-MIT-brightgreen?label=LICENSE)

Clone Tools is a small personal desktop app to quickly clone Git repositories and open them in your favorite editor (VS Code, Cursor, or Windsurf) with a clean dashboard UI.

---

## Features

⚡ **One-click clone & open** – Clone a repo, open folder, and launch editor in a single click  
🗂 **Configurable buttons** – Edit labels, repo URLs, and folder names from the Configuration page  
📁 **Base directory control** – Default to `Downloads`, or point to any folder you like  
🧱 **Duplicate protection** – If a folder already exists, clone is skipped with a clear message  
💾 **Auto-save config** – All changes in Configuration are saved automatically  
🌙 **Neutral dark UI** – Simple dashboard layout with sidebar + status/log panels  

---

## Tech Stack

- [Vite](https://vitejs.dev) – Next Generation Frontend Tooling
- [React](https://react.dev) – UI library (JSX)
- [Electron](https://www.electronjs.org) – Desktop app shell
- [Tailwind CSS](https://tailwindcss.com) – Utility-first styling
- [Iconify](https://iconify.design) – Icon system
- [Bun](https://bun.sh) – Runtime & package manager

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
    "build:win": "bun run build:renderer && bunx electron-builder@24.6.3 --win"
  },
  "build": {
    "appId": "com.adydetra.clonetools",
    "productName": "Clone Tools",
    "files": [
      "dist/",
      "electron/",
      "config.json",
      "package.json"
    ],
    "directories": {
      "output": "release",
      "buildResources": "build"
    },
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

> Minimal explanation:
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

Kirim file `.exe` ini ke PC lain untuk meng-install Clone Tools seperti software Windows biasa.

---

## License

The code is licensed under the [MIT](LICENSE) license.
