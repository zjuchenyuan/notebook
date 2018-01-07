
* TOC
{:toc}

# UPYUN

## FTP

人家支持用ftp传输文件，而且用ftp似乎不对流量计费

ftp://v0.ftp.upyun.com 

用户名是"操作员名/服务名"（其中/字符是用户名的一部分）,密码为"操作员密码"

## UpyunManager

http://micyin.b0.upaiyun.com/manager-for-upyun/manager-for-upyun-0.0.6-win32.exe


## curlftpfs

在这种情境下可靠性不高，不建议使用

http://curlftpfs.sourceforge.net/

注意命令中的 ftp://用户名:密码@v0.ftp.upyun.com 其中的用户名的/符号需要改为%2f

## python规则刷新

本代码作为EasyLogin项目的一个例子

[https://github.com/zjuchenyuan/EasyLogin/tree/master/examples/upyun](https://github.com/zjuchenyuan/EasyLogin/tree/master/examples/upyun)

## python调用API进行URL刷新

官方文档：http://docs.upyun.com/api/purge/

[我的代码upyun_purge.py](code/upyun_purge.py)

注意操作员要被授权，调用API正常的返回值就是`{'invalid_domain_of_url': {}}`，不要看到invalid就以为出错了hhh

## 使用upyun提供的webp功能节省流量

无需任何代码，只需要在原图后面加上`!/format/webp`即可，假设已经在使用自定义图片格式，例如`!compress`则变为`!compress/format/webp`可以进一步节省流量

官方说明：https://www.upyun.com/webp.html

----

# Qiniu

## 使用qshell上传文件夹

    qshell qupload [<ThreadCount>] <LocalUploadConfig>

需要写一个config文件，具体参见官方文档

[http://developer.qiniu.com/code/v6/tool/qshell.html](http://developer.qiniu.com/code/v6/tool/qshell.html)

[https://github.com/qiniu/qshell/wiki/qupload](https://github.com/qiniu/qshell/wiki/qupload)