#查看表结构

desc 表名称;

----

#MERGE存储引擎

官方文档：http://dev.mysql.com/doc/refman/5.7/en/merge-storage-engine.html

查看能用的引擎：**show engines**

##创建一个这样的表：

假设有a,b表，他们的结构完全相同，然后就可以建立一个c表和他们的ddl完全一致

```sql
CREATE TABLE a (
   `id` int(11) NOT NULL,
  `data` longtext NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE= MyISAM DEFAULT CHARSET=utf8;
CREATE TABLE b (
   `id` int(11) NOT NULL,
  `data` longtext NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE= MyISAM DEFAULT CHARSET=utf8;
drop table if exists data;
CREATE TABLE c (
   `id` int(11) NOT NULL,
  `data` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE= MRG_MYISAM ,UNION=(a,b);
```