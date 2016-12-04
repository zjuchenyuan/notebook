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

#git push免密码

参照http://blog.csdn.net/chfe007/article/details/43388041

首先生成自己的ssh密钥

    ssh-keygen -t rsa -b 4096

然后把id_rsa.pub的内容设置到github中，网页端操作；建议顺带启用两步验证

告诉git自己是谁：

    git config --global user.email "邮箱"
    git config --global user.name "用户名"

如果当前仓库是https的，改为git方式：

    git remote set-url origin git@github.com:用户名/仓库名称.git