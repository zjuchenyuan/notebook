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
