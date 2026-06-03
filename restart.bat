@echo off
:loop
node index.js
echo Bot crashed. Waiting 60 seconds before restart...
timeout /t 60 /nobreak
goto loop
