@echo off
bash -c 'git status'
set /p message=commit message?
REM bash -c './compile.sh'
bash -c 'git add -A .'
bash -c 'git commit -m "%message%"'
bash -c 'git push'
pause