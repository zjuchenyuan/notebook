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