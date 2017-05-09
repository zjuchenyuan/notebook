# Jekyll

目前本站使用 `Github Pages`，采用`Jekyll`转换md为html，所以有必要记录一下折腾Jekyll的过程咯

## 碰到过的坑

1. jekyll 不认 gbk 编码，在转换前需要先将 md 文件编码改为UTF-8

1. 本地编译通过了，但Github就是不认，于是干脆把编译好的html作为Github Pages

1. 转换的时候遇到两个大括号之间的东西会自动用Liquid渲染，导致有一条Docker的笔记就丢了东西并抛出了Warning，之前本着不折腾的原则(就是懒)，直接写了个[compile.sh](compile.sh)在jekyll编译过后用py替换了一下(真不优雅23333)；现在发现了解决方案，参见[本页md文件](Jekyll.md)

## 配置代码高亮并显示行号

代码：

```liquid
{% raw %}
{% highlight java linenos %}
public class HelloWorld {
    public static void main(String args[]) {
      System.out.println("Hello World!");
    }
}
{% endhighlight %}
{% endraw %}
```

效果如下：

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