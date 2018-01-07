# Ubuntu桌面版使用

使用ubuntu16.04桌面版的一些折腾

* TOC
{:toc}

## 安装Google拼音并配置代理

安装请参考[这篇文章-ubuntu安装谷歌拼音输入法](https://www.linuxdashen.com/ubuntu%E5%AE%89%E8%A3%85%E8%B0%B7%E6%AD%8C%E6%8B%BC%E9%9F%B3%E8%BE%93%E5%85%A5%E6%B3%95%EF%BC%88fcitx%E8%BE%93%E5%85%A5%E6%B3%95%E6%A1%86%E6%9E%B6%EF%BC%89)

其中在`im-config`切换为`fcitx`后，无需重启，只需要注销后再次登录即可（注销不会影响screen中的任务）

安装后最为有用的云候选功能由于需要配置代理才能用，配置方法：
打开一个terminal（建议启动一个screen），配置环境变量，然后重启fcitx：

```
export http_proxy="http://127.0.0.1:8118"
export https_proxy="http://127.0.0.1:8118"
fcitx -r
```
