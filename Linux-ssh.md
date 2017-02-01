#SSH

## 不同服务器使用不同的id_rsa

修改`.ssh/config`:
```
Host myshortname realname.example.com
    HostName realname.example.com
    IdentityFile ~/.ssh/realname_rsa # private key for realname
    User remoteusername

Host myother realname2.example.org
    HostName realname2.example.org
    IdentityFile ~/.ssh/realname2_rsa
    User remoteusername
```

##换个端口开启一个临时的sshd：

```
which sshd
/usr/sbin/sshd -oPort=2333
```

## ssh反向代理

参见：http://www.tuicool.com/articles/UVRNfi

将本机的22端口转发至外网服务器的2222端口：

```
ssh -b 0.0.0.0 -L 2222:127.0.0.1:22 user@ip
```

注意在运行前需要设置免密码登录以及修改外网服务器的sshd_config，加入GatewayPorts  yes

----