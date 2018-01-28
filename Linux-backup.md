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