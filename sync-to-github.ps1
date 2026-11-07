# Auto Sync Script: Antigravity -> GitHub -> Google AI Studio
$ErrorActionPreference = "Continue"
$env:PATH = "C:\Program Files\Git\cmd;" + $env:PATH

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  🔄 Antigravity & AI Studio Auto Sync  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$remotes = git remote
if (-not $remotes) {
    Write-Host "`n⚠️  কোনো GitHub Remote URL যুক্ত করা নেই!" -ForegroundColor Red
    Write-Host "প্রথমে আপনার GitHub রিপোজিটরি লিংকটি যুক্ত করতে হবে।" -ForegroundColor Yellow
    Write-Host "উদাহরণ: git remote add origin https://github.com/USERNAME/REPO_NAME.git`n" -ForegroundColor Gray
    exit 1
}

$status = git status --porcelain
if ($status) {
    Write-Host "`n📦 নতুন পরিবর্তন পাওয়া গেছে। স্টেজিং ও কমিট করা হচ্ছে..." -ForegroundColor Yellow
    git add .
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto sync from Antigravity: $timestamp"
    Write-Host "✓ লোকাল কমিট সম্পন্ন হয়েছে।" -ForegroundColor Green
} else {
    Write-Host "`n✓ লোকাল ফাইলে কোনো নতুন আনকমিটেড পরিবর্তন নেই।" -ForegroundColor Green
}

Write-Host "`n🚀 GitHub-এ পুশ করা হচ্ছে..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ সফলভাবে GitHub ও Google AI Studio-র সাথে সিঙ্ক হয়েছে!" -ForegroundColor Green
} else {
    Write-Host "`n❌ পুশ করার সময় ত্রুটি হয়েছে। অনুগ্রহ করে ইন্টারনেট ও গিট পারমিশন চেক করুন।" -ForegroundColor Red
}
