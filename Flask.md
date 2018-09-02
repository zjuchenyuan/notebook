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

