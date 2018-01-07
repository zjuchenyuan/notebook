# gist 记录一些代码片段

* TOC
{:toc}

## 连接mysql插入、查询

```python
import pymysql
def db():
    conn = pymysql.connect(user='root',passwd='123456',host='localhost',port=3306,db='dbname',charset='utf8',init_command="set NAMES utf8mb4", use_unicode=True)
    conn.encoding = "utf8"
    return conn
conn=db()
cur = conn.cursor()
# 增
for item in ...:
    cur.execute("insert into tablename values("+repr(item)[1:-1]+")")
    conn.commit()
# 查一条，返回一个dict
id = ... #id为主键 只会有一条记录
cur.execute("select * from tablename where id="+str(id))
return dict(zip(("id","flag","更多的列名"),list(cur)[0]))
```

## flask设置一堆静态目录

```python
from flask import Flask, render_template, Blueprint, request, redirect, Markup
app = Flask(__name__)
for path in ['pic', 'skin', 'images', '更多静态目录']:
    blueprint = Blueprint(path, __name__, static_url_path='/'+path, static_folder=path)
    app.register_blueprint(blueprint)
```

## 大小写不敏感字典

```python
from requests.structures import CaseInsensitiveDict
mydict = CaseInsensitiveDict(mydict)
```

## print的时候顺带带上时间

使用这种方式的好处不仅是显示时间，而且可以很方便地将往屏幕输出改为写文件；更优雅的方式是用logging

```python
import time
myprint = lambda s: print("[{showtime}] {s}".format(showtime=time.strftime("%Y-%m-%d %H:%M:%S"), s=s))

myprint("aha myprint")
```

## 用redis存储字典

假设存储一个用户名对应用户ID的字典，名称为USERS，例如{"zhangsan":1, "lisi":2}

```python
import redis
r = redis.StrictRedis(host='localhost', port=6379, db=1) #db参数可以理解为命名空间
assert r.ping() # 是否成功连上

USERS = {"zhangsan":1, "lisi":2}

# 存储字典
r.hmset("USERS", USERS)

# 获得已经存储的字典里面有哪些键，返回bytes的list
KEYS = r.hkeys("USERS") 

# 获得整个字典并转换回原来的类型
USERS1 = {i.decode():int(j) for i,j in r.hgetall("USERS").items()}

# 修改字典中一个key的value
r.hset("USERS","zhangsan",3)

# 删除存储的字典，只能一个个删，先要hkeys获取有哪些键
_=[r.hdel("USERS", key) for key in r.hkeys("USERS") ]

# 扫描式获得已经存储的字典里面有哪些键
## 如果字典里面存储了太多东西，执行KEYS会卡住整个redis，用hscan是更好的选择
## 这里先生成一个比较大的字典存进去
import random, string
randomstr = lambda n: "".join(random.sample(string.ascii_letters, n))
USERS = {randomstr(10): random.randint(1,10000) for _ in range(10000)} # 生成一个1w条记录的字典
r.hmset("USERS", USERS) # 存进去

## 循环hscan
cursor, result = r.hscan("USERS")
while cursor:
    cursor, tmp = r.hscan("USERS", cursor)
    result.update(tmp)

USERS2 = {i.decode():int(j) for i,j in result.items()} #从bytes转为原来的格式
assert USERS==USERS2 #存进去的与取出来的应该相同
```