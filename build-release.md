# Build & Release Guide

Step-by-step guide to build the application and release a new update using GitHub Releases.

## 1. Version Preparation

Before building, make sure to bump the application version.

1.  Open `package.json`.
2.  Find the `"version"` field.
3.  Increment the numbers (e.g., from `"1.0.0"` to `"1.0.1"`).

```json
{
  "name": "clone-tools",
  "version": "1.0.1",
  ...
}
```

## 2. Build Application

Run the build command to create the installer (`.exe`) and update manifest (`latest.yml`).

1.  Open a terminal in the project root.
2.  Run the command:

    ```bash
    bun run build:win
    ```

3.  Wait for the process to finish.

## 3. Release File Location

After the build is complete, the build artifacts will be located in the `release` folder.

Files you **MUST** retrieve:

1.  `Velocity Setup X.X.X.exe` (Application Installer)
2.  `latest.yml` (Auto-update Manifest)

> **IMPORTANT:** Do not rename these files. Upload them as they are.

## 4. Create Release on GitHub

Now upload these files to GitHub so users can download the update.

1.  Open your GitHub repository: `https://github.com/ose-id/clone-tools`
2.  Click the **Releases** menu in the right sidebar.
3.  Click the **Draft a new release** button.
4.  Fill in the release form:
    - **Choose a tag**: Type the new version, starting with `v`. Example: `v1.0.1`. Click "Create new tag".
    - **Release title**: Fill same as the tag, e.g., `v1.0.1`.
    - **Description**: Write the changelog if necessary.
5.  **Upload Assets**:
    - Drag & drop the `.exe` and `latest.yml` files from the `release` folder into the upload area.
    - Wait until the upload completes (green bar disappears).
6.  Click **Publish release**.

## 5. Verify Update

To ensure auto-update works:

1.  Run the old version of the application (e.g., v1.0.1) that is already installed.
2.  Open the **Configuration** menu.
3.  Click the **Check for Update** button.
4.  The application should detect version `v1.0.1`, download it, and the button should change to **Restart & Install Update**.
