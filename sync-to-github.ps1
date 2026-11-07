# Antigravity to GitHub & Live Website Auto Sync Script
$env:PATH = "C:\Program Files\Git\cmd;C:\Users\MSI ANIK\.bun\bin;" + $env:PATH
$projectDir = $PSScriptRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Antigravity & Live Site Auto Sync     " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$remoteUrl = git config --get remote.origin.url

# 1. Sync Source Code to main branch
$status = git status --porcelain
if ($status) {
    Write-Host "`n[1/3] Changes detected. Committing source code..." -ForegroundColor Yellow
    git add .
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto sync: $timestamp"
    Write-Host "Local commit created successfully." -ForegroundColor Green
} else {
    Write-Host "`n[1/3] Working tree is clean. No new local changes." -ForegroundColor Green
}

Write-Host "`n[2/3] Pushing source code to GitHub (main)..." -ForegroundColor Cyan
git push origin main

# 2. Build and Deploy Live Website to gh-pages branch
Write-Host "`n[3/3] Building and deploying live website..." -ForegroundColor Cyan
bun run build

if (Test-Path "$projectDir\dist") {
    Copy-Item "$projectDir\dist\index.html" "$projectDir\dist\404.html" -Force
    Set-Location "$projectDir\dist"
    git init -b gh-pages | Out-Null
    git config user.name "MSI ANIK"
    git config user.email "anik@example.com"
    git add .
    git commit -m "Live deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-Null
    git remote remove origin 2>$null
    git remote add origin $remoteUrl
    git push -f origin gh-pages
    Set-Location $projectDir
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host " SUCCESS: Both GitHub and Live Website are updated! " -ForegroundColor Green
    Write-Host " Live Website: https://msianik-bd.github.io/kindergarten-school-portal/" -ForegroundColor Cyan
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "ERROR: Build folder dist not found." -ForegroundColor Red
}
