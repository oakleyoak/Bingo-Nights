@echo off
echo 🚀 Deploying Bingo Nights Web Admin to Netlify...
echo.

cd web-admin

echo 📦 Installing dependencies...
call npm ci
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo 🔨 Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build application
    exit /b 1
)

echo 🌐 Deploying to Netlify...
call npx netlify-cli deploy --prod --dir=dist
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy to Netlify
    exit /b 1
)

echo ✅ Deployment successful!
echo.
echo 🎉 Your Bingo Nights admin dashboard is now live!