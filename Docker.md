# Install 安装

建议参见[如何翻墙](https://github.com/zjuchenyuan/notebook/blob/master/code/ssprivoxy.txt)，部署http proxy

安装之前，建议修改apt源

安装之前，或许要对内核升级，如果执行安装脚本发出了对aufs的警告，请先看下面的 _解决aufs的问题_

安装命令： 

    curl -sSL https://get.docker.com/ | sh
    
其中最后一步的apt-get install docker-engine耗时较长，看起来很像卡死，需要耐心等待

安装后执行docker version，没有报错即可

## 解决aufs的问题

```
apt-get install lxc wget bsdtar curl
apt-get install linux-image-extra-$(uname -r)
modprobe aufs
```

--------

# 加速镜像下载

> 在执行以下操作之前，请检查docker的版本：`docker -v`

> 如果你的docker版本为1.6.2,请参考下方 卸载docker

## 建议使用USTC的源：

来自：https://lug.ustc.edu.cn/wiki/mirrors/help/docker

    echo '{"registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]}'>/etc/docker/daemon.json

-------

# Docker旧版本卸载

如果你的docker是使用apt-get install docker.io安装的，请先执行以下命令卸载：

    apt-get remove docker.io
    apt-get autoremove
    rm -rf /var/lib/docker

然后就可以执行安装命令了

--------

## 获得容器的ip

```
{% raw %}
docker inspect  --format '{{.NetworkSettings.IPAddress}}' 容器名称
{% endraw %}
```

--------

# 导出导入

## Export导出容器

导出容器得到的是tar文件，没有进行压缩，我们需要手动执行压缩

    docker export 容器的名称或ID | gzip >导出文件名.tar.gz

## Import导入容器

虽然上一步我们压缩了，但docker可以直接import，不需要用gunzip

    docker import 文件名
    
--------

# 解决iptables failed - No chian/target/match by that name

如果docker安装的时候没有自动把需要的规则链加上，可以手动添加

    iptables -t nat -N DOCKER
    iptables -t filter -N DOCKER

附：如果需要删除链条，可以用iptables-save导出后手动编辑后iptables-restore

--------

# 迁移Docker文件夹到其他硬盘

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

# 解决debian等容器没有ifconfig,killall的问题

```
apt-get install net-tools psmisc
```

----

# 设置容器低权限用户运行

在Dockerfile中加入

```
User nobody
```

容器运行后exec进去默认是nobody用户，并不能su啥的，这时候exec需要带参数-u表示用指定用户身份进入容器：

```
docker exec -i -t -u root 容器名称 /bin/bash
```

----

# 设置容器/etc/resolv.conf和/etc/hosts

在容器中这两个文件是以mount形式挂载的，不能unmount；即使进行修改，容器重启后修改就丢失了

其实这两个文件应该在容器创建的时候指定参数`--dns`和`--add-host`来加以控制：

```
docker run -d --dns 114.114.114.114 --add-host example.com:1.2.3.4 容器名称
```

----

# 容器限制参数设置

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