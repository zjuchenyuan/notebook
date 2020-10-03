# 备份 备份 备份！

一个良好安全的备份计划至关重要，备份脚本应该导出数据库、压缩日志和动态产生的数据文件，加密后上传至其他服务器或CDN


----

## Demo

下面的例子涉及到date、docker、tar、zip、七牛qshell命令的使用

```bash
# !/bin/bash
pushd 工作目录
d=`date +%Y%m%d`
mkdir bakup$d
cd bakup$d
(docker exec 容器名称 mysqldump -p密码 数据库名称) >database.sql
tar cvzf log.tar.gz ../log # 压缩log目录
cd ../
# 使用zip加密压缩，压缩后删除原文件
zip -r -P 压缩密码 -m bakup$d.zip bakup$d/
# 使用七牛的qshell上传备份文件，运行前需要配置账号qshell account 你的AK 你的SK
# 下面这条命令表示将bakup$d.zip上传，CDN上存储的文件名为$d.zip
./qshell fput 你的bucket的名称 $d.zip bakup$d.zip
# 如果你放心可以本地彻底删掉备份文件：
# rm -r bakup$d.zip

```

----

## 用rsync代替scp

rsync可以断点续传，不如就用rsync代替scp

参考：[https://www.digitalocean.com/community/tutorials/how-to-copy-files-with-rsync-over-ssh](https://www.digitalocean.com/community/tutorials/how-to-copy-files-with-rsync-over-ssh)

首先需要ssh-keygen生成id_rsa,把id_rsa.pub的内容复制到目标机器的~/.ssh/authorized_keys

在需要使用scp -r的地方改为rsync -avz -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress

----

## tar备份整个系统

比如通过远程ssh的方式下载到服务器的整个根目录打包：

```
ssh server tar -cvpz --one-file-system / > server_backup.tar.gz
```

其中：

- c 创建
- v 压缩时显示详情 当前处理的文件
- p preserve-permissions保留权限信息
- z 使用gzip压缩

## 使用rsync像time machine一样全盘备份

https://github.com/laurent22/rsync-time-backup

例如将Linux服务器多个硬盘所有文件备份到/nas/hostname下面

先从github下载这个[rsync_tmbackup.sh](https://github.com/laurent22/rsync-time-backup/raw/master/rsync_tmbackup.sh)文件，删掉其中的` --one-file-system`，放入/nas目录

将需要忽略的目录写成/nas/rsync_ignore.txt，例如：（注意忽略了/mnt）

```
- /boot
- /dev
- /lost+found
- /media
- /mnt
- /nas
- /nfs
- /proc
- /snap
- /sys
- /tmp
```

然后就执行呗：

```
mkdir -p /nas/hostname
touch /nas/hostname/backup.marker
/nas/rsync_tmbackup.sh / /nas/hostname/ /nas/rsync_ignore.txt
```

好处是不用自己构造rsync各种复杂的参数，备份的效果是每次备份都会产生一个文件夹，但上次备份时已经存在的文件只会做硬链接

## rsync备份安卓手机

参考： http://ptspts.blogspot.com/2015/03/how-to-use-rsync-over-adb-on-android.html

首先保证手机的usb调试开启了，adb shell能进入手机，在Linux主机上执行：

```
# 将rsync二进制发给手机
wget -O rsync.bin http://github.com/pts/rsyncbin/raw/master/rsync.rsync4android
adb push rsync.bin /data/local/tmp/rsync
adb shell chmod 755 /data/local/tmp/rsync
adb shell /data/local/tmp/rsync --version

# 在安卓上启动rsync server 监听在1873端口，转发到Linux的6010端口
adb shell 'exec >/sdcard/rsyncd.conf && echo address = 127.0.0.1 && echo port = 1873 && echo "[root]" && echo path = / && echo use chroot = false && echo read only = false'
adb shell /data/local/tmp/rsync --daemon --no-detach --config=/sdcard/rsyncd.conf --log-file=/proc/self/fd/2
# 再启动一个终端继续
adb forward tcp:6010 tcp:1873

# 复制整个/sdcard目录
rsync -avzP --stats rsync://localhost:6010/root/sdcard/ .
```

