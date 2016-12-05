#如何翻墙

##部署shadowsocks客户端，并部署Privoxy提供http proxy

> * 代码参见code/ssprivoxy.txt

##也许使用iodine也是个替代方案

TODO: 补充iodine的笔记

----

#帮助文本的grep，把stderr重定向到stdout

就是用2>&1这样的重定向咯

    ssh-keygen --help 2>&1|grep bit

----

#配置有线静态IP
```bash
vim /etc/network/interfaces
#写入以下内容，请自行替换xx部分
iface eth0 inet static
 address 10.xx.xx.13
 netmask 255.255.255.0
 network 10.xx.xx.0
 broadcast 10.xx.xx.255
 gateway 10.xx.xx.254
 dns-nameservers 10.10.0.21
#按Esc, :wq退出保存
service networking restart
ifconfig eth0 10.xx.xx.13 netmask 255.255.255.0 up
route add default eth0
```

#单网卡获得多个IP
ifconfig eth0:233 10.xx.xx.233 netmask 255.255.255.0 up

----
#锐速安装

来自：https://github.com/91yun/serverspeeder

安装之前需要修改内核版本并重启：

    apt-get install linux-image-3.16.0-43-generic
    reboot

安装命令：#此安装脚本会连接开发者的服务器以root权限执行远程指令，风险自负

    wget -N --no-check-certificate https://raw.githubusercontent.com/91yun/serverspeeder/master/serverspeeder-all.sh && bash serverspeeder-all.sh
    
查看状态/关闭服务：

    service serverSpeeder stauts
    service serverSpeeder stop