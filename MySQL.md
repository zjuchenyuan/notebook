#查看表结构

desc 表名称;

----

#MERGE存储引擎

官方文档：http://dev.mysql.com/doc/refman/5.7/en/merge-storage-engine.html

查看能用的引擎：**show engines**

##创建一个这样的表：

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

#删除表的冗余

两行只有一列(gettime)不同，删除其中一行

```sql
delete t1 from t as t1, t as t2 where
    t1.id = t2.id and
    t1.其他列=t2.其他列 and
    t1.gettime>t2.gettime;
```

----

#修改表 alter table

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

