@echo off
echo Setting up Roblox Chat Overlay on Windows...

REM Install dependencies
echo Installing backend dependencies...
cd backend
call npm install

echo Installing frontend dependencies...
cd ..\frontend
call npm install

REM Create .env file if missing
if not exist "backend\.env" (
    echo Creating backend\.env file...
    (
        echo PORT=3001
        echo DATABASE_URL=postgresql://admin:password123@localhost:5432/roblox_chat
        echo JWT_SECRET=your_jwt_secret_here_min_32_chars
        echo JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars
        echo ROBLOX_CLIENT_ID=your_roblox_client_id
        echo ROBLOX_CLIENT_SECRET=your_roblox_client_secret
        echo ROBLOX_REDIRECT_URI=http://localhost:3001/auth/callback
    ) > backend\.env
    echo Please edit backend\.env with your actual Roblox OAuth credentials
)

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo 1. Install PostgreSQL from https://www.postgresql.org/download/windows/
echo    OR install Docker Desktop and use docker-compose.yml
echo.
echo 2. Edit backend\.env with your Roblox OAuth credentials
echo.
echo 3. Open THREE Command Prompt windows:
echo.
echo    Window 1 (Backend):
echo    cd backend
echo    npm run dev
echo.
echo    Window 2 (Frontend dev server):
echo    cd frontend
echo    npm run dev
echo.
echo    Window 3 (Electron app):
echo    cd frontend
echo    npm run electron
echo.
pause