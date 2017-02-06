@echo off&setlocal enabledelayedexpansion 
cls
:: code by shuishui
color 0a
title 网络设置
mode con COLS=80 LINES=36
:menu
cls
ECHO.
ECHO                       + ☆★☆★-网络设置-★☆★☆ +
ECHO                     +　 　　　　 　　　　 　　　　   +
ECHO                        +☆★☆★-shuishui-★☆★☆+
ECHO  -------------------------------------------------------------------------
echo   [1]. 设置静态路由    [2]. 取消静态路由    [3]. 设置IP    [0 ]. 退出 
ECHO  -------------------------------------------------------------------------
ECHO.
ECHO  提示：Vista及以后的操作系统请右键选择用管理员身份运行!
ECHO. 

:menu2
SET cho2=
SET /p cho2= 选择操作:
echo.

if /i "%cho2%"=="0" (
echo.^>^>^>^>^>^>^>^>^>^>^>^>^>[RETURN]^<^<^<^<^<^<^<^<^<^<^<
goto end
)

SET orderIP=ipv4
netsh interface ipv4 show config>nul 2>nul || SET orderIP=ip

if /i "%cho2%"=="3" (
echo.^>^>^>^>^>^>^>^>^>^>^>^>^>^>^>^>[ %cho2%]^<^<^<^<^<^<^<^<^<^<^<^<^<^<
@REM 仅设置"Ethernet adapter"
set orderID=%cho2%
set uip= &set /a numb=0&set /a uipnum=0
for /f "usebackq delims=: tokens=1" %%a in (`"ipconfig | find "Ethernet adapter""`) do (
call set uip=%%uip%%"%%a" 
call set /a uipnum=%%uipnum%%+1
call echo %%uipnum%%. %%a
)
call set uip=%%uip:Ethernet adapter =%%
call :cchoice70
call :cchoice71 %%uip%%
echo.已设置[%cho2%]！
echo.
)
if /i "%cho2%"=="1" (
echo.^>^>^>^>^>^>^>^>^>^>^>^>^>^>^>^>[ %cho2%]^<^<^<^<^<^<^<^<^<^<^<^<^<^<
set orderID=%cho2%
set uip= &set uip1=&set /a uipnum=0&set /a numb=0
@REM 根据"Ethernet adapter""Default Gateway"字样查找
for /f "usebackq tokens=1 delims=:" %%a in (`"ipconfig | find "Ethernet adapter""`) do (
call set uip=%%uip%%"%%a" 
)
call set uip=%%uip:Ethernet adapter =%%
call :cchoice70 "00" 01
call :cchoice70
call :cchoice71 %%uip%%
echo.已设置[%cho2%]！
echo.
)
if /i "%cho2%"=="2" (
echo.^>^>^>^>^>^>^>^>^>^>^>^>^>^>^>^>[%cho2%]^<^<^<^<^<^<^<^<^<^<^<^<^<^<
rem ???????????????????????????????????????????????????
route delete 10.0.0.0
route delete 210.32.0.0
route delete 210.32.128.0
route delete 222.205.0.0
echo.已设置[%cho2%]！
echo.
)

echo.^>^>^>^>^>^>^>^>^>^>^>^>^>^>^>[END]^<^<^<^<^<^<^<^<^<^<^<^<^<
goto menu2

:cchoice70
set uip1= 
if /i "%2"=="01" (
if /i "%orderID%"=="1" (
for %%a in (%uip%) do (
for /f "usebackq tokens=3" %%i in (`"netsh interface %orderIP% show config %%a | find "Default Gateway:""`) do (
call set uip1=%%uip1%%%%i 
call set /a uipnum=%%uipnum%%+1
call echo %%uipnum%%. %%a
echo.   "Default Gateway":%%i
))))
if /i "%2"=="01" (
if /i "%orderID%"=="1" (
if /i %uipnum% EQU 0 (
for %%a in (%uip%) do (
for /f "usebackq tokens=2" %%i in (`"netsh interface %orderIP% show config %%a | find "默认网关:""`) do (
call set uip1=%%uip1%%%%i 
call set /a uipnum=%%uipnum%%+1
call echo %%uipnum%%. %%a
echo.   "默认网关":%%i
)))
call set uip=%%uip1%%
goto end
))
if /i %uipnum% EQU 0 (
for /f "usebackq tokens=1 delims=:" %%a in (`"ipconfig | find "以太网适配器""`) do (
call set uip=%%uip%%"%%a" 
if /i "%orderID%"=="3" (
call set /a uipnum=%%uipnum%%+1
call echo %%uipnum%%. %%a
)))
set uip=%uip:以太网适配器 =%
if /i %uipnum% EQU 0 (
if /i "%orderID%"=="1" (
for %%a in (%uip%) do (
for /f "usebackq tokens=2" %%i in (`"netsh interface %orderIP% show config %%a | find "默认网关:""`) do (
call set uip1=%%uip1%%%%i 
call set /a uipnum=%%uipnum%%+1
call echo %%uipnum%%. %%a
echo.   "默认网关":%%i
))
call set uip=%%uip1%%
))
goto end

:cchoice71
if %uipnum% LSS 1 echo.没有找到网络接口！&goto end
if %uipnum% GTR 1 (
echo.&echo.   输入要设置的接口的序号,退出Q
set /p numb=   :
) else (set numb=1)
if /i "%numb%"=="Q" goto end
if %numb% LSS 1 (echo.输入^<1无效！&goto cchoice71)
if %numb% LEQ 9 (
if %numb% LEQ %uipnum% (
call set uip=%%%numb%%
) else (echo.输入^>=%uipnum%无效！&goto cchoice71)
) else (echo.输入^>=9无效！&goto cchoice71)
if /i "%orderID%"=="1" (
route -4 -p add 10.0.0.0  mask 255.0.0.0 %uip% 2>nul || ^
route -p add 10.0.0.0  mask 255.0.0.0  %uip% >nul
route -4 -p add 210.32.0.0 mask 255.255.240.0 %uip% 2>nul  || ^
route -p add 210.32.0.0  mask 255.255.240.0  %uip% >nul
route -4 -p add 210.32.128.0 mask 255.255.192.0 %uip% 2>nul || ^
route -p add 210.32.128.0  mask 255.255.192.0  %uip% >nul
route -4 -p add 222.205.0.0 mask 255.255.128.0 %uip% 2>nul  || ^
route -p add 222.205.0.0  mask 255.255.128.0  %uip% >nul
goto end)

set myip=
set mygateway=
set mydns=10.10.0.21
echo.&echo.   输入要设置IP
set /p myip=   :
echo.   输入要设置网关
set /p mygateway=   :
echo.   输入要设置DNS
set /p mydns=   :

if /i "%orderID%"=="3" (
sc start dhcp >nul 2>nul
netsh interface ip set address name=%uip% source=static addr^
=%myip% mask=255.255.255.0 gateway=%mygateway% gwmetric=0 || ^
netsh interface ipv4 set address name=%uip% source=static addr^
=%myip% mask=255.255.255.0 gateway=%mygateway% gwmetric=0

netsh interface ip set dns name=%uip% source=static addr=%mydns% register=PRIMARY || ^
netsh interface ipv4 set dns name=%uip% source=static addr=%mydns% register=PRIMARY
sc stop dhcp >nul 2>nul
)
goto end

:end 
