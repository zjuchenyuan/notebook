# Nginx

记录用到的配置，说不定你也能遇到这些特殊需求呢~

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

为简化操作，我写了一个更加方便的(getcert.py)[code/getcert.py]

###使用方法：

####第一步：

配置相应网站的nginx conf中的server里面，加入这个：

```
    location /.well-known/acme-challenge {
        alias 保存密钥的目录;
        try_files $uri =404;
    }
```

记得运行后 `nginx -s reload`

####第二步，创建私钥并提交申请：

````
./getcert.py 文件名称 该证书包含的域名列表
````

例如这样就能获得一张涵盖zjusec.com三个子域名的证书：./getcert.py zjusec zjusec.com,www.zjusec.com,web.zjusec.com

####第三步，加上https的配置：

```
server {
    listen 443;
    server_name 域名1 域名2;
    access_log /tmp/access.log;
    error_log /tmp/error.log;
    ssl on;
    ssl_certificate 密钥目录/名称.crt;
    ssl_certificate_key 密钥目录/名称.key;
    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;
    ssl_ciphers 'AES128+EECDH:AES128+EDH';
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers  on;
    其他配置。。。
}
```