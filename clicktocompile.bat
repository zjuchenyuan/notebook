@echo off
bash -c 'git status'
set /p message=commit message?
bash -c './compile.sh'
bash -c 'git add -A .&&git commit -m "%message%"&&git push'
pause