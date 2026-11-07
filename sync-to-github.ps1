# Antigravity to GitHub Auto Sync Script
$env:PATH = "C:\Program Files\Git\cmd;" + $env:PATH

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Antigravity & AI Studio Auto Sync     " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$status = git status --porcelain
if ($status) {
    Write-Host "[1/2] Changes detected. Committing..." -ForegroundColor Yellow
    git add .
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto sync from Antigravity: $timestamp"
    Write-Host "Local commit created successfully." -ForegroundColor Green
} else {
    Write-Host "[1/2] Working tree is clean. No new local changes to commit." -ForegroundColor Green
}

Write-Host "[2/2] Pushing to GitHub (origin main)..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Project is fully synced with GitHub & Google AI Studio!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Push failed. Check internet connection or Git permissions." -ForegroundColor Red
}
