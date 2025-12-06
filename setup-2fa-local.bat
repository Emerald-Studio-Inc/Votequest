@echo off
REM Setup script for 2FA local development

echo Setting up 2FA for local development...
echo.

REM Check if .env.local exists
if exist .env.local (
    echo .env.local already exists. Appending 2FA secret...
    echo. >> .env.local
    echo # 2FA Authentication >> .env.local
    echo ADMIN_2FA_SECRET=HJ4GMW2FEEWEUXK5JQ4G4LCEHZDSC5DJJ4ZHOTKDKBFUI2CUNNIQ >> .env.local
    echo.
    echo ✓ 2FA secret added to existing .env.local
) else (
    echo Creating new .env.local file...
    echo # 2FA Authentication > .env.local
    echo ADMIN_2FA_SECRET=HJ4GMW2FEEWEUXK5JQ4G4LCEHZDSC5DJJ4ZHOTKDKBFUI2CUNNIQ >> .env.local
    echo. >> .env.local
    echo # Admin Access >> .env.local
    echo NEXT_PUBLIC_ADMIN_PASSPHRASE=your_passphrase_here >> .env.local
    echo NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR=true >> .env.local
    echo.
    echo ✓ Created .env.local with 2FA secret
    echo.
    echo ⚠️  IMPORTANT: Update NEXT_PUBLIC_ADMIN_PASSPHRASE in .env.local
)

echo.
echo 2FA Secret: HJ4GMW2FEEWEUXK5JQ4G4LCEHZDSC5DJJ4ZHOTKDKBFUI2CUNNIQ
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Press Ctrl+Shift+A to access 2FA setup
echo 3. Scan QR code with Google Authenticator
echo.
pause
