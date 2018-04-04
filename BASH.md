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