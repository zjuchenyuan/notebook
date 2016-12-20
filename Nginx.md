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