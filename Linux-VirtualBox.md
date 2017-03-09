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

## 启动虚拟机

```
nohup VBoxHeadless -startvm ubuntu --vrde on -e  TCP/Ports=63389 &
```

## 控制虚拟机

Windows下使用`mstsc`远程连接即可获得一个图形界面的终端完成系统安装