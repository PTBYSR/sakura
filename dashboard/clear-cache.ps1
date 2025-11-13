# Clear Next.js and environment cache
Write-Host "🧹 Clearing Next.js cache..." -ForegroundColor Cyan

# Clear .next build cache
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Cleared .next cache" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next folder not found" -ForegroundColor Yellow
}

# Clear node_modules cache
if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "✅ Cleared node_modules cache" -ForegroundColor Green
} else {
    Write-Host "ℹ️  node_modules cache not found" -ForegroundColor Yellow
}

# Clear TypeScript build info
if (Test-Path tsconfig.tsbuildinfo) {
    Remove-Item -Force tsconfig.tsbuildinfo
    Write-Host "✅ Cleared TypeScript build info" -ForegroundColor Green
}

Write-Host "`n✨ Cache cleared! Now:" -ForegroundColor Cyan
Write-Host "1. Make sure your .env.local file has the correct values" -ForegroundColor Yellow
Write-Host "2. Restart your dev server (npm run dev)" -ForegroundColor Yellow
Write-Host "3. Hard refresh your browser (Ctrl+Shift+R or Ctrl+F5)" -ForegroundColor Yellow

