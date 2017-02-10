# PHP

## 显示错误信息

PHP返回500，不知道发生了啥，就在php文件开头显示所有错误：

```
<?php
    ini_set('display_errors', true);
    error_reporting(E_ALL);
```