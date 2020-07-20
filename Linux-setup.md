# Linux系统配置

本文档为Linux服务器的配置方面的笔记，Linux相关笔记还有：

[Linux命令行操作技巧](Linux-cli.md)

[SSH远程登录](Linux-SSH.md)

[Linux备份](Linux-backup.md)

TOC:


----

## 如何翻墙

## 部署shadowsocks客户端，并部署Privoxy提供http proxy

代码参见[ssprivoxy.txt](code/ssprivoxy.txt)

----

## 配置有线静态IP
```bash
vim /etc/network/interfaces
# 写入以下内容，请自行替换xx部分
iface eth0 inet static
 address 10.xx.xx.13 #你需要设置的IP
 netmask 255.255.255.0 #子网掩码
 network 10.xx.xx.0
 broadcast 10.xx.xx.255
 gateway 10.xx.xx.254 #网关
 dns-nameservers 10.10.0.21 #dns服务器
# 按Esc, :wq退出保存
service networking restart
ifconfig eth0 10.xx.xx.13 netmask 255.255.255.0 up
route add default eth0 #路由配置也很重要，错误的路由将导致不能访问
route add default gw 10.xx.xx.254 dev eth0 #这里设置为你的网关
```

注意使用ifconfig进行ip的修改后，会丢失路由信息、额外的ip设置，需要重新配置route（执行上述两条route命令即可）

## 配置为dhcp自动获取ip，解决RTNETLINK answers: File exists问题

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

或者通过sed替换：

```
sed -i 's/security.ubuntu.com/mirrors.zju.edu.cn/g' /etc/apt/sources.list
sed -i 's/archive.ubuntu.com/mirrors.zju.edu.cn/g' /etc/apt/sources.list
```

## 单网卡获得多个IP
ifconfig eth0:233 10.xx.xx.233 netmask 255.255.255.0 up


## 解决apt依赖问题

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

### Note

一般apt依赖冲突问题都是由于系统版本与需要的包的版本不一致导致的，检查一下/etc/apt/sources.list看看是否匹配系统版本咯

用apt-get前检查一下sources.list 看与当前`lsb-release -a`是否一致

----

## UnixBench

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

参考数据，均为最低配置：主机屋1590.5；阿里云1470.4；腾讯云1156.0

### 硬盘IO性能测试

```
dd if=/dev/zero of=test bs=64k count=4k oflag=dsync
dd if=/dev/zero of=test bs=8k count=256k conv=fdatasync
```

----

## 清除内存缓存

使用`free -h`查看可用内存前可以执行这个命令，查看除去buffer后的可用内存

```
sync
echo 3 > /proc/sys/vm/drop_caches
```

----

## 使用iptables封ip

### 屏蔽单个IP

    iptables -I INPUT -s 123.45.6.7 -j DROP

### 封C段

    iptables -I INPUT -s 123.45.6.0/24 -j DROP

### 封B段

     iptables -I INPUT -s 123.45.0.0/16 -j DROP

### 封A段

    iptables -I INPUT -s 123.0.0.0/8 -j DROP

记得**保存**：

    service iptables save

## 删除一条规则

只要把上述的插入规则重写一次，将其中的-I改为-D即可

    iptables -D INPUT -s IP地址 -j DROP

如果懒得重写 你也可以先列举出规则所在的id，根据id删除：

```
iptables -L --line-numbers
```

假设你想删除INPUT链的第3条规则：

```
iptables -D INPUT 3
```

## 只允许特定IP访问某端口

iptables的插入次序很重要，先加入的会先匹配，所以拒绝策略应该最后加入

以8888端口为例，只允许10.77.88.99这个IP 和 10.22.33.0/24 这个C段访问，其他来源的访问拒绝 返回connection refused

```
iptables -A INPUT -s 10.77.88.99 -p tcp --dport 8888 -j ACCEPT
iptables -A INPUT -s 10.22.33.0/24 -p tcp --dport 8888 -j ACCEPT
iptables -A INPUT -p tcp --dport 8888 -j REJECT
```

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

## 双网卡端口转发，暴露内网端口

@TAG 端口转发

> 来自： https://yq.aliyun.com/wenzhang/show_25824

有两台机器，其中一台A 有内网和外网，B只有内网。

目标： 在外网访问A机器的2121端口，就相当于连上了B机器的ftp(21)

### 环境： 

A机器外网IP为 1.2.3.4(eth1) 内网IP为 192.168.1.20 (eth0)

B机器内网为 192.168.1.21

### 实现方法：

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

### 取消转发方法

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

## 查看CPU核心个数

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

## 非交互式添加用户

```
useradd username -m
echo username:badpassword|chpasswd
```

添加一个用户名为username的用户并创建home目录，并设置密码为badpassword

----

## 简单OpenVPN配置

一个最最简单的场景：只有一个服务器 一个客户端，在容器中用来给用户直接访问的一个内网IP

参考： https://openvpn.net/index.php/open-source/documentation/miscellaneous/78-static-key-mini-howto.html

### 安装openvpn:

Linux:

```
apt-get install openvpn
```

Windows:

[openvpn.exe](https://d.py3.io/openvpn.exe)

### 生成密钥

```
openvpn --genkey --secret static.key
```

用另外建立的安全通道(SSH)将static.key发给客户端

### 服务端配置

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

### 客户端配置

```

remote 这里是你的服务器IP 这里是你的服务器端口 udp
dev tun
ifconfig 10.8.0.2 10.8.0.1
secret static.key
```

### 在Docker中使用服务端

参考： https://raw.githubusercontent.com/kylemanna/docker-openvpn/master/bin/ovpn_run

运行容器的时候一定要给参数`--cap-add=NET_ADMIN`

另外还需要在容器中执行：

```
mkdir -p /dev/net
if [ ! -c /dev/net/tun ]; then
    mknod /dev/net/tun c 10 200
fi
```

----

## 时区时间设置

参考： http://liumissyou.blog.51cto.com/4828343/1302050

设置为上海时区 UTC+8

```
apt-get install tzdata
cp /etc/localtime /etc/localtime.bak
ln -svf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
echo "TZ='Asia/Shanghai'">>~/.bashrc
ntpdate cn.pool.ntp.org
```

修改时间可以用：

```
date -s "2017-06-18 16:40:00"
```

----

## 快速地格式化大分区ext4

Linux系统建议使用ext4分区格式，但直接mkfs.ext4 /dev/sda1就有很大的坑：会默认lazyinit在很长一段时间内占用IO

> 参考： [http://fibrevillage.com/storage/474-ext4-lazy-init](http://fibrevillage.com/storage/474-ext4-lazy-init)

适用于存储少量大文件的格式化大硬盘的方法如下，这样不会跳过初始化磁盘的过程而且初始化过程很快：

```
mkfs.ext4 /dev/sdXX -E lazy_itable_init=0,lazy_journal_init=0 -O sparse_super,large_file -m 0 -T largefile4
```

对应的[man文档](http://manpages.ubuntu.com/manpages/precise/en/man8/mkfs.ext4.8.html)

----

## 添加受信任的CA证书 mitmproxy

@TAG mitm

```
cat ~/.mitmproxy/mitmproxy-ca-cert.pem >> /etc/ssl/certs/ca-certificates.crt
```

----

## 明明还有大量空间却说没有？inode满了！挂载单个文件为btrfs分区

### 问题现象

`df -h`显示还有很多空间，但`echo test>test.txt`会显示`No space left on device`

查到这个： https://wiki.gentoo.org/wiki/Knowledge_Base:No_space_left_on_device_while_there_is_plenty_of_space_available

使用`df -i`查看inodes占用情况，发现确实100%了

### 解决方案

inodes上限在mkfs时就定下来了，不能改动，所以没救了。。。

真没救了嘛？ 当然不是，虽然不能写入大量小文件，但还是可以写一个大文件的嘛，就想到挂载单个文件为btrfs分区

#### 1. 删文件 腾出部分inodes

删掉一些不用的小文件，也不用删太多

#### 2. 创建一个1TB的sparse file

参考: https://prefetch.net/blog/2009/07/05/creating-sparse-files-on-linux-hosts-with-dd/

使用dd命令，不将实际内容写入硬盘，能很快执行完成：

```
NAME="filesystem"
dd if=/dev/zero of=${NAME}.img bs=1 count=0 seek=1T
```

执行后ls -alh能看到文件大小为1T，使用`du filesystem.img`查看真实空间

#### 3. 创建磁盘分区

参考： https://www.jamescoyle.net/how-to/2096-use-a-file-as-a-linux-block-device

btrfs参考： https://btrfs.wiki.kernel.org/index.php/Getting_started

```
mkfs.btrfs ${NAME}.img
```

#### 4. 挂载分区

```
mount ${NAME}.img /mnt
```

#### 5. 然后就可以搬运数据过去了

就用mv像往常一样搬咯

#### 一些查看空间的命令

```
# 查看磁盘文件占用空间
du -h filesystem.img
# 查看btrfs元数据占用空间
btrfs filesystem df /mnt
# 也是查看空间
btrfs filesystem usage /mnt
```

#### 6. 卸载设备

```
sudo umount /mnt
sudo losetup -d /dev/loop0
```

----

## 扩容上述单文件btrfs磁盘

@TAG 安全最佳实践

随着不停地写入数据，上面创建的1TB分区就要被写满了！但文件所在物理磁盘还有空间，我们可以这样给btrfs磁盘扩容：

实际文件用truncate增加一个hole；losetup更新loop0的大小；使用btrfs命令给分区扩容

truncate是一个危险的命令，为了避免手抖把空间写小了丢失数据，这里用`--reference`参数指定一个目标大小的文件，例如我们想扩容到1.5T=1536GB

```
dd if=/dev/zero of=temp bs=1 count=0 seek=1536G
ls -alh # 确认文件大小
truncate -r temp filesystem.img

# 假设目前使用的是/dev/loop0
# 你可以这样确认loop0确实是filesystem.img挂载的： losetup --list /dev/loop0
losetup -c /dev/loop0

# 确保目前btrfs分区是挂载着的，btrfs必须先mount才能resize
# mount filesystem.img /mnt
btrfs filesystem resize +500G /mnt
```

参考：

- https://linux.die.net/man/1/truncate
- https://askubuntu.com/questions/260620/resize-dev-loop0-and-increase-space
- https://btrfs.wiki.kernel.org/index.php/UseCases#How_do_I_resize_a_partition.3F_.28shrink.2Fgrow.29

----

## 安全地拔出移动硬盘

首先当然是`sudo umount /mnt`卸载挂载点咯，如何更安全一点呢？

```
udisksctl power-off -b /dev/sdb
```

From: https://unix.stackexchange.com/questions/354138/safest-way-to-remove-usb-drive-on-linux

----

## iptables 让监听在127.0.0.1上的端口可以公网访问

参考： https://unix.stackexchange.com/questions/111433/iptables-redirect-outside-requests-to-127-0-0-1

例如有监听在127.0.0.1:1234的应用，现在想通过ip:5678来访问

```
iptables -t nat -I PREROUTING -p tcp --dport 5678 -j DNAT --to-destination 127.0.0.1:1234
sysctl -w net.ipv4.conf.eth0.route_localnet=1
```

----

## VMWare扩容磁盘 LVM在线扩容

@TAG 虚拟机

参考： https://ma.ttias.be/increase-a-vmware-disk-size-vmdk-formatted-as-linux-lvm-without-rebooting/

https://ubuntuforums.org/showthread.php?t=2277232

修复`GPT PMBR size mismatch`用`parted -l`输入Fix即可，无需live cd

```
root@docker:/d# parted -l
Warning: Not all of the space available to /dev/sda appears to be used, you can
fix the GPT to use all of the space (an extra 314572800 blocks) or continue with
the current setting?
Fix/Ignore? Fix
Model: VMware Virtual disk (scsi)
Disk /dev/sda: 215GB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size    File system  Name  Flags
 1      1049kB  2097kB  1049kB                     bios_grub
 2      2097kB  1076MB  1074MB  ext4
 3      1076MB  53.7GB  52.6GB


Model: Linux device-mapper (linear) (dm)
Disk /dev/mapper/ubuntu--vg-ubuntu--lv: 52.6GB
Sector size (logical/physical): 512B/512B
Partition Table: loop
Disk Flags:

Number  Start  End     Size    File system  Flags
 1      0.00B  52.6GB  52.6GB  ext4


Warning: Unable to open /dev/sr0 read-write (Read-only file system).  /dev/sr0 has been opened read-only.
Model: NECVMWar VMware SATA CD00 (scsi)
Disk /dev/sr0: 875MB
Sector size (logical/physical): 2048B/2048B
Partition Table: mac
Disk Flags:

Number  Start  End    Size    File system  Name   Flags
 1      2048B  6143B  4096B                Apple
 2      659MB  662MB  2523kB               EFI


root@docker:/d# fdisk -l
Disk /dev/loop0: 91 MiB, 95408128 bytes, 186344 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/sda: 200 GiB, 214748364800 bytes, 419430400 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: C6597B3B-17F0-482A-AF5D-6056F7788052

Device       Start       End   Sectors Size Type
/dev/sda1     2048      4095      2048   1M BIOS boot
/dev/sda2     4096   2101247   2097152   1G Linux filesystem
/dev/sda3  2101248 104855551 102754304  49G Linux filesystem


Disk /dev/mapper/ubuntu--vg-ubuntu--lv: 49 GiB, 52609155072 bytes, 102752256 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
root@docker:/d# fdisk /dev/sda

Welcome to fdisk (util-linux 2.31.1).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): n
Partition number (4-128, default 4):
First sector (104855552-419430366, default 104855552):
Last sector, +sectors or +size{K,M,G,T,P} (104855552-419430366, default 419430366):

Created a new partition 4 of type 'Linux filesystem' and of size 150 GiB.

Command (m for help): t
Partition number (1-4, default 4): 4
Partition type (type L to list all types): 8e

Type of partition 4 is unchanged: Linux filesystem.

Command (m for help): w
The partition table has been altered.
Syncing disks.

root@docker:/d# partprobe -s
/dev/sda: gpt partitions 1 2 3 4
/dev/mapper/ubuntu--vg-ubuntu--lv: loop partitions 1
Warning: Unable to open /dev/sr0 read-write (Read-only file system).  /dev/sr0 has been opened read-only.
Warning: Unable to open /dev/sr0 read-write (Read-only file system).  /dev/sr0 has been opened read-only.
Warning: Unable to open /dev/sr0 read-write (Read-only file system).  /dev/sr0 has been opened read-only.
/dev/sr0: mac partitions 1 2
root@docker:/d# fdisk -l
Disk /dev/loop0: 91 MiB, 95408128 bytes, 186344 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/sda: 200 GiB, 214748364800 bytes, 419430400 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: C6597B3B-17F0-482A-AF5D-6056F7788052

Device         Start       End   Sectors  Size Type
/dev/sda1       2048      4095      2048    1M BIOS boot
/dev/sda2       4096   2101247   2097152    1G Linux filesystem
/dev/sda3    2101248 104855551 102754304   49G Linux filesystem
/dev/sda4  104855552 419430366 314574815  150G Linux filesystem


Disk /dev/mapper/ubuntu--vg-ubuntu--lv: 49 GiB, 52609155072 bytes, 102752256 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
root@docker:/d# pvcreate /dev/sda
sda   sda1  sda2  sda3  sda4
root@docker:/d# pvcreate /dev/sda4
  Physical volume "/dev/sda4" successfully created.
root@docker:/d# vgdisplay
  --- Volume group ---
  VG Name               ubuntu-vg
  System ID
  Format                lvm2
  Metadata Areas        1
  Metadata Sequence No  3
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                1
  Open LV               1
  Max PV                0
  Cur PV                1
  Act PV                1
  VG Size               <49.00 GiB
  PE Size               4.00 MiB
  Total PE              12543
  Alloc PE / Size       12543 / <49.00 GiB
  Free  PE / Size       0 / 0
  VG UUID               FJI08W-C0Db-dXmu-WPyq-Zlr9-Lejq-xadlCk

root@docker:/d# vgextend ubuntu-vg /dev/sda4
  Volume group "ubuntu-vg" successfully extended
root@docker:/d# pvscan
  PV /dev/sda3   VG ubuntu-vg       lvm2 [<49.00 GiB / 0    free]
  PV /dev/sda4   VG ubuntu-vg       lvm2 [<150.00 GiB / <150.00 GiB free]
  Total: 2 [198.99 GiB] / in use: 2 [198.99 GiB] / in no VG: 0 [0   ]
root@docker:/d# lvextend /dev/ubuntu-vg/ubuntu-lv /dev/sda4
  Size of logical volume ubuntu-vg/ubuntu-lv changed from <49.00 GiB (12543 extents) to 198.99 GiB (50942 extents).
  Logical volume ubuntu-vg/ubuntu-lv successfully resized.
root@docker:/d# resize2fs /dev/ubuntu-vg/ubuntu-lv
resize2fs 1.44.1 (24-Mar-2018)
Filesystem at /dev/ubuntu-vg/ubuntu-lv is mounted on /; on-line resizing required
old_desc_blocks = 7, new_desc_blocks = 25
The filesystem on /dev/ubuntu-vg/ubuntu-lv is now 52164608 (4k) blocks long.
```

### VMWare新添加一块硬盘扩容根目录

@TAG 虚拟机

参考这两篇：

https://www.cyberciti.biz/tips/vmware-add-a-new-hard-disk-without-rebooting-guest.html

https://www.unixmen.com/add-a-new-disk-to-lvm/

```
root@docker3:/d# for i in /sys/class/scsi_host/*; do echo "- - -" > ${i}/scan; done
root@docker3:/d# fdisk -l
Disk /dev/sdb: 1 TiB, 1099511627776 bytes, 2147483648 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes

root@docker3:/d# fdisk /dev/sdb

Welcome to fdisk (util-linux 2.31.1).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS disklabel with disk identifier 0x3289a390.

Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p):

Using default response p.
Partition number (1-4, default 1):
First sector (2048-2147483647, default 2048):
Last sector, +sectors or +size{K,M,G,T,P} (2048-2147483647, default 2147483647):

Created a new partition 1 of type 'Linux' and of size 1024 GiB.

Command (m for help): t
Selected partition 1
Hex code (type L to list all codes): 8e
Changed type of partition 'Linux' to 'Linux LVM'.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.

root@docker3:/d# pvcreate /dev/sdb1
  Physical volume "/dev/sdb1" successfully created.
root@docker3:/d# vgextend ubuntu-vg /dev/sdb1
  Volume group "ubuntu-vg" successfully extended
root@docker3:/d# pvscan
  PV /dev/sda3   VG ubuntu-vg       lvm2 [<199.00 GiB / 0    free]
  PV /dev/sdb1   VG ubuntu-vg       lvm2 [<1024.00 GiB / <1024.00 GiB free]
  Total: 2 [1.19 TiB] / in use: 2 [1.19 TiB] / in no VG: 0 [0   ]
root@docker3:/d# lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
  Size of logical volume ubuntu-vg/ubuntu-lv changed from <199.00 GiB (50943 extents) to 1.19 TiB (313086 extents).
  Logical volume ubuntu-vg/ubuntu-lv successfully resized.
root@docker3:/d# resize2fs /dev/ubuntu-vg/ubuntu-lv
resize2fs 1.44.1 (24-Mar-2018)
Filesystem at /dev/ubuntu-vg/ubuntu-lv is mounted on /; on-line resizing required
old_desc_blocks = 25, new_desc_blocks = 153
The filesystem on /dev/ubuntu-vg/ubuntu-lv is now 320600064 (4k) blocks long.

root@docker3:/d# df -h
/dev/mapper/ubuntu--vg-ubuntu--lv  1.2T  170G  986G  15% /
```

----

## 挂载多个vmdk中的LVM分区

@TAG 虚拟机 离线操作

参考： https://superuser.com/questions/1376690/how-to-mount-an-lvm-volume-from-a-dd-raw-vmdk-image

试过用windows的7z直接打开压缩包，只能看到LVM或者多个img文件，不能跳过解压步骤，所以还是在linux上挂载吧

假设有三个vmdk文件需要挂载，得到的lvm是`/dev/ubuntu-vg/ubuntu-lv`，只读挂载到`/mnt`

需要`apt install -y kpartx`

挂载 mount.sh:

```
#!/bin/bash
kpartx -a -v disk1.vmdk
kpartx -a -v disk2.vmdk
kpartx -a -v disk3.vmdk
sleep 2
pvscan
mount  -o ro /dev/ubuntu-vg/ubuntu-lv /mnt
```

取消挂载 umount.sh:

```
#!/bin/bash
umount /mnt
lvchange -an /dev/ubuntu-vg/ubuntu-lv
vgchange -an /dev/ubuntu-vg
kpartx -d disk1.vmdk
kpartx -d disk2.vmdk
kpartx -d disk3.vmdk
```

-----

## 启用rc.local

```
nano /etc/systemd/system/rc-local.service
printf '%s\n' '#!/bin/bash' 'exit 0' | sudo tee -a /etc/rc.local
chmod +x /etc/rc.local
systemctl enable rc-local
```

```
[Unit]
 Description=/etc/rc.local Compatibility
 ConditionPathExists=/etc/rc.local

[Service]
 Type=forking
 ExecStart=/etc/rc.local start
 TimeoutSec=0
 StandardOutput=tty
 RemainAfterExit=yes
 SysVStartPriority=99

[Install]
 WantedBy=multi-user.target
```

------

## apt禁用Translation

apt update的时候发现一堆翻译的条目，不想看到这些

创建/etc/apt/apt.conf.d/99translations

```
Acquire::Languages "none";
```

-------

## 开机自启动wireguard

```
systemctl enable wg-quick@wg0.service
systemctl daemon-reload
service wg-quick@wg0 start
service wg-quick@wg0 status
```

------

## 修复失败的do-release-upgrade

参考： https://www.kingsware.de/2019/01/05/repair-a-damaged-package-system-after-ubuntu-dist-upgrade/

可能的原因是使用了ppa源，而新的发行版里这些软件包已经进入官方源造成冲突

```
apt update
apt upgrade
apt dist-upgrade
apt install -f
dpkg --configure -a
apt autoremove
```

如果你需要禁用ppa源，你可以直接去删除`/etc/apt/sources.list.d`的文件，或者：

```
add-apt-repository --remove ppa:PPA_REPOSITORY_NAME/PPA-NAME
```

----

## 解决wireguard 内核模块编译失败

报错信息 `error: ‘const struct ipv6_stub’ has no member named ‘ipv6_dst_lookup_flow’`

查到这些链接： https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=959157

官方已经给出了patch： https://git.zx2c4.com/wireguard-linux-compat/commit/?id=4602590adee92557847e61c8cd14445d35fbfa2e

但是我已经从最新git下载，这个patch是已经打了的，还是同样的报错

看patch发现这个改动就是在判断内核版本，如果符合特定版本就引入`ipv6_dst_lookup_flow`的#define语句

但估计这个版本判断是不完备的，正好漏掉了当前的内核版本，所以解决方案很简单：强行把这个define加入即可

```
git clone https://git.zx2c4.com/wireguard-linux-compat
cd wireguard-linux-compat/src
echo "#define ipv6_dst_lookup_flow(a, b, c, d) ipv6_dst_lookup(a, b, &dst, c) + (void *)0 ?: dst" >> compat/compat.h
make
make install
```


