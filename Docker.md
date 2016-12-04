# Install 安装

建议参见"如何翻墙"，部署http proxy

官方安装脚本：https://get.docker.com/

安装命令： 

    curl -sSL https://get.docker.com/ | sh
    
其中最后一步的apt-get install docker-engine耗时较长，看起来很像卡死，需要耐心等待

--------

# 加速镜像下载

##建议使用USTC的源：

来自：https://lug.ustc.edu.cn/wiki/mirrors/help/docker

修改 /etc/docker/daemon.json（Linux） 来配置 Daemon。

请在该配置文件中加入（没有该文件的话，请先建一个）：

    {
      "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]
    }

##也可以试试使用daocloud提供的dao工具

TODO:研究dao的安装，不需要daomonit