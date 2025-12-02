# PowerShell script to fix data folder submodule issue
# This script removes the submodule and re-adds data folder as regular files

Write-Host "Checking if data folder is a submodule..." -ForegroundColor Yellow

# Check if data is tracked as a submodule
$isSubmodule = git ls-files --stage data | Select-String "160000"
if ($isSubmodule) {
    Write-Host "Data folder is a submodule. Fixing..." -ForegroundColor Red
    
    # Step 1: Remove from Git index
    Write-Host "Step 1: Removing data folder from Git index..." -ForegroundColor Cyan
    git rm --cached data
    
    # Step 2: Check if .git exists in data folder
    if (Test-Path "data\.git") {
        Write-Host "Step 2: Found .git directory in data folder. Removing..." -ForegroundColor Cyan
        Remove-Item -Recurse -Force "data\.git"
        Write-Host "Removed .git directory from data folder" -ForegroundColor Green
    } else {
        Write-Host "Step 2: No .git directory found in data folder" -ForegroundColor Green
    }
    
    # Step 3: Re-add as regular files
    Write-Host "Step 3: Re-adding data folder as regular files..." -ForegroundColor Cyan
    git add data/
    
    Write-Host "`nData folder has been fixed!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Review the changes: git status" -ForegroundColor White
    Write-Host "2. Commit: git commit -m 'Fix data folder: remove submodule, add as regular files'" -ForegroundColor White
    Write-Host "3. Push: git push origin main" -ForegroundColor White
} else {
    Write-Host "Data folder is NOT a submodule. Checking for other issues..." -ForegroundColor Yellow
    
    # Check if .git exists in data folder
    if (Test-Path "data\.git") {
        Write-Host "Found .git directory in data folder. This might cause issues." -ForegroundColor Red
        Write-Host "Removing .git directory..." -ForegroundColor Cyan
        Remove-Item -Recurse -Force "data\.git"
        Write-Host "Removed .git directory. Re-adding data folder..." -ForegroundColor Green
        git add data/
        Write-Host "`nFixed! Now commit and push." -ForegroundColor Green
    } else {
        Write-Host "No issues found. Data folder should work correctly." -ForegroundColor Green
    }
}

Write-Host "`nScript completed!" -ForegroundColor Green


