# Windows Software

自己日常用到的一些工具咯


----

## Emeditor

https://www.emeditor.com/

下载：http://files.emeditor.com/emed64_16.3.1.exe

打开超大文件，语法高亮，批处理替换等好用的功能


## Everything

https://www.voidtools.com/

下载：https://www.voidtools.com/Everything-1.4.1.809b.x64.zip

快速全盘搜索，不知道比windows自带的搜索快到哪里去了

## **Sysinternals Utilities**

https://technet.microsoft.com/en-us/sysinternals/bb545027

[任务管理器](https://d.py3.io/procexp.exe) https://download.sysinternals.com/files/ProcessExplorer.zip

## CLOC代码统计利器

下载：https://github.com/AlDanial/cloc/releases/download/v1.70/cloc-1.70.exe

Cloc是一款使用Perl语言开发的开源代码统计工具，支持多平台使用、多语言识别，能够计算指定目标文件或文件夹中的文件数(files)、空白行数(blank)、注释行数(comment)和代码行数(code)。

## MenuMgr 右键菜单管理

还右键菜单一份清净

[MenuMgr](https://d.py3.io/MenuMgr.exe)

## 文件夹背景右键添加bash

发现自己经常需要在当前路径下打开bash，之前我都是在地址栏输入bash回车 但这样的副作用是不能再方便地复制当前路径了

现在我将bash添加到右键菜单 只需鼠标点击两次即可打开bash

regedit定位到

```
计算机\HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\
```

新建项bash 再在bash中新建项command 修改command的默认为`bash`

顺带可以把在此处打开命令窗口给显示出来：同一个文件夹里面有个cmd 但还有一些其他项 删掉即可

如果修改注册表没有权限，右键改权限 先改所有者再对everyone允许完全控制即可
## 软媒U盘启动盘制作

[usbbooter.exe](https://d.py3.io/usbbooter.exe)

## WinRAR

压缩解压缩，我只用WinRAR和7zip

[winrar.exe](https://d.py3.io/winrar.exe)

[winrar32bit.exe](https://d.py3.io/winrar32bit.exe)

[rarreg.key](https://d.py3.io/rarreg.key)

## BurpSuite

发现app的漏洞啥的，还是挺有用的~

[burpsuite v1.7.11.zip](https://d.py3.io/burpsuite v1.7.11.zip)

使用方法：安装Java，启动后设置监听在所有网卡，导出证书CA.crt发送到手机，手机导入证书，手机忘记Wifi后连接wifi时设置代理，手机启动APP，查看流量咯~

## BEncode Editor

创建/编辑种子信息，做一个勤奋的搬运工...

[BEncode Editor.exe](https://d.py3.io/BEncode%20Editor.exe)

## Win10 Windows照片查看器

From: http://www.xitongcheng.com/jiaocheng/win10_article_12240.html

Win+R打开regedit，找到HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Photo Viewer\Capabilities\FileAssociations

右键，新建字符串值，命名为.jpg，值为PhotoViewer.FileAssoc.Tiff

我的情况是原先有.tif和.tiff的，还需要新建这些后缀名.jpeg .bmp .png .gif

创建后再看打开方式就有了Windows照片查看器

## 星号密码查看

一般是用不着 [AsteriskPassword.exe](https://d.py3.io/AsteriskPassword.exe)

## 远程连接密码查看

[mstscpass.exe](https://d.py3.io/mstscpass.exe)

## GHO文件查看

也是很久没用了啊 [Ghostexp.exe](https://d.py3.io/Ghostexp.exe)

## 文件哈希计算

Linux下直接用md5sum sha1sum就够了

[Hash.exe](https://d.py3.io/Hash.exe)

## tcping 检测端口是否开放

一直ping的用法: `tcping -t py3.io 443`

[tcping.exe](https://d.py3.io/tcping.exe)

## Nginx 1.11.8

[nginx.zip](https://d.py3.io/nginx.zip)

----

## Bash On Win10

### mount挂载其他分区

```
mount -t drvfs D: /mnt/d
```

----

## VMware vCenter Converter

无需关机，无需移动硬盘将物理机转为虚拟机镜像

基于Windows的卷影复制功能

http://www.softpedia.com/get/System/System-Miscellaneous/VMware-Converter.shtml

----

## 命令行开关蓝牙 powershell

参考： https://blog.netspi.com/15-ways-to-bypass-the-powershell-execution-policy/https://superuser.com/questions/1168551/turn-on-off-bluetooth-radio-adapter-from-cmd-powershell-in-windows-10

绕过powershell执行安全策略参考： https://blog.netspi.com/15-ways-to-bypass-the-powershell-execution-policy/

将这个保存为b.ps1

```
[CmdletBinding()] Param (
    [Parameter(Mandatory=$true)][ValidateSet('Off', 'On')][string]$BluetoothStatus
)
If ((Get-Service bthserv).Status -eq 'Stopped') { Start-Service bthserv }
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
Function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}
[Windows.Devices.Radios.Radio,Windows.System.Devices,ContentType=WindowsRuntime] | Out-Null
[Windows.Devices.Radios.RadioAccessStatus,Windows.System.Devices,ContentType=WindowsRuntime] | Out-Null
Await ([Windows.Devices.Radios.Radio]::RequestAccessAsync()) ([Windows.Devices.Radios.RadioAccessStatus]) | Out-Null
$radios = Await ([Windows.Devices.Radios.Radio]::GetRadiosAsync()) ([System.Collections.Generic.IReadOnlyList[Windows.Devices.Radios.Radio]])
$bluetooth = $radios | ? { $_.Kind -eq 'Bluetooth' }
[Windows.Devices.Radios.RadioState,Windows.System.Devices,ContentType=WindowsRuntime] | Out-Null
Await ($bluetooth.SetStateAsync($BluetoothStatus)) ([Windows.Devices.Radios.RadioAccessStatus]) | Out-Null
```

开启蓝牙：

```
powershell -ExecutionPolicy Bypass -File ./b.ps1 -BluetoothStatus On
```

关闭就是Off

----

## 文件夹背景右键直接显示bash

默认需要按住Shift右键才会显示

HKEY_CLASSES_ROOT\Directory\Background\shell\WSL

删除其中的Extended项即可，可能没有权限需要先获得所有权再给自己权限，[参考](https://www.ithome.com/html/win10/282909.htm)

附上默认的command:

```
wsl.exe --cd "%V"
powershell.exe -noexit -command Set-Location -literalPath '%V'
cmd.exe /s /k pushd "%V"
```

----

## sshfs挂载远程目录

https://github.com/billziss-gh/sshfs-win

相比玄学的windows共享，还是ssh更加简单靠谱，只是有时候ssh.exe会CPU100%卡住，需要任务管理器kill

使用前需要先让ssh开启密码验证，你可以使用`ssh -i /dev/null`去连接测试能否登录

可以用多个`..\`挂载上级目录

```
net use h: \\sshfs\root@ip!2222\..\
```


