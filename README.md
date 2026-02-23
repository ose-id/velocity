# **Velocity** 🧩

![Static Badge](https://img.shields.io/badge/license-MIT-brightgreen?label=LICENSE)

Velocity is a small personal desktop app to quickly clone Git repositories and open them in your favorite editor (VS Code, Cursor, or Windsurf) with a clean dashboard UI.

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
    "dev:vite": "vite",
    "dev:electron": "electron ./electron/main.cjs",
    "build:renderer": "vite build",
    "clean:release": "node -e \"const fs=require('fs'),path=require('path');if(fs.existsSync('release'))fs.readdirSync('release').filter(f=>f.endsWith('.exe')||f.endsWith('.blockmap')).forEach(f=>fs.unlinkSync(path.join('release',f)))\"",
    "build:win": "bun run clean:release && bun run build:renderer && bunx electron-builder@24.6.3 --win --x64 && bunx electron-builder@24.6.3 --win --ia32 && bunx electron-builder@24.6.3 --win --arm64",
    "lint": "eslint .",
    "preview": "vite preview",
  },
  "build": {
    "appId": "com.ose.velocity",
    "target": "nsis",
    "artifactName": "${productName}.Setup.${version}.${arch}.${ext}",
    "productName": "Velocity",
    "files": ["dist/", "electron/", "build/icon.ico", "config.json", "package.json"],
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
      "installerIcon": "icon.ico",
      "uninstallerIcon": "icon.ico",
      "installerHeader": "installerHeader.bmp",
      "installerSidebar": "installerSidebar.bmp",
      "uninstallerSidebar": "uninstallerSidebar.bmp",
      "uninstallDisplayName": "Velocity",
      "deleteAppDataOnUninstall": true,
      "include": "build/installer.nsh",
    },
    "publish": {
      "provider": "github",
      "owner": "ose-id",
      "repo": "velocity",
    },
  },
}
```

> Minimal explanation:
>
> - `build:renderer` – builds the React frontend into `dist/` using Vite
> - `build:win` – runs the cleanup script, then Vite build, then electron-builder 3 times for x64, ia32, and arm64.
> - `directories.output` – installer output folder (here: `release/`)
> - `win.icon` – path to your app icon (`.ico`), create this file yourself

### 3. Build the installer

```bash
bun run build:win
```

After it finishes, you’ll get 3 separate installers based on architecture:

```text
release/Velocity.Setup.X.Y.Z.x64.exe
release/Velocity.Setup.X.Y.Z.ia32.exe
release/Velocity.Setup.X.Y.Z.arm64.exe
```

Send these `.exe` files to other PCs along with `latest.yml` to install Velocity and support Auto-Update across all architectures!

---

## License

The code is licensed under the [MIT](LICENSE) license.
