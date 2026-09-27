# Git operations and execution flow

## Cloning methods

Velocity provides two primary methods to clone repositories into local workspaces:

### 1. Git CLI (`clone-repo` IPC)
- Invokes native `git clone <repoUrl> <targetPath>` using Node's `child_process.spawn`.
- Checks for destination directory collision before executing; if the target directory already exists, aborts with `status: 'duplicate'` and informs the user.
- **Options**:
  - `deleteGit` (boolean): When true, removes the `.git` folder immediately following successful clone via `fs.rmSync(gitFolderPath, { recursive: true, force: true })`. Useful for template/starter kits.
  - `skipOpenFolder` (boolean): Suppresses launching the native file explorer (used during batch operations).
  - `skipOpenEditor` (boolean): Suppresses launching the code editor (used during batch operations).

### 2. ZIP Archive Download (`download-zip-repo` IPC)
- Used as a fallback when Git CLI is not installed or when user prefers direct ZIP download.
- Automatically constructs GitHub zip archive URL if a raw GitHub repository URL is passed (`.../archive/refs/heads/main.zip`).
- Downloads binary stream via `fetch` to OS temporary directory (`os.tmpdir()`), then extracts using `extract-zip`.
- If extracted folder name differs from specified `folderName`, automatically renames the folder to match user intention.

## Batch clone and queue processing

Batch operations are orchestrated through `useGitOperations.js`:

1. **Selection**: User activates multi-selection mode on `HomePage` or selects multiple repositories on `GitHubPage`.
2. **Batch Dialog (`BatchCloneDialog.jsx`)**: User configures:
   - Mode: `individual` (clones directly into base directory) or `group` (creates a parent subfolder).
   - Group name (if mode is `group`).
   - Common options: `deleteGit`, `useSsh`, custom destination directory.
3. **Queue Execution**:
   - Items are processed sequentially in a `for...of` loop.
   - Active item is marked with a spinner (`activeButtonId`).
   - Each operation writes timestamped output to the activity log (`appendLog`).
   - When batch completes, opens the parent directory in file explorer once. If `group` mode was selected, also opens the parent folder in the default editor.

## Editor integration

When opening a cloned repository in an editor, Velocity spawns a detached child process with `stdio: 'ignore'` so the editor outlives the app:

| Editor ID | Executable | Description |
| :--- | :--- | :--- |
| `vscode` | `code` | Visual Studio Code |
| `cursor` | `cursor` | Cursor AI Editor |
| `windsurf` | `windsurf` | Codeium Windsurf |
| `antigravity` | `antigravity` | Google Antigravity IDE |
| `vim` | `vim` | Terminal Vim |
| `visualstudio` | `devenv` / Visual Studio | Microsoft Visual Studio |

Ensure the desired editor binary is in the system's `PATH`.
