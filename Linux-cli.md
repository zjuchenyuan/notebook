# Linux命令行操作技巧

本文档一般不涉及root权限，Linux相关笔记还有：

[Linux系统配置](Linux-setup.md)

[SSH远程登录](Linux-SSH.md)

[Linux备份](Linux-backup.md)


----

## 查看内置命令的帮助

将以下内容加入`~/.bashrc`中即可，判断如果在内置命令就调用help -m，不是则绕开bash函数来运行man进程

```sh
man () {
    case "$(type -t -- "$1")" in
    builtin|keyword)
        help -m "$1" | sensible-pager
        ;;
    *)
        command man "$@"
        ;;
    esac
}
```

----

## grep搜索帮助文档

用两个横线`--`作为grep的第一个参数表示不要把其后面的形如`-z`的参数当成grep的参数

例如我想知道tar命令中的-z是什么意思：

```bash
man tar|grep -- -z
```

## 帮助文本的grep，把stderr重定向到stdout

某些时候帮助文本是输出到标准错误输出的，需要用2>&1这样的重定向咯

    ssh-keygen --help 2>&1|grep bit

----

## 各种解压命令

tar.gz： `tar -zxvf xx.tar.gz`

tar.bz2： `tar -jxvf xx.tar.bz2`

zip：`unzip xx.zip`

参数含义：

-x解压，-v详细显示解压出来的东西（如果是一个复杂的压缩包建议不要用以加快解压速度），-f后接压缩文件的文件名

----

## 当前目录文件全文搜索

这里要搜索当前目录下面所有的包含"MultiTeam"文件

    grep MultiTeam -r .

----

## 统计当前文件夹代码行数

find 指定文件后缀名，记住要引号避免bash解析*

    find -name "*.py" -o -name "*.md"|xargs cat|wc

----

## 查看给定文件列表的文件大小

用xargs -d指定分隔符为\n（默认会按照空格和\n分隔参数）

```
cat list.txt | xargs -d "\n" ls -alh
```

----

## wget慢慢下载

```
wget -i list.txt  -nc --wait=60 --random-wait
```

其中nc表示已经下载到的文件就不要再请求了，wait=60表示两次请求间隔60s，random-wait表示随机等待2~120s

----

## touch修改时间戳

将b.txt的时间戳改为和a.txt一样

```
touch -r a.txt b.txt
```

----

## 去掉Ubuntu默认情况下ls的颜色

```
unalias ls
```

或者直接使用：Credits [@rachpt](https://github.com/rachpt)

```
\ls
```

同理也可以绕过grep的alias: `\grep`

----

## 换行方式修改

如果一个文件来自于Windows，可能需要先修改换行方式才能用，去掉文件中的\r

vim中输入 `:set ff=unix`

----

## iodine--使用DNS传输数据

>* http://code.kryo.se/iodine/

注意： 本方案网速极低，使用时要有足够的耐心，不能保证复杂情况下是否可行（尤其是Windows）

前期准备：一个域名（假设为example.com）及一台服务器（假设为1.2.3.4），建议客户端在Linux上运行

### 1. 设置域名解析

dns.example.com添加一条A记录，解析至1.2.3.4

t.example.com添加一条NS记录，值为dns.example.com

### 2. 服务器端

    ./iodined -f -c -P secretpassword 192.168.99.1 t.example.com

-f表示持续占用前台，-c表示不限制请求源，-P指定密码，最后是`内网IP`和使用的域名

内网IP可以随意指定，只要当前服务器没有占用即可，例如可以改为172.16.0.1

### 3.检查服务端是否正常

http://code.kryo.se/iodine/check-it/

作者提供了在线检查工具，输入t.example.com即可检查

### 4.客户端

建议在ubuntu等完整的Linux操作系统上运行，下载源码后make即可

     ./iodine -f -P secretpassword t.example.com

效果图：

![](download/img/iodine-finish.jpg)

----

## 远程控制Windows

Windows下有自带的mstsc，Linux如树莓派用啥呢？就用[rdesktop](http://www.rdesktop.org/)啦

手册查询用`man rdesktop`

快速使用：

```
sudo apt-get install -y rdesktop
rdesktop -f -k en-us -C -N -z -xl -P -u 用户名 -p 密码 服务器地址:端口
```

其中-f表示全屏， -k设置键盘布局， -C使用私有颜色表，-N同步NumLock，-z启用压缩，-xl 设置为LAN场景，-P使用bitmap缓存

注意上述在命令行中使用明文密码并不安全，可能被其他用户用ps等工具看到，建议仅仅在完全自己控制的Linux上系统上这样操作

----

## 统计以特定字符串开头的文件数目

awk是个很好用的工具呢，支持substr函数，用法为substr(源字符串，开始，长度)，其中开始从1计数

`ls -l` 长列表显示的话，按空格分就是$9

```
ls -l|awk '{if(substr($9,1,字符串长度)=="你要的那个字符串") print $9}'|sort|uniq|wc -l
```

----

## hexdump查看字符内部编码

echo的-n参数表示不要末尾加\n

```
echo -n hello | hexdump -C
```

----

## 子目录大小排序

sort的-h表示按人类理解的大小格式排序，-r表示逆序

```
du -sh * | sort -hr
```

----

## 安装ffmpeg

在ubuntu14下是没有ffmpeg的官方包支持的，需要添加mc3man的ppa

```
sudo add-apt-repository ppa:mc3man/trusty-media
#按回车继续
sudo apt-get update
sudo apt-get install -y ffmpeg
```

----

## 保证脚本安全执行set -ex

`set`命令挺有用的呢，-e表示如果后面的语句返回不为0立刻结束shell，-x表示显示出每条命令及参数

从[人家的Dockerfile](https://github.com/Medicean/VulApps/blob/master/s/struts2/s2-032/Dockerfile)中学习得来

----

## change readonly bash variable

bash is a weird thing...

declaring a variable as reference by using `declare -n`, we can change it!

```
$ a=1
$ readonly a
$ a=2
bash: a: readonly variable
#Look here!
$ declare -n a
$ a=2
$ echo $a
2
```

----

## 永久等待 sleep infinity

有时写了一个sh文件后需要保持这个sh的运行，就用sleep永久等待好咯

```
sleep infinity
```

----

## zmap扫描整个网段特定开放端口

zmap的运行需要root权限，用`apt-get install zmap`即可安装

更详细的帮助去看看`zmap --help`咯

```
#需要先编辑黑名单 vi /etc/zmap/blacklist.conf 取消掉注释
zmap 192.168.0.0/16 -B1000M -i eth0 -g -T 4  -p 23 -o 23.txt
```

其中`-g`表示扫描结束后显示总结，`-T 4`表示启动4个扫描线程，`-p 23`表示扫描23端口，-o保存文件的名称

如果拨号了vpn，需要用-G指定网关的MAC地址，可以通过`arp 网关的IP`得到


----

## 对ip列表批量测试redis未授权漏洞

```
for i in `cat iplist.txt`; do (if [ `echo PING|redis-cli -h $i` == "PONG" ] ;then echo $i;fi);done 2>/dev/null
```

利用了bash支持的for语句，注意for之后的分号和最后的done

还有用了if字符串相等，记得要用fi结束if

redis-cli连接上服务器后发送PING，如果存在未授权访问漏洞则会返回PONG，否则会要求Auth或者其他报错信息

----

## 使用ImageMagick对图像进行裁剪

安装命令：`sudo apt-get install -y imagemagick`

处理一张图片in.png，裁剪成300x280大小，从(30,0)作为裁剪的左上角点，得到out.png：

```
convert in.png -crop 300x280+30+0 out.png
```

其实这四个参数是我反复尝试二分法得到的，或许可以用专业软件快速得到吧

关键是可以批量处理呀，这里下载friends的头像图片进行处理：

```
for i in {1..79}; do curl -o $i.png http://kemono-friends.jp/wp-content/uploads/2016/11/no`printf "%03d" $i`.png --proxy socks5://127.0.0.1:1080; done
for i in {1..79}; do convert $i.png -crop 300x280+30+0 $i.png; done
```

其中使用了printf命令，可以使得1变成人家url需要的001

----

## 查找0字节的文件并删除

```
find . -size 0 -delete
```

查找大于100M的文件：`find . -size +100M`

----

## 批量修改文件后缀名

将当前目录下(包含子目录)所有的txt文件改为.newext后缀：

```
find . -name "*.txt" -exec rename 's/.txt$/.newext/' {} \;
```

如果curl下载的时候允许gzip但忘了--compressed得到的文件是gzip压缩的，修改当前文件夹所有.txt为.txt.gz，然后解压缩：其中rename -v表示显示修改的列表

```
rename -v 's/.txt$/.txt.gz/' *.txt
gunzip *.gz
```

----

## 用vim去除\r换行符 

用vim打开文件后，输入以下内容，冒号也是需要按的

```
:set ff=unix
:wq
```
----

## 不用free查看内存占用

在docker容器内部一般是不能通过`free -h`来查看真实占用的内存的，这时候可以采用`ps aux`累加RSS字段来估计：

```
ps aux | awk '{sum+=$6} END {print sum / 1024}'
```

----

## watch持续观察命令输出

例如我想持续查看output.txt文件大小：

```
watch -n 1 ls -l output.txt
```

其中`-n 1`表示每隔1s刷新一次

这个命令等价于自己写个bash脚本：

```
#! /bin/bash
while [ 1 ]
do
 # do your work here...
 sleep 1
 clear
done
```

----

## 树莓派2上编译Truecrypt 7.1a，使用make -j5 -l4加速编译

参照[http://davidstutz.de/installing-truecrypt-raspbian/](http://davidstutz.de/installing-truecrypt-raspbian/)，一步步来就行啦

具体步骤如下，其中make使用参数`-j5 -l4`表示同时执行5个编译但限制系统负载<4（因为编译过程很慢，直接make只会使用1个CPU，这样设置后可以充分利用树莓派4核心CPU）：

涉及的压缩包[truecrypt-targz.zip](https://d.py3.io/truecrypt-targz.zip)，[wxWidgets-2.8.11.zip](https://d.py3.io/wxWidgets-2.8.11.zip)，[pkcs.zip](https://d.py3.io/pkcs.zip)

```
apt-get install -y unzip build-essentials pkg-config gtk2.0-dev libfuse-dev
#用unzip解压压缩包，都解压到/root下，目录结构：
# /root
#  | - truecrypt-targz
#  | - wxWidgets-2.8.11
#  | - pkcs

cd wxWidgets-2.8.11
./configure
make -j5 -l4 #特别慢，耐心等待
make -j5 -l4 install

cd ../truecrypt-targz
export PKCS11_INC=/root/pkcs/
make -j5 -l4 NOGUI=1 WX_ROOT=/root/wxWidgets-2.8.11 wxbuild
make -j5 -l4 NOGUI=1 WXSTATIC=1

Main/truecrypt --version #输出TrueCrypt 7.1a
cp Main/truecrypt /usr/local/bin/
```

你也可以下载我已经编译好的版本[truecrypt-armv7l](https://d.py3.io/truecrypt-armv7l)

----

## scp目录断点续传

正在拷贝目录的时候被中断了（例如mount.ntfs卡死），而scp不能跳过已经存在的文件、只会覆盖；如果用rsync完全断点续传似乎会校验文件，太慢

方法是：删掉中断时正在拷贝的不完整文件，使用下述命令来跳过已经存在的文件：

假设要把远程目录/path/这个文件夹整个拷贝到/mnt/下（也就是内容拷贝到/mnt/path/下）

```
rsync --progress -v -au username@host:"'/path'" /mnt/
```

注意源路径/path后面不能有/，否则rsync不会创建/mnt/path这个文件夹；/path被两层引号包围是为了支持含有空格的文件夹名称，一层是本地命令，远程目录也要一层

rsync的`--progress -v`参数表示显示当前进度和更多内容，`-a`表示archive递归并尽可能原样保留所有信息，`-u`表示跳过已经存在的文件

[查看man文档 explainshell.com](https://www.explainshell.com/explain?cmd=rsync+--progress+-v+-au+username%40host%3A%22%27%2Fpath%27%22+%2Fmnt%2F)

----

## 使用wget代替scp传输文件夹 避免无谓的加密性能损失（适用于树莓派）

在内网传输非敏感数据时，没有必要使用scp（基于ssh）的安全传输，尤其是树莓派这种计算性能有限的情形。使用HTTP能有效加速传输过程，且部署简单，相比配置复杂的vsftpd可以说是很简单了

#### 服务端（数据传出端）

使用nginx配置允许列目录即可，在/etc/nginx/sites-enabled/下添加一个文件：

```
server{
    listen 8080;
    root /path/to/your/dir;
    autoindex on;
    autoindex_exact_size off;
    autoindex_localtime on;
}
```

如果你不具有root权限，可以复制一份nginx.conf，修改其中出现的所有你没有权限修改的文件路径，例如access_log，然后使用`nginx -c /home/yourname/nginx.conf`（注意必须绝对路径）启动你的nginx，没有出现EMRG错误即为启动成功（可以使用netstat -pant观察是否成功监听端口）

#### 客户端（数据传入端），使用wget：

```
alias myget='wget -r -np -nH -R index.html --restrict-file-names=nocontrol  -p -N -l0 -e robots=off --read-timeout=20 --tries=0'
cd /mnt #下载到哪
myget http://server_IP:8080/yourdir #相当于将yourdir复制到当前文件夹
```

参数说明：

-r 递归下载，-np不要进入父目录，-nH不要创建host文件夹，-R index.html不要保存文件列表的index.html，--restrict-file-names=nocontrol不要乱改中文文件名

-p 要下载图片，-N 使用浏览器304的方式避免重复下载，-l0递归层数不限制，-e robots=off不检查robots.txt

--read-timeout=20 如果20s之内没有数据传输则认为失败进行重试，--tries=0无限次重试

[查看man文档](https://www.explainshell.com/explain?cmd=wget%20-r%20-np%20-nH%20-R%20index.html%20--restrict-file-names=nocontrol%20http://yourserver:8080/yourdir)

----

## 清除已经断开的sshd进程

如果你发现ps aux或netstat -pant输出了大量sshd的信息，说明之前ssh连接断开后sshd并没有退出而是一直占用内存

我们可以清除掉这些进程来释放内存

首先通过`pstree -p`来查看当前你的ssh会话的sshd进程PID，例如输出了这样一行：

```
├─sshd(32275)───bash(32413)───pstree(6543)
```

则说明当前sshd的pid为32275，然后执行下面这条命令来kill -9其他所有的sshd进程：

```
ps -ef | grep sshd | grep -v 32275 | grep -v grep | awk '{print "kill -9", $2}' |sh
```

Hint: 如果当前主机还运行着Docker容器，如果容器的守护进程是sshd，上一条命令可能使容器退出；所以你还需要`docker top`来确定容器的sshd在主机上的pid号

----

## 批量替换文本

例如批量递归替换当前文件夹及子文件夹所有php文件，将其中的"aha/666"改为"ovo/999"

命令如下：

```
find . -type f -name "*.php" -exec sed -i 's~aha/666~ovo/999~g' {} +
```

其中sed -i原位替换用的分隔符由于替换前后字符串中出现了/，所以不能用经典的/，而改用~

----

## 找到最近修改的文件

例如wget递归下载，中途被中断了，恢复的时候与其每个文件都请求一次不如直接跳过已经存在的文件

那就需要找到中断的时候正在写入哪个文件，删掉这个文件继续

这个命令可以以时间顺序显示当前文件夹及子文件夹文件，新文件显示在最前面

```
find . -type f -printf '%TY-%Tm-%Td %TT %p\n' | sort -r|less
```

----

## 使用cryptsetup挂载truecrypt分区

在ubuntu 16.04中编译truecrypt 7.1a运行时出现错误：`error: Invalid characters encountered.`

在这个链接上找到了答案（感谢在其他论坛找到答案后主动提供解决方案的Jakub Urbanowicz）

https://bugs.archlinux.org/task/47325
原贴地址（搜索cryptsetup）：https://forums.gentoo.org/viewtopic-p-7809512.html

方法是：

```
sudo su #以下命令都要root权限，如果在Docker容器中尝试 启动容器时需要--privileged
# 先安装cryptsetup
apt install -y cryptsetup-bin

# 挂载，注意type前面是两个横线，文件路径可以是/dev/sdb1，名称随便填
cryptsetup open --type tcrypt truecrypt文件路径 名称

# 然后mount挂载
mount /dev/mapper/名称 挂载点

# 卸载的时候记得close，都还是要root权限
umount 挂载点
cryptsetup close 名称
```

----

## 从二进制文件中提取片段

用binwalk发现需要的片段的起始位点，以及计算出长度

binwalk直接-e有时候就能满足需求，但如果是exe文件 exe本身可能被拆成多个文件 如一堆证书，这时候可以

```
binwalk -D 'exe' 文件名
```

或者用dd，注意别用bs=1 太慢：

```
dd if=input.binary of=output.binary skip=$offset count=$bytes iflag=skip_bytes,count_bytes
```

From: https://stackoverflow.com/questions/1423346/how-do-i-extract-a-single-chunk-of-bytes-from-within-a-file

如果省略掉count就是一直到末尾

----

## redis匹配前缀删除大量键值

FROM: https://stackoverflow.com/questions/4006324/how-to-atomically-delete-keys-matching-a-pattern-using-redis

删除当前数据库中prefix开头的所有key：

```
EVAL "local keys = redis.call('keys', ARGV[1]) \n for i=1,#keys,5000 do \n redis.call('del', unpack(keys, i, math.min(i+4999, #keys))) \n end \n return keys" 0 prefix*
```

----

## 批量替换子目录特定后缀名文件内容

使用`sed -i` 和`find`

例如本站编译脚本在mkdocs编译后对所有.html文件执行替换，改用国内CDN

```
sed -i 's#cdnjs.cloudflare.com#cdnjs.loli.net#g' $(find -type f -name "*.html")
sed -i 's#fonts.googleapis.com#fonts.loli.net#g' $(find -type f -name "*.html")
```

----

## coredump in fuzzing

参考： http://man7.org/linux/man-pages/man5/core.5.html

为啥afl要求我们`echo core >/proc/sys/kernel/core_pattern` 呢？ fuzzing时怎么避免产生coredump产生大量IO浪费时间？

### core_pattern是啥

这个文件`/proc/sys/kernel/core_pattern`是命名coredump文件的模板，比如改为`core`之后产生的coredump文件就叫做`core`

另一个文件`/proc/sys/kernel/core_uses_pid` 如果是1的话，还会加上`.pid`

### 怎么才能不产生coredump

全局关闭：

```
echo >/proc/sys/kernel/core_pattern
echo 0 >/proc/sys/kernel/core_uses_pid
```

还可以在当前目录`mkdir core`，有了同名文件夹就不会再写core文件了

fuzzer可以用rlimit的功能限制子进程：

文档说了`RLIMIT_CORE`这个限制，只要它是0就不会产生了，比如[AFL的代码](https://github.com/mirrorer/afl/blob/2fb5a3482ec27b593c57258baae7089ebdc89043/afl-fuzz.c)：

```
    /* Dumping cores is slow and can lead to anomalies if SIGKILL is delivered
       before the dump is complete. */

    r.rlim_max = r.rlim_cur = 0;

    setrlimit(RLIMIT_CORE, &r); /* Ignore errors */
```

再比如[honggfuzz的代码](https://github.com/google/honggfuzz/blob/af7a92b9a644d1cc75b415351d9cb2a52eadefcf/subproc.c)（honggfuzz-1.7并没有考虑这个）：

```
/* in cmdline.c */
 { { "rlimit_core", required_argument, NULL, 0x103 }, "Per process RLIMIT_CORE in MiB (default: 0 [no cores are produced])" },

/* in subproc.c */
#ifdef RLIMIT_CORE
    const struct rlimit rl = {
        .rlim_cur = run->global->exe.coreLimit * 1024ULL * 1024ULL,
        .rlim_max = run->global->exe.coreLimit * 1024ULL * 1024ULL,
    };
    if (setrlimit(RLIMIT_CORE, &rl) == -1) {
        PLOG_W("Couldn't enforce the RLIMIT_CORE resource limit, ignoring");
    }
#endif /* ifdef RLIMIT_CORE */
```

-----

## bash对文件乱序遍历

```
shuf filename|while read line; do python3 run.py "$line"; done
```

## grep查找中文

```
ls /tmp/test | grep -P '[\p{Han}]' 
```

参考 https://www.regular-expressions.info/unicode.html#script

-------

## grep正则提取特定内容

场景：fuzzing lava 测试集，做了30次重复（每次重复文件夹名称末尾为`_重复`），已经将crash运行得到的stdout和stderr存储为文件，想统计每次重复触发了多少bugid

换句话说，已知当前文件夹下有一些可能被当成二进制的文本文件，包含`Successfully triggered bug 576, crashing now!`，我想将其中的576提取出来，然后对整个文件夹计数

注意grep的时候一定要--text，不然会漏掉一些文件

用到了grep的正则提取，前置判断用`(?<=文本)`，后置判断用`(?=文本)`，例如提取`aaa123bbb`中的123就可以：`echo aaa123bbb|grep -P '(?<=aaa)\d+(?=bbb)' -o`

其中`-P`表示正则语法为Perl，`-o`表示只显示匹配

参考： https://unix.stackexchange.com/questions/13466/can-grep-output-only-specified-groupings-that-match

```
for i in `seq 1 1 30`; do 
    if [ -d *_${i}/ ]; then 
        (cd *_${i}; 
         echo $i `grep 'Successfully triggered bug' -r . --text \
             | grep -P '(?<=bug )(\d+)(?=,)' -o \
             |sort| uniq|wc -l` 
        ); 
    else 
        echo ${i} 0; 
    fi; 
done
```

-----

## 自动kill大内存的进程

列举所有进程，找出内存超过5%的，kill掉

注意到sort比较数字大小需要用`-h`或者`-V`，否则会出现`3>20`的比较结果（字符串比较）

由于`[ "$num" -gt 5 ]`只支持num为整数的情况，所以用bc作浮点数大小判断，参考： https://stackoverflow.com/questions/8654051/how-to-compare-two-floating-point-numbers-in-bash

用`grep -v`设置白名单：docker, perl

```
while true; do 
    LINE=$(ps aux|grep -v docker|grep -v perl|sort -k4 -h|tail -n 1); 
    (( $( echo "`echo ${LINE}|awk '{print $4}'` > 5" |bc -l) )) && \
        (echo $LINE; 
        kill `echo ${LINE}|awk '{print $2}'`); 
    sleep 5; 
done
```

------

## screen自动操作以及获取当前屏幕内容


```
screen -dmS name /bin/bash
screen -S name -p 0 -X stuff "ls"`echo -ne '\r'`
screen -S name -p 0 -X hardcopy /tmp/test.txt
```

中文字符会有问题，待解决

------

## 编译当前文件夹所有.c文件

`${i%.*}` 去掉文件名的最后一个后缀

```
for i in *.c; do gcc $i -o out/${i%.*}; done
```

-------

## gdb自动化

```
echo -e "set pagination off\nset confirm off" > ~/.gdbinit
```

然后使用`gdb ./a.out -ex "r inputfile" -ex "bt" -ex "quit"`


-------

## mktorrent制作种子torrent文件

参考： https://community.seedboxes.cc/articles/how-to-create-a-torrent-via-the-command-line

```
sudo apt install mktorrent
mktorrent -v -a "http://tracker.nexushd.org/announce.php" -p folder -o folder.torrent -l 24
```

其中`-l 24`的意思是每个分块为2**24=16MB，这是建议的最大的值

-------

## 钉钉直播回放下载 m3u8转mp4

手机端用抓包软件 如HttpCanary，点开直播回放后会得到一个m3u8的地址，然后使用ffmpeg下载即可

参考：https://www.bilibili.com/video/av99036702/

https://gist.github.com/tzmartin/fb1f4a8e95ef5fb79596bd4719671b5d

```
ffmpeg -i http://dtliving-pre.alicdn.com/... -bsf:a aac_adtstoasc -vcodec copy -c copy name.mp4
```

-----

## 黑色背景ls 目录深绿色看不清改个颜色

Ubuntu系统编辑`~/.dircolors`: (其他系统`~/.dir_colors`)

```
DIR 01;36 
```

或者执行：

```
eval `dircolors | sed -e 's/;34:/;36:/'`
```

----

## 部署seafile客户端

https://download.seafile.com/published/seafile-user-manual/syncing_client/install_linux_client.md

需要注意seafile-cli已经加入boinc官方源，但版本与ppa源不匹配

```
# apt install -y software-properties-common
add-apt-repository -y ppa:seafile/seafile-client
apt update
apt install seafile-cli -y
mkdir ~/seafile
seaf-cli init -d ~/seafile
seaf-cli start
# 重启后也需要自己手动启动
```

在网页端创建/打开资料库后从url复制得到id

客户端没有需要同步的文件时用download，有需要加入同步的数据用sync

```
seaf-cli download -l "the id of the library"
     -s "the url + port of server" 
     -d "the folder which the library will be synced with" 
     -u "username on server" 
     [-p "password"]
```

登录用户名密码错误的时候报错是400，需要留意
