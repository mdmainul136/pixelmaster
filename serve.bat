@echo off
:loop
echo [%date% %time%] Starting Laravel server on port 8000...
php artisan serve --port=8000
echo [%date% %time%] Server crashed, restarting in 1 second...
timeout /t 1 /nobreak >nul
goto loop
