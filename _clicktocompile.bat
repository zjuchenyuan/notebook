@echo off
bash -c "git --no-pager diff; git status"
set /p message=commit message?
bash -c "./compile.sh"
bash -c "git add -A ."
bash -c "GPG_TTY=$(tty) git commit -m '%message%'"
bash -c "git push"
pause