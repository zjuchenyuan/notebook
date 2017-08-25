# Linux系统配置

本文档为Linux服务器的配置方面的笔记，Linux相关笔记还有：

[Linux命令行操作技巧](Linux-cli.md)

[SSH远程登录](Linux-SSH.md)

[Linux备份](Linux-backup.md)

----

# 如何翻墙

## 部署shadowsocks客户端，并部署Privoxy提供http proxy

代码参见[ssprivoxy.txt](code/ssprivoxy.txt)

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

# 配置为dhcp自动获取ip，解决RTNETLINK answers: File exists问题

之前已经配置过静态ip，现在要改为自动获取

```
dhclient eth0
```

出现报错RTNETLINK answers: File exists，解决方案：

```
ip addr flush dev eth0
```

## 配置apt源以加速国内环境下apt速度

    curl http://mirrors.163.com/.help/sources.list.trusty>/etc/apt/sources.list

如果还未安装curl，先手动写入这两行：

```
deb http://mirrors.163.com/ubuntu/ trusty main restricted universe multiverse
deb http://mirrors.163.com/ubuntu/ trusty-security main restricted universe multiverse
```

> 注：vim复制一行的命令为yy，粘贴为p

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

使用`free -h`查看可用内存前可以执行这个命令，查看除去buffer后的可用内存

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

# 时区设置

```
cp /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
ntpdate cn.pool.ntp.org
```

----

# 查看CPU核心个数

一般我会用 `top` 命令，按 `1` 就能看到每个CPU占用情况

但当CPU太多的时候还是需要执行命令的：

```
# 查看物理CPU个数
cat /proc/cpuinfo| grep "physical id"| sort| uniq| wc -l

# 查看每个物理CPU中core的个数(即核数)
cat /proc/cpuinfo| grep "cpu cores"| uniq

# 查看逻辑CPU的个数
cat /proc/cpuinfo| grep "processor"| wc -l
```

----

# 非交互式添加用户

```
useradd username -m
echo username:password|chpasswd
```

添加一个用户名为username的用户并创建home目录，并设置密码为password

----

# 简单OpenVPN配置

一个最最简单的场景：只有一个服务器 一个客户端，在容器中用来给用户直接访问的一个内网IP

参考：https://openvpn.net/index.php/open-source/documentation/miscellaneous/78-static-key-mini-howto.html

## 安装openvpn:

Linux:

```
apt-get install openvpn
```

Windows:

[openvpn.exe](https://d.py3.io/openvpn.exe)

## 生成密钥

```
openvpn --genkey --secret static.key
```

用另外建立的安全通道(SSH)将static.key发给客户端

## 服务端配置

```
ifconfig 10.8.0.1 10.8.0.2
secret /static.key
keepalive 10 60
persist-key
persist-tun
proto udp
port 1194
dev tun0
status /tmp/openvpn-status.log

user nobody
group nogroup
```

在 Ubuntu 中，如果要配置成系统服务的形式，将其保存到/etc/openvpn/myvpn.conf

然后这样启动它：

```
service openvpn@myvpn start
```

这样设置开机自启

```
systemctl enable openvpn@myvpn.service
```

## 客户端配置

```

remote 这里是你的服务器IP 这里是你的服务器端口 udp
dev tun
ifconfig 10.8.0.2 10.8.0.1
secret static.key
```

## 在Docker中使用服务端

参考：https://raw.githubusercontent.com/kylemanna/docker-openvpn/master/bin/ovpn_run

运行容器的时候一定要给参数`--cap-add=NET_ADMIN`

另外还需要在容器中执行：

```
mkdir -p /dev/net
if [ ! -c /dev/net/tun ]; then
    mknod /dev/net/tun c 10 200
fi
```

----

# 时区时间设置

参考：http://liumissyou.blog.51cto.com/4828343/1302050

```
cp /etc/localtime /etc/localtime.bak
ln -svf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
echo "TZ='Asia/Shanghai'">>~/.bashrc
```

修改时间可以用：

```
date -s "2017-06-18 16:40:00"
```