# ZJU grs helper 浙大研究生选课助手

版本: v0.3

目前的功能列表：

- “全校开课情况查询”页面 直接进入选课——不再迷茫于没开的课程
- 整合查老师分数与评论显示，选课界面直接看评分——选个好点的老师呗
- 只看特定校区的课程班级——不想校区间奔波？减轻人工筛选负担

## 安装方法

[用 Chrome 的人都需要知道的「神器」扩展：Tampermonkey使用详解](https://sspai.com/post/40485)

然后戳这个链接 确认安装：

https://github.com/zjuchenyuan/notebook/raw/master/code/zju_grs_helper.user.js

### 配置项

只显示特定校区课程：修改代码中的CONFIG_XQ变量

## 使用方法

1. 登录选课网站 http://grs.zju.edu.cn/allogene/page/home.htm
2. 打开“全校开课情况查询”页面（`培养`的最右侧项） http://grs.zju.edu.cn/py/page/student/lnsjCxdc.htm
3. 选择`开课学院`，例如经济学院，查询 

    ![](https://py3.io/assets/img/grshelper_note1.jpg)

    可见`开课号`现在可以点击，找到你想选的课程，即可进入选课

4. 在选课列表中显示查老师网站上的评分数据（如果有多条数据则都显示）

    ![](https://py3.io/assets/img/grshelper_note3.png)

5. 可以点开评分数据查看评论 虽然现在样式emmmm

    ![](https://py3.io/assets/img/grshelper_note4.png)

## 欢迎反馈与贡献

使用遇到bug？需要更多功能？来提个issue吧：

https://github.com/zjuchenyuan/notebook/issues

欢迎给个star咯：

https://github.com/zjuchenyuan/notebook