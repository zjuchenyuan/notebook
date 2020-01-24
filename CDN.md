

## UPYUN

### FTP

人家支持用ftp传输文件，而且用ftp似乎不对流量计费

ftp://v0.ftp.upyun.com 

用户名是"操作员名/服务名"（其中/字符是用户名的一部分）,密码为"操作员密码"

### UpyunManager

http://micyin.b0.upaiyun.com/manager-for-upyun/manager-for-upyun-0.0.6-win32.exe


### curlftpfs

在这种情境下可靠性不高，不建议使用

http://curlftpfs.sourceforge.net/

注意命令中的 ftp://用户名:密码@v0.ftp.upyun.com 其中的用户名的/符号需要改为%2f

### python规则刷新

本代码作为EasyLogin项目的一个例子

[https://github.com/zjuchenyuan/EasyLogin/tree/master/examples/upyun](https://github.com/zjuchenyuan/EasyLogin/tree/master/examples/upyun)

### python调用API进行URL刷新

官方文档：http://docs.upyun.com/api/purge/

[我的代码upyun_purge.py](code/upyun_purge.py)

注意操作员要被授权，调用API正常的返回值就是`{'invalid_domain_of_url': {}}`，不要看到invalid就以为出错了hhh

### 使用upyun提供的webp功能节省流量

无需任何代码，只需要在原图后面加上`!/format/webp`即可，假设已经在使用自定义图片格式，例如`!compress`则变为`!compress/format/webp`可以进一步节省流量

官方说明：https://www.upyun.com/webp.html

### 使用边缘规则修复改版导致的404问题

本站原版使用的Jekyll将xxx.md编译为xxx.html，现在改用MkDocs后xxx.md编译得到的是xxx/index.html，原先的链接就404了

又拍云能配置边缘规则 进行URL改写，用户在访问xxx.html的时候实际回源xxx/

而且配置挺简单，只要会写正则即可

配置规则如下：

条件判断： 如果请求URI 正则匹配 `^/[^/]*html$`
功能选择： URL改写
    URI 字符串提取： `^/([^/]*).html$`
    改写规则：`/$1/`
break: 打勾
----

### 使用边缘规则实现upyun TOKEN反盗链功能

想只对特定url使用token反盗链，于是就使用边缘规则来实现一下完全兼容反盗链的算法咯

发现一个坑：又拍云的边缘规则的`$SUB`函数 其from和to是从1开始计数的，包括from，也包括to

URI 字符串提取不填，break不选，规则编辑器填以下内容

```
$WHEN($MATCH($_URI, '这里填URI匹配正则'),$OR($GT($_TIME, $SUB($_GET__upt, 9,99)),$NOT($_GET__upt), $NOT($EQ($SUB($MD5('这里填TOKEN''&'$SUB($_GET__upt, 9,99)'&'$_URI),13,20),$SUB($_GET__upt, 1,8)))))$EXIT(403)
```

## Qiniu

### 使用qshell上传文件夹

    qshell qupload [<ThreadCount>] <LocalUploadConfig>

需要写一个config文件，具体参见官方文档

[http://developer.qiniu.com/code/v6/tool/qshell.html](http://developer.qiniu.com/code/v6/tool/qshell.html)

[https://github.com/qiniu/qshell/wiki/qupload](https://github.com/qiniu/qshell/wiki/qupload)

## 本地DNS不靠谱？用HTTP DNS访问正确的CDN节点

情形：用户的DNS不靠谱，不遵循CDN DNS的TTL设置，导致用户得到的节点IP已经过期失效，导致网站上的图片无法加载

解决方案：使用[阿里云的HTTP DNS](https://help.aliyun.com/document_detail/30102.html) (支持HTTPS请求)，网页端访问图片时如果出错替换为**指定IP的CDN节点**

### HTTP DNS接入

按照文档操作即可： https://help.aliyun.com/document_detail/30113.html

注意到目前`https://203.107.1.33`会证书错误，改用`https://203.107.1.1`即可

这个接口支持跨域请求：

```
$.get("https://203.107.1.1/100000/d?host=www.aliyun.com",null,function(data){
    var ip = data.ips[0];
    console.log(ip);
});
```

### 泛域名解析

参考 [sslip.io](https://sslip.io)

假设我们有已经备案的域名`example.com`，使用`xip.example.com`作为泛域名解析的域名，也就是说`140-205-34-3.xip.example.com`就会解析到`140.205.34.3`

只需要设置4条NS记录即可：

```
ns-aws.nono.io
ns-gce.nono.io
ns-azure.nono.io
ns-vultr.nono.io
```

### 申请泛域名的https证书

参见： https://py3.io/Nginx/#acmesh

### 配置CDN

将泛域名绑定到CDN服务上，并提供申请到的HTTPS证书，开启HTTPS访问

### 前端JS

下述代码出错时将把图片src的`www.aliyun.com`替换为`1-2-3-4.xip.example.com`，特点：

- 只要一张CDN的图片已经出错就会开始替换所有坏图
- 不会替换已经成功加载的图片
- 使用localStorage缓存HTTP DNS的查询结果 缓存一周
- 存储了DNS的TTL结果，如果TTL已经过期就再次查询（所以上面缓存一周其实没用，TTL一般就10分钟）

参考： 

- https://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
- https://stackoverflow.com/questions/92720/jquery-javascript-to-replace-broken-images

依赖lscache: https://github.com/pamelafox/lscache

```
var cdnupdating = false;

function updatecdn(cb){
    if(cdnupdating) return;
    cdnupdating = true;
    $.get("https://203.107.1.1/100000/d?host=www.aliyun.com",null,function(data){
        var ip = data.ips[0];
        var domain = ip.replace(/\./g, "-")+".xip.example.com";
        var ddl=new Date()/1000 + data.ttl;
        var cdn = {domain:domain, ddl:ddl};
        lscache.set('cdn', cdn, 604800);
        if(cb) cb(cdn);
    });
}

function fixbrokenimages(cdn){
  if(!cdn) cdn=lscache.get("cdn");
  if(!cdn || cdn.ddl < +new Date()/1000) return updatecdn(fixbrokenimages);
  $('img[src*="www.aliyun.com"]').each(function() {
    if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
      this.src = this.src.replace("www.aliyun.com", cdn.domain);
    }
  });
}
var fixbrokenimages_timer = null;
function image_onerror(){
    //console.log("image_onerror",this.src);
    if(/.*www.aliyun.com.*/.test(this.src)){
        fixbrokenimages();
    }
    if(!fixbrokenimages_timer){
        fixbrokenimages_timer = setInterval(fixbrokenimages , 1000);
    }
}

$('img[src*="www.aliyun.com"]').on('error', image_onerror);
```

----

## UPYUN https证书更新

使用F12开发人员工具看的接口，用Python实现了一下，从手动一个个添加证书中解放出来

https://github.com/zjuchenyuan/EasyLogin/tree/master/examples/upyun/

----

## UPYUN 表单上传怎么用

在功能配置-存储管理页面可以看到文件密钥，[官方帮助文档](https://help.upyun.com/knowledge-base/form_api/#old-authorization)过于分散，这里整理一下必须的步骤

需求：简单的允许上传一个固定文件名的文件，不要过期

首先写一个上传策略policy，然后对它base64，和密钥用&拼接后计算md5

这个脚本将输出变量定义和curl命令，便于复制使用

```bash
key='AAA...AAA'
bucket='demobucket'
filename='img.jpg'

filepath="/${filename}"
policy='{"bucket":"'${bucket}'","expiration":9999999999,"save-key":"'${filepath}'"}'
b64_policy=`echo -n $policy|base64 -w0`

echo UPYUN_POLICY=${b64_policy}
echo UPYUN_SIGN=$(echo -n "${b64_policy}&${key}"|md5sum|awk '{print $1}')
echo "curl https://v0.api.upyun.com/${bucket} -F file=@${filename} -F policy=\${UPYUN_POLICY} -F signature=\${UPYUN_SIGN}"
```

我也提供了一个脚本便于你快速调用：

```
curl -O d.py3.io/up.sh
sh up.sh key bucket filename

# 触发上传只要继续丢给sh就行
sh up.sh key bucket filename|sh
```
