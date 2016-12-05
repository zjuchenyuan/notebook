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

#git status

查看状态咯~

#git reset

已经`git add`了，想取消这一步就用`git reset`

#git checkout

啊。。。代码搞坏了我要回滚到上次commit，用`git checkout -- 文件名`