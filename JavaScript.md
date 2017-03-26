# 使用localStorage

Cookie存数据影响访问速度(每次请求都需要带上Cookie)，使用localStorage存储有更大容量，还不易丢失

建议将用户的大段输入随时存储到localStorage中

高级应用可以是把js等代码文件这样缓存到本地，安全性讨论见[https://imququ.com/post/enhance-security-for-ls-code.html](https://imququ.com/post/enhance-security-for-ls-code.html)

```
//写入
var storage=window.localStorage;
storage["a"]=1;
//清空
window.localStorage.clear();
```

----

# 使用phantomjs爬取网页

有些时候我们用Python的requests并不能很完美地渲染好网页，例如人家用酷炫的js作图了，我就想得到这张图，这时候用phantomjs就好啦

爬取目标：

[http://oncokb.org/#/gene/AKT1](http://oncokb.org/#/gene/AKT1)

这个网页的右边有一张Tumor Types with AKT1 Mutations的图

代码：

[code/spider.oncokb.js](code/spider.oncokb.js)

代码的细节：

1. 打开页面之前为了截图方便需要先设置浏览器的大小，这里设置为了1920*1080

2. 不要一打开页面就截图，而是等到页面加载好了最后一个请求(从Chrome开发人员工具查看最后的请求是啥)后，再等待5s后执行截图、导出HTML并退出

3. 为了防止无限等待，设置最长2min后timeout退出

4. 为了方便批量化处理，从命令行参数读取需要爬取的基因名称

5. 在运行的时候有设置代理和不要载入图片的参数，具体见[官方文档](http://phantomjs.org/api/command-line.html)