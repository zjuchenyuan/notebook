# Install 安装

建议参见[如何翻墙](https://github.com/zjuchenyuan/notebook/blob/master/code/ssprivoxy.txt)，部署http proxy

安装之前，建议修改apt源

安装命令： 

    curl -sSL https://get.docker.com/ | sh
    
其中最后一步的apt-get install docker-engine耗时较长，看起来很像卡死，需要耐心等待

安装后执行docker version，没有报错即可

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