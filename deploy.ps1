Write-Host "🚀 Deploying Bingo Nights Web Admin to Netlify..." -ForegroundColor Green
Write-Host ""

Set-Location web-admin

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build application" -ForegroundColor Red
    exit 1
}

Write-Host "🌐 Deploying to Netlify..." -ForegroundColor Yellow
npx netlify-cli deploy --prod --dir=dist
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy to Netlify" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your Bingo Nights admin dashboard is now live!" -ForegroundColor Cyan