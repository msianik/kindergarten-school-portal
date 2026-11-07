# Continuous Auto-Sync Watcher
$env:PATH = "C:\Program Files\Git\cmd;" + $env:PATH

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Antigravity Continuous Auto-Sync Watcher Started" -ForegroundColor Cyan
Write-Host " Auto-pushing to GitHub every 5 seconds on new changes..." -ForegroundColor Gray
Write-Host " Press Ctrl + C to stop." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

while ($true) {
    Start-Sleep -Seconds 5
    $status = git status --porcelain
    if ($status) {
        $timeStr = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timeStr] Changes detected! Committing and pushing..." -ForegroundColor Yellow
        git add .
        git commit -m "Auto sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git push origin main
        Write-Host "[$timeStr] Sync complete!" -ForegroundColor Green
    }
}
