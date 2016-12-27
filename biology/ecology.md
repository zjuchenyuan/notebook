#生态数据处理，使用QIIME

# 作业要求

1. De-novo OTU picking以及OTU table的制作
2. alpha多样性分析：优势种(>5%/10%)的Relative Abundance分布图；Rarefaction Curve( Shannon, Simpson, Observed species)
3. beta多样性分析： Unweighted/Weighted Unifrac PCoA分析
4. 群体性分析：NMDS分析--R
   差异分析（Adonis，ANOSIM，MRPP）--R

----

# 获得数据 Obtaining the data

从群共享下载到三个文件，简介：

## BF_Map.txt 5.10KB

这是对原始测序fna文件的描述，是原始数据

|SampleID|BarcodeSequence|LinkerPrimerSequence|Treatment|Plate|Description|
| --------   | -----:  | :----:  |
|样本ID|用于区分样本的序列|测序时加上的序列|样本的处理，Control与Warming||描述，有TagA,TagB,TagC|

## otu_table_F.txt 23.9MB

OTU是在数量分类学方面作为对象的分类单位

计算得出的OTU Table

每行一个OTU，如果匹配到数据库上有微生物的物种分类数据，以及每个样本是否包含这个OTU--包含为1，不包含为0

## otus_BF.rar 36.7MB

内含otus_BF文件夹，为**De novo OTU picking**步骤的生成结果

# 从头开始的OTU组装 De novo OTU picking

由于缺少原始文件，本步骤无法复现，运算结果为给出的otus_BF.rar

此步骤生成了**rep_set.tre**，使用**FigTree**软件进行查看：

![](http://api.chenyuan.me/fangcloud/4cf9ea4acb452aa8e0df0fe0fd)

## 查看产生的OTU Table

[summarize.txt](http://api.chenyuan.me/fangcloud/9c76ee31266efbf411e51c8388)

一共有50个样本，参照给出的原始BF_Map.txt（72个样本），
发现其中的F.TagA.3C.12和F.TagA.3C.13的Count数太小可以忽略，比较两个文件发现**ID为TagA的都没有出现在给出的OTU Table中**

技术Point:用Excel比较两列相同元素http://jingyan.baidu.com/article/c843ea0b7a2a7477921e4a47.html

## Make an OTU network

人家说要用Cytoscape，有待研究

生成的otu_network文件夹[戳这里下载](http://api.chenyuan.me/fangcloud/a8c63020d9a7d1426cf05a7a77)


# 物种分类统计 Summarize communities by taxonomic composition

[生成的taxa_summary文件夹,戳我下载](http://api.chenyuan.me/fangcloud/cff3d489af54eaea157838719c)

> 这里是重点

打开taxa_summary/taxa_summary_plots文件夹，里面有两个网页，

网页打开后5张图，每张图的横坐标都是50个样本，从上到下分类阶元越来越细

选择最高层次的这张bar图吧：

![](http://api.chenyuan.me/fangcloud/312423426ec71e733de254fbfe)

解压压缩包后打开网页，用鼠标抚摸这张图可以看到分类信息

底下红色是最多的，是Other

其次最多的看起来是上边的红色的，Proteobacteria

## 产生热图Make a taxonomy heatmap

![](http://api.chenyuan.me/fangcloud/c8d28241ed373bd3901a2d848a)

----

#计算alpha多样性

[生成的arare文件夹戳我下载](http://api.chenyuan.me/fangcloud/c07dc497e5679ca505967eb9a5)

alpha多样性的计算结果在arare/alpha_div_collated中，里面有

* shannon.txt
* simpson.txt
* observed_otus.txt 这就是PPT要求的Observed species

每一列是一个样本

每一行行是取样大小+迭代次数：

> rarefaction_##_#.txt: the first set of numbers represents the number of sequences sampled, and the last number represents the iteration number

用不同的采样大小可以得到不同的数值，就可以画出下面这些图

## 看alpha稀疏图

首先了解这是个什么东西 [Wikipedia](https://en.wikipedia.org/wiki/Rarefaction_(ecology))

![shannon.png](http://api.chenyuan.me/fangcloud/f4be696682a9f7941f7f0afd64)

![simpson.png](http://api.chenyuan.me/fangcloud/69404575b5438324d08f0dbc0f)

![observed_otus.png](http://api.chenyuan.me/fangcloud/30bad21c580339cc18fb44a299)


问题：如果使用Category:Treatment, 数据上很多NaN，看不出不同处理的显著性差异

----

# 计算beta多样性 Compute beta diversity and generate ordination plots

[bdiv_even146.zip戳我下载](http://api.chenyuan.me/fangcloud/ba56a4a459ee7238a8af6c3d3b)

## Unweighted

> 红色Control
> 蓝色Warming

![unweighted1.jpg](http://api.chenyuan.me/fangcloud/8c4f7c22f6db3f0a54151c01e4)

![unweighted2.jpg](http://api.chenyuan.me/fangcloud/95708ac65084d85de8a76e517c)

Treatment上没有显著性区别

那什么具有显著性区别呢？

手工标上颜色：

黄色 TagC_13
绿色 TagB_13
蓝色 TagC_12
红色 TagB_12

![unweighted_my.jpg](http://api.chenyuan.me/fangcloud/6ff9f674acdb65c53e1cf08021)

发现**样本最后的标号12与13才是最显著的区别来源**！

## Weighted

![weighted.jpg](http://api.chenyuan.me/fangcloud/06dcc48950634f7915733ed093)

同样在Treatment上没有显著性差异