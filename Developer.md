## 保持技术精进

先得有方向，我用这个技术能给我带来什么回报？找到内在动力

1. 读书，学习视频课程

2. 去阅读源码，大的开源项目有新的技术、巧妙的设计、优良的架构，对自己写代码、架构的能力都有非常大的提升

3. 在项目中使用自己想用的技术，解决现实问题

4. 加入开源项目，和牛人一起工作，向牛人看齐

5. 加入高手的社群，与优秀的人在一起

----

## 如何明智地向程序员提问

From: https://z.codes/how-to-ask-computer-question/

### 简短版

我现在遇到一个问题X

我想到可能的原因是a, b, c

我排除了以下可能性d, e, f

我尝试过以下方案g, h, i

请问还有什么是我遗漏的?

### 首先你需要明白

* 程序员们只偏爱艰巨的任务，或者能激发他们思维的好问题

* 对方没有义务忍耐你的无知和懒惰

* 周全的思考，准备好你的问题，草率的发问只能得到草率的回答，或者根本得不到任何答案

### 提问之前

* 用中**英文**进行**Google**, 翻前两页的结果, 往往Stack Overflow网站上的答案就是正确答案. 如果没有找到, **更换可能的关键词多次尝试**

* 在FAQ/文档里找答案, 耐心读英文文档是基本素养

### 发问的形式

<ul>
<li><p>使用言简意赅，描述准确的标题</p>
</li>
<li><p>精确描述, 信息量大, 但是不啰嗦</p>
<ul>
<li><p>尽可能详细而明确的描述症状</p>
</li>
<li><p>提供问题发生的环境（机器配置、操作系统、应用程序以及别的什么）</p>
</li>
<li><p>说明你在提问前是怎样去研究和理解这个问题的</p>
</li>
<li><p>说明你在提问前采取了什么步骤去解决它</p>
</li>
<li><p>在自己的尝试中, 排除了哪些可能的原因</p>
</li>
<li><p>罗列最近做过什么可能有影响的硬件、软件变更</p>
</li>
<li><p>尽量想象一个程序员会怎样反问你，在提问的时候预先给他答案</p>
</li>
</ul>
</li>
<li><p>对每一个关键步骤截图, 如果有错误信息, **截图和文字版**连同产生问题的**代码**都要发给对方</p>
</li>
<li><p>给出自己出问题的代码, 必须是对方复制后就能立即运行, 并且复现问题的最简代码.  删去与问题无关的部分</p>
</li>
<li><p>别问应该自己解决的问题, 避免无意义的疑问</p>
</li>
</ul>

### 问题解决后

* 简短说明自己是如何解决的, 后续尝试的过程

* 如果别人对你有帮助, 感谢一下对方, 比如发个红包什么的

### 附加

![](assets/img/how_to_ask_question.jpg)

### 参考

电脑出现故障，如何正确地提问 [https://vjudge1.github.io/2015/07/01/how-to-ask.html](https://vjudge1.github.io/2015/07/01/how-to-ask.html)

你会问问题吗 [http://coolshell.cn/articles/3713.html](http://coolshell.cn/articles/3713.html)

《提问的艺术：如何快速获得答案》（精读版） [http://bbs.csdn.net/topics/390307835](http://bbs.csdn.net/topics/390307835)

### 本文的图片版

(方便在聊天工具里甩给对方):

![如何明智地向程序员提问](assets/img/how-to-ask-computer-question.png)

----

## 使用chrome缓存找到被删的qq空间的图片

看到有好友秀恩爱，然后就没有权限访问了，但打开过的图片有chrome缓存，于是便尝试从缓存找到图片url

chrome的缓存可以在这里找到：

```
chrome://cache/
```

然后随意点开一张qq空间的图片，发现其包含psb（毕竟右键保存的文件名默认就是psb），然后就是搜索咯

在点进去的缓存页面可以F12执行js，查看缓存图片：

代码来源：http://www.sensefulsolutions.com/2012/01/viewing-chrome-cache-easy-way.html

```
    (function() {
    var preTags = document.getElementsByTagName('pre');
    var preWithHeaderInfo = preTags[0];
    var preWithContent = preTags[2];

    var lines = preWithContent.textContent.split('\n');
 
    // get data about the formatting (changes between different versions of chrome)
    var rgx = /^(0{8}:\s+)([0-9a-f]{2}\s+)[0-9a-f]{2}/m;
    var match = rgx.exec(lines[0]);
 
    var text = '';
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var firstIndex = match[1].length; // first index of the chars to match (e.g. where a '84' would start)
        var indexJump = match[2].length; // how much space is between each set of numbers
        var totalCharsPerLine = 16;
        index = firstIndex;
        for (var j = 0; j < totalCharsPerLine; j++) {
            var hexValAsStr = line.substr(index, 2);
            if (hexValAsStr == '  ') {
                // no more chars
                break;
            }

            var asciiVal = parseInt(hexValAsStr, 16);
            text += String.fromCharCode(asciiVal);

            index += indexJump;
        }
    }

    var headerText = preWithHeaderInfo.textContent;
    var elToInsertBefore = document.body.childNodes[0];
    var insertedDiv = document.createElement("div");
    document.body.insertBefore(insertedDiv, elToInsertBefore);

    // find the filename
    var nodes = [document.body];
    var filepath = '';
    while (true) {
        var node = nodes.pop();
        if (node.hasChildNodes()) {
            var children = node.childNodes;
            for (var i = children.length - 1; i >= 0; i--) {
                nodes.push(children[i]);
            }
        }

        if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.nodeValue)) {
            // 1st depth-first text node (with non-whitespace chars) found
            filepath = node.nodeValue;
            break;
        }
    }
    
    outputResults(insertedDiv, convertToBase64(text), filepath, headerText);

    insertedDiv.appendChild(document.createElement('hr'));

    function outputResults(parentElement, fileContents, fileUrl, headerText) {
        // last updated 1/27/12
        var rgx = /.+\/([^\/]+)/;
        var filename = rgx.exec(fileUrl)[1];

        // get the content type
        rgx = /content-type: (.+)/i;
        var match = rgx.exec(headerText);
        var contentTypeFound = match != null;
        var contentType = "text/plain";
        if (contentTypeFound) {
            contentType = match[1];
        }

        var dataUri = "data:" + contentType + ";base64," + fileContents;

        // check for gzipped file
        var gZipRgx = /content-encoding: gzip/i;
        if (gZipRgx.test(headerText)) {
            filename += '.gz';
        }
        
        // check for image
        var imageRgx = /image/i;
        var isImage = imageRgx.test(contentType);
            
        // create link
        var aTag = document.createElement('a');
        aTag.textContent = "Left-click to download the cached file";
        aTag.setAttribute('href', dataUri);
        aTag.setAttribute('download', filename);
        parentElement.appendChild(aTag);
        parentElement.appendChild(document.createElement('br'));
    
        // create image
        if (isImage) {
            var imgTag = document.createElement('img');
            imgTag.setAttribute("src", dataUri);
            parentElement.appendChild(imgTag);
            parentElement.appendChild(document.createElement('br'));
        }
    
        // create warning
        if (!contentTypeFound) {
            var pTag = document.createElement('p');
            pTag.textContent = "WARNING: the type of file was not found in the headers... defaulting to text file.";
            parentElement.appendChild(pTag);
        }
    }

    function getBase64Char(base64Value) {
        if (base64Value < 0) {
            throw "Invalid number: " + base64Value;
        } else if (base64Value <= 25) {
            // A-Z
            return String.fromCharCode(base64Value + "A".charCodeAt(0));
        } else if (base64Value <= 51) {
            // a-z
            base64Value -= 26; // a
            return String.fromCharCode(base64Value + "a".charCodeAt(0));
        } else if (base64Value <= 61) {
            // 0-9
            base64Value -= 52; // 0
            return String.fromCharCode(base64Value + "0".charCodeAt(0));
        } else if (base64Value <= 62) {
            return '+';
        } else if (base64Value <= 63) {
            return '/';
        } else {
            throw "Invalid number: " + base64Value;
        }
    }

    function convertToBase64(input) {
        // http://en.wikipedia.org/wiki/Base64#Example
        var remainingBits;
        var result = "";
        var additionalCharsNeeded = 0;

        var charIndex = -1;
        var charAsciiValue;
        var advanceToNextChar = function() {
            charIndex++;
            charAsciiValue = input.charCodeAt(charIndex);
            return charIndex < input.length;
        };

        while (true) {
            var base64Char;

            // handle 1st char
            if (!advanceToNextChar()) break;
            base64Char = charAsciiValue >>> 2;
            remainingBits = charAsciiValue & 3; // 0000 0011
            result += getBase64Char(base64Char); // 1st char
            additionalCharsNeeded = 3;

            // handle 2nd char
            if (!advanceToNextChar()) break;
            base64Char = (remainingBits << 4) | (charAsciiValue >>> 4);
            remainingBits = charAsciiValue & 15; // 0000 1111
            result += getBase64Char(base64Char); // 2nd char
            additionalCharsNeeded = 2;

            // handle 3rd char
            if (!advanceToNextChar()) break;
            base64Char = (remainingBits << 2) | (charAsciiValue >>> 6);
            result += getBase64Char(base64Char); // 3rd char
            remainingBits = charAsciiValue & 63; // 0011 1111
            result += getBase64Char(remainingBits); // 4th char
            additionalCharsNeeded = 0;
        }

        // there may be an additional 2-3 chars that need to be added
        if (additionalCharsNeeded == 2) {
            remainingBits = remainingBits << 2; // 4 extra bits
            result += getBase64Char(remainingBits) + "=";
        } else if (additionalCharsNeeded == 3) {
            remainingBits = remainingBits << 4; // 2 extra bits
            result += getBase64Char(remainingBits) + "==";
        } else if (additionalCharsNeeded != 0) {
            throw "Unhandled number of additional chars needed: " + additionalCharsNeeded;
        }

        return result;
    }
    })()
```

例如找到http://a3.qpic.cn/psb?/V12C1bLj2DcCgb/f9hTWn5wbxt3dZd5MlUCHX6tA9oqVOudgT2rqARLltk!/a/dI4BAAAAAAAA

但这样只是一张小图，我们当然希望有大图，比对大图的url发现只要将上述url的/a/替换为/b/即可

所以总结一下就是打开缓存页面chrome://cache/，查找psb字符串，找到想要的图片，如果是小图就改一下url得到大图


------

## 为什么我喜欢写博客？

摘自 https://manishearth.github.io/blog/2018/08/26/why-i-enjoy-blogging/

写下来的过程发现自己还有不懂的，给自己讲清楚甚至能发现rust标准库的bug，本质上是给很多人讲需要考虑所有方面而不是最小必要；当你觉得显而易见的时候很容易失去解释清楚的能力

读旧的文章很有趣 让自己回到写作的那一时刻 比较当时自己的理解和现在的 体会自己的进步，重新学习已经忘了的

写作能换个脑子 在不同工作之前切换 使用不同的脑区 整天都有精力

写blog能偷懒 以后有人问到就能直接给链接说“你想知道更多的话 我已经在这写过了”

别人写过了还要不要写？要写！ 你的理解不同，散落在不同地方的知识综合起来也有价值

你真正的职责是当你有空free了，你应该让其他人也轻松free，如果你有能力power，你的职责就是为其他人赋能empower

自学不意味着当一个编译器的fuzzer随机尝试，而是学文档tutorial，从书籍学算法——自学只是说你完全掌控自己的学习过程，但仍然依赖其他人的工作

你也应该写博客 这里有一些建议https://jvns.ca/blog/2016/05/22/how-do-you-write-blog-posts/

-----

## 支持被at的(outgoing)钉钉机器人

需要自己注册一个企业，管理员才能创建这种机器人，机器人只能在内部群使用

文档： https://ding-doc.dingtalk.com/doc#/serverapi2/elzz1p

其中缺失了关于atDingtalkIds的描述，需要看这个： https://juejin.im/post/6844903922029576205

需要注意的地方有：修改服务器回调通知地址和修改上线的时候，钉钉就会验证服务器是否正常，你可以`while true; nc -lp 8888 < tmp.txt; done` 死循环提供个正常的http服务

POST发来的数据里面有临时的url可以发消息，还有senderId是发送者id用来在atDingtalkIds中使用

收到的POST内容：

```
{"conversationId":"cidoAgtPbnu9MyulIyt0kpNYg==","atUsers":[{"dingtalkId":"$:LWCP_v1:$Jh2MBlTKQnC/tN4tDTZB3eOIi+xOatMW"}],"chatbotCorpId":"dingb1d0b0ca51cxxxxxx","chatbotUserId":"$:LWCP_v1:$Jh2MBlTKQnC/tN4tDTZB3eOIi+xOatMW","msgId":"msgWjYj1k8LPNOBBy+jxNKwQw==","senderNick":"发送者姓名","isAdmin":false,"senderStaffId":"2665036700000000","sessionWebhookExpiredTime":1600622026555,"createAt":1600616626487,"senderCorpId":"dingb1d0b0ca51c029b24ac5d6980000000","conversationType":"2","senderId":"$:LWCP_v1:$9gY0EpfG9gA0e4xnPjDHugeGB0JtdCJV","conversationTitle":"群组标题","isInAtList":true,"sessionWebhook":"https://oapi.dingtalk.com/robot/sendBySession?session=b28f49899ea1cba0d256673d66ffe386","text":{"content":" 1+1"},"msgtype":"text"}
```

回复发送者一个666：

```
curl https://oapi.dingtalk.com/robot/sendBySession?session=b28f49899ea1cba0d256673d66ffe386 -H "Content-Type: application/json" --data '{"msgtype":"text", "text":{"content":"666"}, "at":{"atDingtalkIds":["$:LWCP_v1:$9gY0EpfG9gA0e4xnPjDHugeGB0JtdCJV"]}}'
```

-----

## Go语言

### 安装

```
wget -q https://golang.org/dl/go1.15.3.linux-amd64.tar.gz &&\
    tar -C /usr/local -xzf go1.15.3.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
```

### 提取build失败缺失的库安装

```
go build |&  grep cannot |cut -d'"' -f2|xargs go get
```

----

## IDEA2020.2 30天后重新试用

参考： http://scz.617.cn:8/windows/202010261152.txt

regedit找到HKCU\SOFTWARE\JavaSoft\Prefs\jetbrains\idea，其中会有目录包含evlsprt3\202，删掉这个目录里面的evlsprt和evlsprt2

然后删除这些目录：

```
rd /s /q "%APPDATA%\JetBrains\IntelliJIdea2020.2\eval"
del "%APPDATA%\JetBrains\PermanentDeviceId"
del "%APPDATA%\JetBrains\PermanentUserId"
del "%APPDATA%\JetBrains\bl"
del "%APPDATA%\JetBrains\crl"
```

编辑"%APPDATA%\JetBrains\IntelliJIdea2020.2\options\other.xml"

删除包含evlsprt.202或evlsprt2.202的行

----

## 树莓派到手后配置

一款新的树莓派4到手，默认为英国键盘布局不能输入@#符号，显示分辨率不够1080p，以及有线网络和无线网络优先级需要调整

### 修改键盘布局

查到有教程说`sudo raspi-config`里可以修改键盘布局，实测发现改了之后只敲了一次@之后又被改回去了，还是得修改输入法：

参考 https://jingyan.baidu.com/article/3aed632e29dfd87011809169.html

```
sudo apt install fcitx
reboot
```

右上角有输入法图标 管理键盘 删掉英国 加上英语(美国)即可

### 显示分辨率修改

参考 https://www.ncnynl.com/archives/201607/226.html

树莓派有两种hdmi输出模式，1是CEA电视，2是DMT电脑显示器

查看当前显示器支持的分辨率们：

```
tvservice -m CEA
tvservice -m DMT
```

实际上显示出来的并不一定完整，还需要自己多测试：例如设置为 640x480   60Hz

```
tvservice -e "DMT 4"
```

建议在终端里先敲这个命令 当显示不出来的时候可以按↑回车改回一个正常显示，不至于重启

完整的列表在上述参考链接中有了，可以自己多试试，切换分辨率后记得移动鼠标 不然不会显示

但是我希望的分辨率 1920x1080 60Hz不在DMT列表中，这就需要自定义分辨率了

修改`/boot/config.txt`，添加：

```
hdmi_cvt=1920 1080 60 3
hdmi_group=2
hdmi_mode=87
hdmi_drive=2
```

其中hdmi_cvt的解释： https://www.raspberrypi.org/documentation/configuration/config-txt/video.md

其中最后一个3是sdtv_aspect 长宽比 我这里是16:9 所以填了3

修改后重启即可，似乎目前树莓派也学聪明了，即使config.txt里配置了错误的值显示不出来，也会自动回退到720p保证显示

### 调整无线网络和有线网络的优先级

我希望外网访问(default路由)走wifi，内网访问(10.0.0.0/8)走有线，但默认联网后有线也会占据default路由而且优先级比无线高（跃点数小）

两个网络都是使用dhcp获取IP，所以可以在dhcp的配置文件里配置metric

参考： https://raspberrypi.stackexchange.com/a/50951

编辑`/etc/dhcpcd.conf`

```
interface wlan0
metric 200

interface eth0
metric 300
```

然后编辑dhcp的hook自动执行route命令：

参考 https://wiki.archlinux.org/index.php/dhcpcd#DHCP_static_route.28s.29

编辑`/etc/dhcpcd.exit-hook`

```
route add -net 10.0.0.0/8 gw <网关ip> dev eth0
```

----

## 修改Electron应用

想让这个Electron应用浏览器打开自定义的页面，但人家没提供F12（虽然最后发现也没啥用Orz

参考： [吾爱破解-Electron跨平台程序破解的一般思路](https://www.52pojie.cn/thread-563895-1-1.html)

```
npm install asar -g
# 在resources目录可以找到app.asar，这样解包：
asar e app.asar tmp

# 修改后重新打包：
asar p tmp/ app.asar
```

具体的修改挺简单，找到入口的electron.js

注释掉new BrowserWindow的titleBarStyle: 'hidden', removeMenu() 修改.loadURL(url)
