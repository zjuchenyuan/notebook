# 查看表结构

desc 表名称;

----

# MERGE存储引擎

官方文档：http://dev.mysql.com/doc/refman/5.7/en/merge-storage-engine.html

查看能用的引擎：**show engines**

## 创建一个MERGE表：

假设有a,b表，他们的结构完全相同，然后就可以建立一个c表，注意这个表的定义要与a和b表完全一致

```sql
drop table if exists data;
CREATE TABLE c (
   `id` int(11) NOT NULL,
  `data` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE= MRG_MYISAM ,UNION=(a,b);
```

特点：

这种表不会创建额外的索引，但查询起来比视图速度更快；

不能在这种表上建立全文索引

----

# 删除表的冗余

两行只有一列(这里假设为 gettime )不同，删除其中一行

```sql
delete t1 from t as t1, t as t2 where
    t1.id = t2.id and
    t1.其他列=t2.其他列 and
    t1.gettime>t2.gettime;
```

----

# 修改表 alter table

```sql
ALTER IGNORE TABLE `表名称`
MODIFY COLUMN `id`  int(11) NOT NULL FIRST,
MODIFY COLUMN `user` varchar(66) NOT NULL AFTER `id`,
MODIFY COLUMN `content` longtext NOT NULL AFTER `user`,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`id`),
DROP INDEX `a1`,
ADD INDEX `a1` (`user`);
```

----

# 将中文转为拼音 函数

代码在[code/pinyin.sql](code/pinyin.sql)

----

# 从路径URL获取文件名称

来源 http://stackoverflow.com/questions/17090237/extracting-filenames-from-a-path-mysql

使用SUBSTRING_INDEX函数，假设url此行的内容为"http://example.com/some/path/to/filename.zip"

    select SUBSTRING_INDEX(url, '/', -1) as filename;
    
即可得到一列filename，此行数据为"filename.zip"

----

# 查询优化

## explain发现出现了using filesort

> 参考 http://www.ccvita.com/169.html

如果使用了order by或者group by，需要建索引以优化这个查询

group by用了两个列，两列要合在一起创建索引

## 内存表索引的选择

> 参考 https://dev.mysql.com/doc/refman/5.5/en/optimizing-memory-tables.html

内存表的索引应该选择BTREE

----

# 内存表The table is full

修改MySQL的配置文件/etc/mysql/my.cnf，在[mysqld]下添加/修改两行(下面的值仅供参考,请根据实际情况酌情处理)： 

```
tmp_table_size = 256M // 临时表大小 
max_heap_table_size = 256M // 内存表大小 
```

----

# replace函数替换文本

```
update `content` set value=replace(value,"original content","replaced content");
```

注意replace不要反引号

----

# 简单的split功能，文本转数字

表的设计违背了一列只存放一种数据的原则，搞出了这样一个Text类型的列(假设为info)，格式为"用户名: 数值"

现在需要将数值从这一列中提取出来，并转为int类型

```
convert (
	substr(
		`info`,
		locate(':', `info`) + 2
	),
	unsigned integer
)
```

Google关键词：`mysql split string`,`mysql string to int`

参考：

https://stackoverflow.com/questions/14950466/how-to-split-the-name-string-in-mysql

https://stackoverflow.com/questions/5960620/convert-text-into-number-in-mysql-query

----

## mysqld配置参数调优

> 参考：[https://www.linode.com/docs/databases/mysql/how-to-optimize-mysql-performance-using-mysqltuner](https://www.linode.com/docs/databases/mysql/how-to-optimize-mysql-performance-using-mysqltuner)

使用MySQLTuner这个工具得到一些建议：

```
curl -L http://mysqltuner.pl/ | perl
```

对于其最后给出的参数建议照做即可。

`key_buffer`参数是最关键的参数，决定了mysql占用的内存大小

----

## 支持emoji，从utf8升级到utf8mb4

为了让mysql存储[emoji表情](http://getemoji.com/)，需要进行表的变更操作 以及 连接代码的修改

参考[https://stackoverflow.com/questions/26532722/how-to-encode-utf8mb4-in-python](https://stackoverflow.com/questions/26532722/how-to-encode-utf8mb4-in-python)

#### 表的变更 表的每一个`CHAR`，`VARCHAR`和`TEXT`类型的列都要改为使用utf8mb4

举个例子，表名称{tablename}，修改其`user`列和`content`列，以及表的默认字符集：

```sql
ALTER TABLE `{tablename}`
MODIFY COLUMN `user`  varchar(66) CHARACTER SET utf8mb4 NOT NULL AFTER `edittime`,
MODIFY COLUMN `content`  longtext CHARACTER SET utf8mb4 NOT NULL AFTER `user`,
DEFAULT CHARACTER SET=utf8mb4;
```

#### 连接代码的改动

在执行 insert 的 sql语句之前，先执行这三条sql:

```
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4; 
SET character_set_connection=utf8mb4;
```