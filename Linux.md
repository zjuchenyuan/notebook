# 如何翻墙

## 部署shadowsocks客户端，并部署Privoxy提供http proxy

代码参见[ssprivoxy.txt](code/ssprivoxy.txt)

## 也许使用iodine也是个替代方案

TODO: 补充iodine的笔记

----

# 帮助文本的grep，把stderr重定向到stdout

就是用2>&1这样的重定向咯

    ssh-keygen --help 2>&1|grep bit

----

# 当前目录文件全文搜索

这里要搜索当前目录下面所有的包含"MultiTeam"的php文件

    find| grep .php| xargs cat|grep MultiTeam -r .

----

# 配置有线静态IP
```bash
vim /etc/network/interfaces
# 写入以下内容，请自行替换xx部分
iface eth0 inet static
 address 10.xx.xx.13
 netmask 255.255.255.0
 network 10.xx.xx.0
 broadcast 10.xx.xx.255
 gateway 10.xx.xx.254
 dns-nameservers 10.10.0.21
# 按Esc, :wq退出保存
service networking restart
ifconfig eth0 10.xx.xx.13 netmask 255.255.255.0 up
route add default eth0
```

## 配置apt源

    curl http://mirrors.163.com/.help/sources.list.trusty>/etc/apt/sources.list

如果只能手打，vim复制一行的命令为yy，粘贴为p

```
deb http://mirrors.163.com/ubuntu/ trusty main restricted universe multiverse
deb http://mirrors.163.com/ubuntu/ trusty-security main restricted universe multiverse
```

## 单网卡获得多个IP
ifconfig eth0:233 10.xx.xx.233 netmask 255.255.255.0 up

----
# 锐速安装

来自：https://github.com/91yun/serverspeeder

安装之前需要修改内核版本并重启：

    apt-get install linux-image-3.16.0-43-generic
    reboot

安装命令：# 此安装脚本会连接开发者的服务器以root权限执行远程指令，风险自负

    wget -N --no-check-certificate https://raw.githubusercontent.com/91yun/serverspeeder/master/serverspeeder-all.sh && bash serverspeeder-all.sh
    
查看状态/关闭服务：

    service serverSpeeder stauts
    service serverSpeeder stop
    
----
# 解决apt依赖问题

问题描述：服务器为ubuntu14.04版本，某些不明操作后，无法用`apt-get`安装任何东西

```bash
> apt-get -f install
Reading package lists... Done
Building dependency tree
Reading state information... Done
Correcting dependencies... failed.
The following packages have unmet dependencies:
 libatk1.0-0 : Depends: libglib2.0-0 (>= 2.41.1) but 2.40.0-2 is installed
 libglib2.0-bin : Depends: libglib2.0-0 (= 2.44.0-1ubuntu3) but 2.40.0-2 is installed
 libglib2.0-dev : Depends: libglib2.0-0 (= 2.44.0-1ubuntu3) but 2.40.0-2 is installed
 libgtk2.0-0 : Depends: libglib2.0-0 (>= 2.41.1) but 2.40.0-2 is installed
E: Error, pkgProblemResolver::Resolve generated breaks, this may be caused by held packages.
E: Unable to correct dependencies
```

仔细看错误说明，libglib2.0-bin这个软件包要求libglib2.0-0的版本=2.44但是现有的安装版本为2.40

在ubuntu的软件包官网搜索咯：https://launchpad.net/ubuntu/

发现2.44版本的是vivid才提供的，现在系统版本是trusty，自然apt-get装不了

解决方案：

找到报错信息需要的精确匹配的那个deb文件下载咯，例如这里就要下载这个版本的：

https://launchpad.net/ubuntu/vivid/amd64/libglib2.0-0/2.44.0-1ubuntu3

得到deb文件后`dpkg -i 文件名`

## Note

一般apt依赖冲突问题都是由于系统版本与需要的包的版本不一致导致的，检查一下/etc/apt/sources.list看看是否匹配系统版本咯

用apt-get前检查一下sources.list，树莓派是版本8，是jessie不是wheezy!

----

# UnixBench

VPS性能测试工具，耗时较长，耐心等待

```bash
curl https://codeload.github.com/kdlucas/byte-unixbench/zip/v5.1.3>UnixBench.zip
unzip UnixBench.zip
cd byte-unixbench-5.1.3/UnixBench
# apt-get install build-essential
make
screen -S ub
./Run
```

## 硬盘IO性能测试

```
dd if=/dev/zero of=test bs=64k count=4k oflag=dsync
dd if=/dev/zero of=test bs=8k count=256k conv=fdatasync
```

## 参考数据，均为最低配置

主机屋1590.5；阿里云1470.4；腾讯云1156.0

----

## 清除内存缓存

```
sync
echo 3 > /proc/sys/vm/drop_caches
```

----

# 使用iptables封ip

### 屏蔽单个IP

    iptables -I INPUT -s 123.45.6.7 -j DROP

### 封C段

    iptables -I INPUT -s 123.45.6.0/24 -j DROP

#### 封B段

     iptables -I INPUT -s 123.45.0.0/16 -j DROP

### 封A段

    iptables -I INPUT -s 123.0.0.0/8 -j DROP

记得**保存**：

    service iptables save

## 删除一条规则

只要重写一次。把-I改为-D即可

    iptables -D INPUT -s IP地址 -j DROP

----

## 无root权限使用screen

> https://www.gnu.org/software/screen/

复制相同操作系统下的screen二进制文件，运行前指定环境变量

    mkdir -p $HOME/.screen
    export SCREENDIR=$HOME/.screen
    
----

## screen的用法

列出存在的screen：

    screen -ls
    
创建一个名为name的screen：

    screen -S name

从screen脱离：

    按Ctrl+A后按d

重新连上名称为name的screen：

    screen -r name

创建一个screen的自启动，让后台进程获得tty

    # 假设写好了一个/root/code.sh
    vim /etc/rc.local
    # 在最后加入一行，其中NAME替换为自己喜欢的名字
    screen -dmS NAME /root/code.sh

举个例子--监测外网能否ping通，如果不能重连zjuvpn：

[code/pingtest.sh](code/pingtest.sh)

----

# 统计当前文件夹代码行数

find 指定文件后缀名，记住要引号避免bash解析*

    find -name "*.py" -o -name "*.md"|xargs cat|wc

----

# 双网卡端口转发，暴露内网端口

> 来自： https://yq.aliyun.com/wenzhang/show_25824

有两台机器，其中一台A 有内网和外网，B只有内网。

目标： 在外网访问A机器的2121端口，就相当于连上了B机器的ftp(21)

## 环境： 

A机器外网IP为 1.2.3.4(eth1) 内网IP为 192.168.1.20 (eth0)

B机器内网为 192.168.1.21

## 实现方法：

首先在A机器上打开端口转发功能

```
    echo 1 > /proc/sys/net/ipv4/ip_forward
    echo -e "\nnet.ipv4.ip_forward = 1">>/etc/sysctl.conf
    sysctl -p
```

然后在A机器上创建iptables规则

```
# 把访问外网2121端口的包转发到内网ftp服务器
iptables -t nat -I PREROUTING -d 1.2.3.4 -p tcp --dport 2121 -j DNAT --to 192.168.1.21:21 

# 把到内网ftp服务器的包回源到内网网卡上，不然包只能转到ftp服务器，而返回的包不能到达客户端
iptables -t nat -I POSTROUTING -d 192.168.1.21 -p tcp --dport 21 -j SNAT --to 192.168.1.20 

# 保存一下规则
service iptables save
```

## 取消转发方法

iptables中把-I改为-D运行就是删除此条规则

----

## 保护重要系统文件防止被删

使用+i标志位使得root用户也不能删除/bin, /sbin, /usr/sbin, /usr/bin, /usr/local/sbin, /usr/local/bin

```
chattr -R +i /bin /sbin /usr/sbin /usr/bin /usr/local/sbin /usr/local/bin
```

设置后无法apt-get安装新软件，需要先取消标志位

```
chattr -R -i /bin /sbin /usr/sbin /usr/bin /usr/local/sbin /usr/local/bin
```

----

# 查看给定文件列表的文件大小

用xargs -d指定分隔符为\n（默认会按照空格和\n分隔参数）

```
cat list.txt | xargs -d "\n" ls -alh
```

----

# 时区设置

```
cp /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
ntpdate cn.pool.ntp.org
```

----

# wget慢慢下载

```
wget -i list.txt  -nc --wait=60 --random-wait
```

其中nc表示已经下载到的文件就不要再请求了，wait=60表示两次请求间隔60s，random-wait表示随机等待2~120s

----

# touch修改时间戳

将b.txt的时间戳改为和a.txt一样

```
touch -r a.txt b.txt
```

----

# 去掉ls的颜色

```
unalias ls
```

----

# 换行方式修改

vim中输入:set ff=unix