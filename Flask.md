# Flask 备忘

常用的一些操作，自己总结的，便于查阅

## 应用根目录APP_ROOT

```
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
```

## app.route里的int和POST

```
@app.route("/list/<int:boardid>")

@app.route("/receive_post", methods=["POST"])

post_param = int(request.form.get("post_param","0"))
# get参数用request.args
```

## render_template引入所有全局变量+局部变量

```
str = str
len = len
int = int

@app.route("/")
def index():
    # ... some logic code
    targs = globals()
    targs.update(locals())
    return render_template("template.html", **targs)
```

## 判断是否手机访问 g.isphone

```
@app.before_request
def before_request():
    ua = request.user_agent.string.lower()
    for mobileua in "android|fennec|iemobile|iphone|opera mini|opera mobi|mobile".split("|"):
        if mobileua in ua:
            g.isphone = True
            break
    else:
        g.isphone = False
```

## 限制特定get整数参数的取值

```
def limit_param(param_name, default_value, minvalue, maxvalue):
    """
    example: p = limit_param("p", 1, 1, 5)
    """
    if maxvalue<minvalue:
        maxvalue = minvalue
    try:
        data = int(request.args.get(param_name, default_value))
    except:
        data = default_value
    if data<minvalue:
        data = minvalue
    elif data > maxvalue:
        data = maxvalue
    return data
```

## 要求登录的decorator

用法: `@require_login()` 注意使用时添加到`@app.route`行的后面

```
import functools
from flask import session, abort, redirect
def require_login(code=200, text="login first", jumptologin=False):
    def real_decorator(func):
        @functools.wraps(func)
        def wrapper(*args,**kwargs):
            if "username" not in session:
                if jumptologin:
                    return redirect("/signin?error=needlogin&next="+signit(request.path))
                elif code==200:
                    return text
                else:
                    abort(code)
            else:
                return func(*args, **kwargs)
        return wrapper
    return real_decorator
```

## import引入列表

```
from flask import Flask, render_template, Blueprint, request, redirect, Markup, g, session, abort, Response, make_response, send_file, jsonify
from werkzeug.utils import secure_filename
import time
import datetime
import random
import pickle
import requests
import os
import sys
import traceback
import mimetypes
import string
import re
import hashlib
import json
```

## request怎么拿到url的各个部分

来自https://stackoverflow.com/questions/15974730/how-do-i-get-the-different-parts-of-a-flask-requests-url

request:

`curl -XGET http://127.0.0.1:5000/alert/dingding/test?x=y`

then:

```
request.method:              GET
request.url:                 http://127.0.0.1:5000/alert/dingding/test?x=y
request.base_url:            http://127.0.0.1:5000/alert/dingding/test
request.url_charset:         utf-8
request.url_root:            http://127.0.0.1:5000/
str(request.url_rule):       /alert/dingding/test
request.host_url:            http://127.0.0.1:5000/
request.host:                127.0.0.1:5000
request.script_root:
request.path:                /alert/dingding/test
request.full_path:           /alert/dingding/test?x=y

request.args:                ImmutableMultiDict([('x', 'y')])
request.args.get('x'):       y
```

----

## 遇到性能瓶颈做profiling看函数耗时

找到对uwsgi应用做profiling的[dozer](https://mg.pov.lt/blog/profiling-with-dozer.html)库

使用方法：

1. 先安装python3对应的uwsgi：`apt install uwsgi-plugin-python3`
2. 写一个python脚本包装app，如`profiler_app.py`：

```
#!/usr/bin/python3
from app import app
from dozer import Profiler
appx = Profiler(app, profile_path="/tmp/profiles")

if __name__ == "__main__":
    import os
    os.system("uwsgi -w profiler_app:appx --http :80")
```

3. 别忘记`mkdir /tmp/profiles` 然后就可以启动了`python3 profiler_app.py`
4. 使用http://127.0.0.1/_profiler/ 查看结果，可以点开每个请求看各个函数耗时详情

----

## lazyload 延迟加载耗时的初始化操作

需求：特定页面需要加载一些耗时的资源，如果在应用启动的时候做加载，此时新来的请求就必须等待这个加载才能完成；而实际上这个init并非所有请求都必须的，想做一个lazyinit: 在不影响正常请求的前提下尽快完成init函数

我的做法：设计一个`/lazyinit`路由函数做初始化工作，在重新部署/重启flask服务的时候同时启动一个简单的python脚本反复请求这个url直到所有的进程都已经触发

这样利用uwsgi自身就有的多进程负载均衡，每次最多只会有一个进程做初始化工作，其他进程可以正常处理请求；坏处就是在日志里面产生一些垃圾吧，影响不大

问题来了 uwsgi怎么知道当前是哪个进程呢 我发现threading提供的进程名称是字符串`b'uWSGIWorker2Core2'`，其中`Worker`后面的数字就是进程ID 不同进程ID的全局变量是不同的

代码：

flask中的`/lazyinit`实现，返回处理当前请求的worker id：

```
import threading
def get_workerid():
    # return uwsgi worker id: int
    threadname = threading.current_thread().name
    id_str = threadname.lower().split("worker")[1].split("core")[0]
    return int(id_str)

HAS_INITED = False

@app.route("/lazyinit")
def lazyinit():
    workerid = get_workerid()
    
    if not HAS_INITED: # skip init if has already initialized
        sleep(1) # do real init code...
        HAS_INITED = True
    
    return str(workerid)
```

这是反复请求的代码，重复请求最多100次，直到所有4个进程都已经触发，其中uwsgi的workerid是从1开始计数的

```
MAX_TRIES = 100
PROCESS_COUNT = 4

import requests
i = 0
status = [False]*PROCESS_COUNT
for i in range(MAX_TRIES):
    id = requests.get("http://127.0.0.1/lazyinit?id="+str(i)).text
    id = int(id) - 1
    status[id] = True
    if all(status):
        break
```

## 让app.run启动的服务器使用HTTP/1.1

就是这个问题： https://www.reddit.com/r/flask/comments/634i5u/make_flask_return_header_response_with_http11/

人家认为Flask不支持，其实flask使用的是`werkzeug.serving`，最底层还是BaseHTTPRequestHandler，而这个是支持HTTP/1.1的，只是默认HTTP/1.0而已

实际发送请求`HTTP/1.1 200 OK`是这个类的`send_response`函数，用到`protocol_version`这个属性，而这个属性是类的属性（不是在__init__函数赋值的），所以我们可以直接修改 之后创建的对象就会自动拥有新的值

在调用之前添加以下几行即可

```
try:
    from http.server import BaseHTTPRequestHandler
except: #PY2
    from BaseHTTPServer import BaseHTTPRequestHandler
BaseHTTPRequestHandler.protocol_version = "HTTP/1.1"
```