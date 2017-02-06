# Install 安装

建议参见[如何翻墙](https://github.com/zjuchenyuan/notebook/blob/master/code/ssprivoxy.txt)，部署http proxy

安装之前，建议修改apt源

安装之前，或许要对内核升级，如果执行安装脚本发出了对aufs的警告，请看[这里](#解决aufs的问题)

安装命令： 

    curl -sSL https://get.docker.com/ | sh
    
其中最后一步的apt-get install docker-engine耗时较长，看起来很像卡死，需要耐心等待

安装后执行docker version，没有报错即可

##解决aufs的问题

```
apt-get install lxc wget bsdtar curl
apt-get install linux-image-extra-$(uname -r)
modprobe aufs
```

--------

# 加速镜像下载

> 在执行以下操作之前，请检查docker的版本：`docker -v`

> 如果你的docker版本为1.6.2,请参考卸载docker

##建议使用USTC的源：

来自：https://lug.ustc.edu.cn/wiki/mirrors/help/docker

    echo '{"registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]}'>/etc/docker/daemon.json

-------

#Docker旧版本卸载

如果你的docker是使用apt-get install docker.io安装的，请先执行以下命令卸载：

    apt-get remove docker.io
    apt-get autoremove
    rm -rf /var/lib/docker

然后就可以执行安装命令了

--------

## 获得容器的ip

    docker inspect  --format '{{.NetworkSettings.IPAddress}}' 容器名称
    
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

当镜像多了起来的时候，/var/lib所在的根分区很可能被占满，这时候要考虑迁移到其他硬盘，此处以迁移到`/home/docker`为例说明

```bash
#首先记得关闭服务
service docker stop
mv /var/lib/docker /home/
#然后修改服务配置文件/etc/default/docker，此处建议手动vim编辑，加入这个：
#    --graph='/home/docker'
echo -e "\nDOCKER_OPTS=\"--graph='/home/docker'\"" >> /etc/default/docker
```

