#Git的学习笔记咯

> 参考 http://igit.linuxtoy.org/

----

#基础命令

在网页上先创建了repo，设置好.gitignore

```bash
git clone  github提供的地址(用ssh的)
#然后丢代码进去咯
git add .
git commit -a -m "这次改了些啥？"
git push
```

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
    
----

#少打点字

通过修改~/.profile来设置别名咯：

```
alias gs='git status '
alias ga='git add '
alias gb='git branch '
alias gc='git commit'
alias gd='git diff'
alias go='git checkout '
alias gl="git log --pretty=format:'%h %ad | %s%d [%an]' --graph --date=short"
```

要立即生效，可以执行source ~/.profile

#git status

查看状态咯~

#git reset

已经`git add`了，想取消这一步就用`git reset`

#git checkout

啊。。。代码搞坏了我要回滚到上次commit，用`git checkout -- 文件名`

----

#哲学

* 为啥要**git add**呢?

因为有些时候两个文件可能是不相关的修改，应该分别提交两次

> 通过分开暂存和提交，你能够更加容易地调优每一个提交。