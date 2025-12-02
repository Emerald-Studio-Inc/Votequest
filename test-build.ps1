# Test build script for VoteQuest
Write-Host "Starting build test..." -ForegroundColor Cyan

# Navigate to project directory
Set-Location C:\Users\USER\Documents\Votequest

# Clear Next.js cache
Write-Host "`nClearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "✓ No cache to clear" -ForegroundColor Green
}

# Run build
Write-Host "`nRunning npm run build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ BUILD SUCCESSFUL!" -ForegroundColor Green
} else {
    Write-Host "`n❌ BUILD FAILED!" -ForegroundColor Red
    exit 1
}
