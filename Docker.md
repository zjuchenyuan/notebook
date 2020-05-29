## 搬运镜像

```
IMAGE=mysql
docker save $IMAGE | 7z a -si $IMAGE.tar.7z
7z x -so $IMAGE.tar.7z | docker load
```

## myubuntu 基础镜像

简单地将Docker当成虚拟机来使用的话，自然要准备个好用的基础镜像咯

基于目前最新的ubuntu18.04，配置apt源、pip源、ssh允许密码登录

Dockerfile:

```
FROM ubuntu:18.04
RUN sed -i 's/security.ubuntu.com/10.15.61.66/g' /etc/apt/sources.list && \
    sed -i 's/archive.ubuntu.com/10.15.61.66/g' /etc/apt/sources.list # 修改apt源
RUN apt update && apt install -y ssh curl wget net-tools iputils-ping netcat python3-pip python-pip nano vim tzdata screen
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime # 修改时区
RUN mkdir -p ~/.pip && echo '[global]\nindex-url = http://pypi.doubanio.com/simple/\n[install]\ntrusted-host=pypi.doubanio.com\n'>  ~/.pip/pip.conf
RUN sed -i 's/prohibit-password/yes/g' /etc/ssh/sshd_config && sed -i 's/#PermitRootLogin/PermitRootLogin/g' /etc/ssh/sshd_config # 允许root用户密码登录
RUN echo root:badpassword|chpasswd # 记得修改这里的密码
ADD run.sh /
RUN chmod +x /run.sh
CMD /run.sh
```

run.sh:

```
#!/bin/bash
service ssh start
# 在容器内安装了mysql等之后可以在run.sh这里添加相应的启动命令
sleep infinity
```

build命令：

```
docker build -t myubuntu18 .
```

## Install 安装

建议参见[如何翻墙](https://github.com/zjuchenyuan/notebook/blob/master/code/ssprivoxy.txt)，部署http proxy

安装之前，建议修改apt源

安装之前，或许要对内核升级，如果执行安装脚本发出了对aufs的警告，请先看下面的 _解决aufs的问题_

安装命令： 

    curl -fsSL get.docker.com -o get-docker.sh
    sh get-docker.sh --mirror Aliyun

其中最后一步的apt-get install docker-engine耗时较长，看起来很像卡死，需要耐心等待

安装后执行docker version，没有报错即可

### 解决aufs的问题

```
apt-get install lxc wget bsdtar curl
apt-get install linux-image-extra-$(uname -r)
modprobe aufs
```

--------

## 加速镜像下载

> 在执行以下操作之前，请检查docker的版本：`docker -v`

> 如果你的docker版本为1.6.2,请参考下方 卸载docker

## 建议使用阿里云的镜像源

```
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://h0kyslzs.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

另外你也可以使用USTC的镜像源：参考 https://lug.ustc.edu.cn/wiki/mirrors/help/docker

-------

### Docker旧版本卸载

如果你的docker是使用apt-get install docker.io安装的，请先执行以下命令卸载：

    apt-get remove docker.io
    apt-get autoremove
    rm -rf /var/lib/docker

然后就可以执行安装命令了

--------

## 获得容器的ip

```
alias getip="docker inspect  --format '{{.NetworkSettings.IPAddress}}' "

getip 容器名称
```

--------

## 导出导入

### 搬运镜像--save导出镜像

由于网络带宽(流量)往往是瓶颈资源，所以产生更小的压缩文件很有必要，这里我们可以生成 tar.7z 文件：`apt-get install -y p7zip-full`

    docker save 镜像名称 | 7z a -si 导出文件名.tar.7z

这是生成tar.gz文件：

    docker save 镜像名称 | gzip >导出文件名.tar.gz

### 搬运镜像--load载入镜像

如果是 tar.7z 文件，需要调用 7z 命令解压：

    7z x -so 文件名.tar.7z | docker load

如果是 tar.gz 文件，可以直接载入：

    docker load < 文件名.tar.gz

### Export导出容器 并不常用

直接导出容器并不常用，建议`docker commit 容器名称 保存成的镜像名称`，然后导出镜像

导出容器得到的是tar文件，没有进行压缩，我们需要手动执行压缩

    docker export 容器的名称或ID | gzip >导出文件名.tar.gz

### Import导入容器

虽然上一步我们压缩了，但docker可以直接import，不需要用gunzip

    docker import 文件名

--------

## 解决iptables failed - No chian/target/match by that name

如果docker安装的时候没有自动把需要的规则链加上，可以手动添加

    iptables -t nat -N DOCKER
    iptables -t filter -N DOCKER

附：如果需要删除链条，可以用`iptables-save`导出后手动编辑后`iptables-restore`

--------

## 迁移Docker文件夹到其他硬盘

当镜像多了起来的时候，/var/lib所在的磁盘分区很可能被占满，这时候要考虑迁移到其他硬盘，此处以迁移到`/home/docker`为例说明

```bash
# 首先记得关闭服务
service docker stop
mv /var/lib/docker /home/
# 然后修改服务配置文件/etc/default/docker，此处建议手动vim编辑，在启动参数中加入这个：
#    --graph='/home/docker'
echo -e "\nDOCKER_OPTS=\"--graph='/home/docker'\"" >> /etc/default/docker
```

----

## 解决debian等容器没有ifconfig,killall的问题

```
apt-get install net-tools psmisc
```

----

## 设置容器低权限用户运行

在Dockerfile中加入

```
User nobody
```

容器运行后exec进去默认是nobody用户，并不能su啥的，这时候exec需要带参数-u表示用指定用户身份进入容器：

```
docker exec -i -t -u root 容器名称 /bin/bash
```

----

## 设置容器/etc/resolv.conf和/etc/hosts

在容器中这两个文件是以mount形式挂载的，不能unmount；即使进行修改，容器重启后修改就丢失了

其实这两个文件应该在容器创建的时候指定参数`--dns`和`--add-host`来加以控制：

```
docker run -d --dns 114.114.114.114 --add-host example.com:1.2.3.4 容器名称
```

----

## 容器限制参数设置

当容器是开放给不可信域的时候(如部署一个CTF的pwn题目)，虽然容器逃逸0-day我也没办法，但限制一下容器资源占用防止搅屎也是很有必要的

```
--cpu-shares 512 --cpu-period=100000 --cpu-quota=50000 --memory 104857600 --ulimit=nofile=65536 --pids-limit=200 --blkio-weight=512 --restart="always"
```

效果简介：如上配置最多占用 50% 单个 CPU ，最多占用100MB物理内存，容器内进程数目最多200个

`--cpu-shares`表示相对利用占比，不设置的默认值为1024，单个CPU是1024，只有当容器试图占用100%的CPU时才会体现作用，举个例子：

> From: http://blog.opskumu.com/docker-cpu-limit.html
> 假如一个 1core 的主机运行 3 个 container，其中一个 cpu-shares 设置为 1024，而其它 cpu-shares 被设置成 512。当 3 个容器中的进程尝试使用 100% CPU 的时候「尝试使用 100% CPU 很重要，此时才可以体现设置值」，则设置 1024 的容器会占用 50% 的 CPU 时间，其他两个容器则只能分别占用到 25% 的 CPU 时间。
> 如果主机是 3core，运行 3 个容器，两个 cpu-shares 设置为 512，一个设置为 1024，则此时每个 container 都能占用其中一个 CPU 为 100%。

`--cpu-period`表示按多少秒分片，例如设置为100000就是按100ms分割，同时设置`--cpu-quota`为50000就是50ms，效果是同时只能使用0.5个CPU

`--memory`限制容器使用的物理内存，当容器超出时，其中的进程会被kill，详细请参考http://blog.opskumu.com/docker-memory-limit.html

`--blkio-weight`表示IO相对权重，详细请参考[http://blog.opskumu.com/docker-io-limit.html](http://blog.opskumu.com/docker-io-limit.html)

----

## 快速部署ftp

vsftpd的配置真是让人头疼，不如`docker search ftp`一番，然后google一下找到对应的Docker Hub页面

https://hub.docker.com/r/stilliard/pure-ftpd/

使用步骤：

```
docker run -d --name ftpd_server -p 21:21 -p 30000-30009:30000-30009 -e "PUBLICHOST=localhost" -v /path/to/the_ftp_directory:/data stilliard/pure-ftpd:hardened
docker exec -it ftpd_server /bin/bash
#进入容器后创建用户
pure-pw useradd bob -f /etc/pure-ftpd/passwd/pureftpd.passwd -m -u ftpuser -d /data
```

----

## 快速部署wordpress

想搭建一个自己的blog，选择玩一玩wordpress咯，这里记录一下完整的流程和遇到的问题及解决方案(Google在手 天下我有)

技术相关： Docker Nginx HTTPS 

目标： 快速搭建一个全站https的wordpress站点，域名为example.com

### 完整流程：

1. 前期准备:域名+vps

注册域名 如果面向国内访问，还需要备案咯； 别忘了配置DNS解析；

买个vps服务器，建议选择香港vps

{:start="2"}
2. 安装Docker和Nginx，都是一条命令的事情

```
curl -sSL https://get.docker.com/ | sh
apt-get install nginx
```

{:start="3"}
3. 启动一个mysql的镜像：

```
# Google搜索关键词 "docker mysql"
docker run --name mysql -e MYSQL_ROOT_PASSWORD=这里改成你想设置的密码 -d mysql
# Google搜索关键词 "docker wordpress"
docker run --name wp --link mysql:mysql -p 6666:80 -d wordpress
```

{:start="4"}
4. 域名https证书获取以及启用https访问，此部分具体见[Nginx.md](Nginx.md)中`获得Let's encrypt免费https证书`和`配置安全的https`部分

5. 配置Nginx，完整配置如下：

```
server{
    server_name *.example.com example.com;
    location /.well-known/acme-challenge { #这是let's encrypt申请证书的时候用到的目录
        alias /tmp/acme/;
        try_files $uri =404;
    }
    location /{
        rewrite ^ https://$host$request_uri? permanent;
    }
}
server{
    server_name *.example.com example.com;
    include https.conf;
    access_log /var/log/nginx/example_access.log;
    error_log /var/log/nginx/example_error.log;
    ssl_certificate /home/keys/example.crt;
    ssl_certificate_key /home/keys/example.key;
    location / {
        proxy_pass http://127.0.0.1:6666;
        proxy_set_header Host $host;
        proxy_set_header Accept-Encoding ""; #禁止后端返回gzip内容，保证能够替换
        sub_filter_once off; #多次替换 不只是替换一次
        sub_filter "http://www.example.com" "https://www.example.com";
    }
}
```

### 遇到的坑

1. docker run的时候忘记-p参数

建议还是把端口映射出来，在容器重启后容器的内网IP是会发生变化的，不适合将172.17.0.*这种IP写入nginx配置

此时我选择了`docker rm -f 容器ID`强制删掉容器，再用加上了-p参数启动了一个

{:start="2"}
2. 全站https

虽然我的https.conf中定义了HSTS，浏览器也确实会把所有的请求都自动用https协议访问，但是还是由于form的action为http协议而警告不安全(在Chrome开发人员工具的Console看到)，也没有小绿锁显示。所以要保证服务器输出给浏览器的内容就是https的链接

一开始选择了官方wordpress的方法(Google关键词"wordpress https")，结果导致了下文第三点的折腾

最终选择的方案是在nginx反向代理的时候替换文本内容，使用sub_filter这个模块进行文本内容替换

遇到了问题，这个sub_filter不起作用，(Google关键词 "sub_filter not working")原因是容器返回的内容启用了gzip，无法替换，方法是加入一行配置禁止容器的Apache使用gzip: proxy_set_header Accept-Encoding "";

参考：

http://stackoverflow.com/questions/31893211/http-sub-module-sub-filter-of-nginx-and-reverse-proxy-not-working

{:start="3"}
3. 由于在后台修改了Wordpress Address和Site Address改为https的链接，导致后台无法打开，重定向死循环

解决方案是进入mysql容器手动修改，把进行的修改改回去

问题在于我也并不知道改了啥，在终端mysql`select * from wp_options;`有些行太长导致关键内容刷屏而过，不方便查看表

我的方法是先`mysqldump -p密码 wordpress >test.sql`，再用nano打开test.sql，用Ctrl+W搜索https（Google关键词"nano search"），把对应的地方找到改回http，保存后用`mysql -p密码 wordpress < test.sql`导入数据库 完事~

----

## Dockerfile 中的 apt-get

为了让 apt-get 顺利静默执行，需要配置环境变量防止交互：

```
DEBIAN_FRONTEND=noninteractive apt-get install -y ...
```

----

## 让Docker容器得到内网IP

这里的内网不是只有主机可以访问的容器Docker内网，而是主机接入的企业内网这种；如果你能直接通过设置IP获得公网IP，当然按照这个方法也能给容器分配公网IP

注意：此方法Docker容器虽然获得了和主机地位相同的IP，但容器无法使用主机的IP与主机通讯，主机好像也不能访问容器的IP，这是Linux内核为了隔离性和安全性做出的限制

参考： 

> [不用端口转发给容器分配公网IP地址 ASSIGN PUBLIC IP ADDRESS TO DOCKER CONTAINER WITHOUT PORT BINDING.](https://micropyramid.com/blog/assign-public-ip-address-to-docker-container-without-port-binding/)

> [Macvlan and IPvlan basics](https://sreeninet.wordpress.com/2016/05/29/macvlan-and-ipvlan/)

> [Docker Networking Tip – Macvlan driver](https://sreeninet.wordpress.com/2017/08/05/docker-networking-tip-macvlan-driver/)

> [PPT Docker Networking - Common Issues and Troubleshooting Techniques](https://www.slideshare.net/SreenivasMakam/docker-networking-common-issues-and-troubleshooting-techniques)

做法也很简单，首先创建一个Macvlan类型的docker网络，然后在创建容器的时候加入这个网络并指定IP/不指定则自动分配

例子：主机（网卡eth0）的IP为10.1.1.2，网关为10.1.1.1，主机所处的IP段是10.1.1.1/24，在该网段内主机可以任意获得IP，我们希望容器分配在10.1.1.65~10.1.1.126之间 （即 10.1.1.64/26）

附： [这是一个输入Network 10.1.1.64/26转换为HostMin 10.1.1.65~ HostMax 10.1.1.126的计算器](http://jodies.de/ipcalc?host=10.1.1.64&mask1=26&mask2=)


```
docker network create -d macvlan -o macvlan_mode=bridge -o parent=eth0 --subnet=10.1.1.0/24 --ip-range=10.1.1.64/26 --gateway=10.1.1.1 macvlan_network

docker run --net=macvlan_network --ip=10.1.1.100 -d nginx
```

现在你可以访问 `http://10.1.1.100` 来看到nginx的欢迎页面了，你需要在内网另一台机器上访问（我的发现是主机和这样分配的容器是不互通的）

### 一点额外的警告

启动容器时可以不指定ip让docker自动分配，警告：如果没有配置ip-range参数，有可能被分配的恰好是主机本身的IP，这种情况将导致主机丢失IP无法联网！

万一发生这种虚拟机把主机的IP抢占的情况，在没有物理控制方法下不可轻易使用ifconfig修改主机IP，因为一旦使用ifconfig主机的route将被清空、当前主机的其他IP也会丢失，你就丢失远程访问的可能了（也许你可以写一个脚本自动恢复route稳妥一点）；但神奇的是即使主机route已经丢失，按照上述macvlan开出来的Docker容器仍然在线（也可以理解——容器的route并没有受到影响，类似于Virtualbox的桥接网卡方式）

### macvlan查看已经分配的IP

由于主机和容器不能互通，所以主机如何得知目前已经分配的IP列表呢？用docker network inspect咯，然后用python处理一下输出格式

下面这个命令列出了容器IP和容器名称：

```
docker network inspect macvlan_bridge --format "{{range .Containers}}{{.IPv4Address}}@{{.Name}},,,{{end}}" | python3 -c 'print(input().replace("/24@","\t").replace(",,,","\n"),end="")'|sort
```

如果只需要IP列表：

```
docker network inspect macvlan_bridge --format "{{range .Containers}}{{.IPv4Address}},{{end}}" | python3 -c 'print(input().replace("/24,","\n"),end="")'|sort
```

### 主机访问macvlan的容器

由于内核限制并不支持host直接使用上述指定的ip访问容器，而docker network connect让容器再加入一个网络又会改变容器的默认路由，但我就是想让主机能访问到容器，咋办哩？

参考：http://blog.oddbit.com/2018/03/12/using-docker-macvlan-networks/

想访问的容器IP为10.1.1.66，这种方法需要让主机再获得一个IP，例如10.1.1.3。注意这种配置是不持久的，重启后丢失

```
DEVICE_NAME="eth0"
NAME="mynet-shim"
HOST_GETIP="10.1.1.3"
TARGET_IP="10.1.1.66"

ip link add $NAME link $DEVICE_NAME type macvlan  mode bridge
ip addr add $HOST_GETIP/32 dev $NAME
ip link set $NAME up
ip route add $TARGET_IP/32 dev $NAME
```

----

## 使用iptables端口转发让Docker容器得到内网IP

上述基于macvlan的方法容器无法与主机通讯，所以下述基于iptables端口转发的方法更胜一筹

这种方法基于主机自己去获得一个额外的内网ip后，用iptables端口转发来实现给容器内网IP的效果，容器应用可以得到请求源IP，但容器向外发起的tcp请求还是主机自身的默认IP

该脚本运行时需要两个参数 第一个为容器名称 第二个为新的IP后缀

举个例子 主机在10.12.34.x这个内网地址段 且可以随意得到这个地址段的内网IP，现在要给mysql容器10.12.34.202这个IP，运行方式就是`./give_container_ip.sh mysql 202`

记得修改下面的IPPREFIX和ETH0变量！

### give_container_ip.sh

```
#!/bin/bash
set -ex
shopt -s expand_aliases

if [ -z $1 ] && [ -z $2 ]; then
    echo "Usage: $0 <container name> <new IP suffix>"
    echo "Example: $0 u202 202"
    exit 1
fi

alias getip="docker inspect  --format '{{.NetworkSettings.IPAddress}}' "

IPPREFIX="10.12.34."
ETH0="eth0"
sudo ifconfig $ETH0:$2 $IPPREFIX$2 netmask 255.255.255.0 up
sudo iptables -t nat -I PREROUTING -d $IPPREFIX$2 -p tcp -j DNAT --to `getip $1`
sudo iptables -t nat -I POSTROUTING -s `getip $1`/32 -d `getip $1`/32 -p tcp -m tcp -j MASQUERADE
```

为什么最后用MASQUERADE而不用SNAT呢？因为用SNAT容器的应用就不能得到请求的源IP，在实际应用中是无法接受的；这一条iptables规则是我用`docker run -p`和`iptables-save`得到的

----

## 对容器网络流量tcpdump

Learned from: https://www.slideshare.net/SreenivasMakam/docker-networking-common-issues-and-troubleshooting-techniques


```
docker run -ti --net container:<containerid> nicolaka/netshoot tcpdump -i eth0 -n port 80
```

举个例子，上述启动了nginx容器并分配了内网ip 10.1.1.100，我们来收集80端口的流量，并保存到/tmp/pcapfiles/nginx.pcap文件：

```
docker run -ti --net container:f5fc -v /tmp/pcapfiles:/data nicolaka/netshoot tcpdump -i eth0 -n -s0 -w /data/nginx.pcap port 80
```

[查看对应的tcpdump文档](http://explainshell.com/explain?cmd=tcpdump%20-i%20eth0%20-n%20-s0%20-w%20/data/nginx.pcap%20port%2080)

----

## 修改正在运行的容器的重启策略

docker run的时候忘了指定restart=always，除了commit后再正确地run一遍之外有没有更加优雅的修改容器参数的方法呢？

参考： https://stackoverflow.com/questions/26852321/docker-add-a-restart-policy-to-a-container-that-was-already-created

在1.11版本后有了`docker update`这个命令，可以修改正在运行的容器的参数，如CPU限制、内存限制 和 重启策略

使目前运行的所有容器都设置为自动重启：

```
docker update --restart=always `docker ps -q`
```

如果要取消这个自动重启，改为--restart=no即可

----

## 快速部署samba

镜像地址：[dperson/samba](https://hub.docker.com/r/dperson/samba/)

快速分享一个目录/data，用户名user密码badpassword：

```
docker run -d -p 139:139 -p 445:445 --name samba -v /data:/data dperson/samba -u "user;badpassword" -s "data;/data;yes;no;no;all"
```

其中-u指定用户名密码；-s参数的格式为：

给访问者看的分享名称;物理位置;是否列出;未登录可否访问;允许访问的用户(all表示所有用户)

----

## [CTF]按需分配容器 过期自动销毁

有些题目需要给每个人单独的容器，为了节约资源还需要设置一个时间，过期后自动删除容器

为了防止滥用还要引入Proof Of Work，回答正确后才分配容器

该代码直接用的docker命令来创建容器，且需要root权限，注意使用上的安全风险

代码如下：`utils.py`

```python
#/usr/bin/python3
#coding:utf-8
import subprocess
import time
import string
import os
import hashlib
import random
from random import randint

# 限时设定
def clock(timeout=5):
    import signal
    def signal_handler(signum,data):
        if signum == signal.SIGALRM:
            print("Time is up!")
            exit()
    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(int(timeout))

# 生成随机字符串
def randomstring(len=5):
    return ''.join(random.sample(string.ascii_letters,len))

# 计算md5
def md5(src):
    return hashlib.md5(bytes(src,encoding='utf-8')).hexdigest()

# 显示一个随机字符串，要求用户计算其md5
def pow_calcmd5():
    question = randomstring()
    answer = md5(question)
    print("Please calculate md5(%s)="%question,end='')
    if input()!=answer:
        exit()

# 显示一个随机字符串，要求用户输入另一个字符串满足md5以difficulty个0开头
def pow_realmd5(difficulty=4):
    question = randomstring()
    print("[Proof Of Work]")
    print("Please calculate s, make that \n    md5(\"%s\"+s).startswith('%s')"%(question,'0'*difficulty))
    print("Input your s:",end='')
    s = input()
    if not md5(question+s).startswith('0'*difficulty):
        exit()

# 从镜像启动容器
def start_container(image, port, paramstring):
    """
    image:镜像名称
    port: 需要映射的端口
    paramstring: 额外的参数设置字符串 如"-v /d/blabla:/data"
    
    返回(容器ID, 映射得到的端口)
    """
    container = subprocess.check_output("docker run -d -p :"+str(port)+" "+paramstring+" "+image+" /run.sh",shell=True).decode().replace("\n","")
    inspect = subprocess.check_output("docker inspect --format '{{.NetworkSettings.Ports}}' %s"%container,shell=True).decode().replace("\n","")
    openport = inspect.split("{")[1].split()[1].split("}")[0]
    return (container, openport)

# 计划在minutes分钟后销毁容器container 需要atd服务
def plan_stop_container(container, minutes):
    PATH = os.getcwd()
    minutes = str(minutes)
    filename = "%s_%d"%(time.strftime("%Y_%m_%d_%H_%M_%S"),randint(0,666))
    open(PATH+"/"+filename,"w").write("docker kill %s && docker rm %s && rm %s/%s"%(container,container,PATH,filename))
    subprocess.check_output("at now + %s minutes -f %s 2>/dev/null"%(minutes,filename),shell=True)

# 生成一个runner的二进制程序，xinetd并不支持直接运行python
if __name__ == "__main__":
    print("[*] writing to runner.c")
    path = os.getcwd()
    open("runner.c","w").write("""#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
int main(){
   chdir("%s");
   system("python3 %s/runner.py");
   return 0;
}
"""%(path, path))
    print("[*] compile runner.c to runner")
    os.system("gcc runner.c -o runner")

```

用到的xinetd配置：`runner.conf`，注意保存的时候不能有\r `:set ff=unix`

```
service 题目名称
{
    socket_type = stream
    protocol    = tcp
    wait        = no
    user        = root
    bind        = 0.0.0.0
    server      = /绝对路径/runner
    type        = UNLISTED
    port        = 端口号
    disable = no
}
```

----

## 在容器A中使用别名访问容器B

容器A是web应用，需要访问redis的容器B，如果用docker inspect拿到现在容器B的IP写入到配置，一旦docker重启这个容器IP就会发生变化

更好的方式是使用docker的自定义网络：创建网络-把redis加入网络-把app加入网络

```
docker network create useredis
docker network connect --alias redis useredis redis
docker network connect --alias app useredis app
```

在加入网络的时候指定--alias即可，网络中的其他容器就能通过这个alias访问到，这样操作后app容器里面就能ping redis了

----

## 修复Docker更新到18.02后部分容器无法start的问题

apt说可以更新，于是就更新了，然而却悲催地发现部分容器无法启动，报错信息：

```
docker start <container_name> returns "container <hash> already exists"
```

Google找到了相关issue在这里→https://github.com/moby/moby/issues/36145

不删容器重建、不回滚Docker的紧急解决方案为：

```
sudo docker-containerd-ctr --namespace moby --address /run/docker/containerd/docker-containerd.sock c rm `docker inspect --format '{{.Id}}' 无法启动的容器名称`
```

注意需要输入的是那个很长的容器id，所以先用docker inspect获取其长Id

如果docker-containerd-ctr 不存在，也许你使用的是Docker for mac，需要这么操作：

```
docker run -it --rm -v /:/host alpine /host/usr/local/bin/docker-containerd-ctr  --namespace moby --address /host/run/docker/containerd/docker-containerd.sock c rm 出错的容器id
```

----

## 解决docker exec -it进入容器屏幕大小不对的问题

发现docker exec -it进入容器的bash后tty的大小不对 只有80x24，参考这个 https://github.com/moby/moby/issues/35407

解决方案：在进入容器时配置环境变量COLUMNS和LINES为正确值即可，为了便于操作与记忆，写~/.bashrc咯：

```
function din(){
    docker exec -ti --env COLUMNS=`tput cols` --env LINES=`tput lines` $1 /bin/bash
}
alias din=din
```

使用的时候只需要`din 容器名称`就能进入容器bash啦，这样进入容器vim也能全屏幕显示了

----

## 不使用docker pull也能下载到镜像

**该脚本存在问题，下载到的镜像层无法导入，仍待研究**

github上官方有下载脚本：https://github.com/moby/moby/blob/master/contrib/download-frozen-image-v2.sh

使用的时候第一个参数是目录名称，第二个是镜像名称:latest，其中:tag是必须要写的

下述命令下载脚本，替换为从阿里云下载，最后打包成golang.tar （由于下载到的layer的tar包已经是gzip压缩过的 没必要再7zip压缩）

```
wget https://raw.githubusercontent.com/moby/moby/master/contrib/download-frozen-image-v2.sh
sed -i 's/registry-1.docker.io/h0kyslzs.mirror.aliyuncs.com/g' download-frozen-image-v2.sh
sed -i 's/token="$(/token="" #/g' download-frozen-image-v2.sh
chmod +x download-frozen-image-v2.sh
./download-frozen-image-v2.sh /tmp/golang google/golang:latest
tar -vf golang.tar -cC '/tmp/golang' . 
```

然后就可以传输golang.tar，导入方法很简单

```
docker load < golang.tar
```

----

## 启动另一个Docker Daemon进程

有时候需要进行build操作，发现根目录剩余空间不够了，但另外一块硬盘还有空间，整体迁移/var/lib/docker或合并两个硬盘为lvm又不现实，这时就可以开启一个新的Docker Daemon，把Docker使用的目录设置为另一块硬盘

参考：http://blog.alpaca.ai/run-multiple-docker-daemons-with-net-container/

docker工作目录假设为/home/cy/docker

第一次执行：

```
OFFSET=0
u="cy"
BRIDGE_NAME=br_${u}
DOCKER_ROOT=/home/${u}/docker
mkdir -p ${DOCKER_ROOT}
brctl addbr ${BRIDGE_NAME}
SUBNET=$(expr 52 + ${OFFSET})
ip addr add 172.18.${SUBNET}.1/24 dev ${BRIDGE_NAME}
ip link set dev ${BRIDGE_NAME} up
iptables -t nat -A POSTROUTING -j MASQUERADE -s 172.18.${SUBNET}.0/24 -d 0.0.0.0/0
```

运行dockerd执行：

```
u="cy"
BRIDGE_NAME=br_${u}
DOCKER_ROOT=/home/${u}/docker
      dockerd -D \
        -g ${DOCKER_ROOT}/g \
        --exec-root=${DOCKER_ROOT}/e \
        -b ${BRIDGE_NAME} \
        --dns=8.8.8.8 \
        --iptables=true \
        -H unix://${DOCKER_ROOT}/docker.sock \
        -p ${DOCKER_ROOT}/docker.pid
```

----

## 配置使用Docker版本的Gitlab CI

参考文档：
官方教程 https://docs.gitlab.com/runner/
高级配置 https://docs.gitlab.com/runner/configuration/advanced-configuration.html

人家这东西本质上是一个docker容器，但是把主机的docker sock传入到容器中，所以容器内可以创建容器

我这里的教程着重解决两个问题：使用自定义的镜像，设置DNS

### 第一步当然是pull人家的runner镜像咯

```
docker pull gitlab/gitlab-runner
```

### 第二步 获取CI连接时需要的token

在管理员界面 Overview下Runners点开即可看到 

网址： /admin/runners

### 第三步 注册以生成初始的配置信息

参考https://docs.gitlab.com/runner/register/index.html#docker

假设容器配置文件保存在/dockerfiles/gitlabrunner中，其中docker-image是默认跑任务的镜像

```
docker run --rm -t -i -v /dockerfiles/gitlabrunner:/etc/gitlab-runner --dns 10.0.0.1 gitlab/gitlab-runner  register  --non-interactive \
  --url "https://gitlab.com/" \
  --registration-token "上一步获得的token" \
  --executor "docker" \
  --docker-image myubuntu:latest \
  --description "docker-runner" \
  --run-untagged \
  --locked="false"
```

### 第四步 修改配置文件

参考高级配置 https://docs.gitlab.com/runner/configuration/advanced-configuration.html
和 https://docs.gitlab.com/runner/executors/docker.html#how-pull-policies-work

```
cd /dockerfiles/gitlabrunner #你的配置文件目录
sudo vim config.yml
```

为了跑本地已经存在的镜像（默认为always表示只能跑dockerhub上的），在[runners.docker]中需要添加：

```
pull_policy = "never"
```

或者这里你也可以使用"if-not-present" 不存在就pull

另外 如果需要修改容器DNS，也添加进去即可

```
dns = ["10.0.0.1"]
```

### 第五步 启动runner容器

如果需要改dns，这里也别忘记写上

```
docker run -d --name gitlab-runner --restart always \
  -v /dockerfiles/gitlabrunner:/etc/gitlab-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --dns 10.0.0.1 \
  gitlab/gitlab-runner:latest
```

### 第六步 创建一个新的repo来测试一下吧

新建`.gitlab-ci.yml`文件，这里使用自己编译的myubuntu镜像

```
image: myubuntu:latest
test:app:
  script:
  - echo ok
  - curl ip.cn
```

然后在gitlab的仓库页面 最新的一次commit message右侧就有CI成功与否状态的图标 点进去看详细日志咯

----

## 为已经存在的容器创建临时端口映射 socat

出于学习目的，想快速地建立一下临时的Docker容器端口映射

用socat咯：

```
socat TCP4-LISTEN:9300,fork TCP4:172.17.0.3:9300
```

如果没有socat，可以：

```
docker run -ti --rm --net host bobrik/socat TCP4-LISTEN:9300 TCP4:172.17.0.3:9300
```

----

## 查看所有容器内存占用 并排序

`docker stats`就能看到实时更新的结果，但并没有提供排序功能

```
docker stats --no-stream|sort -h -r -k 4,4
```

排序列对应关系如下：

|列号|列名|
|---|---|
|3|CPU|
|4|内存|
|8|网络流入|
|10|网络流出|
|11|文件写入|
|13|文件读取|
|14|容器内线程数量(PID数)|

----

## 运行中的容器添加目录挂载

Docker自身只允许在创建容器的时候指定-v进行目录挂载，怎么在不停止容器的情况下增加挂载呢？

注意此方法在容器重启后即失效，需要重新挂载

参考：https://medium.com/kokster/mount-volumes-into-a-running-container-65a967bee3b5

方法是把块设备挂载到容器中，然后可以使用bind mount

假设容器名称为app_container，需要挂载/dev/sdb1这个设备，命令如下：

Step1: 首先要查看设备id以便在容器中mknod创建设备，然后使用nsenter使用主机的权限挂载设备

Step2: 现在就可以在容器中使用/tmpmount读取到设备了，但如果我们只需要挂载其中一个文件夹 例如设备的data文件夹挂载到容器的/newdata，还可以继续执行：

Step3: 最后清理掉临时挂载的/tmpmount 不会影响bind mount挂载出来的/newdata

```
CONTAINER_NAME="app_container"
DEVICE_NAME="/dev/sdb1"
MOUNT_SRC="data"
MOUNT_TARGET="/newdata"

# Step1
x=$(grep $DEVICE_NAME /proc/self/mountinfo|cut -d ' ' -f 3)
docker exec -it -u root $CONTAINER_NAME sh -c "[ -b $DEVICE_NAME ] || mknod -m 0600 $DEVICE_NAME b ${x/:/ }"
sudo nsenter --target "$(docker inspect --format '{{.State.Pid}}' $CONTAINER_NAME)" --mount --uts --ipc --net --pid --  sh -c "mkdir -p /tmpmount;mount $DEVICE_NAME /tmpmount"

# Step2
sudo nsenter --target "$(docker inspect --format '{{.State.Pid}}' $CONTAINER_NAME)" --mount --uts --ipc --net --pid -- sh -c "mkdir -p $MOUNT_TARGET; mount -o bind /tmpmount/$MOUNT_SRC $MOUNT_TARGET"

# Step3
sudo nsenter --target "$(docker inspect --format '{{.State.Pid}}' $CONTAINER_NAME)" --mount --uts --ipc --net --pid -- sh -c "umount /tmpmount"
```

----

## Docker使用32位镜像

例如ubuntu16.04.5 32位镜像 从这里下载i386后缀的`ubuntu-base-16.04.5-base-i386.tar.gz`：

http://cdimage.ubuntu.com/ubuntu-base/releases/16.04/release/

下载了之后直接交给docker导入即可：[docker import 文档](https://docs.docker.com/engine/reference/commandline/import/#examples)

```
cat ubuntu-base-16.04.5-base-i386.tar.gz|docker import - ubuntu1604_32bit
```
----

## 找到/var/lib/docker中容器的数据存储目录

使用[docker-backup](https://github.com/vincepare/docker-backup):

```
curl -Lo /usr/local/bin/docker-backup https://raw.githubusercontent.com/vincepare/docker-backup/master/docker-backup.sh && chmod +x /usr/local/bin/docker-backup

docker-backup ls -w container
```

举个例子 Apache容器由于/tmp/httpd_lua_shm.1的存在跑不起来，试试直接删除容器内的这个文件

```
for i in `d ps -a|grep Exit|grep minutes|awk '{print $1}'`; do rm `docker-backup ls -w $i`/tmp/httpd_lua_shm.1; d start $i ; done
```

------

## 搬运服务器后网段变化 直接修改Docker底层数据库和配置文件修复macvlan网络

需求：服务器机房搬迁，从10.214.10.x变为10.214.160.x，配置的macvlan容器就不能访问了

Docker没有提供修改网络配置的方法，我们就直接改Docker的数据库和配置文件呗

不这样直接改底层文件也是可以的，需要先disconnect旧的macvlan所有容器，然后删掉重建这个network，再一个个加回来

网络配置的数据库在`/var/lib/docker/network/files/local-kv.db`，本质上是boltdb，需要使用docker的[libkv](https://github.com/docker/libkv)来进行访问

注意到ip前缀的长度发生了变化，直接sed是不行的，会损坏数据库（如果长度没变可以直接sed），操作前记得备份

参考 https://blog.qiqitori.com/?p=463

加以修改，需要在`docker pull golang:1.8`中编译运行

```
package main

import (
    "time"
    "log"
    "strings"
    "github.com/docker/libkv"
    "github.com/docker/libkv/store"
    "github.com/docker/libkv/store/boltdb"
)

func init() {
    // Register boltdb store to libkv
    boltdb.Register()
}

func main() {
    client := "./local-kv.db" // ./ appears to be necessary

    // Initialize a new store
    kv, err := libkv.NewStore(
        store.BOLTDB, // or "boltdb"
        []string{client},
        &store.Config{
            Bucket: "libnetwork",
            ConnectionTimeout: 10*time.Second,
        },
    )
    if err != nil {
        log.Fatalf("Cannot create store: %v", err)
    }

    pair, err := kv.List("docker/network")
    for _, p := range pair {
        println("key:", string(p.Key))
        val := strings.Replace(string(p.Value), "10.214.10.", "10.214.160.", -1)
        println("value:", val)
        err = kv.Put(p.Key, []byte(val), nil)
    }
}
```

其中需要注意golang1.8的strings没有ReplaceAll方法；string转bytes数组用`[]byte(...)`即可；`println`不是fmt库的，是往stderr输出的

除了网络数据库还需要修改容器的.json配置文件：`/var/lib/docker/containers/*/*.json`

```
sed -i 's/10.214.10./10.214.160./g' /var/lib/docker/containers/*/*.json
```

然后就能启动docker了，如果有容器的当前ip已经被其他设备占用，可以通过脱离网络再加入来修改ip

```
docker network disconnect macvlan_name container_name
docker network connect macvlan_name container_name --ip 新的ip
```

如果新的ip还是ping不了，试试重启容器

## 获取2个月前退出的容器列表，以空格分隔

```
docker ps -a --format '{{.Names}} {{.Status}}'|grep "2 month"|awk '{print $1}'|tr '\r\n' ' '
```

## 获取容器的IP

```
# clean version
docker inspect --format "{{.NetworkSettings.Networks.macvlan网络名称.IPAddress}}" 容器名称

# dirty but quick version
docker inspect 容器名称 | grep IP
```

## 容器内没有ping, ip？直接nsenter进去看看

```
netin(){
    nsenter --target `docker inspect --format '{{.State.Pid}}' $1`  --net --pid /bin/bash
}
```

这是进入docker容器的namespace，但只切换网络和/proc，文件系统等还是使用主机的

进入后bash似乎没变，这时可以ps看看进程列表变了就说明在容器里面了，然后可以愉快地ifconfig和ping了

也可以使用ip命令指定netns的方式`ip netns exec 名称 命令`

```
#!/bin/bash
NAME="container name"
mkdir -p /var/run/netns
ID=`docker inspect --format='{{ .State.Pid }}' $NAME`
sudo ln -sf "/proc/$ID/ns/net" /var/run/netns/$NAME
exec sudo ip netns exec $NAME "$@"
```

## 为macvlan的容器配置只允许IP段访问

将容器暴露在整个内网还是不够安全，不如使用iptables只允许特定IP段访问这个容器的IP

按上述操作之后，假设容器名称为name，那么我们可以先建立一个alias来快速iptables:

参考： https://unix.stackexchange.com/questions/11851/iptables-allow-certain-ips-and-block-all-other-connection

```
alias i="sudo ip netns exec name iptables"
i -P FORWARD DROP # we aren't a router
i -A INPUT -m state --state INVALID -j DROP
i -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
i -A INPUT -i lo -j ACCEPT
i -A INPUT -s 10.0.0.1/24 -j ACCEPT
i -A INPUT -s 172.19.0.1/24 -j ACCEPT
i -P INPUT DROP # Drop everything we don't accept
```

效果就是只有内网10.0.0.1-10.0.0.254的ip才能访问这个容器的IP，其他来源都不能ping通这个容器

下面的bash脚本会自动对容器的所有IP段允许访问，并拒绝其他访问：

其中的docker inspect命令可以获取容器拥有的所有IP

```
#!/bin/bash
set -ex
DOCKERNAME="xxx"
NAME="xx"

shopt -s expand_aliases
sudo mkdir -p /var/run/netns
ID=`docker inspect --format='{{ .State.Pid }}' ${DOCKERNAME}`
sudo ln -sf "/proc/$ID/ns/net" /var/run/netns/${NAME}
alias i="sudo ip netns exec ${NAME} iptables"
i -F
i -P FORWARD DROP # we aren't a router
i -A INPUT -m state --state INVALID -j DROP
i -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
i -A INPUT -i lo -j ACCEPT

docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{"\n"}}{{end}}' ${DOCKERNAME}|xargs -i sudo ip netns exec ${NAME} iptables -A INPUT -s '{}/24' -j ACCEPT
i -P INPUT DROP # Drop everything we don't accept
```

## 从/var/lib/docker提取容器开始时间

读取/var/lib/docker/containers/*/config.v2.json可以读到容器开始时间

但使用同一个文件夹下hostname这个文件的时间戳更可靠，无需考虑时区换算不同服务器时间不同步等问题。计算文件产生的相对时间用os.path.getmtime(这个文件)减去这个时间戳即可。

导入到mysql 完整代码： 执行的时候需要server name作为参数

```
from bugid import runsql
import os,sys,glob,json
import datetime
import re
server = sys.argv[1]
os.chdir("/var/lib/docker/containers")
sql = "replace into dockers(server, name, id, starttime, runningtime, memlimit) values "
sqlpending = []
t = 0
for i in glob.glob("*/"):
    if not os.path.exists(i+"hostname"):
        #print(i)
        continue
    data = json.loads(open(i+"config.v2.json").read())
    name = data["Name"]
    starttime = data["State"]["StartedAt"]
    endtime = data["State"]["FinishedAt"]
    if endtime != "0001-01-01T00:00:00Z":
        runningtime = (datetime.datetime.strptime(endtime.split(".")[0], "%Y-%m-%dT%H:%M:%S") - datetime.datetime.strptime(starttime.split(".")[0], "%Y-%m-%dT%H:%M:%S")).total_seconds()
    else:
        runningtime = -1
    memlimit = int(json.load(open(i+"hostconfig.json"))["Memory"]/1024/1024)
    sqlpending.extend([server, name[1:], i[:-1], int(os.path.getmtime(i+"hostname")), runningtime, memlimit])
    sql += "(%s, %s, %s, %s, %s, %s),"

#print(sqlpending)
runsql(sql[:-1], *sqlpending)
```

## 固定容器的IP

参考： https://github.com/johnnian/Blog/issues/16

默认的bridge网络不支持指定ip，需要再创建一个网络：

```
docker network create --subnet=172.18.0.0/16 b
```

创建容器的时候可以`--network b --ip 172.18.0.2`

已经存在的容器需要用：

```
docker network connect --ip 172.18.0.2 --alias ${name} b ${name}
```

不想改动docker的network还有个临时的办法：

## 获取容器IP 更新主机/etc/hosts

需要先将当前的hosts文件复制为/etc/hosts.base

其中bridge可能需要改成docker inspect输出的其他network名称

```
#!/bin/bash
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root"
   exit 1
fi
cp /etc/hosts.base /etc/hosts
echo `docker inspect ${name} --format '{{.NetworkSettings.Networks.bridge.IPAddress}}'`  ${name} >> /etc/hosts
```

另外 你还可以启动个dns服务的容器来解析容器hostname:

https://stackoverflow.com/questions/37242217/access-docker-container-from-host-using-containers-name/45071126#45071126


-----

## Docker容器禁止主动联网 但对外提供web服务

首先排除--network none，这样没有网卡怎么做端口映射

下面假设容器名称为${CONTAINER}，容器启动的http服务端口为5000

### 简单方案 直接删除默认路由

```
nsenter --target `docker inspect --format '{{.State.Pid}}' ${CONTAINER}`  --net --pid route delete default
```


好处在于访问网络的请求能迅速报错Network is unreachable，也不需要额外的容器参数配置

但容器每次重启都需要重新执行

### 复杂方案 创建个内部网络 Nginx转发

docker的创建网络提供了`--internal`参数，意思是不允许这个网络访问外界，但是访问网络的请求不会立刻返回，效果像是一直丢包就没响应

这里我们创建一个名为${CONTAINER}_nonet的网络，启动容器的时候指定这个网络并配置别名app

然后还需要Nginx容器同时加入默认网络和这个网络来进行转发，Nginx容器一开始创建后的启动会报错反复重启（无法解析app），加入网络后即可正常启动

```
docker network create ${CONTAINER}_nonet --internal
docker run --network ${CONTAINER}_nonet --network-alias app ...
docker run --name ${CONTAINER}_nginx -d -v `pwd`/nginxconf:/etc/nginx/conf.d -p 20528:80 --restart=always nginx
docker network connect ${CONTAINER}_nonet ${CONTAINER}_nginx --alias nginx
```

其中nginxconf文件夹里放一个default.conf:

```
server {
    listen       80;
    server_name  localhost;
    location / {
        proxy_pass http://app:5000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

既然用了反向代理，应用层也需要配置一下IP相关的修复才能使日志显示访问者ip（而不是Nginx容器的IP），比如Flask 1.0需要：

```
from werkzeug.middleware.proxy_fix import ProxyFix
app.wsgi_app = ProxyFix(app.wsgi_app)
```

这个方案有点复杂，但好处在于重启容器不需要额外配置，反正连不上网

坏处在于访问网络的请求会一直卡住，应用层需要自己考虑超时

你可以把这两种方案结合起来，即使忘了删默认路由也能保证不能联网

