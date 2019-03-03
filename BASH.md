# BASH


## 在bash脚本中使用alias

加上这么一句：

```
shopt -s expand_aliases
```

## 判断命令行参数是否为空

在python里可以用len(sys.argv)判断参数个数

```
if [ -z "$1" ] && [ -z "$2" ]; then
    echo "Usage: $0 <parameter1> <parameter2>"
fi
```

## 写个for循环吧

```
for i in $(seq 1 $END); do echo $i; done
```

## BASH做不同进制间数学计算

不需要bc也可以直接做计算，例如计算5+0xa+0b1010

```
echo $((5+16#a+2#1010))
```

## 判断命令不存在再apt安装

```
command -v aria2c >/dev/null 2>&1 || { apt update;     apt-get install -y aria2; }
```

如果有多个软件可能要安装，没必要每次都apt update，可以先装了再说 失败就apt update

```
command -v 7z >/dev/null 2>&1 || { apt-get install -y p7zip; }
command -v 7z >/dev/null 2>&1 || { apt update;  apt-get install -y p7zip; }
```

## 判断文件不存在

注意]前面要有空格

```
if [ ! -f "somefile" ]; then
    curl ...
fi
```

----

## sort排序

逆序 -r
按版本排序 排序IP地址 -V
按数字排序 -n
按人类理解的文件大小排序 -h
指定某些列来排序 -k 3,3 -k 4,4 指定分隔符用-t '.'

参考： https://www.madboa.com/geek/sort-addr/

----

## rsync移动远程目录特定文件至本机后循环操作

rsync有`--dry-run`参数确认没出错后再操作

```
rsync -P --remove-source-files -avz '1.2.3.4:/root/dockerimages/*.tar.7z' ./

for filename in *.tar.7z; do 
    7z x -so $filename | docker load; 
    mv $filename ./done/; 
done
```