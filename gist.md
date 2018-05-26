# gist 记录一些代码片段

## print的时候顺带带上时间

使用这种方式的好处不仅是显示时间，而且可以很方便地将往屏幕输出改为写文件；更优雅的方式是用logging

```python
import time
def myprint(*args, **kwargs):
    args = list(args)
    args[0] = "["+time.strftime("%Y-%m-%d %H:%M:%S")+"] "+args[0]
    print(*args, **kwargs)


```

使用的时候就和print一样使用，可以传入多个参数

```
myprint("aha myprint", 666)
```

## 连接mysql批量插入、查询

```python
import pymysql
import time
def db():
    conn = pymysql.connect(user='root',passwd='123456',host='localhost',port=3306,db='dbname',charset='utf8',init_command="set NAMES utf8mb4", use_unicode=True)
    conn.encoding = "utf8"
    return conn
conn=db()
cur = conn.cursor()
# 批量插入 将list转为一条sql语句执行insert
sql = "insert into TABLENAME values"
for item in ...:
    sql += "('"+"','".join([pymysql.escape_string(str(i)) for i in item])+"'),"
sql = sql[:-1]
try:
    cur.execute(sql)
except:
    print("Error SQL: "+sql)
    time.sleep(1) # 显示出错的SQL语句后稍作等待，也方便Ctrl+C
conn.commit()

# 查一条，返回一个dict
id = ... #id为主键 只会有一条记录
cur.execute("select * from tablename where id="+str(id))
return dict(zip(("id","flag","更多的列名"),list(cur)[0]))
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