# PHP

* TOC
{:toc}

## 显示错误信息

PHP返回500，不知道发生了啥，就在php文件开头显示所有错误：

```
<?php
    ini_set('display_errors', true);
    error_reporting(E_ALL);
```

## 全页面iframe

```
<!DOCTYPE html>
<body style="padding:0; margin:0;">
<iframe src="https://py3.io" style="visibility: visible;height: 100%; position:absolute" allowtransparency="true" marginheight="0" marginwidth="0" frameborder="0" width="100%"></iframe>
</body></html>
```