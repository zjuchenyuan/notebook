#! /bin/bash

## 并发刷新缓存
## 刷新又拍云缓存，代码在https://github.com/zjuchenyuan/EasyLogin/tree/master/examples/upyun
pushd /mnt/d/Seafile/Developer/EasyLogin/examples/upyun/
python3 upyun.py 'https://py3.io/*.html' &
popd
python3 code/upyun_purge.py &


rm *.html
bundle exec jekyll build -d docs --no-watch -I
cp docs/*.html ./
echo "<hr><small>Last updated: `date --iso-8601=seconds`&nbsp;&nbsp;&nbsp;<a href=http://www.miitbeian.gov.cn/>浙ICP备15043819号-2</a>&nbsp;&nbsp;<a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=33010602007826"><img src="beian.png" height="14px">浙公网安备 33010602007826号</p></a></small>" >> index.html
cp code/randomstring.html ./p.html
cp doc/python/quickstart.html ./
python3 << PYTHON
import os
import re
import requests
star_count = requests.get("https://api.github.com/repos/zjuchenyuan/notebook").json()["stargazers_count"]
replace_css=re.compile(r'/assets/css/style.css\?v=.*"')
for filename in os.listdir("."):
    if filename.endswith(".html"):
        if filename in ("p.html","quickstart.html"):
            continue
        data = open(filename,encoding='utf-8').read()
        data = replace_css.sub('assets/css/style.css?20170509"',data)
        data = data.replace("http://github.com","https://github.com")
        data = data.replace('href="https://github.com/zjuchenyuan/notebook"','href="https://github.com/zjuchenyuan/notebook/blob/master/{name}.md"'.format(name=filename.replace(".html","")) if filename!="index.html" else 'href="https://github.com/zjuchenyuan/notebook"')
        data = data.replace("View on GitHub</a>","""Star me on GitHub ({star_count})</a>&nbsp;{back_html}""".format(star_count=star_count,back_html="""<a href="https://py3.io" class="btn btn-back"><span class="icon"></span>Back to Index</a>""" if filename != "index.html" else ""))
        if filename == "Python.html":
            data = data.replace('<span class="err">','<span class="s">')
        data = data.replace("""    </div>

    
  </body>
</html>""","""<br><hr><h1 id="comment">评论区</h1><div id="comment-thread"></div><div id="loading-spin"></div>
    </div>

  </body>
<script src="assets/js/instantclick.min.js" data-no-instant></script>
<link rel="stylesheet" href="assets/css/comment.css">
<script src="assets/js/comment.js" data-no-instant></script>
<script>
  marked.setOptions({
  highlight: function (code, lang) {
     return hljs.highlightAuto(code).value;
  }
  });
  function Highlighting(){
    var markdowns = document.getElementsByClassName('markdown');
    for(var i=0;i<markdowns.length;i++){
       if(markdowns[i].innerHTML) markdowns[i].innerHTML =marked(markdowns[i].innerHTML);
    }
  }
  window.addEventListener('DOMContentLoaded', Highlighting, false);
  window.addEventListener('load', Highlighting, false);
   var opt = {
       type: "github",
       user: "zjuchenyuan",
       repo: "notebook",
       no_comment: "No comments yet. Press the button and go to comment now!",
       go_to_comment: "Go to comment",
       issue_id: "1",
       btn_class: "btn",
       comments_target: "#comment-thread",
       loading_target: "#loading-spin",
       client_id: "8f7a792630aa459d0812",
       client_secret: "084b314f30dd9b10201011e265c4cb5d78c2b2e9"
   };
   if (jQuery('.discussion-timeline').length == 0) getComments(opt);
</script>
<script data-no-instant>
  InstantClick.init();
</script>
</html>""")
        open(filename,"w",encoding='utf-8').write(data)
PYTHON
