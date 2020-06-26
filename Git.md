# Git

参考 **沉浸式学 Git** http://igit.linuxtoy.org/

参考 Learn Git Branching [learngitbranching.js.org](https://learngitbranching.js.org/?locale=zh_CN)

----

## 立即使用

在网页上先创建了仓库，设置好.gitignore

```bash
git clone  github提供的地址(用ssh的)
# 现在创建了你的仓库文件夹，将需要上传的文件放进去
cd 你的仓库名称
git add .
git commit -a -m "这次改了些啥？"
git push
```

更多的配置：

```
# 默认git pull --rebase
git config --global pull.rebase true
```

----

## 加速git clone

方法1：配置一个代理(如privoxy)，并使用https地址

方法2：使用`--depth 1`参数表示不要复制历史

```
export https_proxy="http://127.0.0.1:8118"
git clone --depth 1 https://github.com/zjuchenyuan/notebook
```

----

## git push加速

代码参见[code/ssgit.txt](/code/ssgit.txt)

----

## git push免密码

参照http://blog.csdn.net/chfe007/article/details/43388041

首先生成自己的ssh密钥，不要修改生成的文件位置

    ssh-keygen -t rsa -b 4096

然后把`~/.ssh/id_rsa.pub`的内容设置到github中，[网页端操作](https://github.com/settings/keys)；建议顺带启用两步验证

新手还告诉git自己是谁：

    git config --global user.email "你的邮箱"
    git config --global user.name "你的用户名"

如果当前仓库是https的，改为git方式：

    git remote set-url origin git@github.com:用户名/仓库名称.git
    
----

## bash别名设置

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

## 设置bash中的自动完成与dirty提示

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

## 好玩的命令们

### git status

查看状态咯~

### git reset

已经`git add`了，想取消这一步就用`git reset`

### git checkout

啊。。。代码搞坏了我要回滚到上次commit，用`git checkout -- 文件名`

### git reset --soft <commit_id>

撤销到某次commit，但不删除新增文件

其中commit_id可以从`git log`获得

### 恢复git reset --hard删除的文件

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

## 你可能会问的一些问题

* 为啥要**git add**呢?

因为有些时候两个文件可能是不相关的修改，应该分别提交两次

> 通过分开暂存和提交，你能够更加容易地调优每一个提交。

* 为啥不改.profile而是改.bashrc呢

因为win10中只要有一个bash窗口没关掉，启动bash就不是登录，而是相当于再开了个`docker exec -i -t bashonwin10 /bin/bash`

此时是不会执行登录脚本.profile的，但是.bashrc还是会执行的

----

## Git各种情景

Learned from [githug](https://github.com/Gazler/githug)

### 忽略*.a文件但不想忽略lib.a

文档查看：`git gitignore --help`

!表示负向选择，在.gitignore中添加：

```
*.a
!lib.a
```

### commit补上忘掉的文件

如果发现上次commit漏了文件，不应该新加commit而是应该用amend，否则可能上CI就挂

```
git add forgotten.txt
git commit --amend
```

### 查出此行代码的最后修改者

github提供的blame功能更好看，显示每行代码的作者和来源于哪次commit

```
git blame filename
```

### 文件一次性改太多了，拆成多次commit

让每次commit保持在比较小的改动，不要在一个commit中出现两个不那么相关的修改

本知识学习自：[10 个迅速提升你 Git 水平的提示](http://www.oschina.net/translate/10-tips-git-next-level)

方法是在add的时候给出参数-p

然后git会在每一个修改的block询问是否加入这次的commit，回答y表示加入，n表示不加入，s表示进一步拆分这个block

完成好选择后，使用`git diff --staged`命令来查询暂存的修改，没有问题就可以继续`git commit`啦

### 本地忽略一些个人的修改

原文： http://stackoverflow.com/questions/1753070/git-ignore-files-only-locally

有时候我们不想让git追踪一些个人相关的文件，例如config中修改Debug=True，此时如果去修改.gitignore造成的影响是全局的，并且需要从git中删除这个文件；手动避开add config很烦，有没有更好的方法，让git忽略掉config文件的修改呢？

方法是修改`.git/info/exclude`文件，这个文件的语法规则与.gitignore一样

如果已经造成了修改，还需要执行以下命令：

```
git update-index --assume-unchanged [<file>...]
```

### 本地创建branch后push操作git push -u

From: http://stackoverflow.com/questions/2765421/how-do-i-push-a-new-local-branch-to-a-remote-git-repository-and-track-it-too

执行了一些修改引入新功能，但还不能工作，决定建立一个dev分支：

```
git checkout -b dev
```

现在再执行`git add`，`git commit`后，需要把新的分支push给远程服务器：

```
git push -u origin dev
```

----

## 用gpg给git提交签名

参考：https://help.github.com/articles/signing-commits-with-gpg/

下述以ubuntu16.04（其实是bash on win10）讲解整个过程

### 安装gpg2

查看gpg版本：`gpg --version`发现版本是`gpg (GnuPG) 1.4.20`，而教程要求要2以上，所以先要安装gpg2，并告诉git我们要使用gpg2：

```
apt install -y gpg2
git config --global gpg.program gpg2
```


### 创建一个新的key

这里github给出的命令有问题，google发现参数改了

```
gpg2 --full-gen-key
```

回车选择RSA and RSA，然后输入密钥大小输入4096，然后回车永不过期，确认y，然后输入自己的名字和邮箱 注意这里邮箱要和git commit用到的邮箱一致

### 导出key的公钥 在github设置中提交

```
gpg2 --list-secret-keys --keyid-format LONG
```

如下输出中，我们需要的是3AA5C34371567BD2这一串 就是sec那一行的4096R/后面的东西

```
$ gpg2 --list-secret-keys --keyid-format LONG
/Users/hubot/.gnupg/secring.gpg
------------------------------------
sec   4096R/3AA5C34371567BD2 2016-03-10 [expires: 2017-03-10]
uid                          Hubot 
ssb   4096R/42B317FD4BA89E7A 2016-03-10
```

然后得到公钥：

```
gpg2 --armor --export 3AA5C34371567BD2
```

复制屏幕上输出的一大串，打开下面的网页 粘贴提交

https://github.com/settings/gpg/new

### 配置git使用gpg签名

告诉git默认使用这个key：

```
git config --global user.signingkey 3AA5C34371567BD2
git config --global commit.gpgsign true
```

执行 建议将这一行写入~/.bashrc：

```
export GPG_TTY=$(tty)
```

然后就是正常的git add .，git commit -m "message"咯

gpg-agent会在后台运行，默认10分钟内不需要再次输入密码

### 修改gpg要求再次输入密码的时间限制

10分钟的默认限制还是太短了，对于安全性要求不高的情景（比如自己的开源代码push到github），不妨设置为密码一直有效，直到gpg-agent重启

下面的设置将限制改到1年，当然gpg-agent重启还是要再次输入密码的：

```
vi ~/.gnupg/gpg-agent.conf

default-cache-ttl 34560000
max-cache-ttl 34560000
```


## 使用GitLab API存储数据备份文件 不占用本地空间

这里的需求是定时任务生成snapshot文件，打算传至免费存储作为备份，不想占用服务器硬盘去存储这个文件，也不想花钱买存储服务

于是想到免费的gitlab.com的私有仓库，仓库数量无限，[每个repo可以存10GB](https://about.gitlab.com/2015/04/08/gitlab-dot-com-storage-limit-raised-to-10gb-per-repo/)

使用API来提交可以避免占用本地空间

其实本来打算用github的，但是github今天(20181022)挂了，于是就gitlab吧

找到这个python sdk: https://python-gitlab.readthedocs.io/

写点代码咯：上传当前目录的to_upload.jpg到uploaded.jpg，记得相应修改你的访问令牌和项目ID

```
TOKEN = '...' # personal access token, https://gitlab.com/profile/personal_access_tokens
REPO_ID = 123456 # after create project, you can see project ID in your repo homepage
message = 'test commit'
target_filename = 'uploaded.jpg'
src_filename = 'to_upload.jpg'

import gitlab
import base64
gl=gitlab.Gitlab('https://gitlab.com',private_token=TOKEN)
gl.auth()
p=gl.projects.get(REPO_ID)
filecontent = open(src_filename, 'rb').read()
data={
    'branch_name':'master', 
    'branch':'master', 
    'commit_message':message,
    'actions':[{'action':'create','file_path':target_filename,
                'content':base64.b64encode(filecontent).decode(),
                'encoding': 'base64'}]
}
c=p.commits.create(data)
print(c)
```

----

## 在git服务器无法连接时点对点git pull

情景：客户端A和B使用gitlab服务器S，然后某天S无法连上了，但A和B之间可以直接通讯。B上开发了新代码，想让A获取到这个更新，如何最方便简单地在A上同步B上的代码更新呢？

解决方案：用python开个简单的http服务器然后添加http的remote进行pull，注意先要让git解压pack文件

```
git update-server-info
python3 -m http.server 6666
git remote add tmp http://ip-b:6666/.git/
git pull tmp master
```

问题来了：如果A访问不了B怎么办呢？通过`git format-patch HEAD~2..HEAD --stdout>patchfile`生成patch文件再发过去`git am patchfile`，但这样可能会改变commit id

-----

## git禁用压缩

如二进制的仓库不想使用压缩，参考: https://stackoverflow.com/questions/11483288/how-to-disable-compression-in-git-server-side

```
git config --add core.bigFileThreshold 1
```

------

## GitHub不同仓库使用不同ssh key: ghclone

GitHub要求不同仓库的deploy key不同，但ssh config只能为一个Host设置相同的key

从[这里](https://gist.github.com/gubatron/d96594d982c5043be6d4)发现了一个trick：`*.github.com`都是可以正常解析到github的，这样就得到了无数个Host

快速使用：

```
curl https://d.py3.io/ghclone > /usr/local/bin/ghclone
chmod +x /usr/local/bin/ghclone
ghclone user/repo
```

会为这个repo创建一个ssh key放在`~/.ssh`目录下，同时修改`~/.ssh/config`，然后显示出公钥，需要手动添加到github，最后回车就会开始git clone

Done.

如果是一个已经存在的仓库，最后一步不用回车Ctrl+C后:

```
git remote set-url origin git@{repo}.github.com:{user}/{repo}.git
```

## 启动一个临时的Git服务器 本地之间同步

场景： GitLab服务器宕机了，现在需要同步自己本地的修改到服务器上

参考： https://datagrok.org/git/git-serve/

```
# 自己机器上（有更多commit的）
git config --global alias.quickserve "daemon --verbose --export-all --base-path=.git --reuseaddr --strict-paths .git/"
git quickserve

# 服务器上（需要pull得到commit的）
git remote add temp git://192.168.1.123/
git pull temp master
```

同步完成后就可以Ctrl+C关闭git服务了

!!! note
    git末尾的/不可缺省，不然报错fatal: No path specified. See 'man git-pull' for valid url syntax
    git pull的分支名称master也不能省略

