# zjuchenyuan's Notebook

我的技术笔记本，为了自己后来方便查询多做点记录吧，开源出来也许更有价值~

包含Docker, Nginx, MySQL, CDN, Python, VirtualBox, C++, BAT等方面的笔记

本网站编译命令参见[compile.sh](compile.sh)

# 目录

## [Python](Python.md)
>* [语言勾勒QuickStart](quickstart.html)
>* 设置pip源
>* 反弹shell 获得tty
>* 让requests使用多个IP
>* [Python多线程模板](code/MultiThread_Template.py)
>* BaseHTTPServer并发性改善
>* 无root权限安装Python
>* 中文输出乱码问题解决
>* pycodestyle检查代码风格
>* 生成随机字符串
>* 大数据判断in
>* 解决Python.h: No such file or directory
>* 二进制字符串转普通字符串

## [BAT 批处理](BAT.md)
>* 并列语句语法
>* 循环for
>* 结束进程taskkill
>* 内存整理free
>* 睡一会sleep
>* 判断文件夹存在
>* 创建硬链接mklink
>* 端口转发

## [C 语言](C.md)
>* 关于Dev C++
>* 输入的问题，建议用gets和sscanf
>* C++用sstream代替sprintf

## [CDN](CDN.md)
>* UPYUN 又拍云
>* Qiniu 七牛

## [cURL](cURL.md)
>* 模拟浏览器请求
>* 基本教程
>* 还可以循环哟

## [Docker](Docker.md)
>* 安装
>* 加速镜像下载
>* 旧版本卸载
>* 获得容器的ip
>* 导入导出容器
>* 解决iptables failed问题
>* 迁移Docker文件夹到其他硬盘
>* 解决debian等容器没有ifconfig的问题
>* 设置容器低权限用户运行
>* 设置容器/etc/resolv.conf和/etc/hosts

## [Favorites](Favorites.md)
>* Intel i386 手册 及 勘误

## [Git](Git.md)
>* 立即使用
>* git push免密码
>* bash工作环境(别名,自动完成,dirty提示)设置
>* [Git也要翻墙](code/ssgit.txt)
>* 好玩的命令们
>* 使用情景：gitignore负向选择；补上commit漏掉的文件；密码泄露查作者

## [Github Project Recommendation](GithubProjectRecommendation.md)
>* 视频下载you-get
>* 记忆手段Anki
>* 在线评测OnlineJudge

## [Java](Java.md)
>* 一些Java与C++的不同之处

## [JavaScript](JavaScript.md)
>* 使用本地存储localStorage
>* [随机字符串生成](http://py3.io/p.html)
>* 异常

## [Linux-setup](Linux-setup.md)
>* [翻墙shadowsocks+privoxy](code/ssprivoxy.txt)
>* 配置有线静态IP
>* 配置apt源以加速国内环境下apt速度
>* 单网卡获得多个IP
>* 锐速安装
>* 解决apt依赖问题
>* UnixBench性能评测
>* 清除内存缓存
>* 使用iptables封ip
>* 无root权限使用screen
>* screen的用法
>* 两条iptables实现端口转发，暴露内网端口
>* 保护重要系统文件防止被删chattr +i
>* 时区设置
>* 查看CPU核心个数

## [Linux-SSH](Linux-SSH.md)
>* 客户端不同服务器使用不同的id_rsa
>* 换个端口开启一个临时的sshd
>* ssh反向代理
>* 启用SSH密钥登录后两步验证

## [Linux-cli](Linux-cli.md)
>* 帮助文本的grep 用2>&1
>* 当前目录文件全文搜索
>* 统计当前文件夹代码行数
>* 查看给定文件列表的文件大小
>* wget慢慢下载
>* touch修改时间戳
>* 去掉Ubuntu默认情况下ls的颜色
>* 换行方式修改
>* iodine--使用DNS传输数据
>* 远程控制Windows
>* 统计以特定字符串开头的文件数目
>* hexdump查看字符内部编码
>* 子目录大小排序

## [Linux-backup](Linux-backup.md)
>* 一个良好安全的备份计划至关重要

## [MySQL](MySQL.md)
>* 查看表结构 desc
>* MERGE存储引擎
>* 删除表的冗余
>* 修改表 alter table
>* [将中文转为拼音的函数](code/pinyin.sql)
>* 从路径URL获取文件名称
>* 查询优化--explain发现出现了using filesort；内存表索引的选择
>* 内存表The table is full的解决

## [Nginx](Nginx.md)
>* 普通资源允许POST
>* 不带后缀的文件当成php执行
>* 获得Let's encrypt免费https证书
>* 配置安全的https
>* 反向代理之替换网页、JS中的文本

## [VirtualBox](Linux-VirtualBox.md)
>* 下载安装，一定记得安装额外包
>* 创建虚拟机，设置虚拟机选项
>* 启动虚拟机
>* 远程控制虚拟机

## [WinSoftware](WindowsSoftware.md)
>* Emeditor
>* Everything
>* Sysinternals Utilities
>* CLOC代码统计利器
>* U盘安装原版系统盘
>* WinRAR
>* BurpSuite
