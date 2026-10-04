# Release and packaging

## Packaging target

Velocity packages for Windows via **electron-builder** using the **NSIS** installer format.

Configured targets in `package.json`:
- **App ID**: `com.ose.velocity`
- **Output Directory**: `release/`
- **Artifact Pattern**: `${productName}.Setup.${version}.${arch}.${ext}`
- **Installer Mode**: One-Click installer (`oneClick: true`, `perMachine: false`, `allowElevation: false`) for silent per-user installation and seamless auto-restart on update.
- **Custom NSIS Script**: `build/installer.nsh`.

## Multi-architecture build

Build all supported Windows architectures using:

```bash
bun run build:win
```

This single command:
1. Cleans previous `.exe` and `.blockmap` files in `release/`.
2. Compiles the React renderer bundle via `vite build` into `dist/`.
3. Invokes `electron-builder` sequentially for:
   - `x64` (64-bit Intel/AMD)
   - `ia32` (32-bit Intel/AMD)
   - `arm64` (Windows on ARM)

Resulting installer outputs:
```text
release/Velocity.Setup.X.Y.Z.x64.exe
release/Velocity.Setup.X.Y.Z.ia32.exe
release/Velocity.Setup.X.Y.Z.arm64.exe
release/latest.yml
```

## Auto-update pipeline

- **Provider**: GitHub Releases (`owner: "ose-id"`, `repo: "velocity"`).
- **Service**: Managed in `electron/main.cjs` using `electron-updater`.
- **Seamless Restart**:
  - `oneClick: true` enables full silent background update.
  - When the user clicks "Restart & Install" (`quitAndInstall(true, true)`), the application shuts down cleanly via `setImmediate`, the new binary is installed silently without any setup wizard dialogs, and the updated app automatically relaunches.
- **Options**:
  - `autoUpdater.autoDownload = false`: Velocity displays a prompt before starting download.
  - `autoUpdater.autoInstallOnAppQuit = true`: Update installs automatically upon app quit or when triggered via "Restart & Install".
- **Development testing**: In development mode, updates can be simulated using the dev helper button on the Settings page or by placing a valid `dev-app-update.yml` at the project root.
