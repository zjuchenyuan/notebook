# cURL

curl这么有用的东西，还是单独开个文档咯~



![cURL](https://curl.haxx.se/logo/curl-logo.svg)

> 大名鼎鼎的cURL，不必多言；只是它的命令行的运行方式与libcurl用起来差异很大（如比较php的curl用法）

> 官方：https://curl.haxx.se/

> 简单入门：http://www.bathome.net/thread-1761-1-1.html

> **将curl转为python requests** http://curl.trillworks.com/

[下载7.51 x64的Win版本](download/curl.exe)

----

## 模拟浏览器请求

用Chrome开发人员工具，对请求右键，Copy as cURL就好啦

其中如果选择了cmd的版本，是不能用于写bat的，我的做法是复制成bash的版本用python循环之

----

## 基本教程

```
REM 在bat中REM命令表示注释行

REM 简单的get一下
curl http://ip.cn

REM 保存到文件并断点续传（可以不指定文件名-O）
curl -o iplist.txt -c  http://f.ip.cn/rt/chnroutes.txt

REM POST请求，设置Referer，并使用代理
curl http://httpbin.org/post --data "something=somedata" -H "Referer: http://github.com/zjuchenyuan/" --proxy socks5://127.0.0.1:1080

REM 文件上传 @文件名
REM POST模式下的文件上的文件上传，比如
REM <form method="POST" enctype="multipart/form-data" action="http://cgi2.tky.3web.ne.jp/~zzh/up_file.cgi">
REM <input type=file name=upload>
REM <input type=submit name=nick value="go">
REM </form>
REM 这样一个HTTP表单，我们要用curl进行模拟，就该是这样的语法：
curl -F upload=@localfile -F nick=go http://cgi2.tky.3web.ne.jp/~zzh/up_file.cgi

REM 登录路由器
curl http://192.168.1.1 -u admin:admin

REM 存下Set-Cookie
curl -D cookie0001.txt http://www.yahoo.com

REM 使用存储的Cookie
curl -b cookie0001.txt http://www.yahoo.com

REM dict协议查字典，显示详细的请求信息
curl dict://www.dict.org/d:computer -v
```

----

## 还可以循环哟

curl -OJ http://example.com/[1-100].jpg

----

## wget在0b/s时自动重连

From: https://askubuntu.com/questions/72663/how-to-make-wget-retry-download-if-speed-goes-below-certain-threshold

用法：

```
wget -c --tries=0 --read-timeout=20 [URL]
```

其中-c表示断点续传，--tries=0表示无限次重试，--read-timeout指定20s无网络活动就认为出错(默认是15分钟)