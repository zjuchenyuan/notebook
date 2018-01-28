

# VirtualBox

> 参考 https://www.howtoforge.com/tutorial/running-virtual-machines-with-virtualbox-5.1-on-a-headless-ubuntu-16.04-lts-server/

在linux终端下使用VBoxManage和VBoxHeadless创建、启动、控制一个Ubuntu14.04 64Bit的虚拟机

## 下载

http://www.virtualbox.org/wiki/Downloads

从官网找到对应的rpm或deb下载即可

> rpm文件的安装：

>    rpm -ivh something.rpm

> deb文件的安装

>    dpkg -i something.rpm

执行`dpkg -i`后需要执行`apt-get -f install`以安装缺失的依赖包

## 一定要安装额外包

```
cd /tmp
wget http://download.virtualbox.org/virtualbox/5.1.16/Oracle_VM_VirtualBox_Extension_Pack-5.1.16-113841.vbox-extpack
sudo VBoxManage extpack install Oracle_VM_VirtualBox_Extension_Pack-5.1.16-113841.vbox-extpack
```

## 创建虚拟机，设置虚拟机选项

```
mkdir -p /home/virtualbox
VBoxManage createvm --name ubuntu --ostype "Ubuntu_64" --register --basefolder /home/virtualbox/
VBoxManage createvdi  --filename ubuntu/ubuntu.vdi --size 102400 # 100GB
VBoxManage storagectl ubuntu --name storage_controller_1 --add ide
VBoxManage storageattach ubuntu --storagectl storage_controller_1 \
    --type hdd --port 0 --device 0  --medium ubuntu/ubuntu.vdi
VBoxManage storageattach ubuntu --storagectl storage_controller_1 \
    --type dvddrive --port 1 --device 0 --medium ubuntu-14.04.4-server-amd64.iso
VBoxManage modifyvm ubuntu --cpus 4 --memory 2048 --acpi on --boot1 dvd --nic1 nat --cableconnected1 on --vrde on --vrdeport 3389
```

以下是我安装CentOS 6.8 32bit minimal的过程

```
pushd /root
curl -O http://mirrors.zju.edu.cn/centos/6.8/isos/i386/CentOS-6.8-i386-minimal.iso
mkdir /home/virtualbox
#看看ostype支持哪一些，结果发现有RedHat，就选它咯
VBoxManage list ostypes
VBoxManage createvm --name centos --ostype "RedHat" --register --basefolder /home/virtualbox/
pushd /home/virtualbox
VBoxManage createvdi  --filename centos/disk.vdi --size 2048 # 2GB
VBoxManage storagectl centos --name storage_controller_1 --add ide
VBoxManage storageattach centos --storagectl storage_controller_1 --type hdd --port 0 --device 0  --medium centos/disk.vdi
VBoxManage storageattach centos --storagectl storage_controller_1 --type dvddrive --port 1 --device 0 --medium /root/CentOS-6.8-i386-minimal.iso
#配置CPU和内存限制，光驱启动，允许多个客户端连接
VBoxManage modifyvm centos --cpus 1 --memory 512 --acpi on --boot1 dvd --nic1 nat --cableconnected1 on --vrde on --vrdeport 13389 --vrdemulticon on
```

## 启动虚拟机

```
nohup VBoxHeadless -startvm ubuntu --vrde on -e  TCP/Ports=63389 &
```

## 控制虚拟机

Windows下使用`mstsc`远程连接即可获得一个图形界面的终端完成系统安装

## 删除硬盘

```
VBoxManage storageattach centos --storagectl storage_controller_1 --type hdd --port 0 --device 0  --medium none
VBoxManage closemedium centos/disk.vdi
rm centos/disk.vdi
```

## 运行条件下修改端口映射

```
# 首先通过mstsc物理接触虚拟机，确认ifconfig已经得到ip
# 否则需要在虚拟机中执行 ifconfig -a 查看网卡，执行 dhclient eth0 获得ip

# 例如我们需要将虚拟机的22端口映射出10022端口
# 最后一个参数的格式：规则名称,tcp还是udp,主机的IP(不填就好),主机暴露出来的端口,虚拟机的IP(不填就好),需要映射的虚拟机端口
VBoxManage controlvm 虚拟机名称 natpf1 ssh,tcp,,10022,,22
```

## 运行条件下关闭远程控制

系统安装好了，SSH开了，SSH的端口映射可以连上去了，就可以关掉远程控制了

```
VBoxManage controlvm 虚拟机名称 vrde off
```
