# GitHub integration

## Authentication modes

Velocity supports two methods to connect to GitHub via `GitHubPage`:

### 1. OAuth Device Flow (Recommended)
- Initiated through `window.electronAPI.startGithubAuth(clientId, scopes)`.
- Uses `@octokit/auth-oauth-device` in `electron/main.cjs`.
- The user is provided an 8-character verification code and redirected to `https://github.com/login/device`.
- The main process listens for token acquisition and returns the Bearer token to the renderer process.
- **Client ID configuration**: Configured via `.env` file under `VITE_GITHUB_CLIENT_ID`.

### 2. Personal Access Token (PAT)
- Direct entry of classic or fine-grained tokens with `repo` and `read:user` scopes.
- Token is saved in the user's config and used to instantiate `@octokit/rest`.

## Repository browsing & filtering

Once authenticated, Velocity fetches repositories and provides several filtering capabilities:

- **Visibility Filter**: All, Public, or Private.
- **Organization Filter**: Dynamically aggregates distinct organizations (`owner.type === 'Organization'`) from the repository list.
- **Real-time Search**: Filters by repository name.
- **Pagination**: Controlled via `itemsPerPage` (10, 20, 30, 50, 100, or All). Page resets to 1 whenever any filter or search query changes.

## Direct actions

- **Single Clone**: Opens `CloneDialog` prefilled with the repository's clone URL and default branch info.
- **Batch Clone**: Select multiple repositories via checkboxes to clone them in sequence with customized destination and group settings.
- **Custom Color Tagging**: Right-click on any repository to assign custom color tags stored persistently in `githubColors` configuration.
