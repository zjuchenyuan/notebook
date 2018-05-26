

# Jekyll

目前本站使用 `Github Pages`，采用`Jekyll`转换md为html，所以有必要记录一下折腾Jekyll的过程咯

## 碰到过的坑

1. jekyll 不认 gbk 编码，在转换前需要先将 md 文件编码改为UTF-8

1. 本地编译通过了，但Github就是不认，于是干脆把编译好的html作为Github Pages

1. 转换的时候遇到两个大括号之间的东西会自动用Liquid渲染，导致有一条Docker的笔记就丢了东西并抛出了Warning，之前本着不折腾的原则(就是懒)，直接写了个[compile.sh](compile.sh)在jekyll编译过后用py替换了一下(真不优雅23333)；现在发现了解决方案，参见[本页md文件](Jekyll.md)

## 配置代码高亮并显示行号

代码：

```liquid
{% highlight java linenos %}
public class HelloWorld {
    public static void main(String args[]) {
      System.out.println("Hello World!");
    }
}
{% endhighlight %}
```

效果如下：(由于现在已经不再使用Jekyll，所以看不出了23333）

{% highlight java linenos %}
public class HelloWorld {
    public static void main(String args[]) {
      System.out.println("Hello World!");
    }
}
{% endhighlight %}

## 解决Github Metadata Warning

>* 参见http://mycyberuniverse.com/web/fixing-jekyll-github-metadata-warning.html

在执行build或serve时，会给出这样的Warning:

```
GitHub Metadata: No GitHub API authentication could be found. Some fields may be missing or have incorrect data.
```

解决方法详细版请见上述链接，简要版：在Github的设置中得到一个能访问公开repo的token，用以下命令配置环境变量，其中abc123改为自己的token

```bash
export JEKYLL_GITHUB_TOKEN='abc123'
```

## 解决Markdown有序列表被文字间隔的问题

参考： http://stackoverflow.com/questions/18088955/markdown-continue-numbered-list

在写3. 之前加入相应的编号控制：

```
{:start="3"}
```

----

# 安装Jekyll

搜索jekyll发现官网[https://jekyllrb.com/](https://jekyllrb.com/)

安装过程一点都不简单， 我的系统环境：ubuntu16.04 on win10

安装命令参考官网及[国内镜像 Ruby China](https://gems.ruby-china.org/)，还踩了[坑1](https://stackoverflow.com/questions/4304438/gem-install-failed-to-build-gem-native-extension-cant-find-header-files), [坑2](https://github.com/flapjack/omnibus-flapjack/issues/72)

```
apt install -y ruby ruby-dev zlib1g-dev nodejs # 其中zlib是安装依赖nokogiri（这个依赖编译特别慢）所必须的，其中nodejs是需要的javascript运行环境
gem update --system # 这里请翻墙一下
gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
gem install jekyll bundler

# 配置github-pages所需的Gemfile，也使用国内镜像源
echo """source 'https://gems.ruby-china.org'
gem 'github-pages', group: :jekyll_plugins""">Gemfile
bundle install # 耐心等待编译
```