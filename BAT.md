# 写在前面

在没有接触到C和Python之前，我也常用BAT和一堆第三方的exe做事情

年少无知的岁月呀~

----

## 快速打开cmd

还在用Win+R cmd再用pushd命令？

在资源管理器的地址栏输入cmd回车就能直接进入当前目录

----

##  并列语句语法

```
顺序执行 &
echo a & echo b 

前者正确才执行 &&
>nul 2>nul ping -n 1 qq.com && echo network ok

前者错误才执行 ||
>nul 2>nul ping -n 1 qq.com || echo network failure

```

----

## 来一个死循环吧 for

> 用于结束进程，或者DNS查询看看解析是否生效

    for /l %i in (1,1,9999999) do ...

类似的Linux命令为：

    for ((i=0; i<10; ++i))  do ...  done  

----

## 结束进程 taskkill

> 当启动cmd窗口过多的时候，使用taskkill清理一下（一个个关掉也是很烦的呢）

    taskkill /f /im cmd.exe
    
类似的Linux命令为`killall bash`
    
----

## 内存整理 free

> 微软自己出的一个内存整理工具，需要管理员权限

> 下载：[empty.exe](https://d.py3.io/empty.exe)

    empty *

----

## 睡一会 SleepX

> 程序需要等待一定时间再继续运行就可以sleepx啦，作者Bill Stewart (bstewart@iname.com)

> 下载：[SleepX.exe](https://d.py3.io/SleepX.exe)

    SleepX 10
    
    REM等待5s，如果用户等不及可以按键，此时 not "%errorlevel%" == "0"
    SleepX -k 5
    
----

## 命令行的浏览器 curl

![cURL](https://curl.haxx.se/logo/curl-logo.svg)

> 大名鼎鼎的cURL，不必多言；只是它的命令行的运行方式与libcurl用起来差异很大（如比较php的curl用法）

> 官方：https://curl.haxx.se/

> 简单入门：http://www.bathome.net/thread-1761-1-1.html

> **将curl转为python requests** http://curl.trillworks.com/

[下载7.51 x64版本](https://d.py3.io/curl.exe)

具体请见单独文档[cURL.md](cURL.md)

----

## 判断文件夹存在

通过判断nul这个特殊文件的存在性（用户并不能创建文件名形如nul的特殊文件）

```
if exist DIRNAME\nul echo Yes!
```

----

## 创建硬链接mklink或者fsutil hardlink create

Win7及以上：
```
mklink /H Link Target
```

目录还需要/J
```
mklink /H /J Link Target
```

WinXP只能用：
```
fsutil hardlink create <new filename> <existing filename>
```

----

## 端口转发

此命令需要管理员权限

```
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=转发出的端口 connectaddress=转发的源IP地址 connectport=转发的源端口
```

----

## 保持RVPN不断开

rvpn会自动断开，所以写了个脚本判断并自动重连

[RVPNKeepAlive.bat](code/RVPNKeepAlive.bat)

其中的知识点：

1. 判断命令是否成功用if "%errorlevel%"=="0"，errorlevel这个变量是上一条命令的返回结果（C程序的int main的返回值），一般规定返回0表示没有发生错误

2. 用ping www.baidu.com和ping -n 2 ip.cn做粗糙的等待延时，其中-n表示ping的次数，默认是4，改小一点就是更短的延时咯

3. 启动一个GUI的exe，需要用start "" example.exe

----

## 浙江大学有线vpn静态路由配置脚本

Author: shuishui

[静态路由设置.bat](code/静态路由设置.bat)

----

## 进入休眠

Win10似乎没有从鼠标进入休眠而不是睡眠的方法，但调用rundll32进入休眠模式还是可以的：

```
rundll32.exe powrProf.dll,SetSuspendState
```

----

## 快速进入系统代理设置

From: https://stackoverflow.com/questions/3648366/is-it-possible-to-launch-ies-proxy-settings-dialog-from-the-command-line

不用启动`c:\Program Files\Internet Explorer\iexplore.exe`，直接Win+R输入这个就能打开IE的连接设置，方便修改代理：

```
inetcpl.cpl ,4
```

----

## 在普通权限cmd中获得更高权限

比如下文的修改ip等操作就需要管理员权限。你可以先启动任务管理器，再运行一个管理员权限的cmd；现在有了更加直接的操作

### 方案1：[elevate](http://code.kliu.org/misc/elevate/)

下载地址：[http://code.kliu.org/misc/elevate/elevate-1.3.0-redist.7z](http://code.kliu.org/misc/elevate/elevate-1.3.0-redist.7z)

特点：有UAC弹窗，会启动一个新窗口

例子：

```
REM 启动一个特权的cmd
elevate -k
REM 执行dir并等待结束
elevate -c -w dir
```

### 方案2：Sudo for Windows – Luke Sampson

参考：https://helpdeskgeek.com/free-tools-review/5-windows-alternatives-linux-sudo-command/

在powershell中输入以下命令完成安装：

```
iex (new-object net.webclient).downloadstring(‘https://get.scoop.sh’)

set-executionpolicy unrestricted -s cu -f

scoop install sudo
```

特点：比较慢，仍然有UAC弹窗，不会启动一个新窗口