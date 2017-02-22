# Linux命令行操作技巧

本文档不涉及root权限，Linux相关笔记还有：

[Linux系统配置](Linux-setup.md)

[SSH远程登录](SSH.md)

[Linux备份](Linux-backup.md)

----

# 帮助文本的grep，把stderr重定向到stdout

就是用2>&1这样的重定向咯

    ssh-keygen --help 2>&1|grep bit

----

# 当前目录文件全文搜索

这里要搜索当前目录下面所有的包含"MultiTeam"文件

    grep MultiTeam -r .

----

# 统计当前文件夹代码行数

find 指定文件后缀名，记住要引号避免bash解析*

    find -name "*.py" -o -name "*.md"|xargs cat|wc

----

# 查看给定文件列表的文件大小

用xargs -d指定分隔符为\n（默认会按照空格和\n分隔参数）

```
cat list.txt | xargs -d "\n" ls -alh
```

----

# wget慢慢下载

```
wget -i list.txt  -nc --wait=60 --random-wait
```

其中nc表示已经下载到的文件就不要再请求了，wait=60表示两次请求间隔60s，random-wait表示随机等待2~120s

----

# touch修改时间戳

将b.txt的时间戳改为和a.txt一样

```
touch -r a.txt b.txt
```

----

# 去掉Ubuntu默认情况下ls的颜色

```
unalias ls
```

----

# 换行方式修改

如果一个文件来自于Windows，可能需要先修改换行方式才能用，去掉文件中的\r

vim中输入 `:set ff=unix`

----

