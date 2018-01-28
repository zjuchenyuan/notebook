REM 用于保证Windows服务器上的rvpn发生断开后尽快重连
REM 本脚本仅包含核心逻辑，还需要写一个Loader.bat每间隔1min(可自定义)调用一次本脚本
REM 逻辑：如果发现了退出登录的弹窗则自动重连，如果curl获取内网数据失败自动重连
REM 由于rvpn会自动启动浏览器，可能导致大量内存占用，所以启动后自动结束浏览器进程Chrome.exe

taskkill /f /im LogoutTimeOut.exe
if "%errorlevel%"=="0" taskkill /f /im SangforCSClient.exe&ping www.baidu.com&start "" "C:\Program Files\Sangfor\SSL\SangforCSClient\SangforCSClient.exe" /ShortCutAutoLogin&& taskkill /f /im Chrome.exe &ping www.baidu.com
curl 10.71.45.100 >nul
if "%errorlevel%"=="0" exit 0
curl www.cc98.org >nul
if "%errorlevel%"=="0" exit 0
taskkill /f /im SangforCSClient.exe
ping -n 2 ip.cn
start "" "C:\Program Files\Sangfor\SSL\SangforCSClient\SangforCSClient.exe" /ShortCutAutoLogin
taskkill /f /im Chrome.exe