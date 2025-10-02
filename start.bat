@echo off
echo Starting Resume Parser MERN Application...
echo.

echo Installing dependencies...
call npm run install-all

echo.
echo Starting development servers...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.

start cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start cmd /k "cd frontend && npm start"

echo.
echo Application is starting up...
echo Please wait for both servers to fully load.
echo.
pause
