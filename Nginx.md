# Nginx

记录用到的配置，说不定你也能遇到这些特殊需求呢~


## Nginx思考题

请以批判的眼光阅读以下链接或者自行google，回答以下问题：

http://www.nginx.cn/591.html

1. nginx.conf在你Linux的什么目录下？用什么命令知道的？修改配置后通过什么命令重新载入配置？

2. nginx.conf分为几个部分？我们需要关注的是哪个？

3. nginx.conf中怎么表示注释行？是否留意到include的行载入了额外的配置文件？

4. 如何增加一个虚拟主机，根据域名来区分访问不同的网站？访问者直接访问IP或者错误的域名会匹配到默认网站，怎么配置默认网站？


这些是更为进阶/发散的问题：

1. 静态内容：root与alias有何区别？访问403了怎么办？

2. 动态内容/反向代理：如何做负载均衡、文本替换？

3. 全站https和HTTP/2.0怎么配置？

1. Nginx是否有必要作为一个Docker容器运行？CentOS下Nginx镜像很大，怎么[减小镜像大小](https://www.v2ex.com/t/360759)？

2. Nginx的worker进程一般不是root权限的，那是怎么监听到80端口的？

3. Nginx在处理高并发的时候参数如何调优？

4. 如何在Nginx层面拦截sql注入、密码爆破等安全风险？[VeryNginx](https://github.com/alexazhou/VeryNginx)


## 普通资源允许POST

    error_page 405 =200 @405;


## 不带后缀的文件当成php执行

这里的思路是用反向代理的方式简单实现

    location /path/something {
        proxy_pass http://yourdomain/path/something.php;
        proxy_method GET;
    }

顺带拒绝掉对php后缀的猜测：

    location = /path/something.php {
        if ($remote_addr != '服务器自身IP') {
            return 404;
        }
        include fastcgi.conf;
    }

## http跳转到https

    location /{
        rewrite ^ https://$host$request_uri? permanent;
    }

## 获得Let's encrypt免费https证书

为简化操作，我写了一个更加方便的[getcert.py](code/getcert.py)

### 使用方法：

#### 第一步：

配置相应网站的nginx conf中的server里面，加入这个：

```
    location /.well-known/acme-challenge {
        alias 保存密钥的目录;
        try_files $uri =404;
    }
```

记得运行后 `nginx -s reload`

#### 第二步，运行我的getcert.py（创建私钥并提交申请）：

````
pushd 上述保存密钥的目录
wget https://raw.githubusercontent.com/zjuchenyuan/notebook/master/code/getcert.py
./getcert.py 文件名称 该证书包含的域名列表
````

例如这样就能获得一张涵盖zjusec.com三个子域名的证书：`./getcert.py zjusec zjusec.com,www.zjusec.com,web.zjusec.com`

具体来说，这个脚本会自动下载需要的acme_tiny.py和Let's Encrypt的中间证书，调用openssl创建账号私钥和站点私钥，最终产生 **名称.crt** **名称.key**。

![https.jpg](download/img/https.jpg)


## 使用acme.sh获得泛域名证书

泛域名解析需要使用DNS验证，就需要使用DNS服务的API，即使没有API只要配置一条CNAME指向一个有DNS API的域名即可

首先获得acme.sh

git clone https://github.com/Neilpang/acme.sh

然后拿到cloudflare的API Key，托管b.com

需要拿到能用于a.com和*.a.com的证书，先配置CNAME（参考：https://github.com/Neilpang/acme.sh/wiki/DNS-alias-mode）

_acme-challenge.a.com   =>   _acme-challenge.b.com

执行命令咯：

```
CF_Key=xxx CF_Email=xxx@example.com /root/acme.sh/acme.sh --issue --dns dns_cf -d '*.a.com' --challenge-alias b.com -d a.com --dnssleep 10 --fullchain-file /root/acom.crt --key-file /root/acom.key -f
```

解释：前面两个是配置环境变量，使用cloudflare所以指定--dns dns_cf，然后-d ... --challenge-alias ... -d ... 指定域名和验证用的域名，--dnssleep 10等待10秒DNS生效（默认120秒没必要），--fullchain-file和--key-file 指定生成后把证书文件和密钥文件拷贝到哪

## 配置安全的https

此处参考[https://z.codes/ssl-lab-a-plus-configuration-for-nginx/](https://z.codes/ssl-lab-a-plus-configuration-for-nginx/)

首先从PPA安装nginx, 这样可以保证最新版

```
add-apt-repository ppa:nginx/stable
apt update
apt install nginx
```

创建DH随机质数：

```
openssl dhparam -out /etc/ssl/dhparams.pem 2048
```

创建/etc/nginx/https.conf：

```
listen 443 ssl http2;
add_header Strict-Transport-Security "max-age=31536000" always;
add_header Upgrade-Insecure-Requests "1";
add_header Content-Security-Policy "upgrade-insecure-requests";
ssl_dhparam /etc/ssl/dhparams.pem;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 114.114.114.114 valid=60s;
resolver_timeout 2s;
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 24h;
ssl_buffer_size 1400;
ssl_prefer_server_ciphers  on;
keepalive_timeout 600s;
location ~* /\.(?!well-known\/) {
    deny all;
}
location ~* (?:\.(?:bak|conf|dist|fla|in[ci]|log|psd|sh|sql|sw[op])|~)$ {
    deny all;
}
include mime.types;
```

为需要启用https的站点，在/etc/nginx/sites-enabled/中写入conf文件

```
server {
    listen 443;
    server_name 域名1 域名2;
    access_log /tmp/access.log;
    error_log /tmp/error.log;
    ssl_certificate 密钥目录/名称.crt;
    ssl_certificate_key 密钥目录/名称.key;
    include https.conf
    其他配置。。。
}
```

## 反向代理之替换网页、JS中的文本

使用模块ngx_http_substitutions_filter_module，见Github: https://github.com/yaoweibin/ngx_http_substitutions_filter_module

需要重新编译nginx，Tip: `nginx -V`命令可以显示当前版本的nginx的编译参数

编译后就可以用啦，举个例子：微信的公众号文章页面为了节省用户流量，图片是把页面滚动至所在位置才加载的，代码上的差异就是img标签本应是src的改成了data-src，这里我们要做一个微信的反向代理网站，把data-src替换成src，则可以直接加载所有图片（唔。。。其实还不够，还需要考虑防盗链的问题）；并且设置MIME类型包含Javascript

```
        subs_filter 需要替换掉的内容 替换后的文本;
        subs_filter data-src src;
        subs_filter_types application/x-javascript text/javascript appliation/x-javascript;
```

## 禁止git目录访问

在server块中添加：

```
location ~ /\. {
    return 404;
}
```

相应的Apache可以在httpd.conf中添加：

```
RedirectMatch 404 /\.git
```

## root与alias的区别

From: http://stackoverflow.com/questions/10631933/nginx-static-file-serving-confusion-with-root-alias

一句话概括，root对应的目录会加上location部分去找文件，而alias则不会

```
        location /static/ {
                root /var/www/app/static/;
                autoindex off;
        }
```

如果我们这么写，那么访问static目录下的a.jpg就会去找/var/www/app/static/static目录下的a.jpg，如果没有这个static/static就会404

解决方法有两种：

如果location中的static就是真实目录，root中就不要写static了

```
        location /static/ {
                root /var/www/app/;
                autoindex off;
        }
```

或者用alias就不会再加上location的部分：

```
        location /static/ {
                alias /var/www/app/static/;
                autoindex off;
        }
```

----

## 在bash on win10上使用Nginx

与Linux中安装类似，只要`apt-get install nginx`即可，但可能会发现nginx并不正常工作，日志中是这样的：

```
[alert] 79#0: ioctl(FIOASYNC) failed while spawning "worker process" (22: Invalid argument)
```

解决方案：在/etc/nginx/nginx.conf中添加一行：

```
master_process off;
```

----

## 使上一级服务知道用户IP

```
proxy_set_header realip $remote_addr;
```

这样设置后，Nginx反向代理上一级服务会加上realip这个头，从而传递用户真实的IP（如果是代理则是代理的IP）

----

## Nginx允许列目录

加上`autoindex on`即可，后两项是为了 显示服务器时间而不是GMT时间 以及 以kB,MB,GB为单位显示大小而不是确切的字节数

```
location / {
    autoindex on;
    autoindex_localtime on;
    autoindex_exact_size off;
}
```

----

## 安全地使用SeaweedFS作为图片反向代理服务器

想基于seaweedfs实现一个反向代理的缓存服务器，Nginx先请求A服务器(weedfs filer)，如果还没有存下这张图片(返回404)，切至B服务器(Python flask)去爬取图片并传至weedfs存储

seaweedfs的filer提供了按自己指定的路径上传下载功能（对象存储），就不需要再自己考虑怎么存储path与fid的对应关系了，直接按爬取源的路径存储即可

实现：

### Nginx配置

#### 在http段中添加upstream

注意把B服务器设置为backup 不要参与默认负载均衡

```
upstream up {
        server weedfs:8888;
        server 127.0.0.1:80 backup;
}
```

#### server段配置

我希望访问`/images/hhh.jpg`实际访问`http://weedfs:8888/my_images/hhh.jpg`

关键就是`proxy_next_upstream`

```
location /images/ {
        rewrite ^/images(/.*)$ /my_images$1 break;
        proxy_pass http://up;
        proxy_next_upstream http_404;
        proxy_hide_header Content-Type;
        add_header Content-Type image/jpeg;
        limit_except GET {
                deny all;
        }
}
```

在seaweedfs返回404的时候会继续请求`http://127.0.0.1/my_images/hhh.jpg`

这种rewrite是不会修改POST的url的。。。就很迷，另外允许用户POST上传也是不安全的，这里就直接禁止了非GET方法

#### 修改后端特定header

这里用的是先删除`proxy_hide_header`再添加`add_header`

#### 我还是想让nginx也能支持给seaweedfs上传文件

不要死磕一个location嘛，再配置个呗：

```
location /upload_images/ {
        rewrite ^/upload_images(/.*)$ $1 break;
        resolver 127.0.0.11 valid=10s;
        proxy_pass http://weedfs:8888/my_images$1;
        allow 127.0.0.0/8;
        deny all;
}
```

这样配置的效果是POST `/upload_images/`相当于在POST `http://weedfs:8888/my_images/`

与前述的GET配置是相同的后端路径，上传的文件（如`/123.jpg`）就传到了weedfs的`http://weedfs:8888/my_images/123.jpg`能通过`/images/123.jpg`访问到

#### 配置proxy_pass使用的DNS服务器

由于这个nginx是在Docker容器里面的，weedfs是另一个容器加入网络的时候指定的别名，所以注意上面的resolver设置为与容器/etc/resolv.conf一致的`127.0.0.11`

经过我测试，这个配置必须在location中才有效，放到http里面没用

### Docker 我使用的seaweedfs启动命令

#### 编译镜像 避免丢失filer数据

首先需要自己编译一个Docker镜像，默认的镜像会把filer的leveldb数据存储在根目录，删除容器就会丢失这部分数据

参见：https://github.com/chrislusf/seaweedfs/blob/master/docker/

`filer.toml`:
```
[leveldb]
enabled = true
dir = "/data/filer/"
```

`Dockerfile`:

```
FROM chrislusf/seaweedfs
COPY filer.toml /etc/seaweedfs/filer.toml
```

#### 启动命令

```
docker run -dit --name weedfs --restart=always --user nobody -v /data/weedfs:/data myweed -log_dir=/data/logs/ server -dir /data -filer=true -filer.disableDirListing -volume.publicUrl=weedfs.py3.io

docker network connect useweed weedfs --alias weedfs
```

建议在测试的时候不要用`-filer.disableDirListing`选项，可以列目录来看看到底上传到哪了：`curl  -H "Accept: application/json" "http://weedfs:8888/my_images/?pretty=y"`

另外注意启动前创建文件夹和配置权限：（不要以为人家会给你创建目录）

```
mkdir -p /data/weedfs/logs/
mkdir -p /data/weedfs/filer/
sudo chown -R nobody /data/weedfs
```

### B服务器的实现

```
TARGET_SERVER = "http://images.example.com/"
WEEDFS_FILER_ENDPOINT = "http://nginx/upload_images/"

from flask import Flask, Response
import requests
import io
sess = requests.session()
app = Flask(__name__)

@app.route("/my_images/<name>")
def handler(name):
    x = sess.get(TARGET_SERVER+name)
    sess.post(WEEDFS_FILER_ENDPOINT, files=[('filename', (name, io.BytesIO(x.content)))])
    return Response(x.content, mimetype="image/jpeg") 
```

#### 顺便附上Python库pyseaweed的使用

pip install pyseaweed

如果服务器启动的时候配置的`publicUrl`以`https://`开头，这个`pyseaweed`库是有问题的，需要手动修几处url构造的地方

```
publicurl = "http://localhost:8080/"

from pyseaweed import WeedFS
w = WeedFS("localhost", 9333, use_session=True)
# 上传 也支持传入流
fid = w.upload_file(filename)

# 下载 得到对象字节
data = w.conn._conn.get(publicurl+fid).content
```

## proxy_pass 动态代理

效果：访问`/www.example.com/` 反向代理到`http://www.example.com`，并支持一次跳转

```
location ~ ^/(.*)$ {
	proxy_pass http://$1;
	proxy_intercept_errors on;
	error_page 301 302 307 = @handle_redirect;
}

location @handle_redirect {
	set $saved_redirect_location '$upstream_http_location';
	proxy_pass $saved_redirect_location;
}
```

---

## Nginx隐藏Server头 简单方式

参考： https://serverfault.com/questions/214242/can-i-hide-all-server-os-info

```
apt install -y nginx-extras
```

配置中添加：

```
header_filter_by_lua 'ngx.header["server"] = nil';
```

----

## 使用阿里云函数计算定时更新https证书

为了减少对vps的依赖，逐步将一些在服务器上跑的任务迁移到更加可靠的函数计算

这不是一个详细的教程，你还需要自行探索研究

### 入口

https://fc.console.aliyun.com

关键词： [教程](https://promotion.aliyun.com/ntms/act/fc/doc.html) [定价 128MB是免费的](https://help.aliyun.com/document_detail/54301.html)  [定时触发器](https://help.aliyun.com/document_detail/68172.html) [日志服务](https://help.aliyun.com/learn/learningpath/log.html)

### 代码框架

Python3 先本地`git clone --depth 1 https://github.com/Neilpang/acme.sh`，再创建个index.py 把代码文件夹上传上去

网页上在线编辑index.py不会丢失acme.sh文件夹（只会改动index.py），代码改动后就能直接运行看到结果（实时输出需要去日志服务搜索），还是挺好用的

使用这个代码需要先创建一个可以访问OSS的AccessKey，填入`oss2.Auth`部分——将生成的https证书和私钥存储到OSS，将Key硬编码到代码中不是一个好习惯，这里就简单粗暴实现了

域名验证方式用的是challenge-alias的dns验证，需要将`_acme-challenge.py3.io`设置CNAME到`_acme-challenge.chenyuan.me`。
如果你还需要更多的子域名如`*.subdomain.py3.io`，那也要把`_acme-challenge.subdomain.py3.io`设置CNAME到`_acme-challenge.chenyuan.me`

用的是cloudflare的API，需要提供`CF_Key`和`CF_Email`，你也可以使用[更多的API](https://github.com/Neilpang/acme.sh/wiki/dnsapi)

定时器设置十五天执行一次，cron表达式为：`0 0 0 1,15 * *`

你需要替换下面代码的REGION OSS地域, AK, SK 可以访问OSS的密钥, OSSNAME 使用的OSS名称, CF_Key cloudflare的API Key, CF_Email cloudflare的用户名邮箱, `chenyuan.me` 在cloudflare上托管的域名, `py3io_ATxx`申请得到的证书的名称 加入随机字符串避免被猜到, `["py3.io", "*.py3.io"]` 申请的域名列表

```
# -*- coding: utf-8 -*-
import os
import logging
import random
import os
import oss2
import io
import time
import string
import json
logger = logging.getLogger()
endpoint = 'http://oss-cn-REGION-internal.aliyuncs.com' 
auth = oss2.Auth('AK', 'SK')
bucket = oss2.Bucket(auth, endpoint, 'OSSNAME')

def getcert(name, domains):
    global logger
    try:
        try:
            lasttime = bucket.get_object_meta(name+".crt").last_modified 
            if time.time() - lasttime <= 86400 * 60:
                # do not recreate cert for 60 days
                logger.info('Skip cert for '+name)
                return
        except:
            pass
        
        logger.info('Getting cert for '+name)
        domain_text = "-d '" + "' -d '".join(domains) + "'"
        cmd = "CF_Key=xxx CF_Email=xxx@yyy.com ./acme.sh/acme.sh --issue --dns dns_cf "+domain_text+" --dnssleep 5 --fullchain-file /tmp/"+name+".crt --key-file /tmp/"+name+".key -f "
        if name != "chenyuan.me":
            cmd += "--challenge-alias chenyuan.me"
        print("acme.sh --issue"+cmd.split("--issue")[1])
        assert os.system(cmd)==0, "get cert failed"
        bucket.put_object_from_file(name+".crt", "/tmp/"+name+".crt")
        bucket.put_object_from_file(name+".key", "/tmp/"+name+".key")
        logger.info('Done for '+name)
    except Exception as e:
        logger.exception("exception happend: "+ name)

def handler(event, context):
    getcert("py3io_ATxx", ["py3.io", "*.py3.io"])
    return 'ok'
```

### 更多说明

取得一个域名的证书大约需要1~2分钟，由于函数计算允许的最长超时是600秒，还有考虑网络因素（毕竟cloudflare和let's encrypt都在国外），
是有可能失败的

我采取的策略就很简单粗暴 每15天执行一遍，一个域名失败了不影响其他域名的尝试，60天内成功了的域名不会反复申请，总会成功的

安全性：为了便于将证书部署到web服务器，OSS仓库是设置成公开读的，这样就可能泄露私钥文件（攻击者知道OSS名称，猜到文件名称），你可以用Referer限制来增加一点安全性

### web服务器上的部署

也是写一个定时任务咯 `0 0 0 3,17 * *`，每个月3号和17号用curl获取一下最新的证书

如果nginx的配置原先就是错的，不会尝试更新证书

如果更新证书后nginx无法启动（比如无法连上阿里云下载的文件为空或404），会回滚这个改动，保证nginx仍然可以启动

你需要替换下面代码的NAME, OSSNAME, REGION 同上, Referer_STRING 在OSS设置的只允许这个Referer_STRING访问 不允许Referer为空 增加安全性

```
#!/bin/bash
set -ex
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
cd /var/www
NAME="py3io_ATxx"
curl -o ${NAME}.crt.new https://OSSNAME.oss-cn-REGION.aliyuncs.com/${NAME}.crt -H "Referer: Referer_STRING"
curl -o ${NAME}.key.new https://OSSNAME.oss-cn-REGION.aliyuncs.com/${NAME}.key -H "Referer: Referer_STRING"
nginx -s reload
mv ${NAME}.crt ${NAME}.crt.old
mv ${NAME}.key ${NAME}.key.old
mv ${NAME}.crt.new ${NAME}.crt
mv ${NAME}.key.new ${NAME}.key
nginx -s reload || (mv ${NAME}.crt.old ${NAME}.crt; mv ${NAME}.key.old ${NAME}.key)
```
