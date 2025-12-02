# Fix Data Folder Submodule Issue

The arrow icon on GitHub indicates your `data` folder is a **Git submodule**. This happens when the folder has its own `.git` directory.

## Quick Fix (PowerShell)

Run the provided script:
```powershell
.\fix-data-folder.ps1
```

Then commit and push:
```powershell
git commit -m "Fix data folder: remove submodule, add as regular files"
git push origin main
```

## Manual Fix Steps

If you prefer to fix it manually:

### Step 1: Remove from Git Index
```powershell
git rm --cached data
```

### Step 2: Remove .git Directory (if exists)
```powershell
# Check if .git exists in data folder
Test-Path data\.git

# If it exists, remove it
Remove-Item -Recurse -Force data\.git
```

### Step 3: Re-add as Regular Files
```powershell
git add data/
```

### Step 4: Commit and Push
```powershell
git commit -m "Fix data folder: remove submodule, add as regular files"
git push origin main
```

## Verify Fix

After pushing, check GitHub:
- The arrow icon should be gone
- You should be able to click into the data folder
- You should see all the company folders and CSV files

## Why This Happened

This typically happens when:
1. The `data` folder was initialized as a separate Git repository
2. The folder was cloned from another repository
3. Someone ran `git init` inside the data folder

## Prevention

To prevent this in the future:
- Never run `git init` inside the `data` folder
- If you need to track the data folder separately, use Git LFS instead
- Always add folders as regular directories, not submodules


