# gist 记录一些代码片段

## python连接mysql插入、查询

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

## python大小写不敏感字典

```python
from requests.structures import CaseInsensitiveDict
mydict = CaseInsensitiveDict(mydict)
```