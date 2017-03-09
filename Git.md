# Git的学习笔记咯

> 参考 **沉浸式学 Git** http://igit.linuxtoy.org/

----

# 立即使用

在网页上先创建了仓库，设置好.gitignore

```bash
git clone  github提供的地址(用ssh的)
# 现在创建了你的仓库文件夹，将需要上传的文件放进去
cd 你的仓库名称
git add .
git commit -a -m "这次改了些啥？"
git push
```

----

# 加速git clone

方法1：配置一个代理(如privoxy)，并使用https地址

方法2：使用`--depth 1`参数表示不要复制历史

```
export https_proxy="http://127.0.0.1:8118"
git clone --depth 1 https://github.com/zjuchenyuan/notebook
```

----

# git push加速

代码参见[code/ssgit.txt](code/ssgit.txt)

----

# git push免密码

参照http://blog.csdn.net/chfe007/article/details/43388041

首先生成自己的ssh密钥

    ssh-keygen -t rsa -b 4096

然后把id_rsa.pub的内容设置到github中，**网页端操作**；建议顺带启用**两步验证**

新手还告诉git自己是谁：

    git config --global user.email "你的邮箱"
    git config --global user.name "你的用户名"

如果当前仓库是https的，改为git方式：

    git remote set-url origin git@github.com:用户名/仓库名称.git
    
----

# bash别名设置

通过修改~/.bashrc来设置别名，让git的日常使用更简单：

```
func_g(){
  git add .
  git commit -a -m "$1"
  git push
}
alias g=func_g
alias gs='git status '
alias ga='git add '
alias gb='git branch '
alias gc='git commit'
alias gd='git diff'
alias go='git checkout '
alias gp='git push'
alias gl="git log --all --pretty=format:'%h %ad | %s%d [%an]' --graph --date=short"
```

![gl的效果](https://raw.githubusercontent.com/zjuchenyuan/notebook/master/download/img/gl.jpg)

完成一次提交，现在只需要`g "提交信息"`

要立即生效，可以执行`source ~/.bashrc`

# 设置bash中的自动完成与dirty提示

此部分内容来自Udacity 如何使用 Git 和 GitHub 课程

下载需要的文件

```
curl -O https://raw.githubusercontent.com/git/git/master/contrib/completion/git-completion.bash
curl -O https://raw.githubusercontent.com/git/git/master/contrib/completion/git-prompt.sh
```

在`~/.bashrc`末尾添加：

```
source ~/git-completion.bash
green="\[\033[0;32m\]"
blue="\[\033[0;34m\]"
purple="\[\033[0;35m\]"
reset="\[\033[0m\]"
source ~/git-prompt.sh
export GIT_PS1_SHOWDIRTYSTATE=1
export PS1="$purple\u$green\$(__git_ps1) \w\a $ $reset"
```

效果如图，如果出现了未提交的修改，会自动显示出*表示dirty：

![setgit.jpg](download/img/setgit.jpg)

# 好玩的命令们

## git status

查看状态咯~

## git reset

已经`git add`了，想取消这一步就用`git reset`

## git checkout

啊。。。代码搞坏了我要回滚到上次commit，用`git checkout -- 文件名`

## git reset --soft <commit_id>

撤销到某次commit，但不删除新增文件

其中commit_id可以从`git log`获得

## 恢复git reset --hard删除的文件

git的历史是不能用命令修改的，丢失的commit用reflog可以找回，除非git已经把它当成垃圾删除（30天）

```
git stash save
git reflog # 查看丢失的那个commit的id
git checkout 那个commitid
git branch recover # 创建recover分支
git checkout master # 回到master
git merge recover # 合并recover到master
git branch -d recover # 合并完成后就可以删了
```

----

# 哲学

* 为啥要**git add**呢?

因为有些时候两个文件可能是不相关的修改，应该分别提交两次

> 通过分开暂存和提交，你能够更加容易地调优每一个提交。

* 为啥不改.profile而是改.bashrc呢

因为win10中只要有一个bash窗口没关掉，启动bash就不是登录，而是相当于再开了个`docker exec -i -t bashonwin10 /bin/bash`

此时是不会执行登录脚本.profile的，但是.bashrc还是会执行的

----

# Git各种情景

Learned from [githug](https://github.com/Gazler/githug)

## 忽略*.a文件但不想忽略lib.a

文档查看：`git gitignore --help`

!表示负向选择，在.gitignore中添加：

```
*.a
!lib.a
```

## commit补上忘掉的文件

如果发现上次commit漏了文件，不应该新加commit而是应该用amend，否则可能上CI就挂

```
git add forgotten.txt
git commit --amend
```

## 查出此行代码的最后修改者

github提供的blame功能更好看，显示每行代码的作者和来源于哪次commit

```
git blame filename
```

## 文件一次性改太多了，拆成多次commit

让每次commit保持在比较小的改动，不要在一个commit中出现两个不那么相关的修改

本知识学习自：[10 个迅速提升你 Git 水平的提示](http://www.oschina.net/translate/10-tips-git-next-level)

方法是在add的时候给出参数-p

然后git会在每一个修改的block询问是否加入这次的commit，回答y表示加入，n表示不加入，s表示进一步拆分这个block

完成好选择后，使用`git diff --staged`命令来查询暂存的修改，没有问题就可以继续`git commit`啦