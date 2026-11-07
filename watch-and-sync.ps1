# Continuous Auto-Sync Watcher
# Watches local project files and automatically commits & pushes to GitHub/AI Studio
$env:PATH = "C:\Program Files\Git\cmd;" + $env:PATH
$projectPath = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🚀 Antigravity Continuous Auto-Sync Watcher Started" -ForegroundColor Cyan
Write-Host " Watching: $projectPath" -ForegroundColor Gray
Write-Host " প্রতি ৫ সেকেন্ডে স্বয়ংক্রিয়ভাবে গিটহাবে পুশ করবে..." -ForegroundColor Gray
Write-Host " বন্ধ করতে Ctrl + C চাপুন।" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

while ($true) {
    Start-Sleep -Seconds 5
    $status = git status --porcelain
    if ($status) {
        $timeStr = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timeStr] 📦 পরিবর্তন পাওয়া গেছে! স্বয়ংক্রিয় কমিট ও পুশ হচ্ছে..." -ForegroundColor Yellow
        git add .
        git commit -m "Auto sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git push origin main
        Write-Host "[$timeStr] ✅ সফলভাবে সিঙ্ক সম্পন্ন হয়েছে!" -ForegroundColor Green
    }
}
