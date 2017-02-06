# 查看表结构

desc 表名称;

----

# MERGE存储引擎

官方文档：http://dev.mysql.com/doc/refman/5.7/en/merge-storage-engine.html

查看能用的引擎：**show engines**

## 创建一个这样的表：

假设有a,b表，他们的结构完全相同，然后就可以建立一个c表和他们的ddl完全一致

```sql
drop table if exists data;
CREATE TABLE c (
   `id` int(11) NOT NULL,
  `data` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE= MRG_MYISAM ,UNION=(a,b);
```

特点：

这种表不会创建索引，比视图速度更快；

但不能在这种表上建立全文索引

----

# 删除表的冗余

两行只有一列(gettime)不同，删除其中一行

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