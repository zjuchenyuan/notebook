# gist 记录一些代码片段

## print的时候顺带带上时间

使用这种方式的好处不仅是显示时间，而且可以很方便地将往屏幕输出改为写文件；更优雅的方式是用logging

```python
import time
def myprint(*args, **kwargs):
    args = list(args)
    args[0] = "["+time.strftime("%Y-%m-%d %H:%M:%S")+"] " + str(args[0])
    print(*args, **kwargs)


```

使用的时候就和print一样使用，可以传入多个参数

```
myprint("aha myprint", 666)
```

## 连接mysql批量插入、查询

config.py:

```python
MYSQL_DB = "web"
MYSQL_USER = "web"
MYSQL_PASSWORD = "sEcret_strOng_passw0rd"
MYSQL_HOST = "localhost"
MYSQL_PORT = 3306
```

```python
from config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB
import threading, pymysql, warnings, time
thread_data = threading.local()

def db():
    global thread_data
    conn = pymysql.connect(user=MYSQL_USER,passwd=MYSQL_PASSWORD,host=MYSQL_HOST,port=MYSQL_PORT,db=MYSQL_DB ,charset='utf8',init_command="set NAMES utf8mb4", use_unicode=True)
    thread_data.__dict__["conn"] = conn
    return conn

def runsql(sql, *args, onerror='raise', returnid=False, allow_retry=True):
    global thread_data
    conn = thread_data.__dict__.get("conn")
    if len(args)==1 and isinstance(args[0], list):
        args = args[0]
    if not conn:
        conn = db()
    if not conn.open:
        conn = db()
    cur = conn.cursor()
    try:
        conn.ping()
    except:
        print("conn.ping() failed, reconnect")
        conn = db()
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            cur.execute(sql, args)
    except pymysql.err.OperationalError as e:
        conn.commit()
        cur.close()
        if allow_retry and ("Lost connection to MySQL" in str(e) or "MySQL server has gone away" in str(e)):
            conn.close()
            conn = db()
            return runsql(sql, *args, onerror=onerror, returnid=returnid, allow_retry=False)
        else:
            raise
    except:
        conn.commit()
        cur.close()
        if onerror=="ignore":
            return False
        else:
            raise
    if returnid:
        cur.execute("SELECT LAST_INSERT_ID();")
        result = list(cur)[0][0]
    else:
        result = list(cur)
    conn.commit()
    cur.close()
    return result

def tags_tagname2ids_set(tagname):
    """
    select查询示例
    返回包含标签tagname的帖子id集合
    """
    sql = "select topicid from tags where tagname=%s"
    sqlresult = runsql(sql, tagname)
    return set([i[0] for i in sqlresult])

def usersettings_write_bool(userid, username, settingname, settingvalue):
    """
    replace查询示例
    写入用户配置信息至usersetting表
    返回bool
    """
    sql = "replace into usersettings values (%s, %s, %s, %s)"
    try:
        runsql(sql, userid, username, settingname, settingvalue)
        return True
    except:
        traceback.print_exc()
        return False
```

## 大小写不敏感字典

```python
from requests.structures import CaseInsensitiveDict
mydict = CaseInsensitiveDict(mydict)
```

## mpms多线程下每个线程单独变量

自己写的类不是线程安全的，所以在多线程下要做到每个线程自己一个变量互不干扰

mpms下使用EasyLogin完整示例代码模板， 先要使用我fork的版本 加上了len支持：

```bash
wget https://d.py3.io/mpms.py
```

```python
from mpms import MPMS
from EasyLogin import EasyLogin
import threading
thread_data = threading.local()

import time
myprint = lambda s: print("[{showtime}] {s}".format(showtime=time.strftime("%Y-%m-%d %H:%M:%S"), s=s))

def worker(id):
    global thread_data
    a = thread_data.__dict__.get("a")
    if not a:
        a = EasyLogin()
        thread_data.__dict__["a"] = a
    pass # do the stuff, like a.get
    return result

def handler(meta, result):
    # meta["fp"].write ...
    pass # do the stuff

if __name__ == "__main__":
    meta = {"fp": open("result.txt","w",encoding="utf-8")}
    m = MPMS(worker, handler, 2, 2, meta=meta)
    m.start()
    for i in range(...):
        m.put(i)
    while len(m)>10:
        myprint("Remaning "+str(len(m)))
        time.sleep(2)
    m.join()
    myprint("Done!")
```

## 将值存入字典中的列表 dict_add_list

判断key是否存在 应该有更好的方法？这个实现还是很naive的

```
def dict_add_list(dictname, key, value):
    if key not in dictname:
        dictname[key] = [value]
    else:
        dictname[key].append(value)

# 如果字典是存储count计数的话 用这个
def dict_incr(dictname, key):
    if key not in dictname:
        dictname[key] = 1
    else:
        dictname[key] += 1
```

## 使用AES加密字符串

https://github.com/ricmoo/pyaes

首先 `pip install pyaes -t .` 注意每次加密的时候都需要重新初始化aes

加密：

```
plaintext = "hello world"

import pyaes,base64
aes = pyaes.AESModeOfOperationCTR(b"This_key_for_demo_purposes_only!")
encrypted_text = base64.b64encode(aes.encrypt(plaintext.encode("utf-8")))

print(encrypted_text) # ipkEJevbnsfbEm4=
```

解密：

```
encrypted_text = "ipkEJevbnsfbEm4="

import pyaes, base64
aes = pyaes.AESModeOfOperationCTR(b"This_key_for_demo_purposes_only!")
plaintext = aes.decrypt(base64.b64decode(encrypted_text)).decode()

print(plaintext) # hello world
```

------

## Python画图 上方颜色，然后M*N个小图

TODO: 增加一张示意图

```
import json
import matplotlib.pyplot as plt 
import seaborn as sns
import matplotlib.gridspec as gridspec
import gzip
import pickle
import os
import shutil

def plotmatrix(M, N, DATA, labels, colors, xlabel, ylabel, fontsize, sep):
    """
    M: how many rows, like 4
    N: how many cols, like 5
    DATA: [{
        "name": "figure title", 
        "lines":[ 
            [[...], [...]],
        ]
    }]
    labels: the label of lines, like [fuzzerA, fuzzerB]
    colors: color of lines, like [red, blue]
    xlabel: like "#Time (days)"
    fontsize: 13
    sep: (wspace, hspace) like (0.5, 0.5)
    """
    assert M*N >= len(DATA)
    fig = plt.figure(figsize=(M*5,N*1.2))
    outer = gridspec.GridSpec(2, 1, wspace=0.2, hspace=0.4, height_ratios= [1, 10])
    inner = gridspec.GridSpecFromSubplotSpec(M,N,subplot_spec=outer[1], wspace=sep[0], hspace=sep[1])
    
    index = -1
    for data in DATA:
        index += 1
        ax = plt.Subplot(fig, inner[index])
        fig.add_subplot(ax)
        plt.title(data["name"])
        for i, line in enumerate(data["lines"]):
            plt.plot(*line, label=labels[i], color=colors[i])
            ax = plt.gca()
            ax.title.set_fontsize(fontsize)
            plt.xlabel(xlabel, fontsize=fontsize-2)
            plt.ylabel(ylabel, fontsize=fontsize-2)
    ax=plt.Subplot(fig, outer[0])
    ax.set_ylabel('')
    ax.set_xlabel('')
    fig.add_subplot(ax)
    ax = sns.boxplot(x=[0]*len(labels), y=[0]*len(labels), sym='', hue=labels, linewidth=0, palette=colors, ax=ax, boxprops={"linestyle":"None"})
    ax.spines['right'].set_visible(False)
    ax.spines['top'].set_visible(False)
    ax.spines['left'].set_visible(False)
    ax.spines['bottom'].set_visible(False)
    plt.xticks([])
    plt.yticks([])
    handles, labels = ax.get_legend_handles_labels()
    plt.legend(handles, labels, loc='center', ncol=8, fontsize=fontsize-1)
    plt.show()
```

----

## 从一系列zip文件中提取C代码

```
from zipfile import ZipFile
import os
for i in os.listdir():
    print(i)
    z = ZipFile(i)
    files = [i.filename for i in z.filelist if i.filename.lower().endswith(".c") or i.filename.lower().endswith(".cpp")]
    files = [i for i in files if "StdAfx" not in i]
    print(files)
    contents = b""
    for f in files:
        c = z.open(f).read()
        if c in contents:
            continue
        contents += c
    open("../output/"+i.split(".")[0]+".asm", "wb").write(contents)
```
----

## 在一批文本中查找可能的密钥

密钥字符串一般为随机字符串，而非英文单词，根据这一特征，我们可以使用去除常见英文单词后的信息熵这一特征来找出可能的密钥字符串

```
import re
from password_strength import PasswordStats
commonwords = set(i.strip() for i in open("google-10000-english.txt").readlines())
def text_entropy(text):
    for word in re.split('[^a-zA-Z]', text):
        if word in commonwords:
            text = text.replace(word, "")
    if not text:
        return 0
    return PasswordStats(text).strength()

```

参考：

- https://pypi.org/project/password-strength/
- https://github.com/first20hours/google-10000-english/

